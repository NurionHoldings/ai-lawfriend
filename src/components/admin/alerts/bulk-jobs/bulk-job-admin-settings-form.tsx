"use client";

import { useState, useTransition } from "react";
import { readJsonApiErrorMessage, requireOkResponseBody } from "@/lib/client/api-error";

type JobShape = {
  id: string;
  priority: string;
  queueGroup: string | null;
  concurrencyKey: string | null;
  maxConcurrency: number;
  status: string;
};

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"] as const;

export function BulkJobAdminSettingsForm({ job }: { job: JobShape }) {
  const [priority, setPriority] = useState(job.priority);
  const [queueGroup, setQueueGroup] = useState(job.queueGroup ?? "");
  const [concurrencyKey, setConcurrencyKey] = useState(job.concurrencyKey ?? "");
  const [maxConcurrency, setMaxConcurrency] = useState(String(job.maxConcurrency));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await fetch(`/api/admin/alerts/bulk-jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priority,
          queueGroup: queueGroup.trim() || null,
          concurrencyKey: concurrencyKey.trim() || null,
          maxConcurrency: maxConcurrency.trim() ? Number(maxConcurrency) : undefined,
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "저장 중 오류가 발생했습니다.");
      } catch (e: unknown) {
        setMessage(
          e instanceof Error
            ? e.message
            : readJsonApiErrorMessage(raw, "저장 중 오류가 발생했습니다."),
        );
        return;
      }

      setMessage("저장되었습니다.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Job 스케줄 제어</h2>
        <p className="mt-1 text-sm text-slate-500">
          우선순위와 동시성 키를 조정해 worker pool 처리 순서를 제어합니다.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">CRITICAL → LOW 순으로 claim 우선순위가 정해집니다.</p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Queue Group</span>
          <input
            value={queueGroup}
            onChange={(e) => setQueueGroup(e.target.value)}
            placeholder="예: alerts"
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-500">동일 그룹 기준 운영 모니터링에 사용됩니다.</p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Concurrency Key</span>
          <input
            value={concurrencyKey}
            onChange={(e) => setConcurrencyKey(e.target.value)}
            placeholder="예: bulk-action:RESOLVE"
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-500">같은 키를 가진 Job끼리 maxConcurrency 제한이 적용됩니다.</p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Max Concurrency</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={maxConcurrency}
            onChange={(e) => setMaxConcurrency(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
          <p className="text-xs text-slate-500">concurrencyKey 기준 동시 실행 가능 수입니다.</p>
        </label>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
        <div>현재 상태: {job.status}</div>
        <div className="mt-1">
          권장: 외부 연동 API는 concurrencyKey를 묶고 maxConcurrency를 낮게 유지하세요.
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}
