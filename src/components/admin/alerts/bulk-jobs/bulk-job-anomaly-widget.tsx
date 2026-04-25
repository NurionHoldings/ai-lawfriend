"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { BulkJobAnomalyBadges } from "@/components/admin/alerts/bulk-jobs/bulk-job-anomaly-badges";

type DashboardResponse = {
  summary: {
    runningJobs: number;
    longRunningCount: number;
    highFailureCount: number;
    anomalyJobsCount: number;
  };
  anomalyJobs: {
    id: string;
    action: string;
    status: string;
    anomalies: string[];
    totalItems: number;
    completedItems: number;
    failedItems: number;
  }[];
};

export function BulkJobAnomalyWidget() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const res = await fetch("/api/admin/alerts/bulk-jobs/dashboard", {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      try {
        const json = requireOkResponseBody(res, raw, "대시보드 조회 실패") as unknown as DashboardResponse;
        if (!ignore) {
          setData(json);
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
    const id = setInterval(load, 15000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, []);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        운영 이상징후를 불러오는 중...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        운영 이상징후를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Job 이상징후</h3>
          <p className="text-xs text-slate-500">
            장기 실행, heartbeat 지연, 실패율 급증, 재시도 과다를 추적합니다.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>실행 중: {data.summary.runningJobs}</div>
          <div>이상징후: {data.summary.anomalyJobsCount}</div>
        </div>
      </div>

      <div className="space-y-3">
        {data.anomalyJobs.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            현재 감지된 주요 이상징후가 없습니다.
          </div>
        ) : (
          data.anomalyJobs.map((job) => (
            <Link
              key={job.id}
              href={`/admin/alerts/bulk-jobs/${job.id}`}
              className="block rounded-xl border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">{job.action}</div>
                  <div className="text-xs text-slate-500">{job.id}</div>
                </div>
                <div className="text-xs text-slate-500">
                  {job.completedItems + job.failedItems}/{job.totalItems}
                </div>
              </div>
              <div className="mt-3">
                <BulkJobAnomalyBadges anomalies={job.anomalies} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
