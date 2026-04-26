import { DASHBOARD_AMBIENCE_COPY } from "@/lib/dashboard/dashboard-copy";

const risks = [
  {
    title: "오래 멈춘 사건",
    level: "주의",
    description: "진행 상태가 장시간 변하지 않은 사건을 확인합니다.",
  },
  {
    title: "승인 대기",
    level: "확인",
    description: "승인 또는 검토가 필요한 항목을 확인합니다.",
  },
  {
    title: "자료 누락",
    level: "보완",
    description: "첨부자료 또는 진술이 부족한 사건을 확인합니다.",
  },
];

export function AdminRiskBoard() {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-5 sm:rounded-3xl sm:p-6">
      <h3 className="text-lg font-bold text-white sm:text-xl">
        {DASHBOARD_AMBIENCE_COPY.adminRiskCaption}
      </h3>

      <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
        {risks.map((risk) => (
          <div
            key={risk.title}
            className="rounded-xl border border-white/12 bg-slate-950/65 p-3.5 sm:rounded-2xl sm:p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-bold text-white">{risk.title}</h4>
              <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                {risk.level}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300/90 sm:text-sm sm:leading-6">
              {risk.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
