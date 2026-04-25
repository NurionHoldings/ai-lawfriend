export type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
export type AlertSlaState = "ON_TRACK" | "DUE_SOON" | "OVERDUE";

export function computeSlaState(input: {
  dueAt?: string | Date | null;
  status: AlertStatus;
  dueSoonHours?: number;
}): AlertSlaState {
  if (!input.dueAt) return "ON_TRACK";
  if (input.status === "IGNORED" || input.status === "RESOLVED") return "ON_TRACK";

  const dueSoonHours = input.dueSoonHours ?? 24;
  const due = typeof input.dueAt === "string" ? new Date(input.dueAt) : input.dueAt;
  const now = new Date();

  if (due.getTime() < now.getTime()) return "OVERDUE";

  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / 1000 / 60 / 60;

  if (diffHours <= dueSoonHours) return "DUE_SOON";
  return "ON_TRACK";
}

export function buildSlaWarningMessage(input: {
  title: string;
  dueAt: string | Date;
  warningType: "DUE_SOON" | "OVERDUE";
}) {
  const dueText =
    typeof input.dueAt === "string"
      ? new Date(input.dueAt).toLocaleString()
      : input.dueAt.toLocaleString();

  if (input.warningType === "OVERDUE") {
    return `경고 "${input.title}" 의 SLA 기한이 지났습니다. 마감 시각: ${dueText}`;
  }

  return `경고 "${input.title}" 의 SLA 기한이 임박했습니다. 마감 시각: ${dueText}`;
}
