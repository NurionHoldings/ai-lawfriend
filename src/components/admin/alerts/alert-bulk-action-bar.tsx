"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AlertBulkActionResult } from "@/types/alert-bulk";
import { runBulkQueuePipeline } from "./run-bulk-queue-pipeline";

type UserOption = { id: string; name: string };

export type BulkActionRequestContext = {
  action: string;
  assigneeUserId?: string;
  note?: string;
};

type Props = {
  selectedIds: string[];
  users: UserOption[];
  onClear: () => void;
  onBulkComplete?: (result: AlertBulkActionResult, context: BulkActionRequestContext) => void;
  onJobQueued?: (jobId: string) => void;
};

export function AlertBulkActionBar({
  selectedIds,
  users,
  onClear,
  onBulkComplete,
  onJobQueued,
}: Props) {
  const router = useRouter();
  const [action, setAction] = useState("ACKNOWLEDGE");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (selectedIds.length === 0) {
      alert("선택된 경고가 없습니다.");
      return;
    }

    try {
      setLoading(true);

      const result = await runBulkQueuePipeline({
        action,
        alertEventIds: selectedIds,
        payload: {
          ...(assigneeUserId ? { assigneeUserId } : {}),
          ...(note ? { note } : {}),
        },
        onJobQueued,
      });

      onBulkComplete?.(result, {
        action,
        assigneeUserId: assigneeUserId || undefined,
        note: note || undefined,
      });

      onClear();
      setNote("");
      setAssigneeUserId("");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "대량 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm text-slate-600">
        선택된 경고:{" "}
        <span className="font-semibold text-slate-900">{selectedIds.length}</span>건
      </div>

      <div className="grid gap-3 xl:grid-cols-[180px_220px_1fr_auto_auto]">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="ACKNOWLEDGE">일괄 확인</option>
          <option value="RESOLVE">일괄 해결</option>
          <option value="IGNORE">일괄 무시</option>
          <option value="REASSIGN">일괄 재지정</option>
        </select>

        <select
          value={assigneeUserId}
          onChange={(e) => setAssigneeUserId(e.target.value)}
          disabled={action !== "REASSIGN"}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-50"
        >
          <option value="">담당자 선택</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="대량 처리 메모"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        />

        <button
          type="button"
          onClick={() => void submit()}
          disabled={
            loading ||
            selectedIds.length === 0 ||
            (action === "REASSIGN" && !assigneeUserId)
          }
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "처리 중..." : "대량 실행"}
        </button>

        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800"
        >
          선택 해제
        </button>
      </div>
    </div>
  );
}
