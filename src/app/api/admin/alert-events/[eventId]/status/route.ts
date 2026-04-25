import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createResolvedTimelineAutoNote } from "@/lib/alerts/auto-resolve-note";
import { computeSlaState } from "@/lib/alerts/sla";
import { updateAlertEventStatusSchema } from "@/lib/alerts/schema";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ eventId: string }>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { eventId } = await params;
    const body = await req.json();
    const parsed = updateAlertEventStatusSchema.parse(body);

    const current = await prisma.alertEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        dueAt: true,
        dueSoonHours: true,
        rule: { select: { dueSoonHours: true } },
      },
    });

    if (!current) {
      return NextResponse.json(
        { ok: false, message: "경고 이력을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const dueAtForSla = current.dueAt ?? null;

    const data: {
      status: typeof parsed.status;
      acknowledgedAt?: Date;
      acknowledgedById?: string;
      ignoredAt?: Date;
      ignoredById?: string;
      resolvedAt?: Date;
      resolvedById?: string;
      slaState: ReturnType<typeof computeSlaState>;
    } = {
      status: parsed.status,
      slaState: computeSlaState({
        dueAt: dueAtForSla,
        status: parsed.status,
        dueSoonHours:
          current.dueSoonHours ?? current.rule?.dueSoonHours ?? undefined,
      }),
    };

    if (parsed.status === "ACKNOWLEDGED") {
      data.acknowledgedAt = new Date();
      data.acknowledgedById = admin.id;
    }

    if (parsed.status === "IGNORED") {
      data.ignoredAt = new Date();
      data.ignoredById = admin.id;
    }

    if (parsed.status === "RESOLVED") {
      data.resolvedAt = new Date();
      data.resolvedById = admin.id;
    }

    const updated = await prisma.alertEvent.update({
      where: { id: eventId },
      data,
    });

    if (parsed.status === "RESOLVED") {
      await createResolvedTimelineAutoNote({
        alertEventId: updated.id,
        resolvedByUserId: admin.id,
      });
    }

    await prisma.adminNotification.updateMany({
      where: { alertEventId: eventId, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "경고 상태 변경 실패" },
      { status: err.status ?? 400 }
    );
  }
}
