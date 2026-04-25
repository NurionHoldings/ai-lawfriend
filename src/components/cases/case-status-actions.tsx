"use client";

import type { AllowedCaseActions } from "@/lib/case-action-guard";

type Props = {
  allowed: AllowedCaseActions;
  disabled?: boolean;
  onAction: (action: string, reason?: string) => Promise<void> | void;
  onOpenCreateDocument: () => void;
};

export function CaseStatusActions({
  allowed,
  disabled,
  onAction,
  onOpenCreateDocument,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold">진행 액션</h3>
      <div className="mt-3 space-y-2">
        {allowed.START_INTERVIEW ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("START_INTERVIEW")}
            className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            인터뷰 시작
          </button>
        ) : null}

        {allowed.RESUME_FROM_HOLD ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("RESUME_CASE")}
            className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            보류 해제(재개)
          </button>
        ) : null}

        {allowed.COMPLETE_INTERVIEW ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("COMPLETE_INTERVIEW")}
            className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            인터뷰 완료 처리
          </button>
        ) : null}

        {allowed.GENERATE_DRAFT ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onOpenCreateDocument}
            className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            문서 초안 생성
          </button>
        ) : null}

        {allowed.REQUEST_REVIEW ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("REQUEST_REVIEW")}
            className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            검토 요청
          </button>
        ) : null}

        {allowed.DELIVER_DOCUMENT ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("DELIVER_DOCUMENT")}
            className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            전달 완료 처리
          </button>
        ) : null}

        {allowed.CLOSE_CASE ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("CLOSE_CASE")}
            className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            사건 종결
          </button>
        ) : null}

        {allowed.PUT_ON_HOLD ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("PUT_ON_HOLD")}
            className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
          >
            보류
          </button>
        ) : null}

        {allowed.REJECT_CASE ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("REJECT_CASE")}
            className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
          >
            사건 반려
          </button>
        ) : null}

        {allowed.REOPEN_CASE ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onAction("REOPEN_CASE")}
            className="w-full rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            사건 재개
          </button>
        ) : null}
      </div>
    </div>
  );
}
