"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { requireOkResponseBody } from "@/lib/client/api-error";

type UserOption = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type Props = {
  opsQueueTicketId: string;
  currentAssigneeUserId?: string | null;
  currentPriority: Priority;
  currentAssignee?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  onUpdated?: () => void;
  onOptimisticUpdate?: (patch: {
    assigneeUserId?: string | null;
    assignee?: { id: string; name?: string | null; email?: string | null } | null;
    priority?: Priority;
  }) => void;
};

export function OpsQueueCardQuickActions({
  opsQueueTicketId,
  currentAssigneeUserId,
  currentPriority,
  onUpdated,
  onOptimisticUpdate,
}: Props) {
  const { pushToast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [assigneeUserId, setAssigneeUserId] = useState(currentAssigneeUserId ?? "");
  const [priority, setPriority] = useState<Priority>(currentPriority);
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
        if (!ignore && items) {
          setUsers(items);
        }
      } catch {
        /* ignore */
      }
    }

    void loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setAssigneeUserId(currentAssigneeUserId ?? "");
  }, [currentAssigneeUserId]);

  useEffect(() => {
    setPriority(currentPriority);
  }, [currentPriority]);

  async function save(nextAssigneeUserId: string, nextPriority: Priority) {
    setSaving(true);
    try {
      const nextAssignee = nextAssigneeUserId.length
        ? {
            id: nextAssigneeUserId,
            name: users.find((u) => u.id === nextAssigneeUserId)?.name ?? null,
            email: users.find((u) => u.id === nextAssigneeUserId)?.email ?? null,
          }
        : null;

      onOptimisticUpdate?.({
        assigneeUserId: nextAssigneeUserId.length ? nextAssigneeUserId : null,
        assignee: nextAssigneeUserId.length ? nextAssignee : null,
        priority: nextPriority,
      });

      const res = await fetch(
        `/api/admin/alerts/ops-queue/${opsQueueTicketId}/quick-update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assigneeUserId: nextAssigneeUserId.length ? nextAssigneeUserId : null,
            priority: nextPriority,
          }),
        },
      );

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "빠른 수정 실패");
      } catch (e: unknown) {
        pushToast({
          kind: "error",
          title: "빠른 수정 실패",
          description: e instanceof Error ? e.message : "빠른 수정 실패",
        });
        onUpdated?.();
        return;
      }

      pushToast({
        kind: "success",
        title: "빠른 수정 완료",
      });

      onUpdated?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      data-quick-actions
      className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="grid gap-2">
        <select
          value={assigneeUserId}
          onChange={(e) => {
            const value = e.target.value;
            setAssigneeUserId(value);
            void save(value, priority);
          }}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
          disabled={saving}
        >
          <option value="">미배정</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? user.email ?? user.id}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => {
            const value = e.target.value as Priority;
            setPriority(value);
            void save(assigneeUserId, value);
          }}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
          disabled={saving}
        >
          <option value="LOW">LOW</option>
          <option value="NORMAL">NORMAL</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
      </div>
    </div>
  );
}
