"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuditLogDetailModal from "@/components/admin/audit-log-detail-modal";
import { ActionBadge, EntityTypeBadge } from "@/components/admin/audit-log-badges";
import {
  isUserApprovalAuditAction,
  readUserApprovalNote,
  truncateUserApprovalNotePreview,
  userApprovalRowSurfaceClass,
} from "@/features/audit-logs/audit-log.ui";

type AuditLogItem = {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string | null;
  metadata: unknown;
  createdAt: string | Date;
  actor: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
};

type Props = {
  items: AuditLogItem[];
  highlightId?: string;
  currentQuery: {
    pageSize: number;
    actorUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    search: string;
    dateFrom: string;
    dateTo: string;
    highlight?: string;
  };
};

function buildQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value).length > 0) {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function AuditLogTable({ items, highlightId, currentQuery }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`audit-log-row-${highlightId}`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightId, items]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  if (items.length === 0) {
    const userApprovalFilter =
      typeof currentQuery.action === "string" &&
      currentQuery.action.toUpperCase().includes("USER_APPROVAL");
    return (
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="p-10 text-center text-slate-500">
          <p className="font-medium text-slate-700">조건에 맞는 감사로그가 없습니다.</p>
          {userApprovalFilter ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              가입 <strong className="text-slate-800">승인·반려</strong> 필터가 켜져 있습니다. 기간·행위자
              조건을 넓히거나,{" "}
              <Link
                href="/admin/users/pending"
                className="font-medium text-slate-900 underline"
              >
                가입 승인 대기
              </Link>
              에서 아직 처리되지 않은 건이 없는지 함께 확인해 보세요.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              상세 검색의 기간·액션·엔티티 조건을 완화해 보세요.
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-4 py-3">시각</th>
                <th className="px-4 py-3">행위자</th>
                <th className="px-4 py-3">액션</th>
                <th className="px-4 py-3">엔티티</th>
                <th className="px-4 py-3">메시지</th>
                <th className="px-4 py-3">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {items.map((item) => {
                const approvalRow = userApprovalRowSurfaceClass(item.action);
                const approvalNote = isUserApprovalAuditAction(item.action)
                  ? readUserApprovalNote(item.metadata)
                  : null;
                return (
                <tr
                  key={item.id}
                  id={`audit-log-row-${item.id}`}
                  className={`align-top transition-colors ${approvalRow} ${
                    highlightId && item.id === highlightId
                      ? "bg-amber-50 ring-2 ring-inset ring-amber-400"
                      : ""
                  }`}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                    {formatDateTime(item.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">
                      <Link
                        href={`/admin/audit-logs?${buildQueryString({
                          ...currentQuery,
                          page: 1,
                          actorUserId: item.actor.id,
                        })}`}
                        className="underline"
                      >
                        {item.actor.name ?? item.actor.email}
                      </Link>
                    </div>
                    <div className="break-all text-xs text-slate-500">
                      {item.actor.id}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/admin/audit-logs?${buildQueryString({
                        ...currentQuery,
                        page: 1,
                        action: item.action,
                      })}`}
                    >
                      <ActionBadge action={item.action} />
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div>
                      <Link
                        href={`/admin/audit-logs?${buildQueryString({
                          ...currentQuery,
                          page: 1,
                          entityType: item.entityType,
                        })}`}
                      >
                        <EntityTypeBadge entityType={item.entityType} />
                      </Link>
                    </div>
                    <div className="mt-2 break-all text-xs text-slate-500">
                      <Link
                        href={`/admin/audit-logs?${buildQueryString({
                          ...currentQuery,
                          page: 1,
                          entityId: item.entityId,
                        })}`}
                        className="underline"
                      >
                        {item.entityId}
                      </Link>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="space-y-1.5">
                      <div className="whitespace-pre-wrap">{item.message ?? "—"}</div>
                      {approvalNote ? (
                        <div className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-2 py-1.5 text-xs text-amber-950">
                          <span className="font-semibold">운영 메모</span>{" "}
                          {truncateUserApprovalNotePreview(approvalNote)}
                        </div>
                      ) : isUserApprovalAuditAction(item.action) ? (
                        <p className="text-xs text-slate-400">운영 메모 없음 (승인·반려만 기록)</p>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      title={
                        isUserApprovalAuditAction(item.action)
                          ? "가입 승인·반려 상세·userApprovalNote 전체"
                          : undefined
                      }
                      className="rounded-lg border px-3 py-2 text-sm text-slate-700"
                    >
                      상세 보기
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <AuditLogDetailModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
