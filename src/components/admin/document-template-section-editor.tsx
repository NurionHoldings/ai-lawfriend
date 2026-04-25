"use client";

import type { DocumentTemplateDefinition } from "@/lib/definitions";
import { DocumentTemplateParagraphEditor } from "@/components/admin/document-template-paragraph-editor";

type Section = DocumentTemplateDefinition["sections"][number];

type Props = {
  section: Section;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (next: Section) => void;
  onRemove: () => void;
};

const SECTION_TYPES = ["HEADER", "BODY", "FOOTER", "SIGNATURE", "ATTACHMENT_GUIDE"] as const;

export function DocumentTemplateSectionEditor({
  section,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onChange,
  onRemove,
}: Props) {
  function addParagraph() {
    onChange({
      ...section,
      paragraphs: [
        ...section.paragraphs,
        {
          key: `paragraph_${section.paragraphs.length + 1}`,
          title: `새 문단 ${section.paragraphs.length + 1}`,
          order: section.paragraphs.length,
          required: false,
          generationMode: "AI_GENERATE",
          aiPromptKey: "",
          fallbackText: "",
          supportsRegeneration: true,
          supportsRestore: true,
          lockOnApproval: true,
        },
      ],
    });
  }

  function updateParagraphByKey(paragraphKey: string, nextParagraph: Section["paragraphs"][number]) {
    const idx = section.paragraphs.findIndex((p) => p.key === paragraphKey);
    if (idx < 0) return;
    onChange({
      ...section,
      paragraphs: section.paragraphs.map((p, i) => (i === idx ? nextParagraph : p)),
    });
  }

  function removeParagraphByKey(paragraphKey: string) {
    onChange({
      ...section,
      paragraphs: section.paragraphs
        .filter((p) => p.key !== paragraphKey)
        .map((p, i) => ({
          ...p,
          order: i,
        })),
    });
  }

  function moveParagraph(paragraphKey: string, delta: number) {
    const sorted = [...section.paragraphs].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((p) => p.key === paragraphKey);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= sorted.length) return;
    const a = sorted[i];
    const b = sorted[j];
    onChange({
      ...section,
      paragraphs: section.paragraphs.map((p) => {
        if (p.key === a.key) return { ...p, order: b.order };
        if (p.key === b.key) return { ...p, order: a.order };
        return p;
      }),
    });
  }

  const sortedParagraphs = [...section.paragraphs].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid flex-1 gap-3 lg:grid-cols-3">
          <input
            value={section.key}
            onChange={(e) => onChange({ ...section, key: e.target.value })}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="section key"
          />
          <input
            value={section.title}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="section title"
          />
          <select
            value={section.type}
            onChange={(e) =>
              onChange({ ...section, type: e.target.value as Section["type"] })
            }
            className="rounded-xl border px-3 py-2 text-sm"
          >
            {SECTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-40"
            title="위로"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="rounded-xl border px-3 py-2 text-sm font-medium disabled:opacity-40"
            title="아래로"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={addParagraph}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
            title="이 섹션에 문단을 넣습니다. 서버에는 「저장」 후 반영됩니다."
          >
            문단 추가
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
            title="편집 화면에서 이 섹션을 빼는 단계입니다. 서버·게시 검사에는 「저장」 후 반영됩니다."
          >
            섹션 삭제
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {section.paragraphs.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-gray-500">
            이 섹션에 문단이 없습니다.
            <span className="mt-1 block text-xs text-gray-400">
              문단을 추가한 뒤 상단 「저장」해야 게시 검사에 포함됩니다.
            </span>
          </div>
        ) : (
          sortedParagraphs.map((paragraph, pi) => (
            <DocumentTemplateParagraphEditor
              key={paragraph.key}
              paragraph={paragraph}
              canMoveUp={pi > 0}
              canMoveDown={pi < sortedParagraphs.length - 1}
              onMoveUp={() => moveParagraph(paragraph.key, -1)}
              onMoveDown={() => moveParagraph(paragraph.key, 1)}
              onChange={(next) => updateParagraphByKey(paragraph.key, next)}
              onRemove={() => removeParagraphByKey(paragraph.key)}
            />
          ))
        )}
      </div>
    </div>
  );
}
