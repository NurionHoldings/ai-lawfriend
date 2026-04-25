import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { bulkJobScheduleUpdateSchema } from "@/lib/validators/bulk-job-schedule-update";

type RouteContext = {
  params: Promise<{ scheduleId: string }>;
};

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const admin = await requireAdminApi();
  const { scheduleId } = await ctx.params;
  const json = await req.json().catch(() => null);

  const parsed = bulkJobScheduleUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const before = await prisma.bulkActionSchedule.findUnique({
    where: { id: scheduleId },
    select: {
      id: true,
      sourceJobId: true,
      taxonomy: true,
      bulkVariant: true,
      status: true,
      scheduledFor: true,
      note: true,
      createdRetryJobId: true,
    },
  });

  if (!before) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  if (parsed.data.action === "cancel") {
    if (before.status === "DONE") {
      return NextResponse.json(
        { error: "이미 실행 완료된 예약은 취소할 수 없습니다." },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const schedule = await tx.bulkActionSchedule.update({
        where: { id: scheduleId },
        data: {
          status: "CANCELED",
        },
        select: {
          id: true,
          status: true,
          scheduledFor: true,
          updatedAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "bulk_job.schedule.cancel",
          entityType: "BulkActionSchedule",
          entityId: scheduleId,
          message: "예약 재시도 취소",
          metadata: {
            sourceJobId: before.sourceJobId,
            before,
            after: schedule,
          } as Prisma.InputJsonValue,
        },
      });

      await tx.adminNotification.create({
        data: {
          userId: admin.id,
          type: "SYSTEM",
          title: "예약 재시도 취소",
          body: `${before.taxonomy} 예약 재시도가 취소되었습니다.`,
          targetHref: `/admin/alerts/bulk-jobs/schedules/${scheduleId}`,
          metaJson: {
            sourceJobId: before.sourceJobId,
            bulkActionJobId: before.sourceJobId,
            taxonomy: before.taxonomy,
            scheduleId,
          },
        },
      });

      return schedule;
    });

    return NextResponse.json({ ok: true, schedule: updated });
  }

  if (before.status === "DONE") {
    return NextResponse.json(
      { error: "이미 실행 완료된 예약은 재예약할 수 없습니다." },
      { status: 400 },
    );
  }

  const nextScheduledFor = new Date(parsed.data.scheduledFor);
  const nextNote =
    parsed.data.note !== undefined ? parsed.data.note : before.note ?? null;

  const updated = await prisma.$transaction(async (tx) => {
    const schedule = await tx.bulkActionSchedule.update({
      where: { id: scheduleId },
      data: {
        status: "PENDING",
        scheduledFor: nextScheduledFor,
        note: nextNote,
      },
      select: {
        id: true,
        status: true,
        scheduledFor: true,
        note: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "bulk_job.schedule.reschedule",
        entityType: "BulkActionSchedule",
        entityId: scheduleId,
        message: "예약 재시도 재설정",
        metadata: {
          sourceJobId: before.sourceJobId,
          before,
          after: {
            ...schedule,
            scheduledFor: schedule.scheduledFor.toISOString(),
          },
        } as Prisma.InputJsonValue,
      },
    });

    await tx.adminNotification.create({
      data: {
        userId: admin.id,
        type: "SYSTEM",
        title: "예약 재시도 재설정",
        body: `${before.taxonomy} 예약 재시도가 ${nextScheduledFor.toLocaleString("ko-KR")} 로 변경되었습니다.`,
        targetHref: `/admin/alerts/bulk-jobs/schedules/${scheduleId}`,
        metaJson: {
          sourceJobId: before.sourceJobId,
          bulkActionJobId: before.sourceJobId,
          taxonomy: before.taxonomy,
          scheduledFor: nextScheduledFor.toISOString(),
          scheduleId,
        },
      },
    });

    return schedule;
  });

  return NextResponse.json({ ok: true, schedule: updated });
}
