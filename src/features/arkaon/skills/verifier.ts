import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { getArkaonProposalById, markProposalExecution } from "../arkaon.ledger";
import { getArkaonSkill } from "./registry";

export const ARKAON_VERIFY_ACTION = "ARKAON_SKILL_VERIFIED" as const;

/**
 * Separate from executeApprovedSkill(). Confirms post-execution state.
 */
export async function verifyExecutedSkill(input: {
  proposalId: string;
  actorUserId: string;
  executionId?: string;
}) {
  const proposal = await getArkaonProposalById(input.proposalId);
  if (!proposal) return null;

  if (!proposal.skillId) {
    return { ok: false as const, reason: "No skill bound to proposal." };
  }

  const skill = getArkaonSkill(proposal.skillId);
  if (!skill) {
    return { ok: false as const, reason: `Skill not registered: ${proposal.skillId}` };
  }

  const execution = input.executionId
    ? await prisma.arkaonExecution.findUnique({ where: { id: input.executionId } })
    : await prisma.arkaonExecution.findFirst({
        where: { proposalId: input.proposalId, status: "EXECUTED" },
        orderBy: { createdAt: "desc" },
      });

  if (!execution || execution.status !== "EXECUTED") {
    return {
      ok: false as const,
      reason: "No EXECUTED execution found. verify requires a prior separate execute step.",
    };
  }

  const outcome = await skill.verify({
    proposal,
    executionResult:
      execution.result && typeof execution.result === "object" && !Array.isArray(execution.result)
        ? (execution.result as Record<string, unknown>)
        : null,
  });

  const status = outcome.ok ? "VERIFIED" : "FAILED";
  await prisma.arkaonExecution.update({
    where: { id: execution.id },
    data: {
      status,
      verifyResult: outcome.verifyResult ?? { message: outcome.message },
      verifiedAt: new Date(),
      executeAllowed: false,
    },
  });

  await markProposalExecution(input.proposalId, {
    status,
    executionStatus: status,
    executeAllowed: false,
  });

  await writeAuditLog({
    actorUserId: input.actorUserId,
    action: ARKAON_VERIFY_ACTION,
    entityType: "ARKAON_EXECUTION",
    entityId: execution.id,
    message: outcome.message,
    metadata: {
      proposalId: input.proposalId,
      skillId: skill.definition.skillId,
      ok: outcome.ok,
    },
  });

  return {
    ok: outcome.ok,
    executionId: execution.id,
    skillId: skill.definition.skillId,
    status,
    message: outcome.message,
    verifyResult: outcome.verifyResult,
  };
}
