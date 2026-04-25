import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoleApi } from "@/lib/auth/guards";
import { writeAuditLog } from "@/lib/audit-log";
import { createTimelineMemo } from "@/features/case-timeline/case-timeline.repository";
import { getFeatureFlags } from "@/lib/feature-flags";
import {
  OPS_MUTATION_REQUESTS_PER_MINUTE,
  OPS_REBALANCE_MAX_ITEMS,
} from "@/lib/config/ops-limits";
import { simpleRateLimit } from "@/lib/server/simple-rate-limit";
import { getRequestId } from "@/lib/server/request-id";
import { logger } from "@/lib/logger";
import { captureServerError } from "@/lib/monitoring";

const ItemSchema = z.object({
  opsQueueTicketId: z.string().min(1),
  suggestedAssigneeUserId: z.string().nullable(),
  reason: z.array(z.string()).optional(),
});

const BodySchema = z.object({
  items: z.array(ItemSchema).min(1).max(OPS_REBALANCE_MAX_ITEMS),
  note: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireRoleApi("STAFF");
  if (!auth.ok) return auth.response;

  const admin = auth.user;
  const requestId = await getRequestId();

  try {
    const flags = getFeatureFlags();
    if (!flags.OPS_QUEUE_REBALANCE_APPLY) {
      return NextResponse.json(
        { ok: false, error: "FEATURE_DISABLED" },
        { status: 403 },
      );
    }

    const rl = simpleRateLimit({
      key: `ops-rebalance-apply:${admin.id}`,
      limit: OPS_MUTATION_REQUESTS_PER_MINUTE,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      logger.warn("ops_queue.rebalance_apply.rate_limited", {
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

    logger.info("ops_queue.rebalance_apply.request", {
      requestId,
      actorId: admin.id,
      count: body.items.length,
    });

    const ids = body.items.map((x) => x.opsQueueTicketId);

    const currentItems = await prisma.opsQueueTicket.findMany({
      where: {
        id: { in: ids },
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

    const currentMap = new Map(currentItems.map((item) => [item.id, item]));

    const updatedResults: Array<{
      opsQueueTicketId: string;
      changed: boolean;
      beforeAssigneeUserId: string | null;
      afterAssigneeUserId: string | null;
    }> = [];

    for (const payload of body.items) {
      const current = currentMap.get(payload.opsQueueTicketId);
      if (!current) continue;

      const nextAssigneeUserId = payload.suggestedAssigneeUserId ?? null;
      const changed = (current.assigneeUserId ?? null) !== nextAssigneeUserId;

      if (!changed) {
        updatedResults.push({
          opsQueueTicketId: current.id,
          changed: false,
          beforeAssigneeUserId: current.assigneeUserId ?? null,
          afterAssigneeUserId: current.assigneeUserId ?? null,
        });
        continue;
      }

      const updated = await prisma.opsQueueTicket.update({
        where: { id: current.id },
        data: {
          assigneeUserId: nextAssigneeUserId,
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
        action: "ops_queue.rebalance_apply",
        entityType: "OpsQueueTicket",
        entityId: updated.id,
        message: "운영 큐 재분배 적용",
        metadata: {
          opsQueueTicketId: updated.id,
          title: updated.title,
          beforeAssigneeUserId: current.assigneeUserId ?? null,
          beforeAssigneeName: current.assignee?.name ?? current.assignee?.email ?? "미배정",
          afterAssigneeUserId: updated.assigneeUserId ?? null,
          afterAssigneeName: updated.assignee?.name ?? updated.assignee?.email ?? "미배정",
          reason: payload.reason ?? [],
          note: body.note ?? null,
        },
      });

      if (current.caseId) {
        await createTimelineMemo({
          caseId: current.caseId,
          authorUserId: admin.id,
          memoType: "SYSTEM",
          noteType: "OPS_QUEUE_REBALANCE_APPLY",
          content: `[운영 큐] ${updated.title} 항목이 재분배 적용으로 담당자 변경되었습니다.${
            body.note ? `\n메모: ${body.note}` : ""
          }`,
        });
      }

      updatedResults.push({
        opsQueueTicketId: updated.id,
        changed: true,
        beforeAssigneeUserId: current.assigneeUserId ?? null,
        afterAssigneeUserId: updated.assigneeUserId ?? null,
      });
    }

    logger.info("ops_queue.rebalance_apply.success", {
      requestId,
      actorId: admin.id,
      count: updatedResults.filter((x) => x.changed).length,
    });

    return NextResponse.json({
      ok: true,
      appliedCount: updatedResults.filter((x) => x.changed).length,
      items: updatedResults,
      requestId,
    });
  } catch (error: unknown) {
    captureServerError(error, {
      requestId,
      route: "/api/admin/alerts/ops-queue/rebalance-apply",
      actorId: admin.id,
    });

    logger.error("ops_queue.rebalance_apply.failed", {
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
      { ok: false, code: "OPS_QUEUE_REBALANCE_APPLY_ERROR", requestId },
      { status: 500 },
    );
  }
}
