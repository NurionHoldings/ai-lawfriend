"use client";

import { useEffect, useMemo, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { BulkJobFailureGuideBadge } from "@/components/admin/alerts/bulk-jobs/bulk-job-failure-guide-badge";
import { FailedItemsToolbar } from "@/components/admin/alerts/bulk-jobs/failed-items-toolbar";
import { FailureActionRecommendationBadges } from "@/components/admin/alerts/bulk-jobs/failure-action-recommendation-badges";

type FailedItem = {
  id: string;
  targetType: string;
  targetId: string;
  targetLabel: string | null;
  errorCode: string | null;
  errorReason: string | null;
  errorMessage: string | null;
  attemptCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  failureCategory?: string | null;
  failureTaxonomyCode?: string | null;
  autoGuideLabel?: string | null;
  autoGuideDescription?: string | null;
  retryable?: boolean | null;
};

type ReasonStat = {
  reason: string;
  count: number;
};

export default function FailedJobItemsTable({ jobId }: { jobId: string }) {
  const [reason, setReason] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<FailedItem[]>([]);
  const [reasonStats, setReasonStats] = useState<ReasonStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (reason) params.set("reason", reason);
    if (q) params.set("q", q);
    return params.toString();
  }, [page, pageSize, reason, q]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/alerts/bulk-jobs/${jobId}/failed-items?${query}`, {
          cache: "no-store",
        });
        const raw = await res.json().catch(() => null);
        if (ignore) return;
        const body = requireOkResponseBody(res, raw, "실패 항목을 불러오지 못했습니다.");
        setItems(Array.isArray(body.items) ? (body.items as FailedItem[]) : []);
        setReasonStats(
          Array.isArray(body.reasonStats) ? (body.reasonStats as ReasonStat[]) : [],
        );
        setTotal(typeof body.total === "number" ? body.total : 0);
      } catch {
        if (!ignore) {
          setItems([]);
          setReasonStats([]);
          setTotal(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [jobId, query]);

  async function handleRetryFailedOnly() {
    setRetryLoading(true);
    try {
      const res = await fetch(`/api/admin/alerts/bulk-jobs/${jobId}/retry-failed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "실패 항목만 재시도" }),
      });

      const raw = await res.json().catch(() => null);
      let body: Record<string, unknown>;
      try {
        body = requireOkResponseBody(res, raw, "재시도 Job 생성에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "재시도 Job 생성에 실패했습니다.");
        return;
      }

      if (typeof body.linkUrl === "string" && body.linkUrl) {
        window.location.href = body.linkUrl;
      }
    } finally {
      setRetryLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <FailedItemsToolbar
        jobId={jobId}
        items={items.map((item) => ({
          id: item.id,
          failureCategory: item.failureCategory,
          failureTaxonomyCode: item.failureTaxonomyCode,
        }))}
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">실패 항목 상세</h2>
          <p className="text-sm text-slate-500">
            DB 실패 항목 우선 · 없으면 resultJson.failures · 사유별 필터
          </p>
        </div>

        <button
          type="button"
          onClick={handleRetryFailedOnly}
          disabled={retryLoading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {retryLoading ? "생성 중..." : "실패 항목으로 새 재시도 Job 만들기"}
        </button>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="targetId / label / errorMessage 검색"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm xl:max-w-sm"
        />

        <select
          value={reason}
          onChange={(e) => {
            setPage(1);
            setReason(e.target.value);
          }}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">전체 사유</option>
          {reasonStats.map((stat) => (
            <option key={stat.reason} value={stat.reason}>
              {stat.reason} ({stat.count})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {reasonStats.map((stat) => {
          const active = reason === stat.reason;
          return (
            <button
              key={stat.reason}
              type="button"
              onClick={() => {
                setPage(1);
                setReason(active ? "" : stat.reason);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {stat.reason} · {stat.count}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">대상</th>
              <th className="px-4 py-3 text-left">유형</th>
              <th className="px-4 py-3 text-left">사유</th>
              <th className="px-4 py-3 text-left">메시지 / 가이드</th>
              <th className="px-4 py-3 text-left">권장 액션</th>
              <th className="px-4 py-3 text-left">시도횟수</th>
              <th className="px-4 py-3 text-left">종료시각</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  불러오는 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  실패 항목이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{item.targetLabel ?? "-"}</div>
                    <div className="text-xs text-slate-500">{item.targetId}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.targetType}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">
                      {item.failureCategory ?? item.errorReason ?? "UNKNOWN"}
                    </span>
                  </td>
                  <td className="max-w-md px-4 py-3 text-slate-700">
                    <div className="space-y-2">
                      <div>{item.errorMessage ?? "-"}</div>
                      <BulkJobFailureGuideBadge
                        label={item.autoGuideLabel}
                        description={item.autoGuideDescription}
                        retryable={item.retryable}
                      />
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3 align-top">
                    <FailureActionRecommendationBadges
                      failureCategory={item.failureCategory}
                      failureTaxonomyCode={item.failureTaxonomyCode}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.attemptCount}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.finishedAt ? new Date(item.finishedAt).toLocaleString("ko-KR") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>
          총 {total}건 / {page} / {totalPages} 페이지
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            이전
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </section>
  );
}
