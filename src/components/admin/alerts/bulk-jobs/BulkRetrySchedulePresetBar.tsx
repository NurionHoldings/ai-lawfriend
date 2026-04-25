"use client";

import { useState } from "react";
import { readJsonApiErrorMessage, requireOkResponseBody } from "@/lib/client/api-error";

type Props = {
  selectedJobIds: string[];
  onDone?: () => void;
};

export function BulkRetrySchedulePresetBar({ selectedJobIds, onDone }: Props) {
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  async function applyPreset(preset: "30_MIN" | "1_HOUR" | "TOMORROW_9AM") {
    if (!selectedJobIds.length) return;

    setLoadingPreset(preset);
    try {
      const res = await fetch("/api/admin/alerts/bulk-jobs/retry-schedule/bulk-move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobIds: selectedJobIds,
          preset,
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "예약 이동에 실패했습니다.");
      } catch (e: unknown) {
        alert(
          e instanceof Error ? e.message : readJsonApiErrorMessage(raw, "예약 이동에 실패했습니다."),
        );
        return;
      }

      onDone?.();
    } finally {
      setLoadingPreset(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="text-sm font-medium text-slate-900">
        선택 {selectedJobIds.length}건 · 재시도 예약 시각
      </div>

      <button
        type="button"
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        disabled={!selectedJobIds.length || !!loadingPreset}
        onClick={() => applyPreset("30_MIN")}
      >
        30분 뒤
      </button>

      <button
        type="button"
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        disabled={!selectedJobIds.length || !!loadingPreset}
        onClick={() => applyPreset("1_HOUR")}
      >
        1시간 뒤
      </button>

      <button
        type="button"
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        disabled={!selectedJobIds.length || !!loadingPreset}
        onClick={() => applyPreset("TOMORROW_9AM")}
      >
        내일 오전 9시
      </button>
    </div>
  );
}
