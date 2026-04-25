import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { getAssigneeWorkloadBuckets } from "@/lib/ops-queue/workload-buckets";
import { getOpsQueueRebalanceRecommendations } from "@/lib/ops-queue/rebalance";
import { getOpsQueueWipLimits, buildWipWarning } from "@/lib/ops-queue/wip";

export const dynamic = "force-dynamic";

const OPS_QUEUE_AUDIT_ACTIONS = [
  "ops_queue.board.move",
  "ops_queue.quick_update",
  "ops_queue.edit",
  "ops_queue.due_at_update",
  "ops_queue.rebalance_apply",
  "ops_queue.bulk_edit",
] as const;

type ColumnKey = "TRIAGE" | "QUEUED" | "WORKING" | "BLOCKED" | "DONE";

export async function GET() {
  try {
    await requireRole("STAFF");

    const now = new Date();
    const wipLimits = await getOpsQueueWipLimits();

    const [activeItems, workload, rebalance, recentMoveLogs] = await Promise.all([
      prisma.opsQueueTicket.findMany({
        where: {
          completedAt: null,
          NOT: {
            status: { in: ["RESOLVED", "CANCELED", "DONE"] },
          },
        },
        select: {
          id: true,
          boardColumn: true,
          status: true,
          priority: true,
          dueAt: true,
        },
      }),
      getAssigneeWorkloadBuckets(),
      getOpsQueueRebalanceRecommendations(),
      prisma.auditLog.findMany({
        where: {
          action: { in: [...OPS_QUEUE_AUDIT_ACTIONS] },
          entityType: "OpsQueueTicket",
        },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    const counts: Record<ColumnKey, number> = {
      TRIAGE: 0,
      QUEUED: 0,
      WORKING: 0,
      BLOCKED: 0,
      DONE: 0,
    };

    let overdueCount = 0;
    let urgentCount = 0;
    let blockedCount = 0;

    for (const item of activeItems) {
      const col = item.boardColumn as ColumnKey;
      if (col in counts) counts[col] += 1;
      if (item.priority === "URGENT") urgentCount += 1;
      if (item.boardColumn === "BLOCKED") blockedCount += 1;
      if (item.dueAt && item.dueAt.getTime() < now.getTime()) overdueCount += 1;
    }

    const wipWarnings = {
      TRIAGE: buildWipWarning(counts.TRIAGE, wipLimits.TRIAGE),
      QUEUED: buildWipWarning(counts.QUEUED, wipLimits.QUEUED),
      WORKING: buildWipWarning(counts.WORKING, wipLimits.WORKING),
      BLOCKED: buildWipWarning(counts.BLOCKED, wipLimits.BLOCKED),
      DONE: buildWipWarning(counts.DONE, wipLimits.DONE),
    };

    return NextResponse.json({
      ok: true,
      summary: {
        totalOpen: activeItems.length,
        overdueCount,
        urgentCount,
        blockedCount,
      },
      wipLimits,
      wipWarnings,
      workload,
      rebalance,
      recentMoveLogs,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
