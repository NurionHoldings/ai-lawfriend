"use client";

import { useCallback, useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Item = {
  assigneeUserId: string;
  assigneeLabel: string;
  totalAssigned: number;
  openCount: number;
  resolvedCount: number;
  overdueCount: number;
  avgResolveHours: number | null;
};

export function AlertPerformanceDashboard() {
  const [days, setDays] = useState(30);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async (nextDays: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/alert-events/performance?days=${nextDays}`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      try {
        const data = requireOkResponseBody(res, raw, "담당자 성과 조회 실패");
        setItems((data.items as Item[] | undefined) ?? []);
      } catch {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems(days);
  }, [days, fetchItems]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">담당자 성과 대시보드</h2>
          <p className="mt-1 text-sm text-slate-500">기간별 담당 경고 처리 현황</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => {
              const v = Number(e.target.value);
              setDays(v);
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">불러오는 중...</div>
      ) : items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="px-3 py-2">담당자</th>
                <th className="px-3 py-2">총 배정</th>
                <th className="px-3 py-2">미처리</th>
                <th className="px-3 py-2">해결</th>
                <th className="px-3 py-2">기한초과</th>
                <th className="px-3 py-2">평균 해결시간</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.assigneeUserId} className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    <a
                      href={`/admin/alerts/board?assigneeUserId=${encodeURIComponent(item.assigneeUserId)}`}
                      className="text-blue-700 underline"
                    >
                      {item.assigneeLabel}
                    </a>
                  </td>
                  <td className="px-3 py-3">{item.totalAssigned}</td>
                  <td className="px-3 py-3">{item.openCount}</td>
                  <td className="px-3 py-3">{item.resolvedCount}</td>
                  <td className="px-3 py-3">{item.overdueCount}</td>
                  <td className="px-3 py-3">
                    {item.avgResolveHours !== null ? `${item.avgResolveHours}시간` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          표시할 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}
