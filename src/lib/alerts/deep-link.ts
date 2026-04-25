type AlertEventLike = {
  entityType?: string | null;
  entityId?: string | null;
  payloadJson?: unknown;
};

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

/** 경고에 연결된 사건 ID (엔티티·payload 기준) */
export function resolveAlertCaseId(alert: {
  entityType?: string | null;
  entityId?: string | null;
  payloadJson?: unknown;
}): string | null {
  const payload = (alert.payloadJson ?? {}) as Record<string, unknown>;

  return (
    getString(payload.caseId) ||
    getString((payload.case as { id?: string } | undefined)?.id) ||
    (alert.entityType === "CASE" ? getString(alert.entityId) : null)
  );
}

export function resolveAlertTargetHref(alert: AlertEventLike): string | null {
  const payload = (alert.payloadJson ?? {}) as Record<string, unknown>;

  const caseId = resolveAlertCaseId(alert);

  if (caseId) {
    return `/cases/${caseId}`;
  }

  const auditLogId =
    getString(payload.auditLogId) ||
    getString(payload.logId) ||
    getString((payload.auditLog as { id?: string } | undefined)?.id) ||
    (alert.entityType === "AUDIT_LOG" ? getString(alert.entityId) : null);

  if (auditLogId) {
    return `/admin/audit-logs?highlight=${encodeURIComponent(auditLogId)}`;
  }

  const actorUserId =
    getString(payload.actorUserId) || getString(payload.userId);

  if (actorUserId) {
    return `/admin/audit-logs?actorUserId=${encodeURIComponent(actorUserId)}`;
  }

  if (alert.entityType && alert.entityId) {
    return `/admin/audit-logs?entityType=${encodeURIComponent(
      alert.entityType
    )}&entityId=${encodeURIComponent(alert.entityId)}`;
  }

  return "/admin/alerts/history";
}

export function extractLinkableIds(payloadJson: unknown) {
  const payload = (payloadJson ?? {}) as Record<string, unknown>;

  return {
    caseId:
      getString(payload.caseId) ||
      getString((payload.case as { id?: string } | undefined)?.id) ||
      null,
    auditLogId:
      getString(payload.auditLogId) ||
      getString(payload.logId) ||
      getString((payload.auditLog as { id?: string } | undefined)?.id) ||
      null,
    actorUserId:
      getString(payload.actorUserId) || getString(payload.userId) || null,
    entityId: getString(payload.entityId) || null,
    entityType: getString(payload.entityType) || null,
  };
}
