import { upsertWorkerHeartbeat } from "@/lib/admin/bulk-jobs/worker-health";
import { prisma } from "@/lib/prisma";
import { processBulkActionJob } from "@/lib/alerts/bulk-job/process-bulk-action-job";

export async function runBulkActionQueueScan() {
  await upsertWorkerHeartbeat({
    workerKey: `bulk-job-worker:${process.pid}`,
    workerType: "bulk-action-job",
    status: "IDLE",
  });

  const queuedJobs = await prisma.bulkActionJob.findMany({
    where: {
      status: "QUEUED",
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 10,
  });

  const results: Array<{ jobId: string; ok: boolean; message?: string }> = [];

  for (const job of queuedJobs) {
    try {
      await processBulkActionJob(job.id);
      results.push({ jobId: job.id, ok: true });
    } catch (error) {
      results.push({
        jobId: job.id,
        ok: false,
        message:
          error instanceof Error ? error.message : "Queue 처리 중 오류가 발생했습니다.",
      });
    }
  }

  return {
    picked: queuedJobs.length,
    results,
  };
}
