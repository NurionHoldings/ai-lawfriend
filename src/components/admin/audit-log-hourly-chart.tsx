import AuditLogHourlyChartClient from "@/components/admin/audit-log-hourly-chart-client";
import { getAuditLogHourlyDistributionService } from "@/features/audit-logs/audit-log.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
  dateFrom?: string;
  dateTo?: string;
};

export default async function AuditLogHourlyChart({
  currentUser,
  dateFrom = "",
  dateTo = "",
}: Props) {
  const data = await getAuditLogHourlyDistributionService(currentUser, {
    dateFrom,
    dateTo,
  });

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">시간대별 로그 분포</h2>
        <p className="mt-1 text-sm text-slate-500">
          0시~23시 기준 로그 발생 분포입니다.
        </p>
      </div>

      <AuditLogHourlyChartClient data={data} />
    </section>
  );
}
