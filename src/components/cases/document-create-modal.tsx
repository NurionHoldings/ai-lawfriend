"use client";

import { useMemo, useState } from "react";
import { requireOkData } from "@/lib/client/api-error";

type Props = {
  open: boolean;
  onClose: () => void;
  caseId: string;
  interviewCompleted: boolean;
  onCreated: () => Promise<void> | void;
};

const DOCUMENT_OPTIONS = [
  {
    type: "STATEMENT",
    label: "진술서",
    questionSetCode: "STATEMENT_DEFAULT_V1",
    questionSetVersion: "1.0.0",
    templateCode: "STATEMENT_TEMPLATE_V1",
    templateVersion: "1.0.0",
  },
  {
    type: "OPINION",
    label: "의견서",
    questionSetCode: "STATEMENT_DEFAULT_V1",
    questionSetVersion: "1.0.0",
    templateCode: "OPINION_TEMPLATE_V1",
    templateVersion: "1.0.0",
  },
  {
    type: "CONSULT_NOTE",
    label: "상담기록서",
    questionSetCode: "STATEMENT_DEFAULT_V1",
    questionSetVersion: "1.0.0",
    templateCode: "CONSULT_NOTE_TEMPLATE_V1",
    templateVersion: "1.0.0",
  },
] as const;

export function DocumentCreateModal({
  open,
  onClose,
  caseId,
  interviewCompleted,
  onCreated,
}: Props) {
  const [documentType, setDocumentType] = useState<(typeof DOCUMENT_OPTIONS)[number]["type"]>(
    "STATEMENT",
  );
  const [title, setTitle] = useState("진술서 초안");
  const [submitting, setSubmitting] = useState(false);

  const selected = useMemo(
    () => DOCUMENT_OPTIONS.find((item) => item.type === documentType)!,
    [documentType],
  );

  if (!open) return null;

  async function handleSubmit() {
    if (!interviewCompleted) {
      alert("인터뷰 완료 후에만 문서를 생성할 수 있습니다.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/cases/${caseId}/documents/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: selected.type,
          title,
          questionSetCode: selected.questionSetCode,
          questionSetVersion: selected.questionSetVersion,
          templateCode: selected.templateCode,
          templateVersion: selected.templateVersion,
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "문서 생성에 실패했습니다.");
      } catch (e) {
        alert(
          e instanceof Error ? e.message : "문서 생성에 실패했습니다.",
        );
        return;
      }

      await onCreated();
      alert("문서 초안이 생성되었습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">문서 초안 생성</h3>
            <p className="mt-1 text-sm text-gray-500">
              질문셋과 템플릿 정의 기준으로 초안을 생성합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-sm"
          >
            닫기
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">문서 종류</label>
            <select
              value={documentType}
              onChange={(e) => {
                const nextType = e.target.value as typeof documentType;
                setDocumentType(nextType);
                const label = DOCUMENT_OPTIONS.find((d) => d.type === nextType)?.label ?? "문서";
                setTitle(`${label} 초안`);
              }}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              {DOCUMENT_OPTIONS.map((item) => (
                <option key={item.type} value={item.type}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">문서 제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="문서 제목"
            />
          </div>

          <div className="rounded-xl bg-gray-50 p-4 text-sm">
            <div>질문셋 코드: {selected.questionSetCode}</div>
            <div>질문셋 버전: {selected.questionSetVersion}</div>
            <div>템플릿 코드: {selected.templateCode}</div>
            <div>템플릿 버전: {selected.templateVersion}</div>
          </div>

          {!interviewCompleted && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              인터뷰 완료 전에는 초안을 생성할 수 없습니다.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm"
          >
            취소
          </button>
          <button
            type="button"
            disabled={submitting || !interviewCompleted}
            onClick={handleSubmit}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "생성 중..." : "생성"}
          </button>
        </div>
      </div>
    </div>
  );
}
