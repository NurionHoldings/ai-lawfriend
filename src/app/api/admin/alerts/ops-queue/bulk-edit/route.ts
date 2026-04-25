import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { OpsQueueBoardColumn, OpsQueuePriority } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRoleApi } from "@/lib/auth/guards";
import { writeAuditLog } from "@/lib/audit-log";
import { createTimelineMemo } from "@/features/case-timeline/case-timeline.repository";
import { getFeatureFlags } from "@/lib/feature-flags";
import {
  OPS_BULK_EDIT_MAX_ITEMS,
  OPS_MUTATION_REQUESTS_PER_MINUTE,
} from "@/lib/config/ops-limits";
import { simpleRateLimit } from "@/lib/server/simple-rate-limit";
import { getRequestId } from "@/lib/server/request-id";
import { logger } from "@/lib/logger";
import { captureServerError } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  opsQueueTicketIds: z
    .array(z.string().min(1))
    .min(1)
    .max(OPS_BULK_EDIT_MAX_ITEMS),
  assigneeUserId: z.union([z.string().min(1), z.null()]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  dueAt: z.union([z.string(), z.null()]).optional(),
  boardColumn: z.enum(["TRIAGE", "QUEUED", "WORKING", "BLOCKED", "DONE"]).optional(),
  note: z.string().max(1000).optional(),
});

function columnToStatus(column: OpsQueueBoardColumn): string {
  switch (column) {
    case "DONE":
      return "RESOLVED";
    case "BLOCKED":
      return "BLOCKED";
    case "WORKING":
      return "IN_PROGRESS";
    default:
      return "OPEN";
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireRoleApi("STAFF");
  if (!auth.ok) return auth.response;

  const admin = auth.user;
  const requestId = await getRequestId();

  try {
    const flags = getFeatureFlags();
    if (!flags.OPS_QUEUE_BULK_EDIT) {
      return NextResponse.json(
        { ok: false, error: "FEATURE_DISABLED" },
        { status: 403 },
      );
    }

    const rl = simpleRateLimit({
      key: `ops-bulk-edit:${admin.id}`,
      limit: OPS_MUTATION_REQUESTS_PER_MINUTE,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      logger.warn("ops_queue.bulk_edit.rate_limited", {
        requestId,
        actorId: admin.id,
        retryAfterMs: rl.retryAfterMs,
      });
      return NextResponse.json(
        { ok: false, error: "RATE_LIMITED", code: "RATE_LIMITED", requestId },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
          },
        },
      );
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_INPUT",
          requestId,
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }
    const body = parsed.data;

    logger.info("ops_queue.bulk_edit.request", {
      requestId,
      actorId: admin.id,
      count: body.opsQueueTicketIds.length,
    });

    const hasMutation =
      body.assigneeUserId !== undefined ||
      body.priority !== undefined ||
      body.dueAt !== undefined ||
      body.boardColumn !== undefined ||
      (body.note !== undefined && body.note.trim().length > 0);

    if (!hasMutation) {
      return NextResponse.json(
        { ok: false, error: "NOTHING_TO_APPLY", requestId },
        { status: 400 },
      );
    }

    const items = await prisma.opsQueueTicket.findMany({
      where: {
        id: { in: body.opsQueueTicketIds },
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

    const results: Array<{ id: string; changed: boolean }> = [];

    for (const item of items) {
      const data: Prisma.OpsQueueTicketUncheckedUpdateInput = {};

      if (body.assigneeUserId !== undefined) {
        data.assigneeUserId = body.assigneeUserId;
      }
      if (body.priority !== undefined) {
        data.priority = body.priority as OpsQueuePriority;
      }
      if (body.dueAt !== undefined) {
        data.dueAt = body.dueAt ? new Date(body.dueAt) : null;
      }

      if (body.boardColumn !== undefined && body.boardColumn !== item.boardColumn) {
        const agg = await prisma.opsQueueTicket.aggregate({
          where: { boardColumn: body.boardColumn },
          _max: { boardOrder: true },
        });
        data.boardColumn = body.boardColumn;
        data.boardOrder = (agg._max.boardOrder ?? -1) + 1;
        data.status = columnToStatus(body.boardColumn);
        data.completedAt = body.boardColumn === "DONE" ? new Date() : null;
      }

      const hasDataUpdate = Object.keys(data).length > 0;

      const updated = hasDataUpdate
        ? await prisma.opsQueueTicket.update({
            where: { id: item.id },
            data,
            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          })
        : item;

      await writeAuditLog({
        actorUserId: admin.id,
        action: "ops_queue.bulk_edit",
        entityType: "OpsQueueTicket",
        entityId: updated.id,
        message: "운영 큐 대량 편집 적용",
        metadata: {
          opsQueueTicketId: updated.id,
          title: updated.title,
          note: body.note?.trim() ?? null,
          before: {
            assigneeUserId: item.assigneeUserId,
            priority: item.priority,
            dueAt: item.dueAt?.toISOString() ?? null,
            boardColumn: item.boardColumn,
            status: item.status,
          },
          after: {
            assigneeUserId: updated.assigneeUserId,
            priority: updated.priority,
            dueAt: updated.dueAt?.toISOString() ?? null,
            boardColumn: updated.boardColumn,
            status: updated.status,
          },
        },
      });

      if (item.caseId) {
        const noteLine = body.note?.trim() ? `\n메모: ${body.note.trim()}` : "";
        await createTimelineMemo({
          caseId: item.caseId,
          authorUserId: admin.id,
          memoType: "SYSTEM",
          noteType: "OPS_QUEUE_BULK_EDIT",
          content: `[운영 큐] ${updated.title} 항목에 대량 편집이 적용되었습니다.${noteLine}`,
        });
      }

      results.push({
        id: updated.id,
        changed: true,
      });
    }

    logger.info("ops_queue.bulk_edit.success", {
      requestId,
      actorId: admin.id,
      count: results.length,
    });

    return NextResponse.json({
      ok: true,
      count: results.length,
      items: results,
      requestId,
    });
  } catch (error: unknown) {
    captureServerError(error, {
      requestId,
      route: "/api/admin/alerts/ops-queue/bulk-edit",
      actorId: admin.id,
    });

    logger.error("ops_queue.bulk_edit.failed", {
      requestId,
      actorId: admin.id,
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_INPUT",
          requestId,
          issues: error.flatten(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { ok: false, code: "OPS_QUEUE_BULK_EDIT_ERROR", requestId },
      { status: 500 },
    );
  }
}
