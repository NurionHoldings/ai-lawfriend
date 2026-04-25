import { finishCronJobLog, startCronJobLog } from "@/lib/cron/job-log";
import { executeEscalationScan } from "@/lib/alerts/escalation-scan-runner";
import { executeSlaScan } from "@/lib/alerts/sla-scan-runner";

export async function runSlaScanWithLog(
  triggeredBy: string,
  retryOfRunId?: string | null
) {
  const { logId, startedAt } = await startCronJobLog({
    jobCode: "alerts.sla_scan",
    jobName: "Alert SLA Scan",
    triggeredBy,
    retryOfRunId: retryOfRunId ?? null,
  });

  try {
    const result = await executeSlaScan();
    await finishCronJobLog({
      logId,
      status: "SUCCESS",
      scannedCount: result.scannedCount,
      affectedCount: result.updatedCount + result.warningCreatedCount,
      message: "SLA scan completed",
      metaJson: {
        updatedCount: result.updatedCount,
        warningCreatedCount: result.warningCreatedCount,
      },
      startedAt,
    });

    return result;
  } catch (error: unknown) {
    const err = error as Error;
    await finishCronJobLog({
      logId,
      status: "FAILED",
      message: err.message ?? "Unknown error",
      errorStack: err.stack ?? String(error),
      startedAt,
    });
    throw error;
  }
}

export async function runEscalationScanWithLog(
  triggeredBy: string,
  retryOfRunId?: string | null
) {
  const { logId, startedAt } = await startCronJobLog({
    jobCode: "alerts.escalation_scan",
    jobName: "Alert Escalation Scan",
    triggeredBy,
    retryOfRunId: retryOfRunId ?? null,
  });

  try {
    const result = await executeEscalationScan();
    await finishCronJobLog({
      logId,
      status: "SUCCESS",
      scannedCount: result.scannedCount,
      affectedCount: result.notificationCount,
      message: "Escalation scan completed",
      metaJson: {
        updatedCount: result.updatedCount,
        notificationCount: result.notificationCount,
      },
      startedAt,
    });

    return result;
  } catch (error: unknown) {
    const err = error as Error;
    await finishCronJobLog({
      logId,
      status: "FAILED",
      message: err.message ?? "Unknown error",
      errorStack: err.stack ?? String(error),
      startedAt,
    });
    throw error;
  }
}
