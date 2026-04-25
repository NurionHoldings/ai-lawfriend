"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { OpsQueueDetailTabs } from "@/components/admin/alerts/ops-queue/OpsQueueDetailTabs";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type AuditItem = {
  id: string;
  action: string;
  message: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

type DetailItem = {
  id: string;
  title: string;
  description?: string | null;
  taxonomy: string;
  priority: Priority;
  status: string;
  boardColumn: string;
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
  caseId?: string | null;
  assigneeUserId?: string | null;
  assignee?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  sourceJob?: {
    id: string;
    status: string;
    action: string;
    priority: string;
    retryScheduledAt?: string | null;
    createdAt: string;
  } | null;
};

type UserOption = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type Props = {
  opsQueueTicketId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  /** false이면 편집 버튼·편집 폼 비표시 (조회 전용) */
  allowEdit?: boolean;
};

function isPriority(v: string): v is Priority {
  return v === "LOW" || v === "NORMAL" || v === "HIGH" || v === "URGENT";
}

export function OpsQueueDetailSlideOver({
  opsQueueTicketId,
  open,
  onClose,
  onUpdated,
  allowEdit = true,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<DetailItem | null>(null);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    taxonomy: "",
    assigneeUserId: "",
    priority: "NORMAL" as Priority,
    dueAt: "",
  });

  const load = useCallback(async () => {
    if (!opsQueueTicketId) return;
    setLoading(true);

    const [detailRes, userRes] = await Promise.all([
      fetch(`/api/admin/alerts/ops-queue/${opsQueueTicketId}`, { cache: "no-store" }),
      fetch("/api/admin/users/options", { cache: "no-store" }),
    ]);

    const detailRaw = await detailRes.json().catch(() => null);
    const userRaw = await userRes.json().catch(() => null);

    try {
      const detailJson = requireOkResponseBody(
        detailRes,
        detailRaw,
        "상세 조회 실패",
      ) as {
        item?: DetailItem;
        recentAuditLogs?: AuditItem[];
      };
      if (detailJson.item) {
        const nextItem = detailJson.item;
        setItem(nextItem);
        setRecentAuditLogs(detailJson.recentAuditLogs ?? []);
        setForm({
          title: nextItem.title ?? "",
          description: nextItem.description ?? "",
          taxonomy: nextItem.taxonomy ?? "",
          assigneeUserId: nextItem.assigneeUserId ?? "",
          priority: isPriority(nextItem.priority) ? nextItem.priority : "NORMAL",
          dueAt: nextItem.dueAt ? new Date(nextItem.dueAt).toISOString().slice(0, 16) : "",
        });
      }
    } catch {
      setItem(null);
      setRecentAuditLogs([]);
    }

    try {
      const userJson = requireOkResponseBody(userRes, userRaw, "사용자 목록 조회 실패");
      const uItems = userJson.items as UserOption[] | undefined;
      if (uItems) {
        setUsers(uItems);
      }
    } catch {
      setUsers([]);
    }

    setLoading(false);
  }, [opsQueueTicketId]);

  useEffect(() => {
    if (open && opsQueueTicketId) {
      void load();
    }
    if (!open) {
      setEditMode(false);
    }
  }, [open, opsQueueTicketId, load]);

  if (!open) return null;

  async function saveEdit() {
    if (!opsQueueTicketId || !item) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/alerts/ops-queue/${opsQueueTicketId}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description.length ? form.description : null,
          taxonomy: (form.taxonomy.trim() || item.taxonomy).trim(),
          assigneeUserId: form.assigneeUserId.length ? form.assigneeUserId : null,
          priority: form.priority,
          dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "저장에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "저장에 실패했습니다.");
        return;
      }

      setEditMode(false);
      await load();
      onUpdated?.();
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditMode(false);
    void load();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex flex-wrap items-start justify-between gap-2 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">운영 큐 상세</h2>
            <p className="text-sm text-slate-500">조회 / 편집</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!editMode && allowEdit ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
              >
                편집
              </button>
            ) : null}
            {editMode && allowEdit ? (
              <>
                <button
                  type="button"
                  onClick={() => void cancelEdit()}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveEdit()}
                  className="rounded-xl border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-sm text-slate-500">불러오는 중...</div>
          ) : !item ? (
            <div className="text-sm text-slate-500">항목을 찾을 수 없습니다.</div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 p-4">
                {!editMode ? (
                  <>
                    <div className="mb-3 text-lg font-semibold text-slate-900">{item.title}</div>
                    {item.description ? (
                      <p className="mb-3 whitespace-pre-wrap text-sm text-slate-600">
                        {item.description}
                      </p>
                    ) : null}

                    <div className="grid gap-2 text-sm text-slate-700">
                      <div>
                        <span className="font-medium">taxonomy:</span> {item.taxonomy}
                      </div>
                      <div>
                        <span className="font-medium">우선순위:</span> {item.priority}
                      </div>
                      <div>
                        <span className="font-medium">상태:</span> {item.status}
                      </div>
                      <div>
                        <span className="font-medium">보드 컬럼:</span> {item.boardColumn}
                      </div>
                      <div>
                        <span className="font-medium">담당자:</span>{" "}
                        {item.assignee?.name ?? item.assignee?.email ?? "미배정"}
                      </div>
                      <div>
                        <span className="font-medium">기한:</span>{" "}
                        {item.dueAt ? new Date(item.dueAt).toLocaleString("ko-KR") : "-"}
                      </div>
                      <div>
                        <span className="font-medium">사건 ID:</span> {item.caseId ?? "-"}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-4">
                    <label className="space-y-2">
                      <div className="text-sm font-medium text-slate-800">제목</div>
                      <input
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                      />
                    </label>

                    <label className="space-y-2">
                      <div className="text-sm font-medium text-slate-800">설명</div>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        rows={5}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <div className="text-sm font-medium text-slate-800">taxonomy</div>
                        <input
                          value={form.taxonomy}
                          onChange={(e) => setForm((p) => ({ ...p, taxonomy: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                        />
                      </label>

                      <label className="space-y-2">
                        <div className="text-sm font-medium text-slate-800">우선순위</div>
                        <select
                          value={form.priority}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              priority: e.target.value as Priority,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="LOW">LOW</option>
                          <option value="NORMAL">NORMAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="URGENT">URGENT</option>
                        </select>
                      </label>

                      <label className="space-y-2">
                        <div className="text-sm font-medium text-slate-800">담당자</div>
                        <select
                          value={form.assigneeUserId}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, assigneeUserId: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                        >
                          <option value="">미배정</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name ?? user.email ?? user.id}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-2">
                        <div className="text-sm font-medium text-slate-800">기한</div>
                        <input
                          type="datetime-local"
                          value={form.dueAt}
                          onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">연결 Job 정보</div>
                {!item.sourceJob ? (
                  <div className="text-sm text-slate-500">연결된 Job이 없습니다.</div>
                ) : (
                  <div className="grid gap-2 text-sm text-slate-700">
                    <div>
                      <span className="font-medium">Job ID:</span> {item.sourceJob.id}
                    </div>
                    <div>
                      <span className="font-medium">상태:</span> {item.sourceJob.status}
                    </div>
                    <div>
                      <span className="font-medium">액션:</span> {item.sourceJob.action}
                    </div>
                    <div>
                      <span className="font-medium">우선순위:</span> {item.sourceJob.priority}
                    </div>
                    <div>
                      <span className="font-medium">재시도 예약:</span>{" "}
                      {item.sourceJob.retryScheduledAt
                        ? new Date(item.sourceJob.retryScheduledAt).toLocaleString("ko-KR")
                        : "-"}
                    </div>
                  </div>
                )}
              </section>

              <OpsQueueDetailTabs
                opsQueueTicketId={item.id}
                recentAuditLogs={recentAuditLogs}
              />

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">바로가기</div>
                <div className="flex flex-wrap gap-2">
                  {item.caseId ? (
                    <Link
                      href={`/cases/${item.caseId}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      사건 상세 이동
                    </Link>
                  ) : null}
                  {item.sourceJob?.id ? (
                    <Link
                      href={`/admin/alerts/bulk-jobs/${item.sourceJob.id}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      Job 상세 이동
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/alerts/ops-queue/${item.id}`}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    운영 큐 티켓 페이지
                  </Link>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
