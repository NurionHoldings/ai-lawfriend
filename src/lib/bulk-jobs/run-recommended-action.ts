import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createBulkActionJob } from "@/lib/alerts/bulk-job/create-bulk-action-job";
import type { FailureActionBulkVariant } from "@/lib/bulk-jobs/failure-action-recommendation";
import { getFailedItemsByTaxonomy } from "@/lib/bulk-jobs/get-failed-items-by-taxonomy";
import {
  buildOpsQueueDedupeKey,
  buildRecommendedActionDedupeKey,
  buildScheduleDedupeKey,
} from "@/lib/bulk-jobs/recommended-action-dedupe";
import { checkRecommendedActionDuplicate } from "@/lib/bulk-jobs/check-recommended-action-duplicate";
import { buildScheduledRetryTime } from "@/lib/bulk-jobs/retry-schedule-policy";
import {
  buildOpsQueueTitle,
  getOpsQueueSeverity,
} from "@/lib/bulk-jobs/ops-queue-policy";
import type { AlertBulkActionType } from "@/types/alert-bulk";

type RunParams = {
  jobId: string;
  taxonomy: string;
  bulkVariant: FailureActionBulkVariant;
  actorId: string;
  actorName?: string | null;
  note?: string;
};

function buildRecommendedJobMetadata(params: {
  sourceJobId: string;
  taxonomy: string;
  bulkVariant: FailureActionBulkVariant;
  count: number;
  note?: string;
  dedupeKey: string;
}): Record<string, unknown> {
  return {
    type: "recommended-action",
    sourceJobId: params.sourceJobId,
    taxonomy: params.taxonomy,
    bulkVariant: params.bulkVariant,
    targetCount: params.count,
    note: params.note ?? null,
    dedupeKey: params.dedupeKey,
  };
}

function tagForVariant(bulkVariant: FailureActionBulkVariant): string {
  switch (bulkVariant) {
    case "mark_permission_check":
      return "PERMISSION_CHECK_REQUIRED";
    case "mark_input_fix_required":
      return "INPUT_FIX_REQUIRED";
    case "mark_manual_review":
      return "MANUAL_REVIEW_REQUIRED";
    case "inspect_dependency_only":
      return "DEPENDENCY_INSPECTION_REQUIRED";
    default:
      return "UNKNOWN";
  }
}

