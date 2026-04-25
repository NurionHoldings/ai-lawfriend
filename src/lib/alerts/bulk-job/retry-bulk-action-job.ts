import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createBulkActionJob } from "@/lib/alerts/bulk-job/create-bulk-action-job";
import type { AlertBulkActionResult } from "@/types/alert-bulk";

function parseTargetIds(json: Prisma.JsonValue): string[] {
  if (Array.isArray(json)) {
    return json.filter((x): x is string => typeof x === "string");
  }
  return [];
}

export async function retryBulkActionJob(params: { jobId: string }) {
  const job = await prisma.bulkActionJob.findUnique({
    where: { id: params.jobId },
  });

  if (!job) {
    throw new Error("원본 Job을 찾을 수 없습니다.");
  }

  if (!["FAILED", "PARTIAL_SUCCESS"].includes(job.status)) {
    throw new Error("실패 또는 부분성공 Job만 재시도할 수 있습니다.");
  }

  const result = (job.resultJson ?? null) as AlertBulkActionResult | null;

  const retryTargetIds =
    result?.failures?.length && result.failures.length > 0
      ? result.failures.map((item) => item.alertEventId)
      : parseTargetIds(job.targetIdsJson);

  const retried = await createBulkActionJob({
    actorId: job.actorId,
    action: job.action,
    alertEventIds: retryTargetIds,
    payload: (job.payloadJson ?? undefined) as Record<string, unknown> | undefined,
    retryOfJobId: job.id,
  });

  return retried;
}
