"use client";

import { DOCUMENT_STATUS_LABELS } from "@/lib/definitions";

type Props = {
  document: {
    id: string;
    type: string;
    status: string;
    title: string;
    latestApprovedAt: string | null;
    lockedAt: string | null;
    paragraphs: Array<{
      id: string;
      title: string;
      content: string;
      status: string;
    }>;
  };
  currentRole: "ADMIN" | "LAWYER" | "STAFF" | "CLIENT";
  onApprove: () => Promise<void> | void;
  onLock: () => Promise<void> | void;
  busy?: boolean;
};

export function DocumentReviewPanel({
  document,
  currentRole,
  onApprove,
  onLock,
  busy,
}: Props) {
  const requiredParagraphsMissing = document.paragraphs.some((p) => !p.content?.trim());

  const isTerminal = document.status === "LOCKED" || document.status === "ARCHIVED";

  /**
   * 승인·잠금: API와 동일 (ADMIN / LAWYER / SUPER_ADMIN). `SUPER_ADMIN` 은
   * `prismaRoleToUiRole` → **ADMIN**으로 내려와 여기서는 ADMIN·LAWYER만 명시.
   */
  const canActAsLawyerOrAdmin = ["ADMIN", "LAWYER"].includes(currentRole);
  const canApprove = canActAsLawyerOrAdmin;
  const canLock = canActAsLawyerOrAdmin && document.status === "APPROVED";

  const approveDisabled =
    busy ||
    requiredParagraphsMissing ||
    document.status === "LOCKED" ||
    document.status === "APPROVED" ||
    document.status === "ARCHIVED";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">
            {isTerminal ? "문서 검토 요약 (읽기 전용)" : "승인 전 검토 패널"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isTerminal ? (
              <>
                잠금·보관된 문서입니다. 아래 수치·안내는 확인용이며, 편집 가능한 버튼은 표시되지 않습니다.
              </>
            ) : (
              <>
                문단 확인 후 <strong className="font-medium text-gray-700">문서 승인</strong> →{" "}
                <strong className="font-medium text-gray-700">승인본 잠금</strong> 순으로 진행합니다.
              </>
            )}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
          {DOCUMENT_STATUS_LABELS[document.status as keyof typeof DOCUMENT_STATUS_LABELS] ??
            document.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-3">
          <div className="text-xs text-gray-500">문단 수</div>
          <div className="mt-1 text-lg font-semibold">{document.paragraphs.length}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-gray-500">승인일</div>
          <div className="mt-1 text-sm font-semibold">
            {document.latestApprovedAt
              ? new Date(document.latestApprovedAt).toLocaleString()
              : "-"}
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-gray-500">잠금일</div>
          <div className="mt-1 text-sm font-semibold">
            {document.lockedAt ? new Date(document.lockedAt).toLocaleString() : "-"}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div
          className={`rounded-xl p-3 text-sm ${
            isTerminal
              ? "border border-slate-200 bg-slate-50 text-slate-700"
              : requiredParagraphsMissing
                ? "border border-red-200 bg-red-50 text-red-700"
                : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {isTerminal
            ? document.status === "LOCKED"
              ? "문서가 잠금되어 승인·잠금 액션은 더 이상 필요하지 않습니다."
              : "문서가 보관되어 승인·잠금·전달 절차는 종료된 상태입니다."
            : requiredParagraphsMissing
              ? "비어 있는 문단이 있어 승인 전 보완이 필요합니다."
              : "기본 검토 조건이 충족되었습니다."}
        </div>
      </div>

      {!isTerminal ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {canApprove ? (
            <button
              type="button"
              disabled={approveDisabled}
              onClick={onApprove}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              문서 승인
            </button>
          ) : null}

          {canLock ? (
            <button
              type="button"
              disabled={busy}
              onClick={onLock}
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              승인본 잠금
            </button>
          ) : null}
        </div>
      ) : null}

      {document.status === "APPROVED" ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
          <span className="font-semibold">지금 할 일:</span> 아래 <strong>승인본 잠금</strong>만 누르세요. (잠금 후
          검증 링크가 열리며, 고객 전달은 상단 진행 액션에서 따로 처리합니다.)
        </p>
      ) : null}

      {document.status === "LOCKED" ? (
        <p className="mt-4 text-sm text-gray-700">
          <span className="font-semibold text-emerald-900">잠금 완료.</span> 출력·PDF 검증코드는{" "}
          <a
            className="font-medium text-emerald-700 underline underline-offset-2"
            href="/document-verification"
          >
            문서 검증
          </a>
          에서 확인하세요. 사건 마무리(전달)는 <strong>페이지 상단</strong> 진행 액션을 따르세요.
        </p>
      ) : null}

      {document.status === "ARCHIVED" ? (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <span className="font-semibold">보관됨.</span> 승인·잠금·전달은 종료된 상태입니다. 검증은 상단
          「문서 검증 페이지」 링크로 확인할 수 있습니다.
        </p>
      ) : null}
    </div>
  );
}
