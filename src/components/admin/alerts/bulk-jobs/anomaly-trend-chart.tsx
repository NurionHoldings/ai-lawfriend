"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  bucket: string;
  label: string;
  retryStormCount: number;
  anomalyCount: number;
};

export function AnomalyTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Anomaly 추이</h3>
        <p className="mt-1 text-sm text-slate-500">
          장시간 실행, heartbeat stale, 고실패율 등의 이상 징후 수입니다.
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" minTickGap={24} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="anomalyCount"
              name="이상 징후"
              stroke="#f43f5e"
              fill="#f43f5e"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
