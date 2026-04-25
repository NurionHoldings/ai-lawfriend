"use client";

import type { DocumentTemplateDefinition, ParagraphGenerationMode } from "@/lib/definitions";
import { ParagraphGenerationModeEnum } from "@/lib/definitions";

type Paragraph = DocumentTemplateDefinition["sections"][number]["paragraphs"][number];

type Props = {
  paragraph: Paragraph;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (next: Paragraph) => void;
  onRemove: () => void;
};

const GENERATION_MODES = ParagraphGenerationModeEnum.options;

export function DocumentTemplateParagraphEditor({
  paragraph,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onChange,
  onRemove,
}: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid flex-1 gap-3 lg:grid-cols-2">
          <input
            value={paragraph.key}
            onChange={(e) => onChange({ ...paragraph, key: e.target.value })}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="paragraph key"
          />
          <input
            value={paragraph.title}
            onChange={(e) => onChange({ ...paragraph, title: e.target.value })}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="paragraph title"
          />

          <select
            value={paragraph.generationMode}
            onChange={(e) =>
              onChange({ ...paragraph, generationMode: e.target.value as ParagraphGenerationMode })
            }
            className="rounded-xl border px-3 py-2 text-sm"
          >
            {GENERATION_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>

          <input
            value={paragraph.aiPromptKey ?? ""}
            onChange={(e) => onChange({ ...paragraph, aiPromptKey: e.target.value })}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="aiPromptKey"
          />
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
            onClick={onRemove}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
            title="이 문단을 편집 트리에서 제거합니다. 서버에는 「저장」 후 반영됩니다."
          >
            문단 삭제
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium">Fallback Text</label>
        <textarea
          value={paragraph.fallbackText ?? ""}
          onChange={(e) => onChange({ ...paragraph, fallbackText: e.target.value })}
          rows={4}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          placeholder="기본 대체 텍스트"
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={paragraph.required}
            onChange={(e) => onChange({ ...paragraph, required: e.target.checked })}
          />
          <span>필수 문단</span>
        </label>

        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={paragraph.supportsRegeneration}
            onChange={(e) =>
              onChange({ ...paragraph, supportsRegeneration: e.target.checked })
            }
          />
          <span>재생성 지원</span>
        </label>

        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={paragraph.supportsRestore}
            onChange={(e) => onChange({ ...paragraph, supportsRestore: e.target.checked })}
          />
          <span>복원 지원</span>
        </label>

        <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={paragraph.lockOnApproval}
            onChange={(e) => onChange({ ...paragraph, lockOnApproval: e.target.checked })}
          />
          <span>승인 시 잠금</span>
        </label>
      </div>
    </div>
  );
}
