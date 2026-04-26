import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { OpsQueuePriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { writeAuditLog } from "@/lib/audit-log";
import { createTimelineMemo } from "@/features/case-timeline/case-timeline.repository";

const BodySchema = z.object({
  assigneeUserId: z.string().nullable().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
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

    const nextAssigneeUserId =
      body.assigneeUserId === undefined ? current.assigneeUserId : body.assigneeUserId;

    const nextPriority: OpsQueuePriority =
      body.priority === undefined ? current.priority : body.priority;

    const updated = await prisma.opsQueueTicket.update({
      where: { id: ticketId },
      data: {
        assigneeUserId: nextAssigneeUserId,
        priority: nextPriority,
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

    const assigneeChanged = current.assigneeUserId !== updated.assigneeUserId;
    const priorityChanged = current.priority !== updated.priority;

    if (assigneeChanged || priorityChanged) {
      await writeAuditLog({
        actorUserId: admin.id,
        action: "ops_queue.quick_update",
        entityType: "OpsQueueTicket",
        entityId: updated.id,
        message: "운영 큐 빠른 수정: 담당자/우선순위 변경",
        metadata: {
          opsQueueTicketId: updated.id,
          title: updated.title,
          before: {
            assigneeUserId: current.assigneeUserId,
            assigneeName: current.assignee?.name ?? current.assignee?.email ?? null,
            priority: current.priority,
          },
          after: {
            assigneeUserId: updated.assigneeUserId,
            assigneeName: updated.assignee?.name ?? updated.assignee?.email ?? null,
            priority: updated.priority,
          },
        },
      });
    }

    if (current.caseId && (assigneeChanged || priorityChanged)) {
      const messages: string[] = [];

      if (assigneeChanged) {
        messages.push(
          `담당자가 ${current.assignee?.name ?? current.assignee?.email ?? "미배정"}에서 ${updated.assignee?.name ?? updated.assignee?.email ?? "미배정"}(으)로 변경되었습니다.`,
        );
      }

      if (priorityChanged) {
        messages.push(
          `우선순위가 ${current.priority}에서 ${updated.priority}(으)로 변경되었습니다.`,
        );
      }

      await createTimelineMemo({
        caseId: current.caseId,
        authorUserId: admin.id,
        memoType: "SYSTEM",
        noteType: "OPS_QUEUE_QUICK_UPDATE",
        content: `[운영 큐] ${updated.title} 항목 수정: ${messages.join(" ")}`,
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
