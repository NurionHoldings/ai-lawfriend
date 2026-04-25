"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { readJsonApiErrorMessage, requireOkResponseBody } from "@/lib/client/api-error";

type ScheduleItem = {
  id: string;
  status: string;
};

export function BulkScheduleControls({
  schedules,
}: {
  schedules: ScheduleItem[];
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateValue, setDateValue] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectableIds = useMemo(
    () =>
      schedules.filter((s) => s.status !== "DONE" && s.status !== "CANCELED").map((s) => s.id),
    [schedules],
  );

  function toggleOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.length === selectableIds.length ? [] : selectableIds,
    );
  }

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/alerts/bulk-jobs/schedules/bulk", {
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

  function onBulkCancel() {
    if (selectedIds.length === 0) {
      setMessage("선택된 예약이 없습니다.");
      return;
    }

    startTransition(async () => {
      try {
        const json = (await patch({
          action: "cancel",
          scheduleIds: selectedIds,
        })) as { affectedCount?: number };
        setMessage(`${json.affectedCount ?? 0}건 취소 완료`);
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "대량 취소 실패");
      }
    });
  }

  function onBulkReschedule() {
    if (selectedIds.length === 0) {
      setMessage("선택된 예약이 없습니다.");
      return;
    }
    if (!dateValue) {
      setMessage("재예약 시간을 입력해주세요.");
      return;
    }

    startTransition(async () => {
      try {
        const json = (await patch({
          action: "reschedule",
          scheduleIds: selectedIds,
          scheduledFor: new Date(dateValue).toISOString(),
          note: note || undefined,
        })) as { affectedCount?: number };
        setMessage(`${json.affectedCount ?? 0}건 재예약 완료`);
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "대량 재예약 실패");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">대량 예약 제어</h3>
        <p className="mt-1 text-sm text-slate-500">
          여러 예약 재시도를 한 번에 취소하거나 같은 시각으로 재설정합니다.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleAll}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          {selectedIds.length === selectableIds.length ? "전체 해제" : "전체 선택"}
        </button>
        <span className="text-sm text-slate-500">선택 {selectedIds.length}건</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">재예약 시각</span>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">메모</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="대량 재예약 사유"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBulkReschedule}
          disabled={pending}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "처리 중..." : "선택건 재예약"}
        </button>
        <button
          type="button"
          onClick={onBulkCancel}
          disabled={pending}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          선택건 취소
        </button>
      </div>

      {message ? <p className="text-sm text-slate-500">{message}</p> : null}

      <div className="rounded-xl border border-slate-200">
        <div className="max-h-72 overflow-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">선택</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">scheduleId</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((schedule) => {
                const disabled =
                  schedule.status === "DONE" || schedule.status === "CANCELED";
                return (
                  <tr key={schedule.id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(schedule.id)}
                        onChange={() => toggleOne(schedule.id)}
                        disabled={disabled}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{schedule.id}</td>
                    <td className="px-4 py-3">{schedule.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
