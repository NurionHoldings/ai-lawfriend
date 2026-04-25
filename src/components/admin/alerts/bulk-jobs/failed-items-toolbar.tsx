"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { readJsonApiErrorMessage, requireOkResponseBody } from "@/lib/client/api-error";
import { normalizeFailureKey } from "@/lib/bulk-jobs/failure-action-recommendation";
import type { FailureActionBulkVariant } from "@/lib/bulk-jobs/failure-action-recommendation";

type Item = {
  id: string;
  failureCategory?: string | null;
  failureTaxonomyCode?: string | null;
};

const VARIANT_OPTIONS: { value: FailureActionBulkVariant; label: string }[] = [
  { value: "retry_failed_items", label: "즉시 재시도" },
  { value: "mark_permission_check", label: "권한 점검 태그" },
  { value: "mark_input_fix_required", label: "입력 수정 태그" },
  { value: "mark_manual_review", label: "수동 검토 태그" },
  { value: "inspect_dependency_only", label: "연동 점검 태그" },
  { value: "wait_and_retry_later", label: "대기 후 재시도 태그" },
];

export function FailedItemsToolbar({ jobId, items }: { jobId: string; items: Item[] }) {
  const router = useRouter();
  const [taxonomy, setTaxonomy] = useState("");
  const [bulkVariant, setBulkVariant] = useState<FailureActionBulkVariant>("retry_failed_items");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const taxonomyOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      const k = normalizeFailureKey(item.failureCategory, item.failureTaxonomyCode);
      if (k) set.add(k);
    }
    return Array.from(set).sort();
  }, [items]);

  function onRun() {
    if (!taxonomy) {
      setMessage("taxonomy를 선택해주세요.");
      return;
    }

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
      let body: Record<string, unknown>;
      try {
        body = requireOkResponseBody(res, raw, "실행 실패");
      } catch (e: unknown) {
        setMessage(
          e instanceof Error ? e.message : readJsonApiErrorMessage(raw, "실행 실패"),
        );
        return;
      }

      setMessage(
        body.mode === "job_created"
          ? `재시도 Job 생성 완료 (${Number(body.affectedCount ?? 0)}건)`
          : `반영 완료 (${Number(body.affectedCount ?? 0)}건)`,
      );
      router.refresh();
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium text-slate-800">taxonomy 일괄 실행</div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-2">
          <div className="text-xs font-medium text-slate-600">taxonomy</div>
          <select
            value={taxonomy}
            onChange={(e) => setTaxonomy(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">선택</option>
            {taxonomyOptions.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <div className="text-xs font-medium text-slate-600">액션</div>
          <select
            value={bulkVariant}
            onChange={(e) => setBulkVariant(e.target.value as FailureActionBulkVariant)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {VARIANT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onRun}
          disabled={pending}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "실행 중..." : "일괄 실행"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
