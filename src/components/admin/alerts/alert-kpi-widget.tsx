"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Kpi = {
  resolvedCount: number;
  avgResolveHours: number;
  openCount: number;
  overdueCount: number;
  dueSoonCount: number;
};

export function AlertKpiWidget() {
  const [data, setData] = useState<Kpi | null>(null);

  async function fetchData() {
    const res = await fetch("/api/admin/alert-events/kpi", {
      cache: "no-store",
    });
    const raw = await res.json().catch(() => null);
    try {
      const body = requireOkResponseBody(res, raw, "KPI 조회 실패");
      setData(body.kpi as Kpi);
    } catch {
      setData(null);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  if (!data) return null;

  const cards = [
    { label: "진행중 경고", value: data.openCount },
    { label: "기한 임박", value: data.dueSoonCount },
    { label: "기한 초과", value: data.overdueCount },
    { label: "총 해결 건수", value: data.resolvedCount },
    { label: "평균 해결 시간", value: `${data.avgResolveHours}시간` },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-sm font-semibold text-slate-900">경고 처리 KPI</div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">{card.label}</div>
            <div className="mt-2 text-xl font-bold text-slate-900">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
