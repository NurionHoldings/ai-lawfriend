"use client";

import { useState } from "react";

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  message?: string;
  error?: string;
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type LawyerCasePackageShare = {
  id: string;
  caseId: string;
  publicCode: string;
  shareMode: "DESIGNATED_LAWYER" | "PUBLIC_CODE_REQUEST";
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  consentedAt: string;
  createdAt: string;
  updatedAt: string;
  scope: {
    allowSummary: boolean;
    allowInterview: boolean;
    allowAttachmentList: boolean;
    allowAttachmentDownload: boolean;
    allowDocumentDraft: boolean;
    allowDocumentPdf: boolean;
    allowPackagePdf: boolean;
    allowClientContact: boolean;
    allowOpponentDetail: boolean;
  };
  case: {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    opponentName: string | null;
    incidentDate: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  owner: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  lawyer: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  attachments: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    category: string | null;
    createdAt: string;
    downloadAllowed: boolean;
  }>;
  documents: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    pdfAllowed: boolean;
  }>;
};

export function LawyerCasePackageLookupClient() {
  const [publicCode, setPublicCode] = useState("");
  const [optionalPin, setOptionalPin] = useState("");
  const [result, setResult] = useState<LawyerCasePackageShare | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLookup() {
    setMessage("");
    setErrorMessage("");
    setResult(null);

    if (!publicCode.trim()) {
      setErrorMessage("사건 고유번호를 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/lawyer/case-packages/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicCode,
          optionalPin,
        }),
      });

      const payload = (await response.json()) as ApiResponse<LawyerCasePackageShare>;

      if (!payload.ok) {
        setErrorMessage(
          normalizeLookupError(
            payload.message ?? payload.error ?? "사건 패키지를 조회할 수 없습니다.",
          ),
        );
        return;
      }

      setResult(payload.data);
      setMessage("사건 패키지를 조회했습니다.");
    } catch {
      setErrorMessage("사건 패키지 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">고유번호 입력</h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          의뢰인에게 받은 사건 고유번호를 입력합니다. 공유가 만료되었거나
          취소된 경우, 또는 지정 변호사가 아닌 경우 열람할 수 없습니다.
        </p>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          6.3 `add-case-package-share` migration과 6.4~6.8 1차 런타임 검증이
          완료되었습니다. 현재 화면은 실제 고유번호 조회, 접근 차단,
          요약본 출력, 접근 로그 적재 기준으로 운영 점검을 이어가면 됩니다.
        </div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">사건 고유번호</span>
            <input
              value={publicCode}
              onChange={(event) => setPublicCode(event.target.value)}
              placeholder="예: AIF-2026-K7Q2-M9RA"
              className="rounded-xl border px-3 py-2 font-mono text-sm uppercase outline-none focus:border-slate-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">접근 PIN</span>
            <input
              value={optionalPin}
              onChange={(event) => setOptionalPin(event.target.value)}
              placeholder="선택 입력 — PIN 공유 시 사용"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <span className="text-xs leading-5 text-slate-500">
              현재 6.5에서는 PIN 입력 UI만 준비합니다. 실제 PIN 검증은 후속
              보안 강화 단계에서 확정할 수 있습니다.
            </span>
          </label>

          {message ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {message}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleLookup}
            disabled={isLoading}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "조회 중..." : "사건 패키지 조회"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
          <p className="font-semibold text-slate-800">조회 조건</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>변호사 또는 관리자 계정으로 로그인되어 있어야 합니다.</li>
            <li>공유 상태가 ACTIVE여야 합니다.</li>
            <li>공유 기간이 만료되지 않아야 합니다.</li>
            <li>의뢰인이 공유를 취소한 경우 열람할 수 없습니다.</li>
            <li>지정 변호사 공유인 경우 해당 변호사만 열람할 수 있습니다.</li>
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        {!result ? (
          <div className="rounded-2xl border bg-white p-6 text-sm leading-6 text-slate-600 shadow-sm">
            조회된 사건 패키지가 없습니다. 의뢰인에게 전달받은 사건
            고유번호를 입력해 주세요.
          </div>
        ) : (
          <CasePackageViewer share={result} />
        )}
      </section>
    </div>
  );
}

