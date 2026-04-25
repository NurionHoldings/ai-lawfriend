import { prisma } from "@/lib/prisma";

function parseLocalDateStart(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseLocalDateEnd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export async function getBulkJobOpsDashboard(params?: { from?: string; to?: string }) {
  const where = {
    ...(params?.from || params?.to
      ? {
          createdAt: {
            ...(params?.from ? { gte: parseLocalDateStart(params.from) } : {}),
            ...(params?.to ? { lte: parseLocalDateEnd(params.to) } : {}),
          },
        }
      : {}),
  };

  const now = new Date();

  const [
    total,
    queued,
    running,
    success,
    partialSuccess,
    failed,
    canceled,
    retryCount,
    staleLockCount,
    recentJobs,
  ] = await Promise.all([
    prisma.bulkActionJob.count({ where }),
    prisma.bulkActionJob.count({ where: { ...where, status: "QUEUED" } }),
    prisma.bulkActionJob.count({ where: { ...where, status: "RUNNING" } }),
    prisma.bulkActionJob.count({ where: { ...where, status: "SUCCESS" } }),
    prisma.bulkActionJob.count({ where: { ...where, status: "PARTIAL_SUCCESS" } }),
    prisma.bulkActionJob.count({ where: { ...where, status: "FAILED" } }),
    prisma.bulkActionJob.count({ where: { ...where, status: "CANCELED" } }),
    prisma.bulkActionJob.count({ where: { ...where, retryOfJobId: { not: null } } }),
    prisma.bulkActionJob.count({
      where: {
        ...where,
        status: "RUNNING",
        lockExpiresAt: { lt: now },
      },
    }),
    prisma.bulkActionJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 14,
      select: {
        createdAt: true,
        status: true,
      },
    }),
  ]);

  const timelineMap = new Map<
    string,
    { date: string; total: number; failed: number; success: number }
  >();

  for (const job of recentJobs) {
    const date = new Date(job.createdAt).toISOString().slice(0, 10);

    if (!timelineMap.has(date)) {
      timelineMap.set(date, {
        date,
        total: 0,
        failed: 0,
        success: 0,
      });
    }

    const row = timelineMap.get(date)!;
    row.total += 1;
    if (job.status === "FAILED") row.failed += 1;
    if (job.status === "SUCCESS") row.success += 1;
  }

  return {
    summary: {
      total,
      queued,
      running,
      success,
      partialSuccess,
      failed,
      canceled,
      retryCount,
      staleLockCount,
      retryRate: total > 0 ? Number(((retryCount / total) * 100).toFixed(1)) : 0,
      failureRate: total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0,
    },
    timeline: Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
