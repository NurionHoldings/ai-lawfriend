"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { requireOkResponseBody } from "@/lib/client/api-error";

type UserOption = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type Props = {
  selectedIds: string[];
  onDone?: () => void;
};

export function OpsQueueBulkEditToolbar({ selectedIds, onDone }: Props) {
  const { pushToast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [priority, setPriority] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [boardColumn, setBoardColumn] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      const res = await fetch("/api/admin/users/options", {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      try {
        const json = requireOkResponseBody(res, raw, "사용자 목록 조회 실패");
        const items = json.items as UserOption[] | undefined;
        if (!ignore) {
          setUsers(items ?? []);
        }
      } catch {
        if (!ignore) {
          setUsers([]);
        }
      }
    }

    void loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  async function apply() {
    if (!selectedIds.length) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/alerts/ops-queue/bulk-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          opsQueueTicketIds: selectedIds,
          ...(assigneeUserId ? { assigneeUserId } : {}),
          ...(priority ? { priority } : {}),
          ...(dueAt ? { dueAt: new Date(dueAt).toISOString() } : {}),
          ...(boardColumn ? { boardColumn } : {}),
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      });

      const applyRaw = await res.json().catch(() => null);
      let count = 0;
      try {
        const json = requireOkResponseBody(res, applyRaw, "대량 편집 실패");
        count = Number((json as { count?: number }).count ?? 0);
      } catch (e: unknown) {
        pushToast({
          kind: "error",
          title: "대량 편집 실패",
          description: e instanceof Error ? e.message : "대량 편집에 실패했습니다.",
        });
        return;
      }

      pushToast({
        kind: "success",
        title: "대량 편집 완료",
        description: `${count}건 반영되었습니다.`,
      });
      setAssigneeUserId("");
      setPriority("");
      setDueAt("");
      setBoardColumn("");
      setNote("");
      onDone?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">대량 편집 툴바</div>
          <div className="text-xs text-slate-500">선택 {selectedIds.length}건</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <select
          value={assigneeUserId}
          onChange={(e) => setAssigneeUserId(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          aria-label="담당자"
        >
          <option value="">담당자 변경 안함</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? user.email ?? user.id}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          aria-label="우선순위"
        >
          <option value="">우선순위 변경 안함</option>
          <option value="LOW">LOW</option>
          <option value="NORMAL">NORMAL</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>

        <input
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          aria-label="기한"
        />

        <select
          value={boardColumn}
          onChange={(e) => setBoardColumn(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          aria-label="보드 컬럼"
        >
          <option value="">보드 이동 안함</option>
          <option value="TRIAGE">TRIAGE</option>
          <option value="QUEUED">QUEUED</option>
          <option value="WORKING">WORKING</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="DONE">DONE</option>
        </select>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="편집 메모"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={!selectedIds.length || saving}
          onClick={() => void apply()}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          {saving ? "적용 중..." : "선택 항목 대량 편집 적용"}
        </button>
      </div>
    </div>
  );
}
