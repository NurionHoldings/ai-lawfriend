import { prisma } from "@/lib/prisma";
import { buildSlaWarningMessage, computeSlaState } from "@/lib/alerts/sla";

async function createSlaNotifications(
  alertEventId: string,
  title: string,
  body: string
) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true },
  });

  for (const admin of admins) {
    await prisma.adminNotification.create({
      data: {
        userId: admin.id,
        alertEventId,
        type: "ALERT_EVENT",
        title,
        body,
        targetHref: "/admin/alerts/board",
      },
    });
  }
}

async function reconcileOpenWarnings(
  alertEventId: string,
  active: "DUE_SOON" | "OVERDUE" | null
) {
  if (active === null) {
    await prisma.alertSlaWarning.updateMany({
      where: { alertEventId, status: "OPEN" },
      data: { status: "CLEARED", clearedAt: new Date() },
    });
    return;
  }
  const inactive = active === "DUE_SOON" ? "OVERDUE" : "DUE_SOON";
  await prisma.alertSlaWarning.updateMany({
    where: { alertEventId, status: "OPEN", warningType: inactive },
    data: { status: "CLEARED", clearedAt: new Date() },
  });
}

export async function executeSlaScan() {
  const items = await prisma.alertEvent.findMany({
    where: {
      dueAt: { not: null },
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
    },
    select: {
      id: true,
      title: true,
      dueAt: true,
      status: true,
      slaState: true,
      dueSoonHours: true,
      rule: { select: { dueSoonHours: true } },
    },
  });

  let updatedCount = 0;
  let warningCreatedCount = 0;

  for (const item of items) {
    const nextState = computeSlaState({
      dueAt: item.dueAt,
      status: item.status,
      dueSoonHours:
        item.dueSoonHours ?? item.rule?.dueSoonHours ?? undefined,
    });

    if (nextState !== item.slaState) {
      await prisma.alertEvent.update({
        where: { id: item.id },
        data: { slaState: nextState },
      });
      updatedCount += 1;
    }

    const warningType =
      nextState === "OVERDUE"
        ? ("OVERDUE" as const)
        : nextState === "DUE_SOON"
          ? ("DUE_SOON" as const)
          : null;

    if (!warningType || !item.dueAt) {
      await reconcileOpenWarnings(item.id, null);
      continue;
    }

    await reconcileOpenWarnings(item.id, warningType);

    const exists = await prisma.alertSlaWarning.findFirst({
      where: {
        alertEventId: item.id,
        warningType,
        status: "OPEN",
      },
      select: { id: true },
    });

    if (!exists) {
      const message = buildSlaWarningMessage({
        title: item.title,
        dueAt: item.dueAt,
        warningType,
      });

      await prisma.alertSlaWarning.create({
        data: {
          alertEventId: item.id,
          warningType,
          message,
          status: "OPEN",
        },
      });

      await createSlaNotifications(
        item.id,
        warningType === "OVERDUE"
          ? "[SLA 초과] 경고 기한 초과"
          : "[SLA 임박] 경고 기한 임박",
        message
      );

      warningCreatedCount += 1;
    }
  }

  return {
    scannedCount: items.length,
    updatedCount,
    warningCreatedCount,
  };
}
