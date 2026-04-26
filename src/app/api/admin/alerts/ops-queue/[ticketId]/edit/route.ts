import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { OpsQueuePriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { writeAuditLog } from "@/lib/audit-log";
import { createTimelineMemo } from "@/features/case-timeline/case-timeline.repository";

const BodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable().optional(),
  taxonomy: z.string().max(120).optional(),
  assigneeUserId: z.union([z.string(), z.null()]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  dueAt: z.union([z.string().datetime(), z.null()]).optional(),
});

type RouteContext = {
  params: Promise<{ ticketId: string }>;
};

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const admin = await requireAdminApi();
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
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    const taxonomy =
      body.taxonomy !== undefined ? body.taxonomy.trim() || current.taxonomy : current.taxonomy;

    const nextAssigneeUserId =
      body.assigneeUserId === undefined
        ? current.assigneeUserId
        : body.assigneeUserId === null || body.assigneeUserId === ""
          ? null
          : body.assigneeUserId;

    let nextDueAt: Date | null = current.dueAt;
    if (body.dueAt !== undefined) {
      nextDueAt = body.dueAt ? new Date(body.dueAt) : null;
    }

    const updated = await prisma.opsQueueTicket.update({
      where: { id: ticketId },
      data: {
        title: body.title,
        description: body.description === undefined ? current.description : body.description,
        taxonomy,
        assigneeUserId: nextAssigneeUserId,
        priority: body.priority as OpsQueuePriority,
        dueAt: nextDueAt,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "ops_queue.edit",
      entityType: "OpsQueueTicket",
      entityId: updated.id,
      message: "운영 큐 상세 편집",
      metadata: {
        opsQueueTicketId: updated.id,
        title: updated.title,
        before: {
          title: current.title,
          description: current.description,
          taxonomy: current.taxonomy,
          assigneeUserId: current.assigneeUserId,
          assigneeName: current.assignee?.name ?? current.assignee?.email ?? null,
          priority: current.priority,
          dueAt: current.dueAt?.toISOString() ?? null,
        },
        after: {
          title: updated.title,
          description: updated.description,
          taxonomy: updated.taxonomy,
          assigneeUserId: updated.assigneeUserId,
          assigneeName: updated.assignee?.name ?? updated.assignee?.email ?? null,
          priority: updated.priority,
          dueAt: updated.dueAt?.toISOString() ?? null,
        },
      },
    });

    if (current.caseId) {
      const changes: string[] = [];

      if (current.title !== updated.title) changes.push("제목 변경");
      if ((current.description ?? "") !== (updated.description ?? "")) changes.push("설명 변경");
      if (current.taxonomy !== updated.taxonomy) changes.push("taxonomy 변경");
      if ((current.assigneeUserId ?? null) !== (updated.assigneeUserId ?? null))
        changes.push("담당자 변경");
      if (current.priority !== updated.priority) changes.push("우선순위 변경");
      if ((current.dueAt?.toISOString() ?? null) !== (updated.dueAt?.toISOString() ?? null))
        changes.push("기한 변경");

      if (changes.length) {
        await createTimelineMemo({
          caseId: current.caseId,
          authorUserId: admin.id,
          memoType: "SYSTEM",
          noteType: "OPS_QUEUE_EDIT",
          content: `[운영 큐] ${updated.title} 항목 편집: ${changes.join(", ")}`,
        });
      }
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
