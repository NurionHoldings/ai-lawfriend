"use client";

import { useEffect, useRef, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type BulkJob = {
  id: string;
  action: string;
  status: string;
  resultJson?: {
    requestedCount?: number;
    successCount?: number;
    failureCount?: number;
  };
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
};

export function BulkActionJobStatusModal({
  open,
  jobId,
  onClose,
}: {
  open: boolean;
  jobId: string | null;
  onClose: () => void;
}) {
  const [job, setJob] = useState<BulkJob | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open || !jobId) return;

    let ignore = false;

    async function poll() {
      const res = await fetch(`/api/admin/alerts/bulk-jobs/${jobId}`);
      const raw = await res.json().catch(() => null);
      let nextJob: BulkJob | null = null;
      try {
        const body = requireOkResponseBody(res, raw, "Job 조회 실패");
        nextJob = body.job as BulkJob;
      } catch {
        if (!ignore) {
          setJob(null);
        }
        return;
      }

      if (!ignore) {
        setJob(nextJob);
      }

      if (
        !ignore &&
        nextJob &&
        (nextJob.status === "QUEUED" || nextJob.status === "RUNNING")
      ) {
        timerRef.current = setTimeout(poll, 1500);
      }
    }

    void poll();

    return () => {
      ignore = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, jobId]);

  if (!open || !jobId) return null;

  const result = job?.resultJson;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">대량 액션 Job 상태</h2>
            <p className="mt-1 text-sm text-slate-500">Job ID: {jobId}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {!job && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              상태를 불러오는 중입니다...
            </div>
          )}

          {job && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Info label="액션" value={job.action} />
                <Info label="상태" value={job.status} />
                <Info
                  label="생성 시각"
                  value={new Date(job.createdAt).toLocaleString("ko-KR")}
                />
                <Info
                  label="완료 시각"
                  value={
                    job.finishedAt
                      ? new Date(job.finishedAt).toLocaleString("ko-KR")
                      : "-"
                  }
                />
              </div>

              {job.errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {job.errorMessage}
                </div>
              )}

              {result && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-800">처리 결과</div>
                  <div className="grid grid-cols-3 gap-3">
                    <Info label="요청" value={String(result.requestedCount ?? "-")} />
                    <Info label="성공" value={String(result.successCount ?? "-")} />
                    <Info label="실패" value={String(result.failureCount ?? "-")} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 break-all text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
