import { getAuditLogAdvancedSignalsService } from "@/features/audit-logs/audit-log.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
};

function toneClass(severity: "critical" | "warning" | "normal") {
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

function roleBadge(role: string) {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "border-red-200 bg-red-50 text-red-700";
    case "LAWYER":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "USER":
      return "border-slate-200 bg-slate-50 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default async function AuditLogAdvancedStatusBanner({ currentUser }: Props) {
  const signal = await getAuditLogAdvancedSignalsService(currentUser);
  const tone = toneClass(signal.nightSignal.severity as "critical" | "warning" | "normal");

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${tone.wrap}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
          {tone.label}
        </span>
        <h2 className={`text-lg font-semibold ${tone.title}`}>고급 이상 활동 상태 배너</h2>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-white/60 bg-white/70 p-4">
          <h3 className="text-sm font-semibold text-slate-900">역할별 급증 탐지</h3>
          {signal.roleSpikes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">급증으로 판단된 역할이 없습니다.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {signal.roleSpikes.map((item) => (
                <div key={item.role} className="rounded-lg border bg-white px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${roleBadge(item.role)}`}
                    >
                      {item.role}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{item.multiplier}배</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    최근 7일 일평균 {item.recentDailyAverage}건 → 오늘 {item.todayCount}건
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/60 bg-white/70 p-4">
          <h3 className="text-sm font-semibold text-slate-900">심야 시간대 이상 활동</h3>
          <p className="mt-3 text-sm text-slate-700">
            00시~05시 로그 수:{" "}
            <span className="font-semibold">{signal.nightSignal.totalNightCount}건</span>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border bg-white p-3">
              <p className="text-slate-500">ADMIN</p>
              <p className="mt-1 font-semibold text-slate-900">{signal.nightSignal.byRole.ADMIN}</p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-slate-500">LAWYER</p>
              <p className="mt-1 font-semibold text-slate-900">{signal.nightSignal.byRole.LAWYER}</p>
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-slate-500">USER</p>
              <p className="mt-1 font-semibold text-slate-900">{signal.nightSignal.byRole.USER}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/60 bg-white/70 p-4">
          <h3 className="text-sm font-semibold text-slate-900">블랙리스트 액션 경고</h3>
          {signal.blacklistHits.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">오늘 블랙리스트 액션은 없습니다.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {signal.blacklistHits.slice(0, 5).map((item, idx) => (
                <div
                  key={`${item.action}-${item.actorUserId}-${idx}`}
                  className="rounded-lg border bg-white px-3 py-3"
                >
                  <p className="font-medium text-slate-900">{item.action}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.actorName ?? item.actorEmail} / {item.role}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/60 bg-white/70 p-4">
        <h3 className="text-sm font-semibold text-slate-900">화이트리스트 제외 후 급증 액션</h3>
        {signal.actionSpikes.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">급증으로 판단된 액션이 없습니다.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {signal.actionSpikes.map((item) => (
              <div
                key={item.action}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3"
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
