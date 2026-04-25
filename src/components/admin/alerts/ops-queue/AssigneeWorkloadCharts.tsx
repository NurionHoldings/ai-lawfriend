"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type WorkloadItem = {
  assigneeId: string | null;
  assigneeName: string;
  openCount: number;
  inProgressCount: number;
  blockedCount: number;
  overdueCount: number;
  urgentCount: number;
  totalScore: number;
};

export function AssigneeWorkloadCharts() {
  const [items, setItems] = useState<WorkloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      const res = await fetch("/api/admin/alerts/ops-queue/workload", {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      try {
        const json = requireOkResponseBody(res, raw, "워크로드 조회 실패");
        if (!ignore) {
          setItems((json.items as WorkloadItem[] | undefined) ?? []);
        }
      } catch {
        if (!ignore) {
          setItems([]);
        }
      }
      if (!ignore) setLoading(false);
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        워크로드 집계 로딩 중...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
        표시할 워크로드 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">담당자별 작업 상태</h3>
          <p className="text-xs text-slate-500">OPEN·ACKED / IN_PROGRESS / BLOCKED 비교</p>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="assigneeName" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="openCount" name="Open" stackId="a" fill="#94a3b8" />
              <Bar dataKey="inProgressCount" name="In Progress" stackId="a" fill="#3b82f6" />
              <Bar dataKey="blockedCount" name="Blocked" stackId="a" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">담당자별 위험도</h3>
          <p className="text-xs text-slate-500">Overdue / Urgent / Total Score</p>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="assigneeName" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="overdueCount" name="Overdue" fill="#f43f5e" />
              <Bar dataKey="urgentCount" name="Urgent" fill="#a855f7" />
              <Bar dataKey="totalScore" name="Workload Score" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
