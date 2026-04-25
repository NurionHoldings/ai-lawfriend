import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { buildBulkJobItemFailureFields } from "@/lib/admin/bulk-job-item-enrichment";
import type { AlertBulkActionResult } from "@/types/alert-bulk";

export function buildBulkJobItemRowsFromResult(
  jobId: string,
  jobAction: string,
  result: AlertBulkActionResult
): Prisma.BulkActionJobItemCreateManyInput[] {
  const rows: Prisma.BulkActionJobItemCreateManyInput[] = [];
  let seq = 0;
  const now = new Date();

  for (const s of result.successes) {
    rows.push({
      id: randomUUID(),
      jobId,
      targetType: "AlertEvent",
      targetId: s.alertEventId,
      action: jobAction,
      status: "SUCCESS",
      sequence: seq++,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const f of result.failures) {
    const failFields = buildBulkJobItemFailureFields({
      errorMessage: f.reason,
    });
    rows.push({
      id: randomUUID(),
      jobId,
      targetType: "AlertEvent",
      targetId: f.alertEventId,
      action: jobAction,
      status: "FAILED",
      sequence: seq++,
      errorMessage: f.reason,
      ...failFields,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  return rows;
}

export async function replaceBulkJobItemsInTransaction(
  tx: Prisma.TransactionClient,
  jobId: string,
  jobAction: string,
  result: AlertBulkActionResult
) {
  const rows = buildBulkJobItemRowsFromResult(jobId, jobAction, result);
  await tx.bulkActionJobItem.deleteMany({ where: { jobId } });
  if (rows.length > 0) {
    await tx.bulkActionJobItem.createMany({ data: rows });
  }
}
