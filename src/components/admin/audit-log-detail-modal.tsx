"use client";

import Link from "next/link";
import { ActionBadge, EntityTypeBadge } from "@/components/admin/audit-log-badges";
import {
  readUserApprovalNote,
  resolveRelatedCaseId,
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
  item: AuditLogItem | null;
  open: boolean;
  onClose: () => void;
};

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

export default function AuditLogDetailModal({ item, open, onClose }: Props) {
  if (!open || !item) return null;

  const relatedCaseId = resolveRelatedCaseId({
    entityType: item.entityType,
    entityId: item.entityId,
    metadata: item.metadata,
  });

  const isUserApprovalAction = item.action.startsWith("USER_APPROVAL_");
  const userApprovalNote = isUserApprovalAction ? readUserApprovalNote(item.metadata) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-sm text-slate-500">감사로그 상세</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ActionBadge action={item.action} />
              <EntityTypeBadge entityType={item.entityType} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm text-slate-700"
          >
            닫기
          </button>
        </div>

        <div className="max-h-[calc(85vh-72px)] overflow-y-auto px-6 py-5">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <h3 className="font-semibold text-slate-900">기본 정보</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">로그 ID</dt>
                  <dd className="mt-1 break-all text-slate-900">{item.id}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">발생 시각</dt>
                  <dd className="mt-1 text-slate-900">
                    {formatDateTime(item.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">액션</dt>
                  <dd className="mt-1">
                    <ActionBadge action={item.action} />
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">엔티티 타입</dt>
                  <dd className="mt-1">
                    <EntityTypeBadge entityType={item.entityType} />
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">엔티티 ID</dt>
                  <dd className="mt-1 break-all text-slate-900">{item.entityId}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">메시지</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-slate-900">
                    {item.message ?? "-"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border p-4">
              <h3 className="font-semibold text-slate-900">행위자 정보</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">사용자 ID</dt>
                  <dd className="mt-1 break-all text-slate-900">{item.actor.id}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">이름</dt>
                  <dd className="mt-1 text-slate-900">{item.actor.name ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">이메일</dt>
                  <dd className="mt-1 text-slate-900">{item.actor.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">역할</dt>
                  <dd className="mt-1 text-slate-900">{item.actor.role}</dd>
                </div>
              </dl>

              {relatedCaseId ? (
                <div className="mt-6 rounded-xl border bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">관련 사건 바로가기</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{relatedCaseId}</p>
                  <Link
                    href={`/cases/${relatedCaseId}`}
                    className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    onClick={onClose}
                  >
                    사건 상세로 이동
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {isUserApprovalAction ? (
            <div
              className={`mt-6 rounded-xl border p-4 ${
                userApprovalNote
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <h3 className="font-semibold text-slate-900">가입 승인·반려 운영 메모</h3>
              {userApprovalNote ? (
                <>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-amber-950">{userApprovalNote}</p>
                  <p className="mt-2 text-xs text-amber-900/90">
                    감사 metadata의 <span className="font-mono">userApprovalNote</span>와 동일합니다.
                    사용자 프로필에는 저장되지 않습니다.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  이 처리에는 운영 메모가 비어 있습니다. (승인·반려만 기록된 경우)
                </p>
              )}
            </div>
          ) : null}

          <div className="mt-6 rounded-xl border p-4">
            <h3 className="font-semibold text-slate-900">메타데이터</h3>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs text-slate-700">
              {item.metadata ? JSON.stringify(item.metadata, null, 2) : "-"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
