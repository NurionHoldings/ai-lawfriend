"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type MetricItem = {
  date: string;
  totalJobs: number;
  successJobs: number;
  failedJobs: number;
  partialJobs: number;
  canceledJobs: number;
  totalItems: number;
  successItems: number;
  failedItems: number;
  retryJobs: number;
  successRate: number;
  failureRate: number;
  retryRate: number;
};

export default function BulkJobCharts() {
  const [range, setRange] = useState<"7d" | "14d" | "30d" | "90d">("14d");
  const [items, setItems] = useState<MetricItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/alerts/bulk-jobs/metrics?range=${range}`, {
          cache: "no-store",
        });
        const raw = await res.json().catch(() => null);
        try {
          const json = requireOkResponseBody(res, raw, "지표 조회 실패");
          if (!ignore) {
            setItems((json.items as MetricItem[] | undefined) ?? []);
          }
        } catch {
          if (!ignore) {
            setItems([]);
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [range]);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">BulkActionJob 운영 차트</h2>
          <p className="text-sm text-slate-500">성공률, 실패율, 처리량, 재시도율 추이</p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value as "7d" | "14d" | "30d" | "90d")}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="7d">최근 7일</option>
          <option value="14d">최근 14일</option>
          <option value="30d">최근 30일</option>
          <option value="90d">최근 90일</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          차트 데이터를 불러오는 중...
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="성공률 / 실패율">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  name="성공률(%)"
                  stroke="#0f172a"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="failureRate"
                  name="실패율(%)"
                  stroke="#be123c"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="처리량(항목)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalItems" name="전체 항목" fill="#64748b" />
                <Bar dataKey="successItems" name="성공 항목" fill="#0f172a" />
                <Bar dataKey="failedItems" name="실패 항목" fill="#be123c" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="재시도율">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="retryRate"
                  name="재시도율(%)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Job 수량">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={items}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalJobs" name="전체 Job" fill="#94a3b8" />
                <Bar dataKey="successJobs" name="성공 Job" fill="#0f172a" />
                <Bar dataKey="failedJobs" name="실패 Job" fill="#be123c" />
                <Bar dataKey="partialJobs" name="부분성공 Job" fill="#ca8a04" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </section>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-sm font-semibold text-slate-700">{title}</div>
      {children}
    </div>
  );
}
