import type { AlertEscalationLevel, AlertEscalationTargetGroup } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildEscalationMessage, computeEscalationLevel } from "@/lib/alerts/escalation";
import {
  resolveEscalationRecipientUserIds,
  type EscalationTargetGroup,
} from "@/lib/alerts/escalation-targets";

function parseEscalationGroups(
  raw: AlertEscalationTargetGroup[] | null | undefined
): EscalationTargetGroup[] {
  if (raw?.length) {
    return raw as EscalationTargetGroup[];
  }
  return ["ADMINS"];
}

function parseCustomUserIdsFromRule(rule: {
  escalationUserIdsJson: unknown;
}): string[] {
  const j = rule.escalationUserIdsJson;
  if (Array.isArray(j)) {
    return j.filter((x): x is string => typeof x === "string");
  }
  return [];
}

async function notifyEscalation(input: {
  alertEventId: string;
  title: string;
  body: string;
  assigneeUserId?: string | null;
  groups: EscalationTargetGroup[];
  customUserIds?: string[] | null;
}) {
  const recipientIds = await resolveEscalationRecipientUserIds({
    groups: input.groups,
    customUserIds: input.customUserIds ?? null,
    assigneeUserId: input.assigneeUserId ?? null,
  });

  for (const userId of recipientIds) {
    await prisma.adminNotification.create({
      data: {
        userId,
        alertEventId: input.alertEventId,
        type: "ALERT_EVENT",
        title: input.title,
        body: input.body,
        targetHref: "/admin/alerts/board",
      },
    });
  }
}

async function reconcilePendingEscalations(
  alertEventId: string,
  active: AlertEscalationLevel
) {
  if (active === "NONE") {
    await prisma.alertEscalation.updateMany({
      where: { alertEventId, status: "PENDING" },
      data: { status: "CLEARED", clearedAt: new Date() },
    });
    return;
  }
  await prisma.alertEscalation.updateMany({
    where: {
      alertEventId,
      status: "PENDING",
      NOT: { level: active },
    },
    data: { status: "CLEARED", clearedAt: new Date() },
  });
}

export async function executeEscalationScan() {
  const items = await prisma.alertEvent.findMany({
    where: {
      dueAt: { not: null },
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
    },
    include: {
      rule: true,
    },
  });

  let updatedCount = 0;
  let notificationCount = 0;

  for (const item of items) {
    const nextLevel = computeEscalationLevel({
      dueAt: item.dueAt,
      status: item.status,
      level1Hours: item.rule?.escalationLevel1Hours ?? null,
      level2Hours: item.rule?.escalationLevel2Hours ?? null,
      level3Hours: item.rule?.escalationLevel3Hours ?? null,
    });

    if (nextLevel !== item.escalationLevel) {
      await prisma.alertEvent.update({
        where: { id: item.id },
        data: {
          escalationLevel: nextLevel,
        },
      });
      updatedCount += 1;
    }

    await reconcilePendingEscalations(item.id, nextLevel);

    if (nextLevel === "NONE" || !item.dueAt) {
      continue;
    }

    const exists = await prisma.alertEscalation.findFirst({
      where: {
        alertEventId: item.id,
        level: nextLevel,
        status: "PENDING",
      },
      select: { id: true },
    });

    if (!exists) {
      const message = buildEscalationMessage({
        title: item.title,
        level: nextLevel,
        dueAt: item.dueAt,
      });

      await prisma.alertEscalation.create({
        data: {
          alertEventId: item.id,
          level: nextLevel,
          message,
          status: "PENDING",
        },
      });

      await notifyEscalation({
        alertEventId: item.id,
        title: `[에스컬레이션] ${nextLevel}`,
        body: message,
        assigneeUserId: item.assigneeUserId ?? null,
        groups: parseEscalationGroups(item.rule?.escalationTargetGroups),
        customUserIds: item.rule ? parseCustomUserIdsFromRule(item.rule) : [],
      });

      notificationCount += 1;
    }
  }

  return {
    scannedCount: items.length,
    updatedCount,
    notificationCount,
  };
}
