"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { AssigneeWorkloadCharts } from "@/components/admin/alerts/ops-queue/AssigneeWorkloadCharts";
import { OpsQueueWipBanner } from "@/components/admin/alerts/ops-queue/OpsQueueWipBanner";
import { OpsQueueRebalanceRecommendationCard } from "@/components/admin/alerts/ops-queue/OpsQueueRebalanceRecommendationCard";

type WipWarning = {
  count: number;
  limit: number;
  percent: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
};

type DashboardResponse = {
  ok: boolean;
  summary: {
    totalOpen: number;
    overdueCount: number;
    urgentCount: number;
    blockedCount: number;
  };
  wipWarnings: Record<string, WipWarning>;
  recentMoveLogs: Array<{
    id: string;
    message: string | null;
    createdAt: string;
    actor?: {
      name?: string | null;
      email?: string | null;
    } | null;
  }>;
};

export function OpsDashboardOverview() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alerts/ops-dashboard/summary", {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const body = requireOkResponseBody(res, raw, "운영 대시보드 요약 조회 실패");
      setData({
        ok: true,
        summary: body.summary as DashboardResponse["summary"],
        wipWarnings: body.wipWarnings as DashboardResponse["wipWarnings"],
        recentMoveLogs: body.recentMoveLogs as DashboardResponse["recentMoveLogs"],
      });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        운영 대시보드 로딩 중...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-red-600">
        운영 대시보드 요약을 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">열린 운영 항목</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{data.summary.totalOpen}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">SLA 초과</div>
          <div className="mt-2 text-2xl font-semibold text-red-600">{data.summary.overdueCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">긴급 우선순위</div>
          <div className="mt-2 text-2xl font-semibold text-amber-600">{data.summary.urgentCount}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">보류 상태</div>
          <div className="mt-2 text-2xl font-semibold text-orange-600">{data.summary.blockedCount}</div>
        </div>
      </div>

      <OpsQueueWipBanner warnings={data.wipWarnings} />
      <AssigneeWorkloadCharts />
      <OpsQueueRebalanceRecommendationCard />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">최근 운영 큐 변경 이력</h2>
          <p className="mt-1 text-sm text-slate-500">최근 10건의 이동·수정·재분배 기록</p>
        </div>

        {!data.recentMoveLogs.length ? (
          <div className="text-sm text-slate-500">표시할 최근 이력이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {data.recentMoveLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-200 p-3">
                <div className="text-sm font-medium text-slate-900">
                  {log.message ?? log.id}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {log.actor?.name ?? log.actor?.email ?? "-"} ·{" "}
                  {new Date(log.createdAt).toLocaleString("ko-KR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
