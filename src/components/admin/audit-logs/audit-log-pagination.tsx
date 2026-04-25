"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
};

export function AuditLogPagination({
  page,
  pageSize,
  totalPages,
  total,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));
    router.push(`/admin/audit-logs?${params.toString()}`);
  }

  function setPageSize(nextSize: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("pageSize", String(nextSize));
    router.push(`/admin/audit-logs?${params.toString()}`);
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          총 <span className="font-semibold text-slate-900">{total}</span>건 중{" "}
          <span className="font-semibold text-slate-900">{start}</span> -{" "}
          <span className="font-semibold text-slate-900">{end}</span> 표시
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
          >
            <option value={10}>10개씩</option>
            <option value={20}>20개씩</option>
            <option value={50}>50개씩</option>
            <option value={100}>100개씩</option>
          </select>

          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:opacity-50"
          >
            이전
          </button>

          <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">
            {page} / {totalPages}
          </div>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
