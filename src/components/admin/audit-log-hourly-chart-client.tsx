"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartItem = {
  hour: number;
  count: number;
};

type Props = {
  data: ChartItem[];
};

export default function AuditLogHourlyChartClient({ data }: Props) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tickFormatter={(value) => `${value}시`}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) => `${value}시`}
            formatter={(value) => [`${value ?? 0}건`, "로그 수"]}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
