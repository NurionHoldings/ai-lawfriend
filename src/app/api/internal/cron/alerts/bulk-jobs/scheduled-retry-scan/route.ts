import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getFailedItemsByTaxonomy } from "@/lib/bulk-jobs/get-failed-items-by-taxonomy";
import { buildRecommendedActionDedupeKey } from "@/lib/bulk-jobs/recommended-action-dedupe";

export const dynamic = "force-dynamic";

function authorizeCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const q = req.nextUrl.searchParams.get("secret");
  if (q === secret) return true;

  return false;
}

async function handle(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const schedules = await prisma.bulkActionSchedule.findMany({
    where: {
      status: "PENDING",
      scheduledFor: {
        lte: now,
      },
    },
    orderBy: { scheduledFor: "asc" },
    take: 20,
    select: {
      id: true,
      sourceJobId: true,
      taxonomy: true,
      bulkVariant: true,
      note: true,
      sourceJob: {
        select: {
          id: true,
          action: true,
          actorId: true,
          priority: true,
          queueGroup: true,
          concurrencyKey: true,
          maxConcurrency: true,
          payloadJson: true,
        },
      },
    },
  });

  const results: Array<{
    scheduleId: string;
    createdJobId?: string;
    status: string;
    reason?: string;
  }> = [];

  for (const schedule of schedules) {
    try {
      const claimed = await prisma.bulkActionSchedule.updateMany({
        where: {
          id: schedule.id,
          status: "PENDING",
        },
        data: {
          status: "CLAIMED",
        },
      });

      if (claimed.count === 0) {
        results.push({
          scheduleId: schedule.id,
          status: "SKIPPED",
          reason: "already claimed",
        });
        continue;
      }

      const items = await getFailedItemsByTaxonomy({
        jobId: schedule.sourceJobId,
        taxonomy: schedule.taxonomy,
      });

      if (items.length === 0) {
        await prisma.bulkActionSchedule.update({
          where: { id: schedule.id },
          data: { status: "DONE" },
        });

        results.push({
          scheduleId: schedule.id,
          status: "DONE",
          reason: "no failed items",
        });
        continue;
      }

      const parentJob = schedule.sourceJob;
      const dedupeKey = buildRecommendedActionDedupeKey({
        sourceJobId: schedule.sourceJobId,
        taxonomy: schedule.taxonomy,
        bulkVariant: "retry_failed_items",
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

      const jobMetadata: Record<string, unknown> = {
        type: "scheduled-recommended-retry",
        sourceJobId: schedule.sourceJobId,
        taxonomy: schedule.taxonomy,
        bulkVariant: "retry_failed_items",
        targetCount: items.length,
        note: schedule.note ?? null,
        dedupeKey,
        scheduleId: schedule.id,
        retryMode: "RECOMMENDED_ACTION_FAILED_ITEMS",
      };

      const retryJob = await prisma.$transaction(async (tx) => {
        const job = await tx.bulkActionJob.create({
          data: {
            action: parentJob.action,
            status: "QUEUED",
            actorId: parentJob.actorId,
            payloadJson:
              Object.keys(payloadObj).length > 0
                ? ({
                    ...payloadObj,
                    recommendedRetryReason: `taxonomy:${schedule.taxonomy}`,
                    ...(schedule.note ? { recommendedActionNote: schedule.note } : {}),
                  } as Prisma.InputJsonValue)
                : schedule.note
                  ? ({ recommendedActionNote: schedule.note } as Prisma.InputJsonValue)
                  : undefined,
            targetIdsJson: alertEventIds as Prisma.InputJsonValue,
            retryOfJobId: parentJob.id,
            priority: parentJob.priority,
            queueGroup: parentJob.queueGroup,
            concurrencyKey: parentJob.concurrencyKey,
            maxConcurrency: parentJob.maxConcurrency,
            metadata: jobMetadata as Prisma.InputJsonValue,
          },
          select: { id: true },
        });

        await tx.bulkActionSchedule.update({
          where: { id: schedule.id },
          data: {
            status: "DONE",
            createdRetryJobId: job.id,
          },
        });

        await tx.auditLog.create({
          data: {
            actorUserId: parentJob.actorId,
            action: "bulk_job.scheduled_retry.executed",
            entityType: "BulkActionSchedule",
            entityId: schedule.id,
            message: `예약 재시도 Job 생성 (${items.length}건)`,
            metadata: {
              sourceJobId: schedule.sourceJobId,
              taxonomy: schedule.taxonomy,
              createdRetryJobId: job.id,
              count: items.length,
            } as Prisma.InputJsonValue,
          },
        });

        await tx.adminNotification.create({
          data: {
            userId: parentJob.actorId,
            type: "SYSTEM",
            title: "예약 재시도 실행",
            body: `${schedule.taxonomy} 실패 항목 ${items.length}건에 대한 예약 재시도 Job이 생성되었습니다.`,
            targetHref: `/admin/alerts/bulk-jobs/${job.id}`,
            metaJson: {
              scheduleId: schedule.id,
              sourceJobId: schedule.sourceJobId,
              taxonomy: schedule.taxonomy,
              bulkActionJobId: job.id,
            },
          },
        });

        return job;
      });

      results.push({
        scheduleId: schedule.id,
        createdJobId: retryJob.id,
        status: "CREATED",
      });
    } catch (error) {
      await prisma.bulkActionSchedule.updateMany({
        where: {
          id: schedule.id,
          status: "CLAIMED",
        },
        data: {
          status: "FAILED",
        },
      });

      results.push({
        scheduleId: schedule.id,
        status: "FAILED",
        reason: error instanceof Error ? error.message : "unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
