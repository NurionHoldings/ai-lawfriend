import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateBulkActionJobInput } from "@/types/bulk-action-job";

export async function createBulkActionJob(input: CreateBulkActionJobInput) {
  const priority = input.priority ?? "NORMAL";
  const queueGroup = input.queueGroup ?? "alerts";
  const concurrencyKey = input.concurrencyKey ?? `bulk-action:${input.action}`;
  const maxConcurrency = input.maxConcurrency ?? 2;

  const job = await prisma.bulkActionJob.create({
    data: {
      action: input.action,
      status: "QUEUED",
      actorId: input.actorId,
      payloadJson: input.payload as Prisma.InputJsonValue | undefined,
      targetIdsJson: input.alertEventIds,
      retryOfJobId: input.retryOfJobId ?? null,
      priority,
      queueGroup,
      concurrencyKey,
      maxConcurrency,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  return job;
}
