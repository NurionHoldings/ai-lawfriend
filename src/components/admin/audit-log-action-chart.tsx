import AuditLogActionChartClient from "@/components/admin/audit-log-action-chart-client";
import { getAuditLogActionChartService } from "@/features/audit-logs/audit-log.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
  dateFrom?: string;
  dateTo?: string;
};

export default async function AuditLogActionChart({
  currentUser,
  dateFrom = "",
  dateTo = "",
}: Props) {
  const data = await getAuditLogActionChartService(currentUser, {
    dateFrom,
    dateTo,
  });

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">액션별 통계 차트</h2>
        <p className="mt-1 text-sm text-slate-500">
          현재 기간 기준 상위 액션을 표시합니다.
        </p>
      </div>

      <AuditLogActionChartClient data={data} />
    </section>
  );
}
