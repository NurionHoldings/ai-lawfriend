import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { computeSlaState } from "@/lib/alerts/sla";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { createResolvedTimelineAutoNote } from "@/lib/alerts/auto-resolve-note";

const bodySchema = z.object({
  action: z.enum(["ACKNOWLEDGE", "RESOLVE", "IGNORE", "REASSIGN"]),
  assigneeUserId: z.string().optional(),
  note: z.string().max(2000).optional(),
});

function buildTimelineBody(
  action: string,
  actorName: string,
  extra?: string
) {
  switch (action) {
    case "ACKNOWLEDGE":
      return `[경고 조치] ${actorName}님이 경고를 확인 처리했습니다.${extra ? `\n${extra}` : ""}`;
    case "RESOLVE":
      return `[경고 조치] ${actorName}님이 경고를 해결 처리했습니다.${extra ? `\n${extra}` : ""}`;
    case "IGNORE":
      return `[경고 조치] ${actorName}님이 경고를 무시 처리했습니다.${extra ? `\n사유: ${extra}` : ""}`;
    case "REASSIGN":
      return `[경고 조치] ${actorName}님이 담당자를 재지정했습니다.${extra ? `\n${extra}` : ""}`;
    default:
      return `[경고 조치] ${actorName}님이 경고 상태를 변경했습니다.`;
  }
}

type Params = { params: Promise<{ alertId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { alertId } = await params;
    const parsed = bodySchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "잘못된 요청입니다.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { action, assigneeUserId, note } = parsed.data;

    const alert = await prisma.alertEvent.findUnique({
      where: { id: alertId },
      include: {
        assigneeUser: true,
        rule: { select: { dueSoonHours: true } },
      },
    });

    if (!alert) {
      return NextResponse.json(
        { ok: false, message: "경고를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const caseId = resolveAlertCaseId(alert);

    const result = await prisma.$transaction(async (tx) => {
      let updated;

      if (action === "ACKNOWLEDGE") {
        updated = await tx.alertEvent.update({
          where: { id: alertId },
          data: {
            status: "ACKNOWLEDGED",
            acknowledgedAt: new Date(),
            acknowledgedById: admin.id,
            slaState: computeSlaState({
              dueAt: alert.dueAt,
              status: "ACKNOWLEDGED",
              dueSoonHours:
                alert.dueSoonHours ?? alert.rule?.dueSoonHours ?? undefined,
            }),
          },
        });
      } else if (action === "RESOLVE") {
        updated = await tx.alertEvent.update({
          where: { id: alertId },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            resolvedById: admin.id,
            escalationLevel: "NONE",
            slaState: computeSlaState({
              dueAt: alert.dueAt,
              status: "RESOLVED",
              dueSoonHours:
                alert.dueSoonHours ?? alert.rule?.dueSoonHours ?? undefined,
            }),
          },
        });

        await tx.alertEscalation.updateMany({
          where: {
            alertEventId: alertId,
            status: "PENDING",
          },
          data: {
            status: "CLEARED",
            clearedAt: new Date(),
            releaseReason: note || "경고 해결로 자동 해제",
            releasedByUserId: admin.id,
          },
        });
      } else if (action === "IGNORE") {
        updated = await tx.alertEvent.update({
          where: { id: alertId },
          data: {
            status: "IGNORED",
            ignoredAt: new Date(),
            ignoredById: admin.id,
            escalationLevel: "NONE",
            slaState: computeSlaState({
              dueAt: alert.dueAt,
              status: "IGNORED",
              dueSoonHours:
                alert.dueSoonHours ?? alert.rule?.dueSoonHours ?? undefined,
            }),
          },
        });

        await tx.alertEscalation.updateMany({
          where: {
            alertEventId: alertId,
            status: "PENDING",
          },
          data: {
            status: "CLEARED",
            clearedAt: new Date(),
            releaseReason: note || "경고 무시 처리로 해제",
            releasedByUserId: admin.id,
          },
        });
      } else {
        if (!assigneeUserId) {
          throw new Error("재지정할 담당자가 필요합니다.");
        }

        const newAssignee = await tx.user.findUnique({
          where: { id: assigneeUserId },
          select: { id: true, name: true, email: true },
        });

        if (!newAssignee) {
          throw new Error("담당자를 찾을 수 없습니다.");
        }

        updated = await tx.alertEvent.update({
          where: { id: alertId },
          data: {
            assigneeUserId,
            slaState: computeSlaState({
              dueAt: alert.dueAt,
              status: alert.status,
              dueSoonHours:
                alert.dueSoonHours ?? alert.rule?.dueSoonHours ?? undefined,
            }),
          },
        });

        await tx.adminNotification.create({
          data: {
            userId: newAssignee.id,
            alertEventId: alert.id,
            type: "ALERT_EVENT",
            title: "경고 담당자 재지정",
            body: `${alert.title} 경고가 ${newAssignee.name}님에게 재지정되었습니다.`,
            targetHref: "/admin/alerts/board",
          },
        });
      }

      if (caseId && action !== "RESOLVE") {
        const timelineExtra =
          action === "REASSIGN"
            ? `새 담당자: ${assigneeUserId}`
            : note;

        await tx.caseTimelineMemo.create({
          data: {
            caseId,
            authorUserId: admin.id,
            memoType: "SYSTEM",
            alertEventId: alert.id,
            noteType: "ALERT_QUICK_ACTION",
            content: buildTimelineBody(action, admin.name, timelineExtra),
          },
        });
      }

      return updated;
    });

    if (action === "RESOLVE") {
      await createResolvedTimelineAutoNote({
        alertEventId: alertId,
        resolvedByUserId: admin.id,
      });
    }

    await prisma.adminNotification.updateMany({
      where: { alertEventId: alertId, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ ok: true, alert: result });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const msg = err.message ?? "처리 실패";
    if (msg.includes("필요") || msg.includes("찾을 수")) {
      return NextResponse.json({ ok: false, message: msg }, { status: 400 });
    }
    return NextResponse.json(
      { ok: false, message: msg },
      { status: err.status ?? 500 }
    );
  }
}
