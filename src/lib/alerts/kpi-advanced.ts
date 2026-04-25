import { prisma } from "@/lib/prisma";
import {
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
} from "date-fns";

function resolvedWithinSla(a: {
  dueAt: Date | null;
  resolvedAt: Date | null;
}): boolean {
  if (!a.resolvedAt) return false;
  if (!a.dueAt) return true;
  return new Date(a.resolvedAt).getTime() <= new Date(a.dueAt).getTime();
}

export async function getAlertKpiAdvanced(days: number) {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, days - 1));

  const alerts = await prisma.alertEvent.findMany({
    where: {
      detectedAt: {
        gte: from,
        lte: to,
      },
    },
    include: {
      assigneeUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const timeline = eachDayOfInterval({ start: from, end: to }).map((d) => {
    const key = format(d, "yyyy-MM-dd");

    const dayItems = alerts.filter(
      (a) => format(a.detectedAt, "yyyy-MM-dd") === key
    );

    const resolved = dayItems.filter((a) => a.status === "RESOLVED").length;
    const acknowledged = dayItems.filter(
      (a) => a.status === "ACKNOWLEDGED"
    ).length;
    const breached = dayItems.filter((a) => a.slaState === "OVERDUE").length;

    return {
      date: key,
      created: dayItems.length,
      resolved,
      acknowledged,
      breached,
    };
  });

  const assigneeMap = new Map<
    string,
    {
      userId: string;
      name: string;
      total: number;
      resolved: number;
      slaCompliantResolved: number;
    }
  >();

  for (const a of alerts) {
    const userId = a.assigneeUserId ?? "unassigned";
    const name = a.assigneeUser?.name ?? "미배정";

    if (!assigneeMap.has(userId)) {
      assigneeMap.set(userId, {
        userId,
        name,
        total: 0,
        resolved: 0,
        slaCompliantResolved: 0,
      });
    }

    const item = assigneeMap.get(userId)!;
    item.total += 1;

    if (a.status === "RESOLVED") {
      item.resolved += 1;
      if (resolvedWithinSla(a)) {
        item.slaCompliantResolved += 1;
      }
    }
  }

  const assigneeStats = Array.from(assigneeMap.values()).map((item) => ({
    ...item,
    resolveRate:
      item.total > 0
        ? Number(((item.resolved / item.total) * 100).toFixed(1))
        : 0,
    slaComplianceRate:
      item.resolved > 0
        ? Number(
            ((item.slaCompliantResolved / item.resolved) * 100).toFixed(1)
          )
        : 0,
  }));

  assigneeStats.sort((a, b) => b.resolveRate - a.resolveRate);

  const total = alerts.length;
  const resolvedTotal = alerts.filter((a) => a.status === "RESOLVED").length;
  const breachedTotal = alerts.filter((a) => a.slaState === "OVERDUE").length;

  const slaCompliantResolvedTotal = alerts.filter(
    (a) => a.status === "RESOLVED" && resolvedWithinSla(a)
  ).length;

  return {
    summary: {
      total,
      resolvedTotal,
      breachedTotal,
      resolveRate:
        total > 0
          ? Number(((resolvedTotal / total) * 100).toFixed(1))
          : 0,
      slaComplianceRate:
        resolvedTotal > 0
          ? Number(
              ((slaCompliantResolvedTotal / resolvedTotal) * 100).toFixed(1)
            )
          : 0,
    },
    timeline,
    assigneeStats,
  };
}
