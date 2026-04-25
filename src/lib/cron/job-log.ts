import type { CronJobStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCronFailureNotifications } from "@/lib/cron/create-cron-failure-notifications";

type StartArgs = {
  jobCode: string;
  jobName: string;
  triggeredBy?: string;
  retryOfRunId?: string | null;
};

type FinishArgs = {
  logId: string;
  status: CronJobStatus;
  scannedCount?: number;
  affectedCount?: number;
  message?: string;
  errorStack?: string;
  metaJson?: Prisma.InputJsonValue;
  startedAt: Date;
};

export async function startCronJobLog(args: StartArgs) {
  const startedAt = new Date();

  const log = await prisma.cronJobExecutionLog.create({
    data: {
      jobCode: args.jobCode,
      jobName: args.jobName,
      status: "RUNNING",
      startedAt,
      triggeredBy: args.triggeredBy ?? "SYSTEM",
      message: "RUNNING",
      retryOfRunId: args.retryOfRunId ?? null,
    },
  });

  return {
    logId: log.id,
    startedAt,
  };
}

export async function finishCronJobLog(args: FinishArgs) {
  const finishedAt = new Date();

  await prisma.cronJobExecutionLog.update({
    where: { id: args.logId },
    data: {
      status: args.status,
      finishedAt,
      durationMs: finishedAt.getTime() - args.startedAt.getTime(),
      scannedCount: args.scannedCount ?? null,
      affectedCount: args.affectedCount ?? null,
      message: args.message ?? null,
      errorStack: args.errorStack ?? null,
      metaJson: args.metaJson ?? undefined,
    },
  });

  if (args.status === "FAILED" && args.message) {
    const log = await prisma.cronJobExecutionLog.findUnique({
      where: { id: args.logId },
      select: { jobName: true },
    });
    if (log) {
      await createCronFailureNotifications({
        jobName: log.jobName,
        cronLogId: args.logId,
        errorMessage: args.errorStack || args.message || "Cron 실행 실패",
      });
    }
  }
}
