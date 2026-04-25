"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { CompareDiffFilterBar } from "@/components/admin/alerts/bulk-jobs/compare-diff-filter-bar";

type CompareRow = {
  targetType?: string;
  targetId: string;
  action?: string;
  sourceStatus: string | null;
  retryStatus: string | null;
  sourceFailureCategory: string | null;
  retryFailureCategory: string | null;
  sourceFailureCode?: string | null;
  retryFailureCode?: string | null;
  sourceFailureMessage?: string | null;
  retryFailureMessage?: string | null;
  diffLabel: "improved" | "worsened" | "changed" | "same";
};

type CompareResponse = {
  sourceJob: {
    id: string;
    action: string;
    status: string;
    createdAt: string;
  };
  retryJob: {
    id: string;
    action: string;
    status: string;
    createdAt: string;
    retryOfJobId?: string | null;
  };
  summary: {
    all: number;
    improved: number;
    worsened: number;
    changed: number;
    same: number;
  };
  diffFilter?: string;
  rows: CompareRow[];
};

export function BulkJobComparePanel({
  jobId,
  retryJobId,
}: {
  jobId: string;
  retryJobId: string;
}) {
  const searchParams = useSearchParams();
  const diffFilter = searchParams.get("diffFilter") ?? "all";

  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("retryJobId", retryJobId);
      if (diffFilter && diffFilter !== "all") {
        params.set("diffFilter", diffFilter);
      }
      const res = await fetch(
        `/api/admin/alerts/bulk-jobs/${jobId}/compare?${params.toString()}`,
        { cache: "no-store" }
      );
      const raw = await res.json().catch(() => null);
      if (!ignore) {
        try {
          const json = requireOkResponseBody(res, raw, "비교 조회 실패") as unknown as CompareResponse;
          setData(json);
        } catch {
          setData(null);
        }
        setLoading(false);
      }
    }

    void run();
    return () => {
      ignore = true;
    };
  }, [jobId, retryJobId, diffFilter]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        비교 데이터를 불러오는 중...
      </div>
    );
  }

  if (!data || !data.summary) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        비교 데이터를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CompareDiffFilterBar counts={data.summary} />

      <div className="grid gap-3 md:grid-cols-5">
        <MetricCard label="전체" value={data.summary.all} />
        <MetricCard label="개선" value={data.summary.improved} accent="emerald" />
        <MetricCard label="악화" value={data.summary.worsened} accent="rose" />
        <MetricCard label="변경" value={data.summary.changed} accent="amber" />
        <MetricCard label="동일" value={data.summary.same} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">대상</th>
              <th className="px-3 py-2">액션</th>
              <th className="px-3 py-2">원본 상태</th>
              <th className="px-3 py-2">재시도 상태</th>
              <th className="px-3 py-2">원본 분류</th>
              <th className="px-3 py-2">재시도 분류</th>
              <th className="px-3 py-2">diff</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr
                key={`${row.targetType}-${row.targetId}-${row.action}`}
                className="border-t border-slate-100"
              >
                <td className="px-3 py-2">
                  <div className="font-medium text-slate-900">{row.targetType}</div>
                  <div className="text-xs text-slate-500">{row.targetId}</div>
                </td>
                <td className="px-3 py-2 text-slate-700">{row.action ?? "-"}</td>
                <td className="px-3 py-2 text-slate-700">{row.sourceStatus ?? "-"}</td>
                <td className="px-3 py-2 text-slate-700">{row.retryStatus ?? "-"}</td>
                <td className="px-3 py-2 text-slate-600">{row.sourceFailureCategory ?? "-"}</td>
                <td className="px-3 py-2 text-slate-600">{row.retryFailureCategory ?? "-"}</td>
                <td className="px-3 py-2">
                  <DiffBadge diffLabel={row.diffLabel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DiffBadge({
  diffLabel,
}: {
  diffLabel: "improved" | "worsened" | "changed" | "same";
}) {
  const cls =
    diffLabel === "improved"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : diffLabel === "worsened"
        ? "bg-rose-50 text-rose-800 border-rose-200"
        : diffLabel === "changed"
          ? "bg-amber-50 text-amber-900 border-amber-200"
          : "bg-slate-50 text-slate-600 border-slate-200";

  const label =
    diffLabel === "improved"
      ? "개선"
      : diffLabel === "worsened"
        ? "악화"
        : diffLabel === "changed"
          ? "변경"
          : "동일";

  return (
    <span className={`rounded-lg border px-2 py-1 text-xs font-medium ${cls}`}>{label}</span>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "rose" | "amber";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-600"
      : accent === "rose"
        ? "text-rose-600"
        : accent === "amber"
          ? "text-amber-600"
          : "text-slate-900";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
