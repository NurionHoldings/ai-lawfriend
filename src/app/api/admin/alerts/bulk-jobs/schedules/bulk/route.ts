import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { bulkJobScheduleBulkUpdateSchema } from "@/lib/validators/bulk-job-schedule-bulk-update";

export async function PATCH(req: NextRequest) {
  const admin = await requireAdminApi();
  const json = await req.json().catch(() => null);

  const parsed = bulkJobScheduleBulkUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const scheduleIds = parsed.data.scheduleIds;

  const schedules = await prisma.bulkActionSchedule.findMany({
    where: {
      id: { in: scheduleIds },
    },
    select: {
      id: true,
      sourceJobId: true,
      taxonomy: true,
      status: true,
      scheduledFor: true,
      note: true,
    },
  });

  if (schedules.length === 0) {
    return NextResponse.json({ error: "No schedules found" }, { status: 404 });
  }

  const actionData = parsed.data;

  if (actionData.action === "cancel") {
    const targets = schedules.filter((s) => s.status !== "DONE");

    if (targets.length === 0) {
      return NextResponse.json(
        { error: "취소할 수 있는 예약이 없습니다." },
        { status: 400 },
      );
    }

    const auditEntityId = targets[0]!.id;

    await prisma.$transaction(async (tx) => {
      await tx.bulkActionSchedule.updateMany({
        where: {
          id: { in: targets.map((t) => t.id) },
        },
        data: {
          status: "CANCELED",
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId: admin.id,
          action: "bulk_job.schedule.bulk_cancel",
          entityType: "BulkActionSchedule",
          entityId: auditEntityId,
          message: `예약 재시도 대량 취소 (${targets.length}건)`,
          metadata: {
            count: targets.length,
            scheduleIds: targets.map((t) => t.id),
          } as Prisma.InputJsonValue,
        },
      });

      await tx.adminNotification.create({
        data: {
          userId: admin.id,
          type: "SYSTEM",
          title: "예약 재시도 대량 취소",
          body: `${targets.length}건의 예약 재시도가 취소되었습니다.`,
          targetHref: "/admin/alerts/bulk-jobs/schedules",
          metaJson: {
            count: targets.length,
            scheduleIds: targets.map((t) => t.id),
          },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      action: "cancel" as const,
      affectedCount: targets.length,
    });
  }

  const rescheduleData = actionData;
  const nextScheduledFor = new Date(rescheduleData.scheduledFor);
  const targets = schedules.filter((s) => s.status !== "DONE");

  if (targets.length === 0) {
    return NextResponse.json(
      { error: "재예약할 수 있는 예약이 없습니다." },
      { status: 400 },
    );
  }

  const auditEntityId = targets[0]!.id;

  await prisma.$transaction(async (tx) => {
    await tx.bulkActionSchedule.updateMany({
      where: {
        id: { in: targets.map((t) => t.id) },
      },
      data: {
        status: "PENDING",
        scheduledFor: nextScheduledFor,
        note: rescheduleData.note ?? null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "bulk_job.schedule.bulk_reschedule",
        entityType: "BulkActionSchedule",
        entityId: auditEntityId,
        message: `예약 재시도 대량 재설정 (${targets.length}건)`,
        metadata: {
          count: targets.length,
          scheduleIds: targets.map((t) => t.id),
          scheduledFor: nextScheduledFor.toISOString(),
        } as Prisma.InputJsonValue,
      },
    });

    await tx.adminNotification.create({
      data: {
        userId: admin.id,
        type: "SYSTEM",
        title: "예약 재시도 대량 재설정",
        body: `${targets.length}건의 예약 재시도가 ${nextScheduledFor.toLocaleString("ko-KR")} 로 변경되었습니다.`,
        targetHref: "/admin/alerts/bulk-jobs/schedules",
        metaJson: {
          count: targets.length,
          scheduleIds: targets.map((t) => t.id),
          scheduledFor: nextScheduledFor.toISOString(),
        },
      },
    });
  });

  return NextResponse.json({
    ok: true,
    action: "reschedule" as const,
    affectedCount: targets.length,
    scheduledFor: nextScheduledFor.toISOString(),
  });
}
