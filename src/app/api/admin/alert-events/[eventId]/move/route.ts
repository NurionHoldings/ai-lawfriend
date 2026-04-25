import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createResolvedTimelineAutoNote } from "@/lib/alerts/auto-resolve-note";
import { computeSlaState } from "@/lib/alerts/sla";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["OPEN", "ACKNOWLEDGED", "IGNORED", "RESOLVED"]),
});

type Params = {
  params: Promise<{ eventId: string }>;
};

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { eventId } = await params;
    const body = await req.json();
    const parsed = schema.parse(body);

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
        { ok: false, message: "경고를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const dueAtForSla = current.dueAt ?? null;
    const dueSoon =
      current.dueSoonHours ?? current.rule?.dueSoonHours ?? undefined;

    const data: {
      status: typeof parsed.status;
      acknowledgedAt?: Date | null;
      acknowledgedById?: string | null;
      ignoredAt?: Date | null;
      ignoredById?: string | null;
      resolvedAt?: Date | null;
      resolvedById?: string | null;
      slaState: ReturnType<typeof computeSlaState>;
    } = {
      status: parsed.status,
      slaState: computeSlaState({
        dueAt: dueAtForSla,
        status: parsed.status,
        dueSoonHours: dueSoon,
      }),
    };

    if (parsed.status === "OPEN") {
      data.acknowledgedAt = null;
      data.acknowledgedById = null;
      data.ignoredAt = null;
      data.ignoredById = null;
      data.resolvedAt = null;
      data.resolvedById = null;
    } else if (parsed.status === "ACKNOWLEDGED") {
      data.acknowledgedAt = new Date();
      data.acknowledgedById = admin.id;
    } else if (parsed.status === "IGNORED") {
      data.ignoredAt = new Date();
      data.ignoredById = admin.id;
    } else if (parsed.status === "RESOLVED") {
      data.resolvedAt = new Date();
      data.resolvedById = admin.id;
    }

    const item = await prisma.alertEvent.update({
      where: { id: eventId },
      data,
    });

    if (parsed.status === "RESOLVED") {
      await createResolvedTimelineAutoNote({
        alertEventId: item.id,
        resolvedByUserId: admin.id,
      });
    }

    await prisma.adminNotification.updateMany({
      where: { alertEventId: eventId, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "칸반 이동 실패" },
      { status: err.status ?? 400 }
    );
  }
}
