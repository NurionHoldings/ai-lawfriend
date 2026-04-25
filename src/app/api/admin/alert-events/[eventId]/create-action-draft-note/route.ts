import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { buildAlertActionDraft } from "@/lib/alerts/action-draft";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ eventId: string }>;
};

export async function POST(_: Request, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { eventId } = await params;

    const item = await prisma.alertEvent.findUnique({
      where: { id: eventId },
      include: {
        rule: true,
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { ok: false, message: "경고를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const caseId = resolveAlertCaseId(item);

    if (!caseId) {
      return NextResponse.json(
        { ok: false, message: "연결된 사건 ID를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    const draft = buildAlertActionDraft({
      alertId: item.id,
      title: item.title,
      severity: item.severity,
      status: item.status,
      message: item.message,
      ruleCode: item.rule?.code ?? null,
      detectedAt: item.detectedAt,
      actorLabel:
        item.actorUser?.name || item.actorUser?.email || item.actorUserId || null,
      entityType: item.entityType,
      entityId: item.entityId,
    });

    const note = await prisma.caseTimelineMemo.create({
      data: {
        caseId,
        authorUserId: admin.id,
        content: draft,
        alertEventId: item.id,
        noteType: "ALERT_ACTION_DRAFT",
        memoType: "STAFF_NOTE",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const qs = new URLSearchParams();
    qs.set("tab", "timeline");
    qs.set("focusAlertId", item.id);
    qs.set("draft", draft);

    return NextResponse.json({
      ok: true,
      note,
      caseId,
      redirectHref: `/cases/${caseId}?${qs.toString()}`,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "조치 메모 초안 생성 실패" },
      { status: err.status ?? 500 }
    );
  }
}
