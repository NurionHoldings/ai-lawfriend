import type { AdminDashboardMetrics } from "@/lib/dashboard/dashboard-metrics";

type Props = {
  statusBreakdown?: AdminDashboardMetrics["statusBreakdown"];
};

const statusGroups = [
  {
    key: "intake",
    label: "접수",
    description: "접수·보완 확인",
    getValue: (data: NonNullable<Props["statusBreakdown"]>) =>
      data.intakePending,
  },
  {
    key: "interview",
    label: "인터뷰",
    description: "진행·완료",
    getValue: (data: NonNullable<Props["statusBreakdown"]>) =>
      data.inInterview + data.interviewDone,
  },
  {
    key: "draft",
    label: "문서",
    description: "작성 중",
    getValue: (data: NonNullable<Props["statusBreakdown"]>) =>
      data.drafting,
  },
  {
    key: "review",
    label: "검토",
    description: "검토 대기",
    getValue: (data: NonNullable<Props["statusBreakdown"]>) =>
      data.reviewPending,
  },
  {
    key: "approved",
    label: "승인",
    description: "승인 완료",
    getValue: (data: NonNullable<Props["statusBreakdown"]>) =>
      data.approved,
  },
  {
    key: "closed",
    label: "종결",
    description: "보류·반려·종결",
    getValue: (data: NonNullable<Props["statusBreakdown"]>) =>
      data.hold + data.rejected + data.closed,
  },
];

const emptyBreakdown: NonNullable<Props["statusBreakdown"]> = {
  intakePending: 0,
  inInterview: 0,
  interviewDone: 0,
  drafting: 0,
  reviewPending: 0,
  approved: 0,
  hold: 0,
  rejected: 0,
  closed: 0,
};

export function AdminStatusDistributionBar({
  statusBreakdown = emptyBreakdown,
}: Props) {
  const groups = statusGroups.map((group) => ({
    ...group,
    value: group.getValue(statusBreakdown),
  }));

  const total = groups.reduce((sum, group) => sum + group.value, 0);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-200">
            Status Distribution
          </p>
          <h3 className="mt-1 text-xl font-bold text-white">
            상태별 사건 분포
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            접수부터 종결까지 사건이 어느 단계에 머물러 있는지 요약합니다.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-slate-200">
          총 {total}건
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
        <div className="flex h-3 w-full">
          {groups.map((group) => {
            const width = total > 0 ? `${(group.value / total) * 100}%` : "0%";

            return (
              <div
                key={group.key}
                className="h-full min-w-[2px] bg-cyan-300/60 first:rounded-l-full last:rounded-r-full"
                style={{ width }}
                aria-label={`${group.label} ${group.value}건`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.key}
            className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{group.label}</p>
              <span className="text-lg font-black tabular-nums text-cyan-100">
                {group.value}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {group.description}
            </p>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="mt-5 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
          아직 상태별로 표시할 사건이 없습니다. 사건이 등록되면 이곳에
          단계별 분포가 표시됩니다.
        </p>
      )}
    </section>
  );
}
