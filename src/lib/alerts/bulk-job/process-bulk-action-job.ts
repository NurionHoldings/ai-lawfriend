import { Prisma } from "@prisma/client";
import { replaceBulkJobItemsInTransaction } from "@/lib/admin/bulk-job-persist-items";
import { startHeartbeatTimers } from "@/lib/admin/bulk-jobs/worker-health";
import { prisma } from "@/lib/prisma";
import { executeAlertBulkAction } from "@/lib/alerts/execute-alert-bulk-action";
import { acquireBulkJobLock, releaseBulkJobLock } from "@/lib/alerts/bulk-job/worker-lock";
import { createBulkJobNotification } from "@/lib/alerts/bulk-job/create-bulk-job-notifications";
import type { AlertBulkActionType } from "@/types/alert-bulk";

function parseTargetIds(json: Prisma.JsonValue): string[] {
  if (Array.isArray(json)) {
    return json.filter((x): x is string => typeof x === "string");
  }
  if (typeof json === "string") {
    try {
      const parsed = JSON.parse(json) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((x): x is string => typeof x === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parsePayload(json: Prisma.JsonValue | null): {
  assigneeUserId?: string;
  note?: string;
} {
  if (json === null || json === undefined) return {};
  if (typeof json !== "object" || Array.isArray(json)) return {};
  const o = json as Record<string, unknown>;
  const assigneeUserId =
    typeof o.assigneeUserId === "string" ? o.assigneeUserId : undefined;
  const note = typeof o.note === "string" ? o.note : undefined;
  return { assigneeUserId, note };
}

export async function processBulkActionJob(jobId: string) {
  const lock = await acquireBulkJobLock(jobId);
  if (!lock) {
    throw new Error("다른 워커가 이미 처리 중이거나 잠금 획득에 실패했습니다.");
  }

  let heartbeat: ReturnType<typeof startHeartbeatTimers> | null = null;

  try {
    const job = await prisma.bulkActionJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new Error("BulkActionJob을 찾을 수 없습니다.");
    }

    if (job.status === "CANCELED") {
      throw new Error("취소된 Job은 실행할 수 없습니다.");
    }

    await prisma.bulkActionJob.update({
      where: { id: jobId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        errorMessage: null,
      },
    });

    const latestJob = await prisma.bulkActionJob.findUnique({
      where: { id: jobId },
    });

    if (!latestJob) {
      throw new Error("Job 재조회에 실패했습니다.");
    }

    if (latestJob.status === "CANCELED") {
      throw new Error("취소된 Job입니다.");
    }

    heartbeat = startHeartbeatTimers({
      jobId,
      lockToken: lock.token,
      workerKey: `bulk-job-worker:${process.pid}`,
      workerType: "bulk-action-job",
    });
    await heartbeat.beatOnce();

    const actor = await prisma.user.findUnique({
      where: { id: latestJob.actorId },
      select: { name: true },
    });

    const alertIds = parseTargetIds(latestJob.targetIdsJson);
    const payload = parsePayload(latestJob.payloadJson);

    const result = await executeAlertBulkAction({
      actorId: latestJob.actorId,
      actorName: actor?.name ?? "관리자",
      action: latestJob.action as AlertBulkActionType,
      alertIds,
      assigneeUserId: payload.assigneeUserId,
      note: payload.note,
    });

    const status =
      result.failureCount === 0
        ? "SUCCESS"
        : result.successCount > 0
          ? "PARTIAL_SUCCESS"
          : "FAILED";

    const updated = await prisma.$transaction(async (tx) => {
      await replaceBulkJobItemsInTransaction(tx, jobId, latestJob.action, result);

      return tx.bulkActionJob.update({
        where: { id: jobId },
        data: {
          status,
          resultJson: result as unknown as Prisma.InputJsonValue,
          finishedAt: new Date(),
          totalItems: result.requestedCount,
          completedItems: result.successCount,
          failedItems: result.failureCount,
          canceledItems: 0,
        },
      });
    });

    if (status === "SUCCESS") {
      await createBulkJobNotification({
        userId: latestJob.actorId,
        jobId: latestJob.id,
        type: "BULK_JOB_SUCCESS",
        title: `[대량 액션 완료] ${latestJob.action}`,
        body: `요청 ${result.requestedCount}건이 모두 성공 처리되었습니다.`,
      });
    } else if (status === "PARTIAL_SUCCESS") {
      await createBulkJobNotification({
        userId: latestJob.actorId,
        jobId: latestJob.id,
        type: "BULK_JOB_PARTIAL_SUCCESS",
        title: `[대량 액션 부분 완료] ${latestJob.action}`,
        body: `성공 ${result.successCount}건 / 실패 ${result.failureCount}건`,
      });
    } else {
      await createBulkJobNotification({
        userId: latestJob.actorId,
        jobId: latestJob.id,
        type: "BULK_JOB_FAILED",
        title: `[대량 액션 실패] ${latestJob.action}`,
        body: `요청 ${result.requestedCount}건이 실패했습니다.`,
      });
    }

    await heartbeat.stop("IDLE");

    return updated;
  } catch (error) {
    if (heartbeat) {
      await heartbeat.stop("ERROR").catch(() => {});
    }

    const message =
      error instanceof Error ? error.message : "대량 액션 Job 실행 중 오류가 발생했습니다.";

    const failed = await prisma.bulkActionJob.updateMany({
      where: {
        id: jobId,
        status: "RUNNING",
      },
      data: {
        status: "FAILED",
        errorMessage: message,
        finishedAt: new Date(),
      },
    });

    if (failed.count > 0) {
      const existing = await prisma.bulkActionJob.findUnique({
        where: { id: jobId },
      });

      if (existing) {
        await createBulkJobNotification({
          userId: existing.actorId,
          jobId: existing.id,
          type: "BULK_JOB_FAILED",
          title: `[대량 액션 실패] ${existing.action}`,
          body: message,
        });
      }
    }

    throw new Error(message);
  } finally {
    await releaseBulkJobLock(jobId, lock.token);
  }
}
