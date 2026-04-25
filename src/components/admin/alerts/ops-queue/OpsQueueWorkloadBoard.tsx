import type { OpsQueueWorkloadRow } from "@/lib/ops-queue/workload";

export function OpsQueueWorkloadBoard({
  rows,
}: {
  rows: OpsQueueWorkloadRow[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          담당자별 워크로드 보드
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          열린 운영 큐 티켓의 현재 분포와 overdue 현황입니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.assigneeUserId}
            className="rounded-2xl border border-slate-200 p-4"
          >
            <div className="text-sm font-semibold text-slate-900">
              {row.assigneeUserId === "unassigned"
                ? "미배정"
                : row.assigneeUserId}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">총 티켓</div>
                <div className="mt-1 text-lg font-semibold">{row.totalCount}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">OPEN</div>
                <div className="mt-1 text-lg font-semibold">{row.openCount}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">ACKED</div>
                <div className="mt-1 text-lg font-semibold">{row.ackedCount}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">IN_PROGRESS</div>
                <div className="mt-1 text-lg font-semibold">
                  {row.inProgressCount}
                </div>
              </div>
              <div className="rounded-xl bg-rose-50 p-3">
                <div className="text-xs text-rose-600">SLA 초과</div>
                <div className="mt-1 text-lg font-semibold text-rose-700">
                  {row.overdueCount}
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <div className="text-xs text-amber-600">SLA 임박</div>
                <div className="mt-1 text-lg font-semibold text-amber-700">
                  {row.nearDueCount}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
