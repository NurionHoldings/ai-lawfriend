import { canOperatorQueueRetry } from "@/features/platform/reliability/retry-job-policy";
import { operatorQueueRetryJobService } from "@/features/platform/reliability/retry-job.service";
import { prisma } from "@/lib/prisma";
import { ARKAON_HARD_DENY_ACTIONS } from "../../arkaon.policy";
import type { ArkaonProposal } from "../../arkaon.schema";
import type { ArkaonSkillHandler } from "../types";

/**
 * First RC3 L2 skill — selected after full RetryJob survey.
 * Scope: CRON RetryJob queue-marker ONLY (operatorQueueRetryJobService).
 * Does NOT call cron log re-run APIs (alerts.sla_scan / escalation re-execution).
 */
export const RETRY_FAILED_INTERNAL_JOB_SKILL_ID =
  "retry_failed_internal_job_after_human_approval" as const;

const ALLOWED_SOURCE_TYPES = new Set(["CRON"]);

/** Pure gate used by execute path and lock-validation tests. */
export function isArkaonL2CronRetrySourceAllowed(sourceType: string): boolean {
  return ALLOWED_SOURCE_TYPES.has(sourceType);
}

function readRetryJobId(proposal: ArkaonProposal): string | null {
  const ref = proposal.targetRef;
  if (!ref || typeof ref !== "object") return null;
  const retryJobId = (ref as { retryJobId?: unknown }).retryJobId;
  return typeof retryJobId === "string" && retryJobId.length > 0 ? retryJobId : null;
}

export async function buildInternalRetryProposals(): Promise<ArkaonProposal[]> {
  const jobs = await prisma.retryJob.findMany({
    where: {
      sourceType: "CRON",
      status: "FAILED",
      retryable: true,
      safetyClass: { in: ["SAFE_AUTO", "OPERATOR_APPROVAL"] },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });

  return jobs.flatMap((job) => {
    if (!ALLOWED_SOURCE_TYPES.has(job.sourceType)) return [];
    const gate = canOperatorQueueRetry({
      retryable: job.retryable,
      safetyClass: job.safetyClass as "SAFE_AUTO" | "OPERATOR_APPROVAL" | "BLOCKED",
      status: job.status,
      attemptCount: job.attemptCount,
      maxAttempts: job.maxAttempts,
    });
    if (!gate.allowed) return [];

    const createdAt = new Date().toISOString();
    const proposal: ArkaonProposal = {
      proposalId: `arkaon_skill_retry_cron_${job.id}`,
      platform: "AI법친",
      domain: "OPERATIONS_HEALTH",
      severity: "WARNING",
      title: `CRON RetryJob 재큐잉 승인: ${job.jobCode}`,
      rationale: `실패한 CRON RetryJob(${job.jobCode})을 payload 변경 없이 PENDING_RETRY로 표시하려면 인간 승인이 필요합니다. 실제 cron 재실행 API는 호출하지 않습니다.`,
      evidence: [
        `retryJobId:${job.id}`,
        `sourceType:CRON`,
        `status:${job.status}`,
        `failure:${job.failureReason ?? "n/a"}`,
      ],
      risk: "큐 마커·attemptCount·audit만 변경합니다. 의뢰인 송신·문서 재분석·결제·법률판단 변경 없음.",
      recommendedAction:
        "1) APPROVE → 2) 별도 EXECUTE → 3) VERIFY. approve만으로 실행되지 않습니다.",
      policyResult: {
        adviceOnly: true,
        executeAllowed: false,
        l3Enabled: false,
        humanApprovalRequired: true,
        deniedActions: [...ARKAON_HARD_DENY_ACTIONS],
        note: "RC3 L2 CRON-only. EXTERNAL_MESSAGE/DOCUMENT_PIPELINE/AI_* excluded by survey.",
      },
      status: "PROPOSED",
      executeAllowed: false,
      skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
      targetRef: {
        retryJobId: job.id,
        sourceType: "CRON",
        jobCode: job.jobCode,
        payloadMutation: false,
        invokesCronRerunApi: false,
      },
      executionStatus: "EXECUTION_BLOCKED",
      createdAt,
    };
    return [proposal];
  });
}

export const retryFailedInternalJobSkill: ArkaonSkillHandler = {
  definition: {
    skillId: RETRY_FAILED_INTERNAL_JOB_SKILL_ID,
    platform: "AI법친",
    title: "Retry failed CRON RetryJob after human approval (queue marker only)",
    description:
      "Sets an existing CRON RetryJob to PENDING_RETRY without payload mutation, client send, payment, legal judgment change, or cron re-run API invocation.",
    level: "L2_HUMAN_APPROVED_EXECUTION",
    enabled: true,
    declaredActions: ["INTERNAL_RETRY_QUEUE"],
    hardDenyBlocked: ARKAON_HARD_DENY_ACTIONS,
    requiresHumanApproval: true,
    mutatesLegalJudgment: false,
    clientVisibleSend: false,
  },
  async execute({ proposal, actor }) {
    const retryJobId = readRetryJobId(proposal);
    if (!retryJobId) {
      return { ok: false, message: "Proposal targetRef.retryJobId is required." };
    }
    const job = await prisma.retryJob.findUnique({ where: { id: retryJobId } });
    if (!job) return { ok: false, message: "Retry job not found." };
    if (!isArkaonL2CronRetrySourceAllowed(job.sourceType)) {
      return {
        ok: false,
        message: `Source type ${job.sourceType} denied. First L2 skill is CRON-only after survey.`,
      };
    }

    const gate = canOperatorQueueRetry({
      retryable: job.retryable,
      safetyClass: job.safetyClass as "SAFE_AUTO" | "OPERATOR_APPROVAL" | "BLOCKED",
      status: job.status,
      attemptCount: job.attemptCount,
      maxAttempts: job.maxAttempts,
    });
    if (!gate.allowed) {
      return { ok: false, message: gate.reason ?? "Retry not allowed by RetryJob policy." };
    }

    const queued = await operatorQueueRetryJobService(
      actor,
      retryJobId,
      `ARKAON L2 CRON-only queue marker after human approval (${RETRY_FAILED_INTERNAL_JOB_SKILL_ID})`,
    );

    return {
      ok: true,
      message:
        "CRON RetryJob queued to PENDING_RETRY. No cron re-run API, client send, payment, or legal mutation.",
      result: {
        retryJobId: queued.id,
        status: queued.status,
        sourceType: queued.sourceType,
        jobCode: queued.jobCode,
        attemptCount: queued.attemptCount,
        invokesCronRerunApi: false,
      },
    };
  },
  async verify({ proposal, executionResult }) {
    const retryJobId =
      readRetryJobId(proposal) ??
      (typeof executionResult?.retryJobId === "string" ? executionResult.retryJobId : null);
    if (!retryJobId) {
      return { ok: false, message: "Cannot verify without retryJobId." };
    }
    const job = await prisma.retryJob.findUnique({ where: { id: retryJobId } });
    if (!job) return { ok: false, message: "Retry job missing after execution." };
    if (job.sourceType !== "CRON") {
      return { ok: false, message: "Verify FAIL — sourceType is no longer CRON." };
    }

    const ok = job.status === "PENDING_RETRY" || job.status === "RETRYING";

    return {
      ok,
      message: ok
        ? `Verify PASS — CRON RetryJob status is ${job.status} (queue marker).`
        : `Verify FAIL — unexpected status ${job.status}.`,
      verifyResult: {
        retryJobId: job.id,
        status: job.status,
        attemptCount: job.attemptCount,
        sourceType: job.sourceType,
      },
    };
  },
};
