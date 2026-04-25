"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BaseModal } from "@/components/ui/base-modal";
import { SeverityBadge } from "./severity-badge";
import { StatusBadge } from "./status-badge";
import { AlertPayloadViewer } from "./alert-payload-viewer";
import { AlertLinkedIds } from "./alert-linked-ids";
import { RelatedAuditLogsPanel } from "./related-audit-logs-panel";
import { formatDateTime, formatUserLabel } from "@/lib/alerts/format";
import { extractLinkableIds, resolveAlertTargetHref } from "@/lib/alerts/deep-link";
import { buildCaseTimelineHref } from "@/lib/alerts/case-links";
import { AssigneeUserPicker } from "./assignee-user-picker";
import { requireOkResponseBody } from "@/lib/client/api-error";

type AlertDetail = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  fingerprint: string;
  entityType: string | null;
  entityId: string | null;
  detectedAt: string;
  acknowledgedAt: string | null;
  ignoredAt: string | null;
  resolvedAt: string | null;
  payloadJson: unknown;
  actorUser: {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
  } | null;
  acknowledgedBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  ignoredBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  resolvedBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  assigneeUserId: string | null;
  dueAt: string | null;
  slaState: "ON_TRACK" | "DUE_SOON" | "OVERDUE";
  slaHours: number | null;
  dueSoonHours: number | null;
  escalationLevel: "NONE" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  assigneeUser: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  rule: {
    id: string;
    name: string;
    code: string;
    type: string;
    enabled: boolean;
    severity: string;
    description: string | null;
    configJson: unknown;
  } | null;
  notifications: Array<{
    id: string;
    userId: string;
    title: string;
    body: string;
    readAt: string | null;
    createdAt: string;
  }>;
  timelineMemos?: Array<{
    id: string;
    caseId: string;
    content: string;
    noteType: string | null;
    memoType: string;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
};

type Props = {
  eventId: string | null;
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
};

