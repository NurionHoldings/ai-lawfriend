import { getCaseStatusLabel } from "@/lib/definitions/case-status-definition";

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";

  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function statusLabel(status: string) {
  return getCaseStatusLabel(status);
}
