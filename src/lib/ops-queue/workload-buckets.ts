import type { OpsQueuePriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isOverdue } from "@/lib/ops-queue/sla";
import type { WorkloadBucket } from "./types";

function priorityWeight(priority: OpsQueuePriority) {
  switch (priority) {
    case "URGENT":
      return 4;
    case "HIGH":
      return 3;
    case "NORMAL":
      return 2;
    case "LOW":
      return 1;
    default:
      return 1;
  }
}

export async function getAssigneeWorkloadBuckets(): Promise<WorkloadBucket[]> {
  const items = await prisma.opsQueueTicket.findMany({
    where: {
      completedAt: null,
      NOT: {
        status: { in: ["RESOLVED", "CANCELED", "DONE"] },
      },
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

  const map = new Map<string, WorkloadBucket>();

  for (const item of items) {
    const key = item.assigneeUserId ?? "UNASSIGNED";
    const assigneeName =
      item.assignee?.name ?? item.assignee?.email ?? "미배정";

    const current = map.get(key) ?? {
      assigneeId: item.assigneeUserId,
      assigneeName,
      openCount: 0,
      inProgressCount: 0,
      blockedCount: 0,
      overdueCount: 0,
      urgentCount: 0,
      totalScore: 0,
    };

    if (item.status === "OPEN" || item.status === "ACKED") current.openCount += 1;
    if (item.status === "IN_PROGRESS") current.inProgressCount += 1;
    if (item.status === "BLOCKED") current.blockedCount += 1;
    if (item.priority === "URGENT") current.urgentCount += 1;
    if (isOverdue(item.dueAt, item.completedAt)) current.overdueCount += 1;

    current.totalScore +=
      priorityWeight(item.priority) + (item.status === "BLOCKED" ? 1 : 0);

    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => b.totalScore - a.totalScore);
}
