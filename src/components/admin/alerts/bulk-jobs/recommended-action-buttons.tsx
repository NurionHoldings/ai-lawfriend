"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { readJsonApiErrorMessage, requireOkResponseBody } from "@/lib/client/api-error";
import type { FailureActionBulkVariant } from "@/lib/bulk-jobs/failure-action-recommendation";

type Recommendation = {
  action: string;
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
  executable: boolean;
  bulkVariant: FailureActionBulkVariant;
};

export function RecommendedActionButtons({
  jobId,
  taxonomy,
  recommendations,
}: {
  jobId: string;
  taxonomy: string;
  recommendations: Recommendation[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function runAction(bulkVariant: FailureActionBulkVariant) {
    setMessage(null);

    startTransition(async () => {
      const res = await fetch(`/api/admin/alerts/bulk-jobs/${jobId}/recommended-actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxonomy,
          bulkVariant,
        }),
      });

      const raw = await res.json().catch(() => null);
      if (!res.ok) {
        const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
        if (typeof o.duplicateJobId === "string" && o.duplicateJobId) {
          setMessage(`이미 실행 중인 재시도 Job이 있습니다. (${o.duplicateJobId})`);
          return;
        }
        if (typeof o.duplicateScheduleId === "string" && o.duplicateScheduleId) {
          setMessage(`이미 등록된 예약 재시도가 있습니다. (${o.duplicateScheduleId})`);
          return;
        }
        setMessage(readJsonApiErrorMessage(raw, "실행 중 오류가 발생했습니다."));
        return;
      }

      let body: Record<string, unknown>;
      try {
        body = requireOkResponseBody(res, raw, "실행 중 오류가 발생했습니다.");
      } catch (e: unknown) {
        setMessage(e instanceof Error ? e.message : "실행 중 오류가 발생했습니다.");
        return;
      }

      if (body.mode === "job_created") {
        setMessage(
          `재시도 Job 생성 완료 (${Number(body.affectedCount ?? 0)}건, Job ID: ${String(body.createdJobId ?? "")})`,
        );
      } else if (body.mode === "scheduled") {
        setMessage(
          `예약 재시도 등록 완료 (${Number(body.affectedCount ?? 0)}건, ${String(body.scheduledFor ?? "")})`,
        );
      } else if (body.mode === "ops_ticket_created") {
        setMessage(
          `운영 큐 연동 완료 (${Number(body.affectedCount ?? 0)}건, Ticket ID: ${String(body.ticketId ?? "")})`,
        );
      } else {
        setMessage(`반영 완료 (${Number(body.affectedCount ?? 0)}건)`);
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {recommendations
          .filter((r) => r.executable)
          .map((rec) => (
            <button
              key={`${taxonomy}-${rec.bulkVariant}`}
              type="button"
              disabled={pending}
              onClick={() => runAction(rec.bulkVariant)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              title={rec.description}
            >
              실행: {rec.label}
            </button>
          ))}
      </div>

      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