function CasePackageViewer({ share }: { share: LawyerCasePackageShare }) {
  return (
    <>
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">사건 고유번호</p>
            <p className="mt-1 font-mono text-xl font-bold text-slate-950">{share.publicCode}</p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {share.status}
            </span>

            {share.scope.allowPackagePdf ? (
              <a
                href={`/api/lawyer/case-packages/${share.id}/package-summary`}
                className="w-fit rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                사건 패키지 요약본 출력
              </a>
            ) : (
              <span className="w-fit rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
                요약본 출력 비허용
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <InfoItem label="사건 제목" value={share.case.title} />
          <InfoItem label="사건 유형" value={share.case.category ?? "미분류"} />
          <InfoItem label="사건 상태" value={formatCaseStatus(share.case.status)} />
          <InfoItem
            label="사건 발생일"
            value={share.case.incidentDate ? formatDate(share.case.incidentDate) : "미기입"}
          />
          <InfoItem
            label="공유 만료일"
            value={share.expiresAt ? formatDateTime(share.expiresAt) : "미설정"}
          />
          <InfoItem label="공유 방식" value={share.shareMode} />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">사건 요약</h2>

        {share.scope.allowSummary ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {share.case.description || "공유된 사건 요약이 아직 없습니다."}
          </div>
        ) : (
          <RestrictedBox message="의뢰인이 사건 요약 열람을 허용하지 않았습니다." />
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">의뢰인 / 상대방 정보</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <InfoItem label="의뢰인" value={share.owner?.name ?? "비공개"} />
          <InfoItem label="의뢰인 이메일" value={share.owner?.email ?? "비공개"} />
          <InfoItem label="의뢰인 연락처" value={share.owner?.phone ?? "비공개"} />
          <InfoItem label="상대방" value={share.case.opponentName ?? "비공개 또는 미기입"} />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">공유 범위 / 다운로드 정책</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <InfoItem label="AI 인터뷰 열람" value={share.scope.allowInterview ? "허용" : "비허용"} />
          <InfoItem label="첨부자료 목록 열람" value={share.scope.allowAttachmentList ? "허용" : "비허용"} />
          <InfoItem label="문서 초안 열람" value={share.scope.allowDocumentDraft ? "허용" : "비허용"} />
          <InfoItem label="의뢰인 연락처 공유" value={share.scope.allowClientContact ? "허용" : "비허용"} />
          <InfoItem label="상대방 상세 정보 공유" value={share.scope.allowOpponentDetail ? "허용" : "비허용"} />
          <InfoItem label="첨부 원본 다운로드" value={share.scope.allowAttachmentDownload ? "허용" : "비허용"} />
          <InfoItem label="문서 PDF 다운로드" value={share.scope.allowDocumentPdf ? "허용" : "비허용"} />
          <InfoItem label="사건 패키지 요약본 출력" value={share.scope.allowPackagePdf ? "허용" : "비허용"} />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">첨부자료 목록</h2>

        {!share.scope.allowAttachmentList ? (
          <RestrictedBox message="의뢰인이 첨부자료 목록 열람을 허용하지 않았습니다." />
        ) : share.attachments.length === 0 ? (
          <EmptyBox message="공유된 첨부자료가 없습니다." />
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3">파일명</th>
                  <th className="px-4 py-3">유형</th>
                  <th className="px-4 py-3">크기</th>
                  <th className="px-4 py-3">다운로드</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {share.attachments.map((attachment) => (
                  <tr key={attachment.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{attachment.originalName}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {attachment.category ?? attachment.mimeType}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatBytes(attachment.sizeBytes)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {attachment.downloadAllowed ? (
                        <a
                          href={`/api/lawyer/case-packages/${share.id}/attachments/${attachment.id}/download`}
                          className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          다운로드
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">비허용</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-xs leading-5 text-slate-500">
          첨부파일 다운로드는 의뢰인이 별도로 허용한 경우에만 가능합니다.
          다운로드 시 열람 기록이 시스템에 남을 수 있습니다.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">문서 초안</h2>

        {!share.scope.allowDocumentDraft ? (
          <RestrictedBox message="의뢰인이 문서 초안 열람을 허용하지 않았습니다." />
        ) : share.documents.length === 0 ? (
          <EmptyBox message="공유된 문서 초안이 없습니다." />
        ) : (
          <div className="mt-4 grid gap-3">
            {share.documents.map((document) => (
              <div key={document.id} className="rounded-xl border bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{document.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {document.type} / {document.status}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    PDF {document.pdfAllowed ? "허용" : "비허용"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
        <h2 className="font-bold">검토 안내</h2>
        <p className="mt-2">
          이 사건 패키지는 의뢰인이 입력한 자료와 AI 정리 결과를 기반으로
          구성된 검토용 자료입니다. AI 정리 결과는 법률 자문이나 최종 판단이
          아니며, 사실관계 확인과 법률 판단은 변호사 검토를 통해 이루어져야
          합니다.
        </p>
      </section>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function RestrictedBox({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      {message}
    </div>
  );
}

function EmptyBox({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{message}</div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCaseStatus(status: string): string {
  const labels: Record<string, string> = {
    CREATED: "생성됨",
    INTAKE_PENDING: "접수 대기",
    IN_INTERVIEW: "인터뷰 진행 중",
    INTERVIEW_DONE: "인터뷰 완료",
    DRAFTING: "문서 작성 중",
    REVIEW_PENDING: "검토 대기",
    APPROVED: "승인 완료",
    DELIVERED: "전달 완료",
    CLOSED: "종결",
    HOLD: "보류",
    REJECTED: "반려",
    DELETED: "삭제",
  };

  return labels[status] ?? status;
}

function normalizeLookupError(message: string): string {
  if (message.includes("CasePackageShare") || message.includes("does not exist")) {
    return "사건 패키지 조회 API는 연결되었지만 DB migration이 아직 적용되지 않았을 수 있습니다. add-case-package-share migration 완료 후 다시 확인해 주세요.";
  }

  if (message.includes("권한") || message.includes("지정된 변호사")) {
    return message;
  }

  if (message.includes("만료") || message.includes("취소") || message.includes("고유번호")) {
    return message;
  }

  return message;
}