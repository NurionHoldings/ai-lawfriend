"use client";

import type { QuestionDefinition, QuestionSetDefinition } from "@/lib/definitions";
import { QuestionConditionEditor } from "@/components/admin/question-condition-editor";
import { QuestionParagraphMappingEditor } from "@/components/admin/question-paragraph-mapping-editor";

type Question = QuestionDefinition;

type Props = {
  question: Question;
  documentTypes: QuestionSetDefinition["supportedDocumentTypes"];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (next: Question) => void;
  onRemove: () => void;
};

const INPUT_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "NUMBER",
  "DATE",
  "DATETIME",
  "BOOLEAN",
  "FILE",
] as const;

const CATEGORIES = [
  "BASIC_INFO",
  "CASE_FACT",
  "TIMELINE",
  "EVIDENCE",
  "DAMAGE",
  "REQUEST",
  "DEFENSE",
  "OTHER",
] as const;

const VISIBILITY = [
  "ALL",
  "ADMIN_ONLY",
  "LAWYER_ONLY",
  "STAFF_ONLY",
  "CLIENT_ONLY",
] as const;

export function QuestionItemEditor({
  question,
  documentTypes,
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
            value={question.key}
            onChange={(e) => onChange({ ...question, key: e.target.value })}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="question key"
          />
          <input
            value={question.title}
            onChange={(e) => onChange({ ...question, title: e.target.value })}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="question title"
          />

          <select
            value={question.inputType}
            onChange={(e) =>
              onChange({ ...question, inputType: e.target.value as Question["inputType"] })
            }
            className="rounded-xl border px-3 py-2 text-sm"
          >
            {INPUT_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={question.category}
            onChange={(e) =>
              onChange({ ...question, category: e.target.value as Question["category"] })
            }
            className="rounded-xl border px-3 py-2 text-sm"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={question.visibility}
            onChange={(e) =>
              onChange({ ...question, visibility: e.target.value as Question["visibility"] })
            }
            className="rounded-xl border px-3 py-2 text-sm"
          >
            {VISIBILITY.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
            />
            <span>필수 질문</span>
          </label>
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
          <button type="button" onClick={onRemove} className="rounded-xl border px-4 py-2 text-sm font-medium">
            질문 삭제
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <input
          value={question.description ?? ""}
          onChange={(e) => onChange({ ...question, description: e.target.value })}
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder="description"
        />
        <input
          value={question.placeholder ?? ""}
          onChange={(e) => onChange({ ...question, placeholder: e.target.value })}
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder="placeholder"
        />
        <input
          value={question.helpText ?? ""}
          onChange={(e) => onChange({ ...question, helpText: e.target.value })}
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder="helpText"
        />
        <input
          value={question.tags.join(", ")}
          onChange={(e) =>
            onChange({
              ...question,
              tags: e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            })
          }
          className="rounded-xl border px-3 py-2 text-sm"
          placeholder="tags comma separated"
        />
      </div>

      {(question.inputType === "SINGLE_SELECT" || question.inputType === "MULTI_SELECT") && (
        <div className="mt-4 rounded-xl border p-4">
          <div className="mb-2 text-sm font-semibold">선택 옵션</div>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={`${option.value}-${index}`} className="grid gap-2 lg:grid-cols-3">
                <input
                  value={option.value}
                  onChange={(e) => {
                    const next = [...question.options];
                    next[index] = { ...next[index], value: e.target.value };
                    onChange({ ...question, options: next });
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
                  placeholder="value"
                />
                <input
                  value={option.label}
                  onChange={(e) => {
                    const next = [...question.options];
                    next[index] = { ...next[index], label: e.target.value };
                    onChange({ ...question, options: next });
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
                  placeholder="label"
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...question,
                      options: question.options.filter((_, i) => i !== index),
                    });
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  옵션 삭제
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                onChange({
                  ...question,
                  options: [
                    ...question.options,
                    {
                      value: `option_${question.options.length + 1}`,
                      label: `옵션 ${question.options.length + 1}`,
                    },
                  ],
                })
              }
              className="rounded-xl border px-3 py-2 text-sm"
            >
              옵션 추가
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <QuestionConditionEditor
          conditions={question.conditions}
          onChange={(conditions) => onChange({ ...question, conditions })}
        />

        <QuestionParagraphMappingEditor
          documentTypes={documentTypes}
          mappings={question.paragraphMappings}
          onChange={(paragraphMappings) => onChange({ ...question, paragraphMappings })}
        />
      </div>
    </div>
  );
}
