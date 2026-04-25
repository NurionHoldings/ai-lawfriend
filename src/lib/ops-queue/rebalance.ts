import { prisma } from "@/lib/prisma";
import { getAssigneeWorkloadBuckets } from "@/lib/ops-queue/workload-buckets";
import { getOpsQueueWipLimits } from "@/lib/ops-queue/wip";

type ColumnKey = "TRIAGE" | "QUEUED" | "WORKING" | "BLOCKED" | "DONE";

function scoreItemForRebalance(item: {
  priority: string;
  dueAt: Date | null;
  assigneeUserId: string | null;
  updatedAt: Date;
}) {
  let score = 0;

  if (!item.assigneeUserId) score += 3;
  if (item.priority === "LOW") score += 3;
  if (item.priority === "NORMAL") score += 2;
  if (!item.dueAt) score += 2;
  if (item.dueAt && item.dueAt.getTime() > Date.now()) score += 1;

  const ageHours = Math.floor((Date.now() - item.updatedAt.getTime()) / (1000 * 60 * 60));
  if (ageHours > 24) score += 2;
  if (ageHours > 72) score += 1;

  return score;
}

export async function getOpsQueueRebalanceRecommendations() {
  const limits = await getOpsQueueWipLimits();

  const activeItems = await prisma.opsQueueTicket.findMany({
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

  const counts: Record<ColumnKey, number> = {
    TRIAGE: 0,
    QUEUED: 0,
    WORKING: 0,
    BLOCKED: 0,
    DONE: 0,
  };

  for (const item of activeItems) {
    counts[item.boardColumn as ColumnKey] += 1;
  }

  const overflowColumns = (Object.keys(counts) as ColumnKey[]).filter(
    (column) => column !== "DONE" && counts[column] > limits[column],
  );

  const workloadBuckets = await getAssigneeWorkloadBuckets();
  const candidateAssignees = workloadBuckets
    .filter((x) => x.assigneeId)
    .sort((a, b) => a.totalScore - b.totalScore);

  const recommendations = [];

  for (const column of overflowColumns) {
    const overflowCount = counts[column] - limits[column];

    const candidateItems = activeItems
      .filter((item) => item.boardColumn === column)
      .map((item) => ({
        ...item,
        rebalanceScore: scoreItemForRebalance(item),
      }))
      .sort((a, b) => b.rebalanceScore - a.rebalanceScore)
      .slice(0, Math.max(overflowCount, 0));

    const n = Math.max(candidateAssignees.length, 1);

    const suggested = candidateItems.map((item, index) => {
      const assignee = candidateAssignees[index % n];

      return {
        opsQueueTicketId: item.id,
        title: item.title,
        currentAssigneeUserId: item.assigneeUserId,
        currentAssigneeName: item.assignee?.name ?? item.assignee?.email ?? "미배정",
        suggestedAssigneeUserId: assignee?.assigneeId ?? null,
        suggestedAssigneeName: assignee?.assigneeName ?? "추천 없음",
        reason: [
          !item.assigneeUserId ? "미배정 항목" : null,
          item.priority === "LOW" ? "낮은 우선순위" : null,
          item.priority === "NORMAL" ? "보통 우선순위" : null,
          !item.dueAt ? "기한 미설정" : null,
          item.dueAt && item.dueAt.getTime() > Date.now() ? "긴급도 상대적 낮음" : null,
        ].filter((x): x is string => Boolean(x)),
      };
    });

    recommendations.push({
      column,
      currentCount: counts[column],
      limit: limits[column],
      overflowCount,
      suggestions: suggested,
    });
  }

  return {
    limits,
    counts,
    recommendations,
  };
}
