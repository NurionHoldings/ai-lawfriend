/**
 * Staging / real-DB gate for RC3 LOCK — concurrent EXECUTE on the same proposal/skill.
 *
 * Requires:
 *   DATABASE_URL                      — target DB (staging recommended)
 *   ARKAON_RC3_STAGING_ACTOR_USER_ID  — existing ADMIN/SUPER_ADMIN user id
 *
 * Optional:
 *   ARKAON_RC3_EVIDENCE_PATH — output JSON path
 *   --keep                   — retain fixture rows
 *
 * Usage:
 *   npm run verify:arkaon-ailawfriend-rc3:staging-concurrent
 */
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth/session";
import { executeApprovedSkill } from "@/features/arkaon/skills/executor";
import { verifyExecutedSkill } from "@/features/arkaon/skills/verifier";
import { RETRY_FAILED_INTERNAL_JOB_SKILL_ID } from "@/features/arkaon/skills/ailawfriend/retry-failed-internal-job-after-human-approval";

const keep = process.argv.includes("--keep");
const evidencePath =
  process.env.ARKAON_RC3_EVIDENCE_PATH?.trim() ||
  path.join(process.cwd(), "docs/arkaon/evidence/rc3-concurrent-execute-latest.json");

function fail(message: string): never {
  console.error(`[RC3 staging concurrent] FAIL: ${message}`);
  process.exit(1);
}

