"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { readJsonApiErrorMessage, requireOkResponseBody } from "@/lib/client/api-error";

export function ScheduleActionControls({
  scheduleId,
  status,
  scheduledFor,
  note,
}: {
  scheduleId: string;
  status: string;
  scheduledFor: string;
  note?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dateValue, setDateValue] = useState(() => {
    const date = new Date(scheduledFor);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  });
  const [noteValue, setNoteValue] = useState(note ?? "");

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/alerts/bulk-jobs/schedules/${scheduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw = await res.json().catch(() => null);
    try {
      return requireOkResponseBody(res, raw, "요청 실패");
    } catch (e: unknown) {
      throw new Error(
        e instanceof Error ? e.message : readJsonApiErrorMessage(raw, "요청 실패"),
      );
    }
  }

  function onCancel() {
    setMessage(null);
    startTransition(async () => {
      try {
        await patch({ action: "cancel" });
        setMessage("예약이 취소되었습니다.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "취소 실패");
      }
    });
  }

  function onReschedule() {
    setMessage(null);
    startTransition(async () => {
      try {
        const nextIso = new Date(dateValue).toISOString();
        await patch({
          action: "reschedule",
          scheduledFor: nextIso,
          note: noteValue,
        });
        setMessage("예약 시간이 변경되었습니다.");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "재예약 실패");
      }
    });
  }

  const disabled = pending || status === "DONE" || status === "CANCELED";

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">예약 재시도 제어</div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">실행 예정 시각</span>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            disabled={status === "DONE" || status === "CANCELED"}
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">메모</span>
          <input
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="재예약 사유 또는 운영 메모"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            disabled={status === "DONE" || status === "CANCELED"}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReschedule}
          disabled={disabled}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "처리 중..." : "재예약"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          예약 취소
        </button>
      </div>

      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
