import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { writeAuditLog } from "@/lib/audit-log";
import { createTimelineMemo } from "@/features/case-timeline/case-timeline.repository";
import { OPS_QUEUE_DUE_PRESETS, resolveDuePreset } from "@/lib/ops-queue/due-date";

const BodySchema = z.object({
  dueAt: z.union([z.string().datetime(), z.null()]).optional(),
  preset: z.enum(OPS_QUEUE_DUE_PRESETS).optional(),
});

type RouteContext = {
  params: Promise<{ ticketId: string }>;
};

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const admin = await requireRole("ADMIN");
    const { ticketId } = await ctx.params;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const current = await prisma.opsQueueTicket.findUnique({
      where: { id: ticketId },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    let nextDueAt: Date | null = null;

    if (body.preset) {
      nextDueAt = resolveDuePreset(body.preset);
    } else if (body.dueAt !== undefined) {
      nextDueAt = body.dueAt ? new Date(body.dueAt) : null;
    } else {
      nextDueAt = null;
    }

    const updated = await prisma.opsQueueTicket.update({
      where: { id: ticketId },
      data: {
        dueAt: nextDueAt,
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "ops_queue.due_at_update",
      entityType: "OpsQueueTicket",
      entityId: updated.id,
      message: "운영 큐 기한 변경",
      metadata: {
        opsQueueTicketId: updated.id,
        title: updated.title,
        beforeDueAt: current.dueAt?.toISOString() ?? null,
        afterDueAt: updated.dueAt?.toISOString() ?? null,
        preset: body.preset ?? null,
      },
    });

    if (current.caseId) {
      await createTimelineMemo({
        caseId: current.caseId,
        authorUserId: admin.id,
        memoType: "SYSTEM",
        noteType: "OPS_QUEUE_DUE_AT_UPDATE",
        content: `[운영 큐] ${updated.title} 항목의 기한이 변경되었습니다.`,
      });
    }

    return NextResponse.json({
      ok: true,
      item: updated,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
