"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type UserOption = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

const OPS_STATUSES = [
  "OPEN",
  "ACKED",
  "IN_PROGRESS",
  "RESOLVED",
  "CANCELED",
] as const;

type OpsStatus = (typeof OPS_STATUSES)[number];

export function OpsQueueAssigneeSelect({
  ticketId,
  currentAssigneeUserId,
  currentStatus,
}: {
  ticketId: string;
  currentAssigneeUserId: string | null;
  currentStatus: OpsStatus;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [assigneeUserId, setAssigneeUserId] = useState(currentAssigneeUserId ?? "");
  const [status, setStatus] = useState<OpsStatus>(currentStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setAssigneeUserId(currentAssigneeUserId ?? "");
  }, [currentAssigneeUserId]);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  useEffect(() => {
    let ignore = false;

    async function run() {
      const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });
      const json = (await res.json().catch(() => ({ users: [] }))) as {
        users?: UserOption[];
      };
      if (!ignore) {
        setUsers(json.users ?? []);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [q]);

  function onSave() {
    setMessage(null);

    startTransition(async () => {
      const res = await fetch(`/api/admin/alerts/ops-queue/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          assigneeUserId: assigneeUserId || null,
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "저장 실패");
      } catch (e: unknown) {
        setMessage(
          e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.",
        );
        return;
      }

      setMessage("담당자/상태가 저장되었습니다.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">담당자 배정 / 상태 변경</div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">담당자 검색</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름 또는 이메일 검색"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">상태</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OpsStatus)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {OPS_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-xs font-medium text-slate-600">담당자</span>
          <select
            value={assigneeUserId}
            onChange={(e) => setAssigneeUserId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">미배정</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || "이름없음"} {user.email ? `(${user.email})` : ""}{" "}
                {user.role ? `- ${user.role}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
        {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      </div>
    </div>
  );
}
