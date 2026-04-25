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
  action: string;
  count: number;
};

type Props = {
  data: ChartItem[];
};

export default function AuditLogActionChartClient({ data }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
        차트로 표시할 감사로그가 없습니다.
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="action"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
