import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { extractLinkableIds } from "@/lib/alerts/deep-link";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ eventId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await requireAdminApi();
    const { eventId } = await params;

    const alertEvent = await prisma.alertEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        actorUserId: true,
        detectedAt: true,
        payloadJson: true,
      },
    });

    if (!alertEvent) {
      return NextResponse.json(
        { ok: false, message: "경고 이력을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const ids = extractLinkableIds(alertEvent.payloadJson);
    const from = new Date(new Date(alertEvent.detectedAt).getTime() - 1000 * 60 * 60 * 24 * 3);
    const to = new Date(new Date(alertEvent.detectedAt).getTime() + 1000 * 60 * 60 * 24 * 1);

    const orConditions: Array<Record<string, unknown>> = [];

    if (alertEvent.actorUserId) {
      orConditions.push({ actorUserId: alertEvent.actorUserId });
    }

    if (alertEvent.entityType && alertEvent.entityId) {
      orConditions.push({
        entityType: alertEvent.entityType,
        entityId: alertEvent.entityId,
      });
    }

    if (ids.entityType && ids.entityId) {
      orConditions.push({
        entityType: ids.entityType,
        entityId: ids.entityId,
      });
    }

    if (ids.caseId) {
      orConditions.push({
        entityType: "CASE",
        entityId: ids.caseId,
      });
    }

    if (orConditions.length === 0) {
      return NextResponse.json({
        ok: true,
        items: [],
        range: { from: from.toISOString(), to: to.toISOString() },
      });
    }

    const items = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
        OR: orConditions,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      select: {
        id: true,
        action: true,
        createdAt: true,
        actorUserId: true,
        entityType: true,
        entityId: true,
      },
    });

    return NextResponse.json({
      ok: true,
      items,
      range: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "관련 감사로그 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
