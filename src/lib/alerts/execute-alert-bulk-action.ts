import { prisma } from "@/lib/prisma";
import { computeSlaState } from "@/lib/alerts/sla";
import { resolveAlertCaseId } from "@/lib/alerts/deep-link";
import { writeAuditLog } from "@/lib/audit-log";
import type {
  AlertBulkActionResult,
  AlertBulkActionType,
} from "@/types/alert-bulk";

type ExecuteInput = {
  actorId: string;
  actorName: string;
  action: AlertBulkActionType;
  alertIds: string[];
  assigneeUserId?: string;
  note?: string;
};

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}

export async function executeAlertBulkAction(
  input: ExecuteInput
): Promise<AlertBulkActionResult> {
  const result: AlertBulkActionResult = {
    action: input.action,
    requestedCount: input.alertIds.length,
    successCount: 0,
    failureCount: 0,
    successes: [],
    failures: [],
  };

  const alerts = await prisma.alertEvent.findMany({
    where: { id: { in: input.alertIds } },
    include: {
      rule: { select: { dueSoonHours: true } },
    },
  });

  const foundIdSet = new Set(alerts.map((a) => a.id));

  for (const requestedId of input.alertIds) {
    if (!foundIdSet.has(requestedId)) {
      result.failures.push({
        alertEventId: requestedId,
        reason: "대상 경고를 찾을 수 없습니다.",
      });
    }
  }

  if (input.action === "REASSIGN") {
    if (!input.assigneeUserId) {
      for (const alert of alerts) {
        result.failures.push({
          alertEventId: alert.id,
          caseId: resolveAlertCaseId(alert),
          title: alert.title,
          reason: "재지정 담당자가 필요합니다.",
        });
      }
      result.failureCount = result.failures.length;
      result.successCount = 0;
      return result;
    }
    const u = await prisma.user.findUnique({
      where: { id: input.assigneeUserId },
      select: { id: true },
    });
    if (!u) {
      for (const alert of alerts) {
        result.failures.push({
          alertEventId: alert.id,
          caseId: resolveAlertCaseId(alert),
          title: alert.title,
          reason: "담당자를 찾을 수 없습니다.",
        });
      }
      result.failureCount = result.failures.length;
      result.successCount = 0;
      return result;
    }
  }

  for (const alert of alerts) {
    const dueSoon = alert.dueSoonHours ?? alert.rule?.dueSoonHours ?? undefined;
    const caseId = resolveAlertCaseId(alert);

    try {
      await prisma.$transaction(async (tx) => {
        if (input.action === "ACKNOWLEDGE") {
          await tx.alertEvent.update({
            where: { id: alert.id },
            data: {
              status: "ACKNOWLEDGED",
              acknowledgedAt: new Date(),
              acknowledgedById: input.actorId,
              slaState: computeSlaState({
                dueAt: alert.dueAt,
                status: "ACKNOWLEDGED",
                dueSoonHours: dueSoon,
              }),
            },
          });
        } else if (input.action === "RESOLVE") {
          await tx.alertEvent.update({
            where: { id: alert.id },
            data: {
              status: "RESOLVED",
              resolvedAt: new Date(),
              resolvedById: input.actorId,
              escalationLevel: "NONE",
              slaState: computeSlaState({
                dueAt: alert.dueAt,
                status: "RESOLVED",
                dueSoonHours: dueSoon,
              }),
            },
          });

          await tx.alertEscalation.updateMany({
            where: { alertEventId: alert.id, status: "PENDING" },
            data: {
              status: "CLEARED",
              clearedAt: new Date(),
              releaseReason:
                input.note || "대량 해결 처리로 자동 해제",
              releasedByUserId: input.actorId,
            },
          });
        } else if (input.action === "IGNORE") {
          await tx.alertEvent.update({
            where: { id: alert.id },
            data: {
              status: "IGNORED",
              ignoredAt: new Date(),
              ignoredById: input.actorId,
              escalationLevel: "NONE",
              slaState: computeSlaState({
                dueAt: alert.dueAt,
                status: "IGNORED",
                dueSoonHours: dueSoon,
              }),
            },
          });

          await tx.alertEscalation.updateMany({
            where: { alertEventId: alert.id, status: "PENDING" },
            data: {
              status: "CLEARED",
              clearedAt: new Date(),
              releaseReason:
                input.note || "대량 무시 처리로 자동 해제",
              releasedByUserId: input.actorId,
            },
          });
        } else if (input.action === "REASSIGN" && input.assigneeUserId) {
          await tx.alertEvent.update({
            where: { id: alert.id },
            data: {
              assigneeUserId: input.assigneeUserId,
              slaState: computeSlaState({
                dueAt: alert.dueAt,
                status: alert.status,
                dueSoonHours: dueSoon,
              }),
            },
          });
        }

        if (caseId) {
          await tx.caseTimelineMemo.create({
            data: {
              caseId,
              authorUserId: input.actorId,
              memoType: "SYSTEM",
              alertEventId: alert.id,
              noteType: "ALERT_BULK",
              content:
                `[대량 조치] ${input.actorName}님이 경고를 일괄 ${input.action} 처리했습니다.` +
                (input.note ? `\n메모: ${input.note}` : "") +
                (input.action === "REASSIGN" && input.assigneeUserId
                  ? `\n담당자 ID: ${input.assigneeUserId}`
                  : ""),
            },
          });
        }
      });

      await writeAuditLog({
        actorUserId: input.actorId,
        action: `alert.bulk.${input.action}`,
        entityType: "AlertEvent",
        entityId: alert.id,
        metadata: {
          action: input.action,
          note: input.note ?? null,
          assigneeUserId: input.assigneeUserId ?? null,
        },
      });

      result.successes.push({
        alertEventId: alert.id,
        caseId,
        title: alert.title,
      });
    } catch (error) {
      result.failures.push({
        alertEventId: alert.id,
        caseId,
        title: alert.title,
        reason: normalizeErrorMessage(error),
      });
    }
  }

  result.successCount = result.successes.length;
  result.failureCount = result.failures.length;

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true },
  });

  for (const a of admins) {
    await prisma.adminNotification.create({
      data: {
        userId: a.id,
        type: "ALERT_EVENT",
        title: `경고 대량 ${input.action} 처리`,
        body: `요청 ${result.requestedCount}건 · 성공 ${result.successCount} · 실패 ${result.failureCount}`,
        targetHref: "/admin/alerts/board",
      },
    });
  }

  if (
    input.action === "REASSIGN" &&
    input.assigneeUserId &&
    result.successCount > 0
  ) {
    await prisma.adminNotification.create({
      data: {
        userId: input.assigneeUserId,
        type: "ALERT_EVENT",
        title: "경고 대량 담당 재지정",
        body: `${result.successCount}건이 재지정되었습니다.`,
        targetHref: "/admin/alerts/board",
      },
    });
  }

  return result;
}
