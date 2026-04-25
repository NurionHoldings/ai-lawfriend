"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type WorkerItem = {
  id: string;
  workerKey: string;
  workerType: string;
  hostname: string | null;
  pid: number | null;
  currentJobId: string | null;
  status: string;
  lastHeartbeatAt: string;
  isStale: boolean;
};

type HealthBody = {
  total: number;
  running: number;
  stale: number;
  error: number;
  items: WorkerItem[];
};

export default function WorkerHealthPanel() {
  const [data, setData] = useState<HealthBody | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const res = await fetch("/api/admin/system/workers/health", { cache: "no-store" });
      const raw = await res.json().catch(() => null);
      try {
        const b = requireOkResponseBody(res, raw, "Worker health 조회 실패");
        if (!ignore) {
          setData({
            total: Number(b.total ?? 0),
            running: Number(b.running ?? 0),
            stale: Number(b.stale ?? 0),
            error: Number(b.error ?? 0),
            items: (b.items as WorkerItem[] | undefined) ?? [],
          });
        }
      } catch {
        if (!ignore) {
          setData(null);
        }
      } finally {
        if (!ignore) {
          setReady(true);
        }
      }
    }

    void load();
    const id = setInterval(() => void load(), 15000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, []);

  if (!ready) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-slate-500">Worker health를 불러오는 중...</div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <div className="text-sm text-rose-800">Worker health를 불러오지 못했습니다.</div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Worker Health</h2>
        <p className="text-sm text-slate-500">heartbeat 기준 워커 상태 모니터링</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <MetricBox label="전체" value={data.total} />
        <MetricBox label="정상 RUNNING" value={data.running} />
        <MetricBox label="Stale" value={data.stale} />
        <MetricBox label="ERROR" value={data.error} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Worker</th>
              <th className="px-4 py-3 text-left">상태</th>
              <th className="px-4 py-3 text-left">현재 Job</th>
              <th className="px-4 py-3 text-left">PID/Host</th>
              <th className="px-4 py-3 text-left">마지막 heartbeat</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  등록된 워커 heartbeat가 없습니다. Job 처리 시 기록됩니다.
                </td>
              </tr>
            )}
            {data.items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{item.workerKey}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.isStale
                        ? "bg-amber-100 text-amber-700"
                        : item.status === "ERROR"
                          ? "bg-rose-100 text-rose-700"
                          : item.status === "RUNNING"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.isStale ? "STALE" : item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {item.currentJobId ? (
                    <a
                      href={`/admin/alerts/bulk-jobs/${item.currentJobId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {item.currentJobId}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.pid ?? "-"} / {item.hostname ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(item.lastHeartbeatAt).toLocaleString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
