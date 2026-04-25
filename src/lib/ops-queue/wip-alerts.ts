import { prisma } from "@/lib/prisma";
import { getOpsQueueWipLimits } from "@/lib/ops-queue/wip";

type ColumnKey = "TRIAGE" | "QUEUED" | "WORKING" | "BLOCKED" | "DONE";

function columnLabel(column: ColumnKey) {
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
  }
}

export async function scanOpsQueueWipOverflowAndNotify() {
  const limits = await getOpsQueueWipLimits();

  const items = await prisma.opsQueueTicket.findMany({
    where: {
      completedAt: null,
    },
    select: {
      id: true,
      boardColumn: true,
    },
  });

  const counts: Record<ColumnKey, number> = {
    TRIAGE: 0,
    QUEUED: 0,
    WORKING: 0,
    BLOCKED: 0,
    DONE: 0,
  };

  for (const item of items) {
    counts[item.boardColumn as ColumnKey] += 1;
  }

  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ["ADMIN", "SUPER_ADMIN"],
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  const results: Array<{
    column: ColumnKey;
    count: number;
    limit: number;
    notified: number;
  }> = [];

  const hourBucket = new Date();
  hourBucket.setMinutes(0, 0, 0);
  const hourIso = hourBucket.toISOString().slice(0, 13);

  for (const column of Object.keys(counts) as ColumnKey[]) {
    const count = counts[column];
    const limit = limits[column];

    if (count <= limit) continue;
    if (column === "DONE") continue;

    const dedupeKey = `OPS_QUEUE_WIP_OVER_LIMIT:${column}:${hourIso}`;

    const title = `[운영 큐 WIP 초과] ${columnLabel(column)}`;

    const existing = await prisma.adminNotification.findFirst({
      where: {
        type: "SYSTEM",
        title,
        createdAt: { gte: hourBucket },
      },
    });

    if (existing) continue;

    const body = `${columnLabel(column)} 컬럼이 WIP limit를 초과했습니다. 현재 ${count}건 / 제한 ${limit}건`;

    for (const admin of admins) {
      await prisma.adminNotification.create({
        data: {
          userId: admin.id,
          type: "SYSTEM",
          title,
          body,
          targetHref: "/admin/alerts/ops-queue/board",
          metaJson: {
            dedupeKey,
            kind: "OPS_QUEUE_WIP_OVER_LIMIT",
            column,
            count,
            limit,
          },
        },
      });
    }

    results.push({
      column,
      count,
      limit,
      notified: admins.length,
    });
  }

  return {
    limits,
    counts,
    results,
  };
}
