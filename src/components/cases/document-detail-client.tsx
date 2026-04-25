"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DocumentApprovalHistoryPanel from "@/components/cases/document-approval-history-panel";
import DocumentVersionPanel from "@/components/cases/document-version-panel";
import { requireOkData } from "@/lib/client/api-error";

type DocumentDetail = {
  id: string;
  caseId: string | null;
  title: string;
  content: string;
  type: string;
  status: string;
  updatedAt: string | null;
  reviewComment?: string;
  case?: {
    id: string;
    title: string;
    status: string | null;
    caseNumber?: string | null;
  } | null;
};

type SessionUser = {
  id: string;
  role?: string | null;
};

type Props = {
  initialDocument: DocumentDetail;
  sessionUser: SessionUser;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function canReview(role?: string | null) {
  return (
    role === "ADMIN" ||
    role === "SUPER_ADMIN" ||
    role === "LAWYER" ||
    role === "STAFF"
  );
}

export default function DocumentDetailClient({ initialDocument, sessionUser }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialDocument.title);
  const [content, setContent] = useState(initialDocument.content);
  const [status, setStatus] = useState(initialDocument.status);
  const [reviewComment, setReviewComment] = useState(initialDocument.reviewComment ?? "");
  const [updatedAt, setUpdatedAt] = useState(initialDocument.updatedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [hasParagraphs, setHasParagraphs] = useState(false);
  const [isParagraphInfoLoading, setIsParagraphInfoLoading] = useState(true);

  const dirty = useMemo(() => {
    return title !== initialDocument.title || content !== initialDocument.content;
  }, [title, content, initialDocument.title, initialDocument.content]);

  /** 승인본 출력·PDF는 잠금 확정 후에만 의미 있음(이른 클릭 방지). */
  const approvalOutputsReady = status === "LOCKED";
  /** 사건 쪽 최종 승인·잠금 후에는 이 화면의 검토 버튼으로 상태를 바꾸지 않음. */
  const reviewButtonsEnabled =
    status !== "LOCKED" && status !== "ARCHIVED";
  /** 잠금·보관 후 본문·저장·검토 의견 수정은 사건 화면 기준으로 맞춤. */
  const documentEditingLocked = status === "LOCKED" || status === "ARCHIVED";
  const titleReadOnly = documentEditingLocked;
  /** 본문: 잠금·보관 또는 문단 구조·메타 로딩 중에는 읽기 전용으로 표시 */
  const bodyReadOnly =
    documentEditingLocked || hasParagraphs || isParagraphInfoLoading;

  useEffect(() => {
    setTitle(initialDocument.title);
    setContent(initialDocument.content);
    setStatus(initialDocument.status);
    setReviewComment(initialDocument.reviewComment ?? "");
    setUpdatedAt(initialDocument.updatedAt);
  }, [
    initialDocument.id,
    initialDocument.title,
    initialDocument.content,
    initialDocument.status,
    initialDocument.reviewComment,
    initialDocument.updatedAt,
  ]);

  /** 잠금·보관으로 전환된 뒤에는 이전 저장/검토 토스트가 남지 않도록 정리 */
  useEffect(() => {
    if (status === "LOCKED" || status === "ARCHIVED") {
      setSaveMessage(null);
      setSaveError(null);
      setReviewMessage(null);
      setReviewError(null);
    }
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    async function loadParagraphInfo() {
      try {
        setIsParagraphInfoLoading(true);
        const res = await fetch(`/api/documents/${initialDocument.id}/paragraphs`, {
          cache: "no-store",
        });

        const raw = await res.json().catch(() => null);
        const payload = requireOkData<{ paragraphs?: unknown[] }>(
          res,
          raw,
          "문단 정보 조회에 실패했습니다.",
        );

        const nextHasParagraphs =
          Array.isArray(payload?.paragraphs) && payload.paragraphs.length > 0;

        if (!cancelled) {
          setHasParagraphs(nextHasParagraphs);
        }
      } catch {
        if (!cancelled) {
          setHasParagraphs(false);
        }
      } finally {
        if (!cancelled) {
          setIsParagraphInfoLoading(false);
        }
      }
    }

    void loadParagraphInfo();

    return () => {
      cancelled = true;
    };
  }, [initialDocument.id]);

  async function saveDocument() {
    if (documentEditingLocked) {
      setSaveError("잠금·보관된 문서는 이 화면에서 저장할 수 없습니다. 사건 상세에서 진행하세요.");
      setSaveMessage(null);
      return;
    }
    if (hasParagraphs) {
      setSaveError(
        "문단 구조가 있는 문서는 본문 문자열을 직접 수정할 수 없습니다. 문단 패널을 통해 수정하세요.",
      );
      setSaveMessage(null);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/documents/${initialDocument.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const raw = await res.json().catch(() => null);
      const payload = requireOkData<{
        message?: string;
        document?: { updatedAt?: string | null };
      }>(res, raw, "문서 저장에 실패했습니다.");

      setSaveMessage(payload?.message ?? "문서가 저장되었습니다.");
      if (payload.document?.updatedAt) {
        setUpdatedAt(
          typeof payload.document.updatedAt === "string"
            ? payload.document.updatedAt
            : new Date(payload.document.updatedAt).toISOString(),
        );
      }
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "문서 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitReview(action: "REQUEST_REVIEW" | "APPROVE" | "REJECT") {
    if (!reviewButtonsEnabled) return;
    setIsReviewing(true);
    setReviewError(null);
    setReviewMessage(null);

    try {
      const res = await fetch(`/api/documents/${initialDocument.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          reviewComment,
        }),
      });

      const raw = await res.json().catch(() => null);
      const payload = requireOkData<{
        message?: string;
        document?: {
          status?: string;
          reviewComment?: string;
          updatedAt?: string | null;
        };
      }>(res, raw, "검토 처리에 실패했습니다.");

      setStatus(payload?.document?.status ?? status);
      setReviewComment(payload?.document?.reviewComment ?? reviewComment);
      if (payload?.document?.updatedAt) {
        setUpdatedAt(
          typeof payload.document.updatedAt === "string"
            ? payload.document.updatedAt
            : new Date(payload.document.updatedAt).toISOString(),
        );
      }
      setReviewMessage(payload?.message ?? "문서 검토 상태가 반영되었습니다.");
      router.refresh();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "검토 처리 중 오류가 발생했습니다.");
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="text-sm text-slate-500">문서 상세</div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1">상태: {status}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">유형: {initialDocument.type}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                최종 수정: {formatDateTime(updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-2">
              {initialDocument.caseId ? (
                <a
                  href={`/cases/${initialDocument.caseId}`}
                  className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  사건 상세로 이동
                </a>
              ) : null}

              {approvalOutputsReady ? (
                <a
                  href={`/documents/${initialDocument.id}/print`}
                  className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  승인본 출력 보기
                </a>
              ) : (
                <span
                  title="사건 상세에서 승인본 잠금 후 이용할 수 있습니다."
                  className="inline-flex cursor-not-allowed items-center rounded-xl border border-dashed border-slate-200 px-4 py-2 text-sm text-slate-400"
                >
                  승인본 출력 보기
                </span>
              )}

              {approvalOutputsReady ? (
                <a
                  href={`/api/documents/${initialDocument.id}/pdf`}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  승인본 PDF 다운로드
                </a>
              ) : (
                <span
                  title="사건 상세에서 승인본 잠금 후 이용할 수 있습니다."
                  className="inline-flex cursor-not-allowed items-center rounded-xl border border-dashed border-slate-300 bg-slate-100 px-4 py-2 text-sm text-slate-400"
                >
                  승인본 PDF 다운로드
                </span>
              )}

              <a
                href="/document-verification"
                className="inline-flex items-center rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-neutral-50"
              >
                문서 검증 페이지
              </a>
            </div>
            <p className="max-w-md text-right text-xs text-neutral-500">
              승인본 출력은 잠금된 승인 기준 버전으로 생성되며, 법인 헤더·사건번호·워터마크·서명란과 함께
              검증코드 및 QR 코드가 포함됩니다.
            </p>
          </div>
        </div>

        {initialDocument.case ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="font-medium text-slate-900">연결 사건</div>
            <div className="mt-1 text-slate-700">
              {initialDocument.case.title} / 상태: {initialDocument.case.status ?? "-"}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {documentEditingLocked ? "문서 보기" : "문서 편집"}
            </h2>
            {documentEditingLocked ? (
              <p className="mt-1 text-xs text-slate-500">
                잠금 또는 보관된 문서입니다. 이 화면에서는 읽기만 가능합니다.
              </p>
            ) : null}
          </div>
          {!documentEditingLocked ? (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={saveDocument}
                disabled={
                  isSaving ||
                  !dirty ||
                  hasParagraphs ||
                  isParagraphInfoLoading
                }
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={titleReadOnly}
              className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-slate-500 ${
                titleReadOnly ? "cursor-default bg-slate-50 text-slate-800" : ""
              }`}
              placeholder="문서 제목"
              aria-readonly={titleReadOnly || undefined}
            />
          </div>

          {saveMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {saveMessage}
            </div>
          ) : null}

          {saveError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {saveError}
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">본문</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              readOnly={bodyReadOnly}
              className={`min-h-[420px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-slate-500 ${
                bodyReadOnly
                  ? "cursor-default bg-slate-50 text-slate-800"
                  : ""
              }`}
              placeholder="문서 본문"
              aria-readonly={bodyReadOnly || undefined}
            />
            {hasParagraphs ? (
              <p className="mt-2 text-xs text-amber-700">
                이 문서는 문단 구조 기반으로 관리됩니다. 본문 직접 수정 대신 아래 문단 패널을 통해 편집하세요.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {reviewButtonsEnabled ? "검토 흐름" : "검토 흐름 (읽기 전용)"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            AI는 초안과 구조화까지만 담당하며, 최종 확정은 변호사 또는 관리자가 수행합니다.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            승인 시 최신 버전이 잠기며, PDF·승인본 출력은 그 잠금 버전을 기준으로 합니다. 이후
            편집한 작업본과 출력본이 달라질 수 있습니다.
          </p>
          {initialDocument.caseId ? (
            <p className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              법률 문서 <strong>최종 승인 → 승인본 잠금 → 검증 → 전달 완료</strong>는{" "}
              <a
                href={`/cases/${initialDocument.caseId}`}
                className="font-medium text-slate-800 underline underline-offset-2"
              >
                사건 상세
              </a>
              에서 한 화면으로 이어집니다.
              {status === "LOCKED"
                ? " 잠금된 버전 기준 검증은 상단 「문서 검증 페이지」 또는 출력물 하단 코드로 확인하세요."
                : ""}
            </p>
          ) : status === "LOCKED" ? (
            <p className="mt-2 text-xs text-emerald-800">
              검증코드는 상단 <strong>문서 검증 페이지</strong> 링크와 출력물 하단 코드로 확인하세요.
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">검토 의견</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              readOnly={!reviewButtonsEnabled}
              className={`min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-slate-500 ${
                !reviewButtonsEnabled
                  ? "cursor-default bg-slate-50 text-slate-800"
                  : ""
              }`}
              placeholder="검토 요청 또는 승인/반려 의견을 입력하세요."
              aria-readonly={!reviewButtonsEnabled || undefined}
            />
          </div>

          {reviewButtonsEnabled ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => submitReview("REQUEST_REVIEW")}
                disabled={isReviewing}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isReviewing ? "처리 중..." : "검토 요청"}
              </button>

              {canReview(sessionUser.role) ? (
                <>
                  <button
                    type="button"
                    onClick={() => submitReview("APPROVE")}
                    disabled={isReviewing}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    승인
                  </button>

                  <button
                    type="button"
                    onClick={() => submitReview("REJECT")}
                    disabled={isReviewing}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    반려
                  </button>
                </>
              ) : null}
            </div>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              잠금 또는 보관된 문서는 이 화면에서 검토 요청·승인·반려를 진행할 수 없습니다. 필요 시{" "}
              {initialDocument.caseId ? (
                <a
                  href={`/cases/${initialDocument.caseId}`}
                  className="font-medium text-slate-800 underline underline-offset-2"
                >
                  사건 상세
                </a>
              ) : (
                "사건 상세"
              )}
              를 확인하세요.
            </p>
          )}
        </div>

        {reviewMessage ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {reviewMessage}
          </div>
        ) : null}

        {reviewError ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {reviewError}
          </div>
        ) : null}
      </section>

      <DocumentApprovalHistoryPanel
        documentId={initialDocument.id}
        documentStatus={status}
      />

      <DocumentVersionPanel documentId={initialDocument.id} documentStatus={status} />
    </div>
  );
}
