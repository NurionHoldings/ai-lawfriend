import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { detectJobAnomalies } from "@/lib/admin/bulk-job-anomaly";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdminApi();

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [recentJobs, runningJobs, longRunningCount, highFailureCount, retryGroup] =
    await Promise.all([
      prisma.bulkActionJob.findMany({
        where: { createdAt: { gte: since24h } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          action: true,
          status: true,
          createdAt: true,
          startedAt: true,
          finishedAt: true,
          totalItems: true,
          completedItems: true,
          failedItems: true,
          lastHeartbeatAt: true,
        },
      }),
      prisma.bulkActionJob.count({
        where: { status: "RUNNING" },
      }),
      prisma.bulkActionJob.count({
        where: {
          status: "RUNNING",
          startedAt: {
            lte: new Date(now.getTime() - 15 * 60 * 1000),
          },
        },
      }),
      prisma.bulkActionJob.count({
        where: {
          failedItems: { gte: 10 },
        },
      }),
      prisma.bulkActionJob.groupBy({
        by: ["retryOfJobId"],
        where: { retryOfJobId: { not: null } },
        _count: { _all: true },
      }),
    ]);

  const retryCountMap = new Map(
    retryGroup
      .filter((row): row is typeof row & { retryOfJobId: string } => row.retryOfJobId != null)
      .map((row) => [row.retryOfJobId, row._count._all])
  );

  const anomalyJobs = recentJobs
    .map((job) => ({
      ...job,
      anomalies: detectJobAnomalies(job, retryCountMap.get(job.id) ?? 0, now),
    }))
    .filter((job) => job.anomalies.length > 0)
    .slice(0, 20);

  return NextResponse.json({
    ok: true,
    summary: {
      runningJobs,
      longRunningCount,
      highFailureCount,
      anomalyJobsCount: anomalyJobs.length,
    },
    anomalyJobs,
  });
}
