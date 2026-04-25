"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type CronLogRow = {
  id: string;
  jobCode: string;
  jobName: string;
  status: "RUNNING" | "SUCCESS" | "FAILED";
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  scannedCount: number | null;
  affectedCount: number | null;
  triggeredBy: string | null;
  message: string | null;
  errorStack: string | null;
};

export function CronLogsTable({ logs }: { logs: CronLogRow[] }) {
  const router = useRouter();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  async function handleRetry(runId: string) {
    const ok = window.confirm("이 실패 실행을 다시 시도하시겠습니까?");
    if (!ok) return;

    try {
      setRetryingId(runId);
      const res = await fetch(`/api/admin/cron/logs/${runId}/retry`, {
        method: "POST",
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "재시도에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "재시도에 실패했습니다.");
        return;
      }

      alert("재시도가 완료되었습니다.");
      router.refresh();
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">작업코드</th>
            <th className="px-4 py-3">상태</th>
            <th className="px-4 py-3">시작</th>
            <th className="px-4 py-3">종료</th>
            <th className="px-4 py-3">소요(ms)</th>
            <th className="px-4 py-3">스캔</th>
            <th className="px-4 py-3">반영</th>
            <th className="px-4 py-3">트리거</th>
            <th className="px-4 py-3">메시지</th>
            <th className="px-4 py-3 text-right">액션</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3 font-mono text-xs">{log.jobCode}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    log.status === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-800"
                      : log.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {log.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-800">{log.startedAt}</td>
              <td className="px-4 py-3 text-slate-800">{log.finishedAt ?? "-"}</td>
              <td className="px-4 py-3">{log.durationMs ?? "-"}</td>
              <td className="px-4 py-3">{log.scannedCount ?? "-"}</td>
              <td className="px-4 py-3">{log.affectedCount ?? "-"}</td>
              <td className="px-4 py-3">{log.triggeredBy ?? "-"}</td>
              <td className="px-4 py-3">
                <div className="text-slate-800">{log.message || "-"}</div>
                {log.errorStack ? (
                  <pre className="mt-2 max-w-[520px] overflow-x-auto whitespace-pre-wrap rounded-xl bg-red-50 p-3 text-xs text-red-900">
                    {log.errorStack}
                  </pre>
                ) : null}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/cron-runs/${log.id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    상세
                  </Link>
                  {log.status === "FAILED" && (
                    <button
                      type="button"
                      disabled={retryingId === log.id}
                      onClick={() => void handleRetry(log.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {retryingId === log.id ? "재시도 중..." : "실패 재시도"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
