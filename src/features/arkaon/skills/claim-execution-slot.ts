/**
 * Atomic claim for L2 execution slot.
 * Combines Idempotency check + create under a transaction.
 * Partial unique index (proposalId, skillId) WHERE status IN active set
 * closes the TOCTOU race between concurrent EXECUTE requests.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const ARKAON_ACTIVE_EXECUTION_STATUSES = [
  "EXECUTION_AVAILABLE",
  "EXECUTED",
  "VERIFIED",
] as const;

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code) : "";
  // Prisma P2002 = unique constraint
  return code === "P2002";
}

export async function claimArkaonExecutionSlot(input: {
  proposalId: string;
  skillId: string;
  actorUserId: string;
  payload?: Prisma.InputJsonValue;
}): Promise<
  | { claimed: true; executionId: string }
  | { claimed: false; reason: string; existingExecutionId?: string }
> {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.arkaonExecution.findFirst({
        where: {
          proposalId: input.proposalId,
          skillId: input.skillId,
          status: { in: [...ARKAON_ACTIVE_EXECUTION_STATUSES] },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true },
      });

      if (existing) {
        return {
          claimed: false as const,
          reason:
            existing.status === "EXECUTION_AVAILABLE"
              ? "Idempotency Gate: an in-flight execution already exists for this proposal/skill."
              : `Idempotency Gate: proposal already has ${existing.status} execution. Re-execute is blocked.`,
          existingExecutionId: existing.id,
        };
      }

      const created = await tx.arkaonExecution.create({
        data: {
          proposalId: input.proposalId,
          skillId: input.skillId,
          status: "EXECUTION_AVAILABLE",
          actorUserId: input.actorUserId,
          payload: input.payload,
          executeAllowed: true,
        },
        select: { id: true },
      });

      return { claimed: true as const, executionId: created.id };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const raced = await prisma.arkaonExecution.findFirst({
        where: {
          proposalId: input.proposalId,
          skillId: input.skillId,
          status: { in: [...ARKAON_ACTIVE_EXECUTION_STATUSES] },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      return {
        claimed: false,
        reason:
          "Idempotency Gate: concurrent EXECUTE lost the race (DB unique active execution).",
        existingExecutionId: raced?.id,
      };
    }
    throw error;
  }
}
