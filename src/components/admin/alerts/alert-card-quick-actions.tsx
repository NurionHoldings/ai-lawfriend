"use client";

import { useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type UserOption = { id: string; name: string };

type Props = {
  alertId: string;
  users: UserOption[];
  onDone?: () => void;
};

export function AlertCardQuickActions({ alertId, users, onDone }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [note, setNote] = useState("");

  async function run(action: "ACKNOWLEDGE" | "RESOLVE" | "IGNORE" | "REASSIGN") {
    try {
      setLoading(action);

      const res = await fetch(`/api/admin/alerts/${alertId}/quick-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          assigneeUserId: action === "REASSIGN" ? assigneeUserId : undefined,
          note: note || undefined,
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "처리에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "처리에 실패했습니다.");
        return;
      }

      setNote("");
      onDone?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void run("ACKNOWLEDGE")}
          disabled={!!loading}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading === "ACKNOWLEDGE" ? "처리 중..." : "확인"}
        </button>
        <button
          type="button"
          onClick={() => void run("RESOLVE")}
          disabled={!!loading}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading === "RESOLVE" ? "처리 중..." : "해결"}
        </button>
        <button
          type="button"
          onClick={() => void run("IGNORE")}
          disabled={!!loading}
          className="rounded-lg bg-zinc-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading === "IGNORE" ? "처리 중..." : "무시"}
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <select
          value={assigneeUserId}
          onChange={(e) => setAssigneeUserId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="">재지정 담당자 선택</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void run("REASSIGN")}
          disabled={!!loading || !assigneeUserId}
          className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading === "REASSIGN" ? "처리 중..." : "재지정"}
        </button>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="조치 메모 / 무시 사유 / 해결 코멘트"
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
      />
    </div>
  );
}
