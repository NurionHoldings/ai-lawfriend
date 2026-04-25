export type OpsQueueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type OpsQueueStatus =
  | "OPEN"
  | "ACKED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CANCELED";

export function normalizeOpsQueueSeverity(severity: string): OpsQueueSeverity {
  const u = severity.toUpperCase();
  if (u === "LOW" || u === "MEDIUM" || u === "HIGH" || u === "CRITICAL") {
    return u;
  }
  return "MEDIUM";
}

export function normalizeOpsQueueStatus(status: string): OpsQueueStatus {
  const u = status.toUpperCase();
  if (
    u === "OPEN" ||
    u === "ACKED" ||
    u === "IN_PROGRESS" ||
    u === "RESOLVED" ||
    u === "CANCELED"
  ) {
    return u;
  }
  return "OPEN";
}

export function getOpsQueueSlaHours(severity: OpsQueueSeverity) {
  switch (severity) {
    case "CRITICAL":
      return 2;
    case "HIGH":
      return 8;
    case "MEDIUM":
      return 24;
    case "LOW":
    default:
      return 72;
  }
}

export function buildOpsQueueDueAt(params: {
  createdAt: Date;
  severity: OpsQueueSeverity;
}) {
  const hours = getOpsQueueSlaHours(params.severity);
  return new Date(params.createdAt.getTime() + hours * 60 * 60 * 1000);
}

export function getOpsQueueSlaState(params: {
  createdAt: Date;
  severity: OpsQueueSeverity;
  status: OpsQueueStatus;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const dueAt = buildOpsQueueDueAt({
    createdAt: params.createdAt,
    severity: params.severity,
  });

  const closed =
    params.status === "RESOLVED" || params.status === "CANCELED";

  if (closed) {
    return {
      dueAt,
      overdue: false,
      nearDue: false,
      remainingMinutes: Math.max(
        0,
        Math.floor((dueAt.getTime() - now.getTime()) / 60000),
      ),
    };
  }

  const remainingMs = dueAt.getTime() - now.getTime();
  const remainingMinutes = Math.floor(remainingMs / 60000);
  const overdue = remainingMs < 0;
  const nearDue = !overdue && remainingMs <= 2 * 60 * 60 * 1000;

  return {
    dueAt,
    overdue,
    nearDue,
    remainingMinutes,
  };
}
