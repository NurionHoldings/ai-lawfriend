"use client";

import type { DocumentType, ParagraphMapping, QuestionSetDefinition } from "@/lib/definitions";

type Props = {
  documentTypes: QuestionSetDefinition["supportedDocumentTypes"];
  mappings: ParagraphMapping[];
  onChange: (next: ParagraphMapping[]) => void;
};

const TRANSFORMS = [
  "RAW",
  "JOIN_LINES",
  "DATE_RANGE_SUMMARY",
  "TIMELINE_SUMMARY",
  "BULLET_LIST",
] as const satisfies readonly ParagraphMapping["transform"][];

export function QuestionParagraphMappingEditor({ documentTypes, mappings, onChange }: Props) {
  const docOptions: DocumentType[] =
    documentTypes.length > 0 ? [...documentTypes] : ["STATEMENT"];

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">문단 매핑</div>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...mappings,
              {
                documentType: docOptions[0],
                templateSectionKey: "",
                paragraphKey: "",
                weight: 1,
                required: false,
                transform: "RAW",
              },
            ])
          }
          className="rounded-lg border px-3 py-1.5 text-xs font-medium"
        >
          매핑 추가
        </button>
      </div>

      <div className="space-y-3">
        {mappings.length === 0 ? (
          <div className="text-sm text-gray-500">매핑 없음</div>
        ) : (
          mappings.map((mapping, index) => (
            <div key={index} className="space-y-2 rounded-xl border p-3">
              <div className="grid gap-2 lg:grid-cols-2">
                <select
                  value={mapping.documentType}
                  onChange={(e) => {
                    const next = [...mappings];
                    next[index] = {
                      ...next[index],
                      documentType: e.target.value as DocumentType,
                    };
                    onChange(next);
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  {docOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={mapping.transform}
                  onChange={(e) => {
                    const next = [...mappings];
                    next[index] = {
                      ...next[index],
                      transform: e.target.value as ParagraphMapping["transform"],
                    };
                    onChange(next);
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  {TRANSFORMS.map((transform) => (
                    <option key={transform} value={transform}>
                      {transform}
                    </option>
                  ))}
                </select>

                <input
                  value={mapping.templateSectionKey}
                  onChange={(e) => {
                    const next = [...mappings];
                    next[index] = {
                      ...next[index],
                      templateSectionKey: e.target.value,
                    };
                    onChange(next);
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
                  placeholder="templateSectionKey"
                />

                <input
                  value={mapping.paragraphKey}
                  onChange={(e) => {
                    const next = [...mappings];
                    next[index] = {
                      ...next[index],
                      paragraphKey: e.target.value,
                    };
                    onChange(next);
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
                  placeholder="paragraphKey"
                />

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={mapping.weight}
                  onChange={(e) => {
                    const next = [...mappings];
                    next[index] = {
                      ...next[index],
                      weight: Number(e.target.value),
                    };
                    onChange(next);
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
                  placeholder="weight"
                />

                <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={mapping.required}
                    onChange={(e) => {
                      const next = [...mappings];
                      next[index] = {
                        ...next[index],
                        required: e.target.checked,
                      };
                      onChange(next);
                    }}
                  />
                  <span>필수 매핑</span>
                </label>
              </div>

              <button
                type="button"
                onClick={() => onChange(mappings.filter((_, i) => i !== index))}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                매핑 삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
