import { WORKER_STALE_MS } from "@/lib/admin/bulk-jobs/constants";
import { prisma } from "@/lib/prisma";
import { createBulkJobNotification } from "@/lib/alerts/bulk-job/create-bulk-job-notifications";

export async function recoverStaleBulkJobLocks() {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - WORKER_STALE_MS);

  const staleJobs = await prisma.bulkActionJob.findMany({
    where: {
      status: "RUNNING",
      OR: [
        { lockExpiresAt: { lt: now } },
        { lastHeartbeatAt: { lt: staleThreshold } },
        {
          AND: [{ lastHeartbeatAt: null }, { startedAt: { lt: staleThreshold } }],
        },
      ],
    },
    take: 50,
    orderBy: {
      lockExpiresAt: "asc",
    },
  });

  const results: Array<{ jobId: string; recovered: boolean; message?: string }> = [];

  for (const job of staleJobs) {
    try {
      const updated = await prisma.bulkActionJob.updateMany({
        where: {
          id: job.id,
          status: "RUNNING",
          OR: [
            { lockExpiresAt: { lt: now } },
            { lastHeartbeatAt: { lt: staleThreshold } },
            {
              AND: [{ lastHeartbeatAt: null }, { startedAt: { lt: staleThreshold } }],
            },
          ],
        },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          errorMessage:
            "Worker lock 또는 heartbeat 타임아웃으로 인해 자동 복구 처리되었습니다.",
          lockedAt: null,
          lockToken: null,
          lockExpiresAt: null,
        },
      });

      if (updated.count > 0) {
        await createBulkJobNotification({
          userId: job.actorId,
          jobId: job.id,
          type: "BULK_JOB_FAILED",
          title: `[대량 액션 자동 복구] ${job.action}`,
          body: "Lock/heartbeat 타임아웃으로 Job이 FAILED 상태로 복구되었습니다.",
        });

        results.push({ jobId: job.id, recovered: true });
      } else {
        results.push({
          jobId: job.id,
          recovered: false,
          message: "이미 다른 프로세스에서 상태가 변경되었습니다.",
        });
      }
    } catch (error) {
      results.push({
        jobId: job.id,
        recovered: false,
        message:
          error instanceof Error ? error.message : "복구 처리 중 오류가 발생했습니다.",
      });
    }
  }

  return {
    scannedCount: staleJobs.length,
    results,
  };
}
