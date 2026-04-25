import { getAuditLogSummaryService } from "@/features/audit-logs/audit-log.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

type Props = {
  currentUser: SessionUser;
  dateFrom?: string;
  dateTo?: string;
};

export default async function AuditLogSummaryWidgets({
  currentUser,
  dateFrom = "",
  dateTo = "",
}: Props) {
  const summary = await getAuditLogSummaryService(currentUser, {
    dateFrom,
    dateTo,
  });

  const cards = [
    { label: "전체 로그", value: summary.totalCount },
    { label: "오늘 로그", value: summary.todayCount },
    { label: "사건 로그", value: summary.caseCount },
    { label: "첨부파일 로그", value: summary.attachmentCount },
    { label: "타임라인 로그", value: summary.timelineCount },
    { label: "배정 로그", value: summary.assignmentCount },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {card.value.toLocaleString("ko-KR")}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">상위 액션</h2>

        {summary.topActions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-sm text-slate-500">
            집계할 로그가 없습니다.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {summary.topActions.map((item) => (
              <div
                key={item.action}
                className="flex items-center justify-between rounded-xl border bg-slate-50 p-4"
              >
                <span className="truncate pr-4 font-medium text-slate-900">
                  {item.action}
                </span>
                <span className="shrink-0 text-sm text-slate-500">
                  {item.count.toLocaleString("ko-KR")}건
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
