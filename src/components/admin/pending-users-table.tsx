"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { AUDIT_LOG_USER_APPROVAL_HREF } from "@/lib/admin/audit-log-shortcuts";
import { requireOkData } from "@/lib/client/api-error";

export type PendingUserRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  createdAt: string;
};

const ROLE_LABEL: Record<string, string> = {
  USER: "의뢰인",
  LAWYER: "변호사",
  STAFF: "스태프",
  ADMIN: "관리자",
  SUPER_ADMIN: "최상위 관리자",
};

function formatRole(role: string) {
  return ROLE_LABEL[role] ? `${ROLE_LABEL[role]} (${role})` : role;
}

const OPERATOR_NOTE_MAX = 500;

type PendingUsersTableProps = {
  users: PendingUserRow[];
  /** 서버에서 적용한 역할 필터(빈 목록 문구 분기용) */
  activeRoleFilter?: string | null;
};

export function PendingUsersTable({
  users,
  activeRoleFilter = null,
}: PendingUsersTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<ReactNode | null>(null);
  const [memos, setMemos] = useState<Record<string, string>>({});

  const act = useCallback(
    async (userId: string, action: "approve" | "reject", operatorNote: string) => {
      const note = operatorNote.trim().slice(0, OPERATOR_NOTE_MAX);

      if (action === "reject") {
        const confirmed = window.confirm(
          "반려 시 해당 계정은 정지(SUSPENDED)됩니다.\n\n행 아래 메모란에 입력한 내용이 있으면 감사로그(메시지·metadata)에만 함께 기록됩니다.\n\n취소를 누르면 반려하지 않고 아무 것도 바뀌지 않습니다. 계속할까요?",
        );
        if (!confirmed) return;
      }

      setBusyId(userId);
      try {
        const res = await fetch(`/api/admin/users/${userId}/approval`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            ...(note.length > 0 ? { note } : {}),
          }),
        });
        const raw = await res.json().catch(() => null);
        try {
          requireOkData<{ action: string }>(res, raw, "처리에 실패했습니다.");
        } catch (e) {
          alert(
            e instanceof Error ? e.message : "처리에 실패했습니다.",
          );
          return;
        }
        const memoHint =
          note.length > 0
            ? " 입력한 운영 메모는 사용자 프로필이 아닌 감사로그(metadata)에만 남았습니다."
            : "";
        const headline =
          action === "approve"
            ? `처리 완료: 가입이 승인되어 ACTIVE로 바뀌었습니다.${memoHint}`
            : `처리 완료: 반려되어 계정이 정지(SUSPENDED)되었습니다.${memoHint}`;
        const followClass =
          action === "approve"
            ? "text-emerald-900/95"
            : "text-amber-950/95";
        setNotice(
          <div className="space-y-2">
            <p className="font-semibold">{headline}</p>
            <p className={`text-xs leading-relaxed ${followClass}`}>
              아래 목록을 새로고침했습니다. 감사로그에서는{" "}
              <strong className="font-medium">시각이 가장 최근인 USER_APPROVAL_* 행</strong>을 먼저
              보시면 됩니다. 목록에서도 승인·반려 행이 색으로 구분되고, 운영 메모가 있으면 메시지 열에
              요약이 붙습니다.{" "}
              <Link href={AUDIT_LOG_USER_APPROVAL_HREF} className="font-semibold underline">
                가입 승인·반려 감사로그로 이동
              </Link>
              → 행의 <strong className="font-medium">상세 보기</strong>를 누르면 모달 상단에{" "}
              <span className="whitespace-nowrap font-mono text-[0.8rem]">userApprovalNote</span> 전체가
              보이고, 아래 JSON에서도 확인할 수 있습니다.
            </p>
          </div>,
        );
        setMemos((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        router.refresh();
      } finally {
        setBusyId(null);
      }
    },
    [router],
  );

  if (users.length === 0) {
    return (
      <div className="space-y-3">
      {notice ? (
        <div
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200/80"
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      ) : null}
        <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">
          {activeRoleFilter ? (
            <>
              <p>
                선택한 <strong className="text-gray-700">가입 요청 역할</strong>(
                <strong className="text-gray-700">
                  {ROLE_LABEL[activeRoleFilter] ?? activeRoleFilter}
                </strong>
                )에 맞는 <strong className="text-gray-700">PENDING</strong> 계정이 없습니다. 관리자·최상위
                관리자 신청은 역할 필터에 없으므로{" "}
                <Link href="/admin/users/pending" className="font-medium text-slate-800 underline">
                  전체
                </Link>
                에서 확인하세요.
              </p>
              <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
                <Link href="/admin/users/pending" className="font-medium text-slate-900 underline">
                  전체 보기
                </Link>
                <Link href="/admin" className="font-medium text-slate-700 underline">
                  관리자 콘솔
                </Link>
                <Link
                  href={AUDIT_LOG_USER_APPROVAL_HREF}
                  className="font-medium text-slate-700 underline"
                  title="USER_APPROVAL_APPROVE / REJECT 행만"
                >
                  승인·반려 감사로그
                </Link>
              </p>
            </>
          ) : (
            <>
              <p>승인 대기 중인 가입 신청이 없습니다.</p>
              <p className="mt-3 text-xs text-gray-400">
                신규 가입은 회원가입 직후 PENDING으로만 저장되며, 승인 전에는 로그인할 수 없습니다.
              </p>
              <p className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                <Link href="/admin" className="font-medium text-slate-900 underline">
                  관리자 콘솔
                </Link>
                <Link
                  href={AUDIT_LOG_USER_APPROVAL_HREF}
                  className="font-medium text-slate-700 underline"
                  title="가입 승인·반려 처리 이력"
                >
                  승인·반려 감사로그
                </Link>
                <Link href="/dashboard" className="font-medium text-slate-700 underline">
                  업무 대시보드
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notice ? (
        <div
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200/80"
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      ) : null}
      <p className="text-xs leading-relaxed text-gray-500">
        각 행 아래 <strong className="font-medium text-gray-700">운영 메모</strong>는 선택입니다. 내용은
        사용자 프로필에 저장되지 않고{" "}
        <strong className="font-medium text-gray-700">감사로그</strong> 메시지·metadata(
        <span className="whitespace-nowrap">userApprovalNote</span>)에만 남습니다. 처리 후에는{" "}
        <Link href={AUDIT_LOG_USER_APPROVAL_HREF} className="font-medium text-gray-700 underline">
          승인·반려 감사로그
        </Link>
        에서 바로 확인할 수 있습니다. <strong className="font-medium text-gray-700">승인</strong>은 즉시
        반영됩니다. <strong className="font-medium text-gray-700">반려</strong>는 확인 창에서 취소하면
        처리되지 않습니다.
      </p>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_140px_180px] gap-3 border-b px-4 py-3 text-xs font-semibold text-gray-500">
          <div>이메일</div>
          <div>이름</div>
          <div>신청일</div>
          <div>가입 요청 역할</div>
          <div className="text-right">처리</div>
        </div>
        <div className="divide-y">
          {users.map((u) => (
            <div key={u.id}>
              <div className="grid grid-cols-[1.2fr_1fr_1fr_140px_180px] items-center gap-3 px-4 py-3 text-sm">
                <div className="font-medium">{u.email}</div>
                <div>{u.name}</div>
                <div className="text-gray-600">{new Date(u.createdAt).toLocaleString()}</div>
                <div className="text-gray-600">{formatRole(u.role)}</div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    aria-busy={busyId === u.id}
                    onClick={() =>
                      void act(u.id, "approve", memos[u.id] ?? "")
                    }
                    title="ACTIVE로 전환. 같은 행 메모란 내용이 있으면 감사로그에만 기록됩니다."
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                  >
                    승인
                  </button>
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    aria-busy={busyId === u.id}
                    onClick={() => void act(u.id, "reject", memos[u.id] ?? "")}
                    title="SUSPENDED(정지). 확인에서 취소하면 반려하지 않습니다. 메모는 감사로그만."
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-900 disabled:opacity-50"
                  >
                    반려
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-100 bg-slate-50/90 px-4 py-3">
                <label
                  htmlFor={`pending-memo-${u.id}`}
                  className="text-xs font-medium text-slate-600"
                >
                  운영 메모 (선택 · 감사로그 전용 · 최대 {OPERATOR_NOTE_MAX}자)
                </label>
                <textarea
                  id={`pending-memo-${u.id}`}
                  value={memos[u.id] ?? ""}
                  onChange={(e) =>
                    setMemos((prev) => ({
                      ...prev,
                      [u.id]: e.target.value.slice(0, OPERATOR_NOTE_MAX),
                    }))
                  }
                  disabled={busyId === u.id}
                  rows={2}
                  placeholder="내부 참고용입니다. 비우면 메모 없이 승인·반려만 기록됩니다."
                  className="mt-1 w-full max-w-3xl rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
