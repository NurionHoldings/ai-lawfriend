import { prisma } from "@/lib/prisma";

function parseLocalDateStart(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseLocalDateEnd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export async function getBulkJobFailureReasonStats(params?: {
  from?: string;
  to?: string;
  limit?: number;
}) {
  const jobs = await prisma.bulkActionJob.findMany({
    where: {
      status: { in: ["FAILED", "PARTIAL_SUCCESS"] },
      ...(params?.from || params?.to
        ? {
            createdAt: {
              ...(params?.from ? { gte: parseLocalDateStart(params.from) } : {}),
              ...(params?.to ? { lte: parseLocalDateEnd(params.to) } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      errorMessage: true,
      resultJson: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 500,
  });

  const counter = new Map<string, number>();

  for (const job of jobs) {
    if (job.errorMessage) {
      counter.set(job.errorMessage, (counter.get(job.errorMessage) ?? 0) + 1);
    }

    const result = job.resultJson as { failures?: { reason?: string }[] } | null;
    const failures = result?.failures ?? [];
    for (const item of failures) {
      const reason = item?.reason || "기타 실패";
      counter.set(reason, (counter.get(reason) ?? 0) + 1);
    }
  }

  const rows = Array.from(counter.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, params?.limit ?? 10);

  return rows;
}
