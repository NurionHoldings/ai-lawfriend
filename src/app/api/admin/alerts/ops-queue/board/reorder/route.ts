import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { OpsQueueBoardColumn } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { writeAuditLog } from "@/lib/audit-log";
import { createTimelineMemo } from "@/features/case-timeline/case-timeline.repository";

const BodySchema = z.object({
  itemId: z.string().min(1),
  toColumn: z.enum(["TRIAGE", "QUEUED", "WORKING", "BLOCKED", "DONE"]),
  toOrder: z.number().int().min(0),
  comment: z.string().max(1000).optional(),
});

function columnToStatus(column: OpsQueueBoardColumn): string {
  switch (column) {
    case "DONE":
      return "RESOLVED";
    case "BLOCKED":
      return "BLOCKED";
    case "WORKING":
      return "IN_PROGRESS";
    case "TRIAGE":
    case "QUEUED":
    default:
      return "OPEN";
  }
}

function getColumnLabel(column: string) {
  switch (column) {
    case "TRIAGE":
      return "분류대기";
    case "QUEUED":
      return "대기열";
    case "WORKING":
      return "작업중";
    case "BLOCKED":
      return "보류";
    case "DONE":
      return "완료";
    default:
      return column;
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN");

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const body = parsed.data;
    const commentTrimmed = body.comment?.trim() || null;

    const item = await prisma.opsQueueTicket.findUnique({
      where: { id: body.itemId },
    });

    if (!item) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    const toColumn = body.toColumn as OpsQueueBoardColumn;
    const fromColumn = item.boardColumn;
    const fromStatus = item.status;
    const toStatus = columnToStatus(toColumn);

    await prisma.$transaction(async (tx) => {
      await tx.opsQueueTicket.updateMany({
        where: {
          boardColumn: toColumn,
          boardOrder: {
            gte: body.toOrder,
          },
          NOT: {
            id: body.itemId,
          },
        },
        data: {
          boardOrder: {
            increment: 1,
          },
        },
      });

      await tx.opsQueueTicket.update({
        where: { id: body.itemId },
        data: {
          boardColumn: toColumn,
          boardOrder: body.toOrder,
          status: toStatus,
          completedAt: toColumn === "DONE" ? new Date() : null,
        },
      });
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "ops_queue.board.move",
      entityType: "OpsQueueTicket",
      entityId: item.id,
      message: `운영 큐 항목 이동: ${getColumnLabel(fromColumn)} → ${getColumnLabel(body.toColumn)}`,
      metadata: {
        opsQueueTicketId: item.id,
        title: item.title,
        fromColumn,
        toColumn: body.toColumn,
        fromStatus,
        toStatus,
        fromOrder: item.boardOrder,
        toOrder: body.toOrder,
        comment: commentTrimmed,
      },
    });

    if (item.caseId) {
      const baseMessage = `[운영 큐] ${item.title} 항목이 ${getColumnLabel(fromColumn)}에서 ${getColumnLabel(body.toColumn)}(으)로 이동되었습니다.`;
      const timelineContent = commentTrimmed
        ? `${baseMessage}\n코멘트: ${commentTrimmed}`
        : baseMessage;

      await createTimelineMemo({
        caseId: item.caseId,
        authorUserId: admin.id,
        memoType: "SYSTEM",
        noteType: "OPS_QUEUE_BOARD_MOVE",
        content: timelineContent,
      });
    }

    return NextResponse.json({
      ok: true,
      moved: {
        itemId: item.id,
        fromColumn,
        toColumn: body.toColumn,
        fromStatus,
        toStatus,
        comment: commentTrimmed,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