export async function runRecommendedAction(params: RunParams) {
  const items = await getFailedItemsByTaxonomy({
    jobId: params.jobId,
    taxonomy: params.taxonomy,
  });

  if (items.length === 0) {
    return {
      ok: false as const,
      error: "해당 taxonomy에 속한 실패 항목이 없습니다.",
    };
  }

  if (params.bulkVariant === "retry_failed_items") {
    const duplicate = await checkRecommendedActionDuplicate({
      sourceJobId: params.jobId,
      taxonomy: params.taxonomy,
      bulkVariant: params.bulkVariant,
    });

    if (duplicate.duplicated) {
      return {
        ok: false as const,
        error: "동일 추천 액션의 재시도 Job이 이미 대기 또는 실행 중입니다.",
        duplicateJobId: duplicate.existingJob.id,
      };
    }

    const parentJob = await prisma.bulkActionJob.findUnique({
      where: { id: params.jobId },
    });

    if (!parentJob) {
      return { ok: false as const, error: "원본 Job을 찾을 수 없습니다." };
    }

    const dedupeKey = buildRecommendedActionDedupeKey({
      sourceJobId: params.jobId,
      taxonomy: params.taxonomy,
      bulkVariant: params.bulkVariant,
    });

    const alertEventIds = items.map((i) => i.targetId);
    const payload = parentJob.payloadJson;
    const payloadObj =
      payload !== null &&
      payload !== undefined &&
      typeof payload === "object" &&
      !Array.isArray(payload)
        ? { ...(payload as Record<string, unknown>) }
        : {};

    const job = await createBulkActionJob({
      actorId: params.actorId,
      action: parentJob.action as AlertBulkActionType,
      alertEventIds,
      payload:
        Object.keys(payloadObj).length > 0
          ? {
              ...payloadObj,
              recommendedRetryReason: `taxonomy:${params.taxonomy}`,
              ...(params.note ? { recommendedActionNote: params.note } : {}),
            }
          : params.note
            ? { recommendedActionNote: params.note }
            : undefined,
      retryOfJobId: parentJob.id,
      priority: parentJob.priority,
      queueGroup: parentJob.queueGroup,
      concurrencyKey: parentJob.concurrencyKey,
      maxConcurrency: parentJob.maxConcurrency,
      metadata: {
        ...buildRecommendedJobMetadata({
          sourceJobId: params.jobId,
          taxonomy: params.taxonomy,
          bulkVariant: params.bulkVariant,
          count: items.length,
          note: params.note,
          dedupeKey,
        }),
        retryMode: "RECOMMENDED_ACTION_FAILED_ITEMS",
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.create({
        data: {
          actorUserId: params.actorId,
          action: "bulk_job.recommended_action.retry_failed_items",
          entityType: "BulkActionJob",
          entityId: job.id,
          message: `추천 액션: 즉시 재시도 Job 생성 (${items.length}건)`,
          metadata: {
            sourceJobId: params.jobId,
            taxonomy: params.taxonomy,
            count: items.length,
            note: params.note ?? null,
            actorName: params.actorName ?? null,
            dedupeKey,
          } as Prisma.InputJsonValue,
        },
      });

      await tx.adminNotification.create({
        data: {
          userId: params.actorId,
          type: "SYSTEM",
          title: "추천 액션 실행: 즉시 재시도",
          body: `${params.taxonomy} 실패 항목 ${items.length}건에 대한 재시도 Job이 생성되었습니다.`,
          targetHref: `/admin/alerts/bulk-jobs/${job.id}`,
          metaJson: {
            bulkActionJobId: job.id,
            recommendedAction: true,
            sourceJobId: params.jobId,
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
            dedupeKey,
          },
        },
      });
    });

    return {
      ok: true as const,
      mode: "job_created" as const,
      createdJobId: job.id,
      affectedCount: items.length,
    };
  }

  if (params.bulkVariant === "wait_and_retry_later") {
    const scheduledFor = buildScheduledRetryTime({
      taxonomy: params.taxonomy,
    });

    const dedupeKey = buildScheduleDedupeKey({
      sourceJobId: params.jobId,
      taxonomy: params.taxonomy,
      bulkVariant: params.bulkVariant,
    });

    const existing = await prisma.bulkActionSchedule.findUnique({
      where: { dedupeKey },
      select: {
        id: true,
        status: true,
        scheduledFor: true,
      },
    });

    if (
      existing &&
      ["PENDING", "SCHEDULED", "CLAIMED"].includes(existing.status)
    ) {
      return {
        ok: false as const,
        error: "동일 예약 재시도가 이미 존재합니다.",
        duplicateScheduleId: existing.id,
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      const schedule = await tx.bulkActionSchedule.upsert({
        where: { dedupeKey },
        update: {
          status: "PENDING",
          scheduledFor,
          note: params.note ?? null,
          createdRetryJobId: null,
        },
        create: {
          sourceJobId: params.jobId,
          taxonomy: params.taxonomy,
          bulkVariant: params.bulkVariant,
          status: "PENDING",
          scheduledFor,
          note: params.note ?? null,
          dedupeKey,
        },
        select: {
          id: true,
          scheduledFor: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: params.actorId,
          action: "bulk_job.recommended_action.schedule_retry",
          entityType: "BulkActionJob",
          entityId: params.jobId,
          message: `추천 액션: 예약 재시도 등록 (${items.length}건)`,
          metadata: {
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
            count: items.length,
            scheduledFor: schedule.scheduledFor.toISOString(),
            dedupeKey,
            actorName: params.actorName ?? null,
          } as Prisma.InputJsonValue,
        },
      });

      await tx.adminNotification.create({
        data: {
          userId: params.actorId,
          type: "SYSTEM",
          title: "추천 액션 실행: 예약 재시도",
          body: `${params.taxonomy} 실패 항목 ${items.length}건이 ${schedule.scheduledFor.toLocaleString("ko-KR")} 에 재시도 예정으로 등록되었습니다.`,
          targetHref: `/admin/alerts/bulk-jobs/${params.jobId}`,
          metaJson: {
            bulkActionJobId: params.jobId,
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
            scheduledFor: schedule.scheduledFor.toISOString(),
            dedupeKey,
          },
        },
      });

      return schedule;
    });

    return {
      ok: true as const,
      mode: "scheduled" as const,
      affectedCount: items.length,
      scheduleId: created.id,
      scheduledFor: created.scheduledFor.toISOString(),
    };
  }

  if (
    params.bulkVariant === "mark_permission_check" ||
    params.bulkVariant === "mark_input_fix_required" ||
    params.bulkVariant === "mark_manual_review" ||
    params.bulkVariant === "inspect_dependency_only"
  ) {
    const tag = tagForVariant(params.bulkVariant);

    const opsDedupeKey = buildOpsQueueDedupeKey({
      sourceJobId: params.jobId,
      taxonomy: params.taxonomy,
      bulkVariant: params.bulkVariant,
    });

    const updated = await prisma.$transaction(async (tx) => {
      let affected = 0;

      for (const item of items) {
        const prev =
          item.metadata !== null &&
          item.metadata !== undefined &&
          typeof item.metadata === "object" &&
          !Array.isArray(item.metadata)
            ? (item.metadata as Record<string, unknown>)
            : {};

        await tx.bulkActionJobItem.update({
          where: { id: item.id },
          data: {
            metadata: {
              ...prev,
              recommendationActionApplied: {
                bulkVariant: params.bulkVariant,
                tag,
                note: params.note ?? null,
                appliedAt: new Date().toISOString(),
                taxonomy: params.taxonomy,
              },
            } as Prisma.InputJsonValue,
          },
        });
        affected += 1;
      }

      const ticket = await tx.opsQueueTicket.upsert({
        where: { dedupeKey: opsDedupeKey },
        update: {
          status: "OPEN",
          description: params.note ?? null,
          severity: getOpsQueueSeverity({
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
          }),
          metadata: {
            sourceJobId: params.jobId,
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
            count: affected,
          },
        },
        create: {
          sourceJobId: params.jobId,
          taxonomy: params.taxonomy,
          bulkVariant: params.bulkVariant,
          status: "OPEN",
          title: buildOpsQueueTitle({
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
            count: affected,
          }),
          description: params.note ?? null,
          severity: getOpsQueueSeverity({
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
          }),
          dedupeKey: opsDedupeKey,
          metadata: {
            sourceJobId: params.jobId,
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
            count: affected,
          },
        },
        select: {
          id: true,
          status: true,
          severity: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: params.actorId,
          action: "bulk_job.recommended_action.mark_items",
          entityType: "BulkActionJob",
          entityId: params.jobId,
          message: `추천 액션: 운영 큐 연동 (${affected}건, ${tag})`,
          metadata: {
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
            tag,
            count: affected,
            note: params.note ?? null,
            actorName: params.actorName ?? null,
            opsQueueTicketId: ticket.id,
            opsQueueDedupeKey: opsDedupeKey,
          } as Prisma.InputJsonValue,
        },
      });

      await tx.adminNotification.create({
        data: {
          userId: params.actorId,
          type: "SYSTEM",
          title: "추천 액션 실행 완료",
          body: `${params.taxonomy} 실패 항목 ${affected}건에 ${tag} 태그 반영 및 운영 큐 티켓이 생성되었습니다.`,
          targetHref: `/admin/alerts/ops-queue`,
          metaJson: {
            bulkActionJobId: params.jobId,
            taxonomy: params.taxonomy,
            bulkVariant: params.bulkVariant,
            tag,
            opsQueueTicketId: ticket.id,
          },
        },
      });

      return {
        affected,
        ticketId: ticket.id,
        severity: ticket.severity,
      };
    });

    return {
      ok: true as const,
      mode: "ops_ticket_created" as const,
      affectedCount: updated.affected,
      ticketId: updated.ticketId,
      severity: updated.severity,
      tag,
    };
  }

  return {
    ok: false as const,
    error: "지원하지 않는 추천 액션입니다.",
  };
}
