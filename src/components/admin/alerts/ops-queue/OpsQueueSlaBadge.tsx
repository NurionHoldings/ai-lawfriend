import { isOverdue } from "@/lib/ops-queue/sla";
import {
  getOpsQueueSlaState,
  normalizeOpsQueueSeverity,
  normalizeOpsQueueStatus,
} from "@/lib/ops-queue/sla-policy";

export function OpsQueueSlaBadge({
  createdAt,
  severity,
  status,
  dueAt,
  completedAt,
}: {
  createdAt: Date;
  severity: string;
  status: string;
  dueAt?: Date | null;
  completedAt?: Date | null;
}) {
  const useDueMode = dueAt != null || completedAt != null;

  if (useDueMode) {
    if (!dueAt) {
      return (
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
          기한 없음
        </span>
      );
    }

    const done = completedAt
      ? typeof completedAt === "string"
        ? new Date(completedAt)
        : completedAt
      : null;
    const due = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
    const overdue = isOverdue(due, done);

    if (done) {
      return (
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
          완료
        </span>
      );
    }

    if (overdue) {
      return (
        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
          SLA 초과
        </span>
      );
    }

    return (
      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
        진행중
      </span>
    );
  }

  const sla = getOpsQueueSlaState({
    createdAt,
    severity: normalizeOpsQueueSeverity(severity),
    status: normalizeOpsQueueStatus(status),
  });

  const cls = sla.overdue
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : sla.nearDue
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  const label = sla.overdue
    ? "SLA 초과"
    : sla.nearDue
      ? "SLA 임박"
      : "SLA 정상";

  return (
    <span className={`rounded-lg border px-2 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
