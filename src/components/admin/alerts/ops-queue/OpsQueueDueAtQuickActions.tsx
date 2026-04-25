"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { resolveDuePreset } from "@/lib/ops-queue/due-date";
import type { OpsQueueDuePreset } from "@/lib/ops-queue/due-date";

type Props = {
  opsQueueTicketId: string;
  currentDueAt?: string | null;
  onUpdated?: () => void;
  onOptimisticUpdate?: (dueAt: string | null) => void;
};

export function OpsQueueDueAtQuickActions({
  opsQueueTicketId,
  currentDueAt,
  onUpdated,
  onOptimisticUpdate,
}: Props) {
  const { pushToast } = useToast();
  const [customDueAt, setCustomDueAt] = useState(
    currentDueAt ? new Date(currentDueAt).toISOString().slice(0, 16) : "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCustomDueAt(
      currentDueAt ? new Date(currentDueAt).toISOString().slice(0, 16) : "",
    );
  }, [currentDueAt, opsQueueTicketId]);

  async function save(
    body: Record<string, unknown>,
    optimisticDueAt: string | null,
  ) {
    setSaving(true);
    try {
      onOptimisticUpdate?.(optimisticDueAt);

      const res = await fetch(`/api/admin/alerts/ops-queue/${opsQueueTicketId}/due-at`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "기한 변경 실패");
      } catch (e: unknown) {
        pushToast({
          kind: "error",
          title: "기한 변경 실패",
          description: e instanceof Error ? e.message : "기한 변경 실패",
        });
        onUpdated?.();
        return;
      }

      pushToast({
        kind: "success",
        title: "기한 변경 완료",
      });

      onUpdated?.();
    } finally {
      setSaving(false);
    }
  }

  function presetOptimistic(p: OpsQueueDuePreset) {
    return resolveDuePreset(p).toISOString();
  }

  return (
    <div
      className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="grid gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save({ preset: "END_OF_TODAY" }, presetOptimistic("END_OF_TODAY"))}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 hover:bg-slate-50"
        >
          오늘 종료
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save({ preset: "TOMORROW_9AM" }, presetOptimistic("TOMORROW_9AM"))}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 hover:bg-slate-50"
        >
          내일 오전 9시
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save({ preset: "PLUS_3_DAYS_9AM" }, presetOptimistic("PLUS_3_DAYS_9AM"))}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 hover:bg-slate-50"
        >
          3일 뒤 오전 9시
        </button>

        <input
          type="datetime-local"
          value={customDueAt}
          onChange={(e) => setCustomDueAt(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
        />

        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving || !customDueAt}
            onClick={() =>
              void save(
                { dueAt: new Date(customDueAt).toISOString() },
                new Date(customDueAt).toISOString(),
              )
            }
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 hover:bg-slate-50"
          >
            직접 저장
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save({ dueAt: null }, null)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 hover:bg-slate-50"
          >
            기한 해제
          </button>
        </div>
      </div>
    </div>
  );
}
