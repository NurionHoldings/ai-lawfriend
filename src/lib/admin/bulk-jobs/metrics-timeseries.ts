import { prisma } from "@/lib/prisma";

function floorHour(d: Date) {
  const copy = new Date(d);
  copy.setMinutes(0, 0, 0);
  return copy;
}

function toKey(d: Date) {
  return floorHour(d).toISOString();
}

export type BulkJobTimeseriesPoint = {
  bucket: string;
  label: string;
  retryStormCount: number;
  anomalyCount: number;
};

export async function getBulkJobTimeseriesMetrics(hours: number): Promise<BulkJobTimeseriesPoint[]> {
  const safeHours = Math.min(168, Math.max(1, hours));
  const now = new Date();
  const since = new Date(now.getTime() - safeHours * 60 * 60 * 1000);

  const jobs = await prisma.bulkActionJob.findMany({
    where: {
      createdAt: {
        gte: since,
      },
    },
    select: {
      id: true,
      retryOfJobId: true,
      createdAt: true,
      startedAt: true,
      finishedAt: true,
      lastHeartbeatAt: true,
      status: true,
      failedItems: true,
      totalItems: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const buckets = new Map<string, BulkJobTimeseriesPoint>();
  for (let i = safeHours - 1; i >= 0; i--) {
    const dt = new Date(now.getTime() - i * 60 * 60 * 1000);
    const key = toKey(dt);
    buckets.set(key, {
      bucket: key,
      label: new Date(key).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
      }),
      retryStormCount: 0,
      anomalyCount: 0,
    });
  }

  for (const job of jobs) {
    const key = toKey(job.createdAt);
    const row = buckets.get(key);
    if (!row) continue;

    if (job.retryOfJobId) {
      row.retryStormCount += 1;
    }

    const isLongRunning =
      job.status === "RUNNING" &&
      job.startedAt &&
      !job.finishedAt &&
      now.getTime() - job.startedAt.getTime() > 30 * 60 * 1000;

    const isStaleHeartbeat =
      job.status === "RUNNING" &&
      job.lastHeartbeatAt != null &&
      now.getTime() - job.lastHeartbeatAt.getTime() > 10 * 60 * 1000;

    const failRatio =
      job.totalItems > 0 ? job.failedItems / job.totalItems : 0;
    const isHighFailure = failRatio >= 0.5 && job.failedItems >= 5;

    if (isLongRunning || isStaleHeartbeat || isHighFailure) {
      row.anomalyCount += 1;
    }
  }

  return Array.from(buckets.values());
}
