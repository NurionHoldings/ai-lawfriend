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

type ChartItem = {
  date: string;
  count: number;
};

type Props = {
  data: ChartItem[];
};

function formatDateLabel(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function AuditLogDailyTrendChartClient({ data }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
        추이 차트로 표시할 감사로그가 없습니다.
      </div>
    );
  }

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => `날짜: ${value}`}
            formatter={(value) => [`${value}건`, "로그 수"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            strokeWidth={2}
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