export function AlertDetailModal({ eventId, open, onClose, onChanged }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [item, setItem] = useState<AlertDetail | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!eventId || !open) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/alert-events/${eventId}`, { cache: "no-store" });
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "상세 조회 실패");
      setItem(data.item as AlertDetail);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [eventId, open]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (!item) return;
    setAssignee(item.assigneeUserId ?? "");
    setDueAt(item.dueAt ? toDatetimeLocalValue(item.dueAt) : "");
  }, [item]);

  async function saveAssign() {
    if (!item) return;

    setAssignSaving(true);
    try {
      const res = await fetch(`/api/admin/alert-events/${item.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigneeUserId: assignee.trim() || null,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        }),
      });
      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "담당자/기한 저장 실패");

      await fetchDetail();
      onChanged?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setAssignSaving(false);
    }
  }

  async function createActionDraftNote() {
    if (!eventId) return;

    setDraftLoading(true);
    try {
      const res = await fetch(
        `/api/admin/alert-events/${eventId}/create-action-draft-note`,
        {
          method: "POST",
        }
      );
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "조치 메모 초안 생성 실패");

      await fetchDetail();
      onChanged?.();

      const href = data.redirectHref;
      if (typeof href === "string" && href) {
        router.push(href);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setDraftLoading(false);
    }
  }

  async function changeStatus(nextStatus: "ACKNOWLEDGED" | "IGNORED" | "RESOLVED") {
    if (!eventId) return;

    setStatusLoading(true);
    try {
      const res = await fetch(`/api/admin/alert-events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "상태 변경 실패");

      await fetchDetail();
      onChanged?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setStatusLoading(false);
    }
  }

  const primaryHref = item
    ? resolveAlertTargetHref({
        entityType: item.entityType,
        entityId: item.entityId,
        payloadJson: item.payloadJson,
      })
    : null;

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={item ? item.title : "경고 상세"}
      widthClassName="max-w-7xl"
    >
      {loading ? <div className="text-sm text-zinc-500">불러오는 중...</div> : null}
      {message ? <div className="text-sm text-red-600">{message}</div> : null}

      {!loading && item ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={item.severity} />
            <StatusBadge status={item.status} />
            {item.rule ? (
              <>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs">
                  {item.rule.code}
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs">
                  {item.rule.type}
                </span>
              </>
            ) : null}
          </div>

          <div className="rounded-2xl border bg-zinc-50 p-4">
            <div className="text-sm font-semibold">메시지</div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{item.message}</div>

            {(() => {
              const linkableIds = extractLinkableIds(item.payloadJson);
              const linkedCaseId =
                linkableIds.caseId ||
                (item.entityType === "CASE" ? item.entityId : null);

              return (
                <div className="mt-4 flex flex-wrap gap-2">
                  {primaryHref ? (
                    <Link
                      href={primaryHref}
                      className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                    >
                      관련 화면으로 바로 이동
                    </Link>
                  ) : null}

                  {linkedCaseId ? (
                    <Link
                      href={buildCaseTimelineHref(linkedCaseId, item.id)}
                      className="inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900"
                    >
                      사건 타임라인 메모로 이동
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    disabled={draftLoading}
                    onClick={createActionDraftNote}
                    className="inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
                  >
                    {draftLoading ? "초안 생성 중..." : "조치 메모 초안 생성"}
                  </button>
                </div>
              );
            })()}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard label="감지 시각" value={formatDateTime(item.detectedAt)} />
            <InfoCard label="행위자" value={formatUserLabel(item.actorUser)} />
            <InfoCard
              label="엔티티"
              value={`${item.entityType ?? "-"} / ${item.entityId ?? "-"}`}
            />
            <InfoCard label="fingerprint" value={item.fingerprint} mono />
          </div>

          <AlertLinkedIds
            payloadJson={item.payloadJson}
            entityType={item.entityType}
            entityId={item.entityId}
          />

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-zinc-900">담당자 / 기한 설정</div>
            <p className="mb-3 text-xs text-zinc-500">
              검색으로 담당자를 고르거나 userId를 직접 입력할 수 있습니다. 기한은 로컬 시간 기준입니다.
            </p>
            <div className="mb-2 space-y-1">
              <div className="text-xs font-medium text-zinc-500">담당자</div>
              <AssigneeUserPicker value={assignee} onChange={setAssignee} />
            </div>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="mb-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            />
            <div className="mb-2 grid gap-2 text-xs text-zinc-600 md:grid-cols-2">
              <div>
                현재 담당자:{" "}
                {item.assigneeUser?.name ??
                  item.assigneeUser?.email ??
                  item.assigneeUserId ??
                  "-"}
              </div>
              <div>SLA 상태: {item.slaState}</div>
              <div>기본 SLA 시간: {item.slaHours ?? "-"}h</div>
              <div>임박 기준(시간): {item.dueSoonHours ?? "-"}</div>
              <div>에스컬레이션: {item.escalationLevel}</div>
            </div>
            {item.dueAt ? (
              <div className="mb-2 text-xs text-zinc-600">
                저장된 기한(UTC): {formatDateTime(item.dueAt)}
              </div>
            ) : null}
            <button
              type="button"
              disabled={assignSaving}
              onClick={() => void saveAssign()}
              className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {assignSaving ? "저장 중..." : "저장"}
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold">처리 이력</div>
              <div className="space-y-2 text-sm">
                <HistoryLine
                  label="확인"
                  value={
                    item.acknowledgedAt
                      ? `${formatDateTime(item.acknowledgedAt)} / ${formatUserLabel(item.acknowledgedBy)}`
                      : "-"
                  }
                />
                <HistoryLine
                  label="무시"
                  value={
                    item.ignoredAt
                      ? `${formatDateTime(item.ignoredAt)} / ${formatUserLabel(item.ignoredBy)}`
                      : "-"
                  }
                />
                <HistoryLine
                  label="해결"
                  value={
                    item.resolvedAt
                      ? `${formatDateTime(item.resolvedAt)} / ${formatUserLabel(item.resolvedBy)}`
                      : "-"
                  }
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() => changeStatus("ACKNOWLEDGED")}
                  className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                >
                  확인
                </button>
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() => changeStatus("IGNORED")}
                  className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                >
                  무시
                </button>
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() => changeStatus("RESOLVED")}
                  className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                >
                  해결
                </button>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold">연결된 규칙</div>
              {item.rule ? (
                <div className="space-y-3 text-sm">
                  <HistoryLine label="규칙명" value={item.rule.name} />
                  <HistoryLine label="코드" value={item.rule.code} mono />
                  <HistoryLine label="유형" value={item.rule.type} />
                  <HistoryLine label="상태" value={item.rule.enabled ? "활성" : "비활성"} />
                  <HistoryLine label="설명" value={item.rule.description ?? "-"} />
                  <div>
                    <div className="mb-2 text-xs font-medium text-zinc-500">규칙 설정</div>
                    <AlertPayloadViewer value={item.rule.configJson} />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-zinc-500">연결된 규칙이 없습니다.</div>
              )}
            </div>
          </div>

          <RelatedAuditLogsPanel eventId={item.id} />

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold">연결된 타임라인 메모</div>

            <div className="space-y-2">
              {(item.timelineMemos?.length ?? 0) > 0 ? (
                (item.timelineMemos ?? []).map((note) => (
                  <div key={note.id} className="rounded-xl border border-zinc-200 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {note.noteType ? (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium">
                          {note.noteType}
                        </span>
                      ) : null}
                      <span className="text-xs text-zinc-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-zinc-700">
                      {note.content}
                    </pre>

                    <div className="mt-2 text-xs text-zinc-500">
                      작성자: {note.author?.name ?? note.author?.email ?? "-"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-500">연결된 타임라인 메모가 없습니다.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold">알림 전파 이력</div>
            <div className="space-y-2">
              {item.notifications.length > 0 ? (
                item.notifications.map((noti) => (
                  <div
                    key={noti.id}
                    className="flex flex-col gap-2 rounded-xl border p-3 text-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="font-medium">{noti.title}</div>
                      <div className="mt-1 text-zinc-600">{noti.body}</div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      생성 {formatDateTime(noti.createdAt)} / 읽음{" "}
                      {noti.readAt ? formatDateTime(noti.readAt) : "미확인"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-zinc-500">전파된 알림이 없습니다.</div>
              )}
            </div>
          </div>

          <AlertPayloadViewer value={item.payloadJson} />
        </div>
      ) : null}
    </BaseModal>
  );
}

function InfoCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className={`mt-2 break-all text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function HistoryLine({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[84px_1fr] gap-3">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className={`break-all text-sm text-zinc-700 ${mono ? "font-mono" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
