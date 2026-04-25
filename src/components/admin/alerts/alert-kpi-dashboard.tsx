"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type TimelineItem = {
  date: string;
  created: number;
  resolved: number;
  acknowledged: number;
  breached: number;
};

type AssigneeStat = {
  userId: string;
  name: string;
  total: number;
  resolved: number;
  resolveRate: number;
  slaComplianceRate: number;
};

type Props = {
  summary: {
    total: number;
    resolvedTotal: number;
    breachedTotal: number;
    resolveRate: number;
    slaComplianceRate: number;
  };
  timeline: TimelineItem[];
  assigneeStats: AssigneeStat[];
};

export function AlertKpiDashboard({ summary, timeline, assigneeStats }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">전체 경고 (기간 내)</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">해결 건수</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{summary.resolvedTotal}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">해결률</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{summary.resolveRate}%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">SLA 준수율 (기한 내 해결)</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{summary.slaComplianceRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">기간별 경고 추이</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" name="생성" stroke="#0f172a" />
                <Line type="monotone" dataKey="resolved" name="해결" stroke="#059669" />
                <Line type="monotone" dataKey="breached" name="SLA 초과(상태)" stroke="#e11d48" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">담당자별 해결률 / SLA 준수율</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="resolveRate" name="해결률" fill="#0f172a" />
                <Bar dataKey="slaComplianceRate" name="SLA 준수율" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
