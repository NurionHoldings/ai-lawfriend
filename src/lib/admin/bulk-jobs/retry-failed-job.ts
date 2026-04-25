import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createBulkActionJob } from "@/lib/alerts/bulk-job/create-bulk-action-job";
import type { AlertBulkActionResult } from "@/types/alert-bulk";

function parsePayload(json: Prisma.JsonValue | null): Record<string, unknown> | undefined {
  if (json === null || json === undefined) return undefined;
  if (typeof json !== "object" || Array.isArray(json)) return undefined;
  return json as Record<string, unknown>;
}

export async function createRetryJobFromFailedItems(params: {
  sourceJobId: string;
  reason?: string;
}) {
  const sourceJob = await prisma.bulkActionJob.findUniqueOrThrow({
    where: { id: params.sourceJobId },
  });

  const failedRows = await prisma.bulkActionJobItem.findMany({
    where: { jobId: params.sourceJobId, status: "FAILED" },
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
    select: { targetId: true },
  });

  const result = sourceJob.resultJson as AlertBulkActionResult | null;
  const failuresFromJson = result?.failures ?? [];

  const alertEventIds =
    failedRows.length > 0
      ? failedRows.map((r) => r.targetId)
      : failuresFromJson.map((f) => f.alertEventId);

  if (alertEventIds.length === 0) {
    throw new Error("FAILED_ITEMS_NOT_FOUND");
  }

  const payload = parsePayload(sourceJob.payloadJson);

  const mergedPayload = {
    ...(payload ?? {}),
    ...(params.reason ? { retryReason: params.reason } : {}),
  };

  return createBulkActionJob({
    actorId: sourceJob.actorId,
    action: sourceJob.action,
    alertEventIds,
    payload: Object.keys(mergedPayload).length ? mergedPayload : undefined,
    retryOfJobId: sourceJob.id,
    priority: sourceJob.priority,
    queueGroup: sourceJob.queueGroup,
    concurrencyKey: sourceJob.concurrencyKey,
    maxConcurrency: sourceJob.maxConcurrency,
    metadata: {
      retryMode: "FAILED_ITEMS_ONLY",
      sourceJobId: sourceJob.id,
      ...(params.reason ? { retryReason: params.reason } : {}),
    },
  });
}
