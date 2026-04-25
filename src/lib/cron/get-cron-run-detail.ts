import { prisma } from "@/lib/prisma";

export async function getCronRunDetail(logId: string) {
  const run = await prisma.cronJobExecutionLog.findUnique({
    where: { id: logId },
  });

  if (!run) return null;

  const related = await prisma.cronJobExecutionLog.findMany({
    where: {
      OR: [
        { id: run.id },
        ...(run.retryOfRunId ? [{ id: run.retryOfRunId }] : []),
        { retryOfRunId: run.id },
      ],
    },
    orderBy: { startedAt: "desc" },
  });

  const seen = new Map<string, (typeof related)[0]>();
  for (const row of related) {
    seen.set(row.id, row);
  }
  const retryRuns = Array.from(seen.values()).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  const notifications = await prisma.adminNotification.findMany({
    where: {
      targetHref: { contains: logId },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return {
    run,
    retryRuns,
    notifications,
  };
}
