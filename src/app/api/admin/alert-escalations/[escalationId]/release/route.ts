import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { maxEscalationLevelFromPending } from "@/lib/alerts/escalation-sync";

const schema = z.object({
  reason: z.string().min(1, "해제 사유를 입력해주세요.").max(1000),
});

type Params = { params: Promise<{ escalationId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { escalationId } = await params;
    const parsed = schema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "잘못된 입력입니다.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const escalation = await prisma.alertEscalation.findUnique({
      where: { id: escalationId },
      include: {
        alertEvent: true,
      },
    });

    if (!escalation) {
      return NextResponse.json(
        { ok: false, message: "에스컬레이션을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (escalation.status !== "PENDING") {
      return NextResponse.json(
        { ok: false, message: "이미 해제(정리)된 에스컬레이션입니다." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.alertEscalation.update({
        where: { id: escalationId },
        data: {
          status: "CLEARED",
          clearedAt: new Date(),
          releaseReason: parsed.data.reason,
          releasedByUserId: admin.id,
        },
      });

      const pending = await tx.alertEscalation.findMany({
        where: {
          alertEventId: escalation.alertEventId,
          status: "PENDING",
        },
        select: { level: true },
      });

      const nextLevel = maxEscalationLevelFromPending(pending.map((p) => p.level));

      await tx.alertEvent.update({
        where: { id: escalation.alertEventId },
        data: { escalationLevel: nextLevel },
      });

      const caseId = resolveAlertCaseId(escalation.alertEvent);
      if (caseId) {
        await tx.caseTimelineMemo.create({
          data: {
            caseId,
            authorUserId: admin.id,
            memoType: "SYSTEM",
            alertEventId: escalation.alertEventId,
            noteType: "ESCALATION_RELEASED",
            content: `[에스컬레이션 해제] ${admin.name}님이 에스컬레이션 ${escalation.level}을 해제했습니다.\n사유: ${parsed.data.reason}`,
          },
        });
      }

      const admins = await tx.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true },
      });
      for (const a of admins) {
        await tx.adminNotification.create({
          data: {
            userId: a.id,
            alertEventId: escalation.alertEventId,
            type: "ALERT_EVENT",
            title: "에스컬레이션 해제",
            body: `${escalation.alertEvent.title} / ${escalation.level}`,
            targetHref: "/admin/alerts/escalations",
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "해제 처리 실패" },
      { status: err.status ?? 500 }
    );
  }
}
