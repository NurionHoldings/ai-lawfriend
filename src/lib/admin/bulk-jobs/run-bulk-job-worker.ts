import { prisma } from "@/lib/prisma";
import { processBulkActionJob } from "@/lib/alerts/bulk-job/process-bulk-action-job";
import { upsertWorkerHeartbeat } from "@/lib/admin/bulk-jobs/worker-health";

export async function runBulkJobWorkerOnce() {
  await upsertWorkerHeartbeat({
    workerKey: `bulk-job-worker:${process.pid}`,
    workerType: "bulk-action-job",
    status: "IDLE",
  });

  const nextJob = await prisma.bulkActionJob.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!nextJob) {
    await upsertWorkerHeartbeat({
      workerKey: `bulk-job-worker:${process.pid}`,
      workerType: "bulk-action-job",
      status: "IDLE",
    });
    return { processed: false as const };
  }

  await processBulkActionJob(nextJob.id);
  return { processed: true as const };
}
