import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ escalationId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { escalationId } = await params;

    const escalation = await prisma.alertEscalation.findUnique({
      where: { id: escalationId },
      include: {
        alertEvent: true,
      },
    });

    if (!escalation) {
      return NextResponse.json(
        { ok: false, message: "에스컬레이션 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const caseId = resolveAlertCaseId(escalation.alertEvent);
    const alertEventId = escalation.alertEventId;

    const timelineWhere = {
      OR: [
        { alertEventId },
        ...(caseId ? [{ caseId }] : []),
      ],
    };

    const [timeline, auditLogs, notifications] = await Promise.all([
      prisma.caseTimelineMemo.findMany({
        where: timelineWhere,
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          memoType: true,
          content: true,
          createdAt: true,
          authorUserId: true,
          alertEventId: true,
          caseId: true,
          noteType: true,
        },
      }),
      prisma.auditLog.findMany({
        where: {
          OR: [
            { entityType: "AlertEvent", entityId: alertEventId },
            ...(caseId ? [{ entityType: "Case", entityId: caseId }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          actorUserId: true,
          action: true,
          entityType: true,
          entityId: true,
          metadata: true,
          message: true,
          createdAt: true,
        },
      }),
      prisma.adminNotification.findMany({
        where: {
          userId: admin.id,
          alertEventId,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          targetHref: true,
          readAt: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      escalation: {
        id: escalation.id,
        alertEventId: escalation.alertEventId,
        caseId,
        level: escalation.level,
        status: escalation.status,
        message: escalation.message,
        createdAt: escalation.createdAt.toISOString(),
        clearedAt: escalation.clearedAt?.toISOString() ?? null,
        sentAt: escalation.sentAt?.toISOString() ?? null,
      },
      timeline,
      auditLogs,
      notifications,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "통합 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
