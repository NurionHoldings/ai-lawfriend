import { getAuditLogDashboardSignalsService } from "@/features/audit-logs/audit-log.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
};

function bannerTone(severity: "critical" | "warning" | "normal") {
  switch (severity) {
    case "critical":
      return {
        wrap: "border-red-200 bg-red-50",
        title: "text-red-800",
        text: "text-red-700",
        badge: "bg-red-600 text-white",
        label: "위험",
      };
    case "warning":
      return {
        wrap: "border-amber-200 bg-amber-50",
        title: "text-amber-800",
        text: "text-amber-700",
        badge: "bg-amber-500 text-white",
        label: "주의",
      };
    default:
      return {
        wrap: "border-emerald-200 bg-emerald-50",
        title: "text-emerald-800",
        text: "text-emerald-700",
        badge: "bg-emerald-600 text-white",
        label: "정상",
      };
  }
}

export default async function AuditLogStatusBanner({ currentUser }: Props) {
  const signal = await getAuditLogDashboardSignalsService(currentUser);
  const tone = bannerTone(signal.severity as "critical" | "warning" | "normal");

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${tone.wrap}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
              {tone.label}
            </span>
            <h2 className={`text-lg font-semibold ${tone.title}`}>감사로그 상태 배너</h2>
          </div>

          <p className={`mt-3 text-sm ${tone.text}`}>
            오늘 로그 수는 <span className="font-semibold">{signal.todayCount}건</span>이며, 최근 7일
            일평균은 <span className="font-semibold">{signal.last7DaysAverage}건</span>입니다. 현재
            비율은 <span className="font-semibold">{signal.todayVsAverageRatio}배</span>입니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/60 bg-white/70 p-4">
          <p className="text-xs font-medium text-slate-500">오늘 로그 수</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {signal.todayCount.toLocaleString("ko-KR")}
          </p>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/70 p-4">
          <p className="text-xs font-medium text-slate-500">최근 7일 평균</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {signal.last7DaysAverage.toLocaleString("ko-KR")}
          </p>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/70 p-4">
          <p className="text-xs font-medium text-slate-500">오늘 / 평균 배수</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {signal.todayVsAverageRatio.toLocaleString("ko-KR")}배
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/60 bg-white/70 p-4">
        <h3 className="text-sm font-semibold text-slate-900">오늘 급증 액션 알림</h3>

        {signal.spikeActions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            현재 기준으로 급증으로 판단되는 액션은 없습니다.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {signal.spikeActions.map((item) => (
              <div
                key={item.action}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.action}</p>
                  <p className="text-xs text-slate-500">
                    최근 7일 일평균 {item.recentDailyAverage}건 → 오늘 {item.todayCount}건
                  </p>
                </div>
                <div className="text-sm font-semibold text-slate-900">{item.multiplier}배</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
