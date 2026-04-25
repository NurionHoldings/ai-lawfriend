import AuditLogDailyTrendChartClient from "@/components/admin/audit-log-daily-trend-chart-client";
import { getAuditLogDailyTrendService } from "@/features/audit-logs/audit-log.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
  dateFrom?: string;
  dateTo?: string;
};

export default async function AuditLogDailyTrendChart({
  currentUser,
  dateFrom = "",
  dateTo = "",
}: Props) {
  const data = await getAuditLogDailyTrendService(currentUser, {
    dateFrom,
    dateTo,
  });

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">일자별 감사로그 추이</h2>
        <p className="mt-1 text-sm text-slate-500">
          기간 내 날짜별 로그 발생 추이입니다.
        </p>
      </div>

      <AuditLogDailyTrendChartClient data={data} />
    </section>
  );
}
