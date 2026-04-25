import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { assignAlertEventSchema } from "@/lib/alerts/schema";
import { computeSlaState } from "@/lib/alerts/sla";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ eventId: string }>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdminApi();
    const { eventId } = await params;

    const body = await req.json();
    const parsed = assignAlertEventSchema.parse(body);

    const current = await prisma.alertEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        status: true,
        dueSoonHours: true,
        rule: { select: { dueSoonHours: true } },
      },
    });

    if (!current) {
      return NextResponse.json(
        { ok: false, message: "경고를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (parsed.assigneeUserId) {
      const user = await prisma.user.findUnique({
        where: { id: parsed.assigneeUserId },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json(
          { ok: false, message: "담당자 사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
    }

    let dueAt: Date | null = null;
    if (parsed.dueAt && String(parsed.dueAt).trim()) {
      const d = new Date(parsed.dueAt);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { ok: false, message: "유효한 기한 날짜가 아닙니다." },
          { status: 400 }
        );
      }
      dueAt = d;
    }

    const slaState = computeSlaState({
      dueAt,
      status: current.status,
      dueSoonHours:
        current.dueSoonHours ?? current.rule?.dueSoonHours ?? undefined,
    });

    const updated = await prisma.alertEvent.update({
      where: { id: eventId },
      data: {
        assigneeUserId: parsed.assigneeUserId ?? null,
        dueAt,
        slaState,
      },
      include: {
        assigneeUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "담당자/기한 저장 실패" },
      { status: err.status ?? 500 }
    );
  }
}
