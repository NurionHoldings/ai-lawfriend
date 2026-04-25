"use client";

import type { DocumentTemplateDefinition, DocumentType } from "@/lib/definitions";

type Props = {
  definition: DocumentTemplateDefinition;
  onChange: (patch: Partial<DocumentTemplateDefinition>) => void;
};

const DOC_TYPES: DocumentType[] = ["STATEMENT", "OPINION", "CONSULT_NOTE"];

export function DocumentTemplateMetaForm({ definition, onChange }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">기본 정보</h2>
      <p className="mt-1 text-xs text-gray-500">
        이 구역의 값은 「저장」할 때 정의 JSON에 함께 반영됩니다.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">제목</label>
          <input
            value={definition.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">문서 타입</label>
          <select
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
          <label className="mb-1 block text-sm font-medium">설명</label>
          <input
            value={definition.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">코드</label>
          <input
            value={definition.code}
            onChange={(e) => onChange({ code: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">버전</label>
          <input
            value={definition.version}
            onChange={(e) => onChange({ version: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
