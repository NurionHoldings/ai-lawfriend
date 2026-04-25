import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type NotifyArgs = {
  userId: string;
  title: string;
  message: string;
  href?: string | null;
  type?: string;
  metaJson?: unknown;
};

export function isOverdue(dueAt?: Date | null, completedAt?: Date | null) {
  if (!dueAt || completedAt) return false;
  return dueAt.getTime() < Date.now();
}

export async function createOpsQueueNotification(args: NotifyArgs) {
  return prisma.adminNotification.create({
    data: {
      userId: args.userId,
      type: "SYSTEM",
      title: args.title,
      body: args.message,
      targetHref: args.href ?? null,
      metaJson: (args.metaJson ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function scanOverdueOpsQueueItemsAndNotify() {
  const now = new Date();

  const overdueItems = await prisma.opsQueueTicket.findMany({
    where: {
      completedAt: null,
      NOT: {
        status: { in: ["RESOLVED", "CANCELED", "DONE"] },
      },
      dueAt: {
        not: null,
        lt: now,
      },
      OR: [
        { overdueNotifiedAt: null },
        {
          overdueNotifiedAt: {
            lt: new Date(now.getTime() - 1000 * 60 * 60 * 6),
          },
        },
      ],
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: [{ dueAt: "asc" }],
    take: 200,
  });

  let notified = 0;

  for (const item of overdueItems) {
    if (!item.assigneeUserId) {
      await prisma.opsQueueTicket.update({
        where: { id: item.id },
        data: {
          slaLastCheckedAt: now,
        },
      });
      continue;
    }

    await createOpsQueueNotification({
      userId: item.assigneeUserId,
      title: `[운영 큐 SLA 초과] ${item.title}`,
      message: `담당 작업이 기한을 초과했습니다. 우선 확인이 필요합니다.`,
      href: `/admin/alerts/ops-queue/${item.id}`,
      metaJson: {
        opsQueueItemId: item.id,
        dueAt: item.dueAt?.toISOString(),
        boardColumn: item.boardColumn,
        priority: item.priority,
        severity: item.severity,
      },
    });

    await prisma.opsQueueTicket.update({
      where: { id: item.id },
      data: {
        overdueNotifiedAt: now,
        slaLastCheckedAt: now,
      },
    });

    notified += 1;
  }

  return {
    scanned: overdueItems.length,
    notified,
  };
}
