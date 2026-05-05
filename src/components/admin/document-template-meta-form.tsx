"use client";

import type { ReactNode } from "react";
import type { DocumentTemplateDefinition, DocumentType } from "@/lib/definitions";
import {
  formatLegalFormSourceLabel,
  LEGAL_FORM_SOURCE_PROVIDER_LABELS,
  type LegalFormSourceOption,
} from "@/lib/legal-form-source";

type Props = Readonly<{
  definition: DocumentTemplateDefinition;
  sources: LegalFormSourceOption[];
  sourceMode: "UNSPECIFIED" | "OFFICIAL_SOURCE" | "INTERNAL_STANDARD";
  selectedSourceId: string;
  selectedSourceProvider: string | null;
  selectedSourceUrl: string | null;
  selectedSourceHash: string | null;
  onChange: (patch: Partial<DocumentTemplateDefinition>) => void;
  onSourceModeChange: (mode: "UNSPECIFIED" | "OFFICIAL_SOURCE" | "INTERNAL_STANDARD") => void;
  onSourceIdChange: (sourceId: string) => void;
}>;

const DOC_TYPES: DocumentType[] = ["STATEMENT", "OPINION", "CONSULT_NOTE"];

export function DocumentTemplateMetaForm({
  definition,
  sources,
  sourceMode,
  selectedSourceId,
  selectedSourceProvider,
  selectedSourceUrl,
  selectedSourceHash,
  onChange,
  onSourceModeChange,
  onSourceIdChange,
}: Props) {
  const selectedSource = sources.find((item) => item.id === selectedSourceId) ?? null;
  let sourceSummary: ReactNode;

  if (selectedSource) {
    sourceSummary = (
      <>
        <div>
          <strong>선택된 출처:</strong> {formatLegalFormSourceLabel(selectedSource)}
        </div>
        <div>
          <strong>출처군:</strong> {LEGAL_FORM_SOURCE_PROVIDER_LABELS[selectedSource.provider]}
        </div>
        <div>
          <strong>URL:</strong> {selectedSource.sourceUrl}
        </div>
        <div>
          <strong>문서유형:</strong> {selectedSource.documentType}
        </div>
        <div>
          <strong>해시:</strong> {selectedSource.fileHash ?? "-"}
        </div>
      </>
    );
  } else if (sourceMode === "INTERNAL_STANDARD") {
    sourceSummary = (
      <div>
        <strong>내부표준:</strong> 공식서식 원천자료가 아직 연결되지 않은 템플릿입니다.
      </div>
    );
  } else {
    sourceSummary = (
      <div>
        <strong>현재 저장값:</strong> {selectedSourceProvider ?? "미지정"}
        {selectedSourceUrl ? ` · ${selectedSourceUrl}` : ""}
        {selectedSourceHash ? ` · ${selectedSourceHash}` : ""}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">기본 정보</h2>
      <p className="mt-1 text-xs text-gray-500">
        이 구역의 값은 「저장」할 때 정의 JSON에 함께 반영됩니다.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="template-meta-title" className="mb-1 block text-sm font-medium">
            제목
          </label>
          <input
            id="template-meta-title"
            value={definition.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="template-meta-type" className="mb-1 block text-sm font-medium">
            문서 타입
          </label>
          <select
            id="template-meta-type"
            value={definition.type}
            onChange={(e) => onChange({ type: e.target.value as DocumentType })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="template-meta-description" className="mb-1 block text-sm font-medium">
            설명
          </label>
          <input
            id="template-meta-description"
            value={definition.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="template-meta-code" className="mb-1 block text-sm font-medium">
            코드
          </label>
          <input
            id="template-meta-code"
            value={definition.code}
            onChange={(e) => onChange({ code: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="template-meta-version" className="mb-1 block text-sm font-medium">
            버전
          </label>
          <input
            id="template-meta-version"
            value={definition.version}
            onChange={(e) => onChange({ version: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="template-meta-source-mode" className="mb-1 block text-sm font-medium">
            출처 기준
          </label>
          <select
            id="template-meta-source-mode"
            value={sourceMode}
            onChange={(e) =>
              onSourceModeChange(
                e.target.value as "UNSPECIFIED" | "OFFICIAL_SOURCE" | "INTERNAL_STANDARD",
              )
            }
            className="w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="UNSPECIFIED">미지정</option>
            <option value="OFFICIAL_SOURCE">공식서식 소스 연결</option>
            <option value="INTERNAL_STANDARD">내부표준 템플릿</option>
          </select>
        </div>

        <div>
          <label htmlFor="template-meta-source-id" className="mb-1 block text-sm font-medium">
            공식서식 소스
          </label>
          <select
            id="template-meta-source-id"
            value={selectedSourceId}
            disabled={sourceMode !== "OFFICIAL_SOURCE"}
            onChange={(e) => onSourceIdChange(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm disabled:bg-gray-100"
          >
            <option value="">소스를 선택하세요</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {formatLegalFormSourceLabel(source)}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-700">
          {sourceSummary}
        </div>
      </div>
    </div>
  );
}
