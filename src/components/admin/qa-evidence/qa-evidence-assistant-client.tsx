"use client";

import { useMemo, useState } from "react";
import type { QaEvidenceAnalyzeOutput } from "@/lib/qa-evidence/qa-evidence-schema";

type AnalyzeResponse =
  | {
      ok: true;
      data: QaEvidenceAnalyzeOutput;
    }
  | {
      ok: false;
      message: string;
    };

const DEFAULT_SOURCE_TEXT = `QA 수행 일시:
QA 담당자:
테스트 환경 URL:
사용 계정 역할:
PASS 항목:
FAIL 항목:
N/A 항목:
BLOCKED 항목:
보완 필요 항목:
최종 의견:
배포 전 closure 반영 가능 여부:`;

function splitRoles(value: string): string[] {
  return value
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
}

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function QaEvidenceAssistantClient() {
  const [qaPerformedAt, setQaPerformedAt] = useState("");
  const [qaOwner, setQaOwner] = useState("");
  const [testEnvironmentUrl, setTestEnvironmentUrl] = useState("");
  const [accountRoles, setAccountRoles] = useState("CLIENT, LAWYER, ADMIN");
  const [sourceText, setSourceText] = useState(DEFAULT_SOURCE_TEXT);
  const [attachmentNotes, setAttachmentNotes] = useState("");
  const [operatorMemo, setOperatorMemo] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QaEvidenceAnalyzeOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedLabel, setCopiedLabel] = useState("");

  const hasResult = Boolean(result);

  const statusLabel = useMemo(() => {
    if (!result) return "분석 전";
    switch (result.status) {
      case "READY_FOR_COPY":
        return "복사 가능";
      case "NEEDS_QA_REPLY":
        return "QA 추가 회신 필요";
      case "BLOCKED":
        return "closure 보류 필요";
      case "NEEDS_REVIEW":
        return "사람 검토 필요";
      case "REJECTED":
        return "반려";
      default:
        return "초안";
    }
  }, [result]);

  async function handleAnalyze() {
    setIsLoading(true);
    setErrorMessage("");
    setCopiedLabel("");

    try {
      const response = await fetch("/api/admin/qa-evidence/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qaPerformedAt,
          qaOwner,
          testEnvironmentUrl,
          accountRoles: splitRoles(accountRoles),
          sourceText,
          attachmentNotes,
          operatorMemo,
        }),
      });

      const payload = (await response.json()) as AnalyzeResponse;

      if (!payload.ok) {
        setErrorMessage(payload.message);
        setResult(null);
        return;
      }

      setResult(payload.data);
    } catch {
      setErrorMessage("분석 요청 중 오류가 발생했습니다.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(label: string, value: string) {
    await copyToClipboard(value);
    setCopiedLabel(label);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">QA 원문 입력</h2>
          <p className="mt-1 text-sm text-slate-600">
            실측 QA 회신 원문과 필수 메타 정보를 입력합니다. AI는 초안만 생성하며 공식
            반영은 하지 않습니다.
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>안내:</strong> AI 분석 결과는 공식 확정이 아닙니다. 공식 증빙 반영과
          배포 가능 판정은 사람 승인 후에만 가능합니다. DB 저장·문서 자동 수정·Git
          자동 커밋은 수행하지 않습니다.
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">QA 수행 일시</span>
            <input
              value={qaPerformedAt}
              onChange={(event) => setQaPerformedAt(event.target.value)}
              placeholder="예: 2026-04-29 14:00"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">QA 담당자</span>
            <input
              value={qaOwner}
              onChange={(event) => setQaOwner(event.target.value)}
              placeholder="예: 운영 QA팀"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">테스트 환경 URL</span>
            <input
              value={testEnvironmentUrl}
              onChange={(event) => setTestEnvironmentUrl(event.target.value)}
              placeholder="예: https://staging.example.com"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">사용 계정 역할</span>
            <input
              value={accountRoles}
              onChange={(event) => setAccountRoles(event.target.value)}
              placeholder="CLIENT, LAWYER, ADMIN"
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
            <span className="text-xs text-slate-500">쉼표로 구분합니다.</span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">QA 회신 원문</span>
            <textarea
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              rows={14}
              className="rounded-xl border px-3 py-2 font-mono text-sm outline-none focus:border-slate-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">첨부 메모</span>
            <textarea
              value={attachmentNotes}
              onChange={(event) => setAttachmentNotes(event.target.value)}
              rows={3}
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">운영자 메모</span>
            <textarea
              value={operatorMemo}
              onChange={(event) => setOperatorMemo(event.target.value)}
              rows={3}
              className="rounded-xl border px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </label>

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "분석 중..." : "AI 분석 실행"}
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">분석 결과</h2>
              <p className="mt-1 text-sm text-slate-600">상태: {statusLabel}</p>
            </div>
            {copiedLabel ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {copiedLabel} 복사됨
              </span>
            ) : null}
          </div>

          {!hasResult ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              아직 분석 결과가 없습니다. QA 원문을 입력한 뒤 분석을 실행하세요.
            </div>
          ) : null}

          {result ? (
            <div className="mt-6 grid gap-4">
              {result.warnings.length > 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="text-sm font-semibold text-amber-900">경고</h3>
                  <ul className="mt-2 list-disc pl-5 text-sm text-amber-800">
                    {result.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.missingFields.length > 0 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h3 className="text-sm font-semibold text-red-900">필수 항목 누락</h3>
                  <p className="mt-2 text-sm text-red-700">
                    {result.missingFields.join(", ")}
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <Metric label="PASS" value={result.summary.passCount} />
                <Metric label="FAIL" value={result.summary.failCount} />
                <Metric label="BLOCKED" value={result.summary.blockedCount} />
                <Metric label="N/A" value={result.summary.naCount} />
                <Metric
                  label="FOLLOW-UP"
                  value={result.summary.needsFollowUpCount}
                />
              </div>

              <div className="rounded-xl border">
                <div className="border-b px-4 py-3 text-sm font-semibold text-slate-800">
                  분류 결과
                </div>
                <div className="divide-y">
                  {result.classifications.map((item, index) => (
                    <div key={`${item.type}-${index}`} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {item.type}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{item.evidence}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        영향 범위: {item.scope} / 후속: {item.followUp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {result ? (
          <>
            <MarkdownPanel
              title="closure 공식 확정 표 초안"
              value={result.closureDraftMarkdown}
              onCopy={() => handleCopy("closure 표", result.closureDraftMarkdown)}
            />
            <MarkdownPanel
              title="회신 원문 정리본"
              value={result.sourceRecordMarkdown}
              onCopy={() => handleCopy("회신 원문", result.sourceRecordMarkdown)}
            />
            <MarkdownPanel
              title="4.6 follow-up tracker 초안"
              value={result.followupTrackerDraftMarkdown}
              onCopy={() =>
                handleCopy("follow-up tracker", result.followupTrackerDraftMarkdown)
              }
            />
          </>
        ) : null}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MarkdownPanel({
  title,
  value,
  onCopy,
}: {
  title: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          복사
        </button>
      </div>
      <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-50">
        {value}
      </pre>
    </div>
  );
}
