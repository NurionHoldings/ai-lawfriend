import { prisma } from "@/lib/prisma";
import {
  getOpsQueueSlaState,
  normalizeOpsQueueSeverity,
  normalizeOpsQueueStatus,
} from "@/lib/ops-queue/sla-policy";

export type OpsQueueWorkloadRow = {
  assigneeUserId: string;
  openCount: number;
  ackedCount: number;
  inProgressCount: number;
  overdueCount: number;
  nearDueCount: number;
  totalCount: number;
};

export async function getOpsQueueWorkloadRows(): Promise<OpsQueueWorkloadRow[]> {
  const tickets = await prisma.opsQueueTicket.findMany({
    where: {
      status: {
        in: ["OPEN", "ACKED", "IN_PROGRESS"],
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      severity: true,
      status: true,
      assigneeUserId: true,
      createdAt: true,
    },
  });

  const bucket = new Map<string, OpsQueueWorkloadRow>();

  for (const ticket of tickets) {
    const assignee = ticket.assigneeUserId ?? "unassigned";

    if (!bucket.has(assignee)) {
      bucket.set(assignee, {
        assigneeUserId: assignee,
        openCount: 0,
        ackedCount: 0,
        inProgressCount: 0,
        overdueCount: 0,
        nearDueCount: 0,
        totalCount: 0,
      });
    }

    const row = bucket.get(assignee)!;
    row.totalCount += 1;

    if (ticket.status === "OPEN") row.openCount += 1;
    if (ticket.status === "ACKED") row.ackedCount += 1;
    if (ticket.status === "IN_PROGRESS") row.inProgressCount += 1;

    const sla = getOpsQueueSlaState({
      createdAt: ticket.createdAt,
      severity: normalizeOpsQueueSeverity(ticket.severity),
      status: normalizeOpsQueueStatus(ticket.status),
    });

    if (sla.overdue) row.overdueCount += 1;
    if (sla.nearDue) row.nearDueCount += 1;
  }

  const rows = Array.from(bucket.values()).sort((a, b) => {
    if (b.overdueCount !== a.overdueCount) return b.overdueCount - a.overdueCount;
    return b.totalCount - a.totalCount;
  });

  return rows;
}