async function assertPartialUniqueIndex() {
  const rows = await prisma.$queryRaw<Array<{ indexname: string }>>`
    SELECT indexname
    FROM pg_indexes
    WHERE tablename = 'ArkaonExecution'
      AND indexname = 'ArkaonExecution_proposalId_skillId_active_uidx'
  `;
  if (!rows.length) {
    fail(
      "Partial unique index ArkaonExecution_proposalId_skillId_active_uidx not found. Apply migration 20260728193000_arkaon_execution_active_unique_rc3.",
    );
  }
  console.log("[RC3 staging concurrent] partial unique index confirmed");
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    fail("DATABASE_URL is required");
  }
  const actorUserId = process.env.ARKAON_RC3_STAGING_ACTOR_USER_ID?.trim();
  if (!actorUserId) {
    fail("ARKAON_RC3_STAGING_ACTOR_USER_ID is required (existing ADMIN user id)");
  }

  const actorRow = await prisma.user.findUnique({
    where: { id: actorUserId },
    select: { id: true, email: true, name: true, role: true, status: true },
  });
  if (!actorRow) fail(`actor user not found: ${actorUserId}`);
  if (actorRow.role !== "ADMIN" && actorRow.role !== "SUPER_ADMIN") {
    fail(`actor must be ADMIN/SUPER_ADMIN, got ${actorRow.role}`);
  }

  const actor: SessionUser = {
    id: actorRow.id,
    email: actorRow.email,
    name: actorRow.name,
    role: actorRow.role,
    status: actorRow.status,
  };

  await assertPartialUniqueIndex();

  const stamp = Date.now();
  const sourceRefId = `arkaon-rc3-concurrent-${stamp}`;
  const proposalId = `arkaon_skill_retry_cron_rc3_lock_${stamp}`;

  const retryJob = await prisma.retryJob.create({
    data: {
      sourceType: "CRON",
      sourceRefId,
      jobCode: "alerts.sla_scan",
      status: "FAILED",
      safetyClass: "OPERATOR_APPROVAL",
      retryable: true,
      attemptCount: 0,
      maxAttempts: 3,
      failureReason: "TIMEOUT synthetic for RC3 concurrent LOCK gate",
    },
  });

  await prisma.arkaonProposal.create({
    data: {
      id: proposalId,
      platform: "AI법친",
      domain: "OPERATIONS_HEALTH",
      severity: "WARNING",
      title: "RC3 staging concurrent EXECUTE fixture",
      rationale: "LOCK gate: concurrent execute must claim exactly one slot",
      evidence: [`retryJobId:${retryJob.id}`, "sourceType:CRON"],
      risk: "queue marker only",
      recommendedAction: "concurrent execute then verify",
      policyResult: {
        adviceOnly: true,
        executeAllowed: true,
        l3Enabled: false,
        humanApprovalRequired: true,
        note: "RC3 staging concurrent fixture",
      },
      status: "APPROVED",
      executeAllowed: true,
      skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
      targetRef: {
        retryJobId: retryJob.id,
        sourceType: "CRON",
        jobCode: "alerts.sla_scan",
        payloadMutation: false,
        invokesCronRerunApi: false,
      },
      executionStatus: "EXECUTION_AVAILABLE",
      createdAt: new Date(),
    },
  });

  await prisma.arkaonApproval.create({
    data: {
      proposalId,
      decision: "APPROVED",
      actorUserId: actor.id,
      reason: "RC3 staging concurrent fixture approval (no execute)",
      executeAllowed: false,
    },
  });

  const beforeAttempts = retryJob.attemptCount;

  const [execA, execB] = await Promise.all([
    executeApprovedSkill({ proposalId, actor }),
    executeApprovedSkill({ proposalId, actor }),
  ]);

  const results = [execA, execB];
  const successes = results.filter((r) => r && r.ok === true && r.blocked === false);
  const rejected = results.filter((r) => r && (r.blocked === true || r.ok === false));

  const activeExecutionCount = await prisma.arkaonExecution.count({
    where: {
      proposalId,
      skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
      status: { in: ["EXECUTION_AVAILABLE", "EXECUTED", "VERIFIED"] },
    },
  });

  const jobAfter = await prisma.retryJob.findUnique({ where: { id: retryJob.id } });
  const mutationCount = Math.max(0, (jobAfter?.attemptCount ?? 0) - beforeAttempts);

  if (successes.length !== 1) fail(`expected claimSuccess=1, got ${successes.length}`);
  if (rejected.length !== 1) fail(`expected claimRejected=1, got ${rejected.length}`);
  if (activeExecutionCount !== 1) {
    fail(`expected activeExecutionCount=1, got ${activeExecutionCount}`);
  }
  if (mutationCount !== 1) fail(`expected mutationCount=1, got ${mutationCount}`);
  if (jobAfter?.status !== "PENDING_RETRY") {
    fail(`expected PENDING_RETRY, got ${jobAfter?.status}`);
  }

  const winner = successes[0]!;
  const verify = await verifyExecutedSkill({
    proposalId,
    actorUserId: actor.id,
    executionId: winner.executionId,
  });
  if (!verify || verify.ok !== true || verify.status !== "VERIFIED") {
    fail(`VERIFY expected VERIFIED, got ${JSON.stringify(verify)}`);
  }

  // After VERIFY, active set still includes VERIFIED → count remains 1
  const evidence = {
    scenario: "concurrent_execute_same_proposal",
    platform: "AI법친",
    skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
    proposalId,
    retryJobId: retryJob.id,
    requestCount: 2,
    claimSuccess: 1,
    claimRejected: 1,
    mutationCount: 1,
    activeExecutionCount: 1,
    finalRetryJobStatus: jobAfter.status,
    verification: "VERIFIED" as const,
    hardDenyViolations: 0,
    approveTriggeredExecutions: 0,
    requestResults: results.map((r, idx) => ({
      request: idx + 1,
      ok: r?.ok ?? false,
      blocked: r?.blocked ?? false,
      status: r && "status" in r ? r.status : undefined,
      reason: r && "reason" in r ? r.reason : undefined,
      executionId: r && "executionId" in r ? r.executionId : undefined,
    })),
    capturedAt: new Date().toISOString(),
    rc3Status:
      "STAGING_CONCURRENT_PASS — promote to LOCKED_SAFE_L2 only after full RC3_LOCK_REQUIRED",
  };

  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  console.log(`[RC3 staging concurrent] evidence written: ${evidencePath}`);
  console.log(JSON.stringify(evidence, null, 2));

  if (!keep) {
    await prisma.arkaonExecution.deleteMany({ where: { proposalId } });
    await prisma.arkaonApproval.deleteMany({ where: { proposalId } });
    await prisma.arkaonProposal.delete({ where: { id: proposalId } }).catch(() => undefined);
    await prisma.retryJob.delete({ where: { id: retryJob.id } }).catch(() => undefined);
    console.log("[RC3 staging concurrent] fixtures cleaned (use --keep to retain)");
  }

  console.log("[RC3 staging concurrent] PASS");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
