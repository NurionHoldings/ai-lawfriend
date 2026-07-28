import type { SessionUser } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { evaluateL2SkillExecution } from "../arkaon.policy";
import { getArkaonProposalById, markProposalExecution } from "../arkaon.ledger";
import { claimArkaonExecutionSlot } from "./claim-execution-slot";
import { getArkaonSkill } from "./registry";

export const ARKAON_EXECUTION_ENTITY_TYPE = "ARKAON_EXECUTION" as const;
export const ARKAON_EXECUTE_ACTION = "ARKAON_SKILL_EXECUTED" as const;

/**
 * Physically separate from approve().
 * Flow: EXECUTE REQUEST → Skill Registry → Policy Gate → Approval Validation
 *      → Idempotency/Claim (tx + unique) → Executor → (Verifier is separate)
 */
export async function executeApprovedSkill(input: {
  proposalId: string;
  actor: SessionUser;
}) {
  const proposal = await getArkaonProposalById(input.proposalId);
  if (!proposal) return null;

  if (proposal.humanDecision !== "APPROVED" && proposal.status !== "APPROVED") {
    return {
      ok: false as const,
      blocked: true as const,
      reason: "Proposal is not APPROVED. approve() and executeApprovedSkill() are separate.",
    };
  }

  if (!proposal.skillId) {
    await markProposalExecution(input.proposalId, {
      executionStatus: "EXECUTION_BLOCKED",
      status: "APPROVED",
      executeAllowed: false,
    });
    return {
      ok: false as const,
      blocked: true as const,
      reason: "No L2 skill bound to this proposal.",
    };
  }

  const skill = getArkaonSkill(proposal.skillId);
  if (!skill) {
    return {
      ok: false as const,
      blocked: true as const,
      reason: `Skill not registered: ${proposal.skillId}`,
    };
  }

  const gate = evaluateL2SkillExecution({
    skillId: skill.definition.skillId,
    hasHumanApproval: true,
    proposalApproved: true,
    skillDeclaredActions: skill.definition.declaredActions,
    l2EnabledForSkill: skill.definition.enabled,
  });

  if (!gate.allowed) {
    await markProposalExecution(input.proposalId, {
      executionStatus: "EXECUTION_BLOCKED",
      executeAllowed: false,
    });
    return { ok: false as const, blocked: true as const, reason: gate.reason };
  }

  const claim = await claimArkaonExecutionSlot({
    proposalId: input.proposalId,
    skillId: skill.definition.skillId,
    actorUserId: input.actor.id,
    payload: proposal.targetRef ?? undefined,
  });

  if (!claim.claimed) {
    return {
      ok: false as const,
      blocked: true as const,
      reason: claim.reason,
      existingExecutionId: claim.existingExecutionId,
    };
  }

  const outcome = await skill.execute({
    proposal,
    actor: input.actor,
    executionId: claim.executionId,
  });

  const status = outcome.ok ? "EXECUTED" : "FAILED";
  await prisma.arkaonExecution.update({
    where: { id: claim.executionId },
    data: {
      status,
      result: outcome.result ?? { message: outcome.message },
      executeAllowed: false,
    },
  });

  await markProposalExecution(input.proposalId, {
    status,
    executionStatus: status,
    executeAllowed: false,
  });

  await writeAuditLog({
    actorUserId: input.actor.id,
    action: ARKAON_EXECUTE_ACTION,
    entityType: ARKAON_EXECUTION_ENTITY_TYPE,
    entityId: claim.executionId,
    message: outcome.message,
    metadata: {
      proposalId: input.proposalId,
      skillId: skill.definition.skillId,
      ok: outcome.ok,
      executeAllowed: false,
      idempotencyPassed: true,
      claimMode: "transaction+partial_unique",
    },
  });

  return {
    ok: outcome.ok,
    blocked: false as const,
    executionId: claim.executionId,
    skillId: skill.definition.skillId,
    status,
    message: outcome.message,
    result: outcome.result,
  };
}
