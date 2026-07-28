/**
 * RC3 Idempotency Gate — blocks duplicate EXECUTE for the same proposal/skill target.
 * APPROVE never bypasses this gate.
 * Active-slot claim (transaction + partial unique index) is the race-safe path used by executor.
 */
import { prisma } from "@/lib/prisma";
import { ARKAON_ACTIVE_EXECUTION_STATUSES } from "./claim-execution-slot";

export async function assertArkaonExecutionIdempotency(input: {
  proposalId: string;
  skillId: string;
}): Promise<{ allowed: boolean; reason?: string; existingExecutionId?: string }> {
  const existing = await prisma.arkaonExecution.findFirst({
    where: {
      proposalId: input.proposalId,
      skillId: input.skillId,
      status: { in: [...ARKAON_ACTIVE_EXECUTION_STATUSES] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true },
  });

  if (!existing) return { allowed: true };

  if (existing.status === "EXECUTION_AVAILABLE") {
    return {
      allowed: false,
      reason: "Idempotency Gate: an in-flight execution already exists for this proposal/skill.",
      existingExecutionId: existing.id,
    };
  }

  return {
    allowed: false,
    reason: `Idempotency Gate: proposal already has ${existing.status} execution. Re-execute is blocked.`,
    existingExecutionId: existing.id,
  };
}
