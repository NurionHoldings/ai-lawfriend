"use client";

import type { QuestionSetDefinition } from "@/lib/definitions";
import { QuestionItemEditor } from "@/components/admin/question-item-editor";

type Section = QuestionSetDefinition["sections"][number];

type Props = {
  section: Section;
  documentTypes: QuestionSetDefinition["supportedDocumentTypes"];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (next: Section) => void;
  onRemove: () => void;
};

export function QuestionSetSectionEditor({
  section,
  documentTypes,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onChange,
  onRemove,
}: Props) {
  function addQuestion() {
    onChange({
      ...section,
      questions: [
        ...section.questions,
        {
          key: `question_${section.questions.length + 1}`,
          title: `새 질문 ${section.questions.length + 1}`,
          description: "",
          inputType: "SHORT_TEXT",
          category: "BASIC_INFO",
          required: false,
          order: section.questions.length,
          visibility: "ALL",
          placeholder: "",
          helpText: "",
          options: [],
          conditions: [],
          paragraphMappings: [],
          tags: [],
        },
      ],
    });
  }

  function updateQuestionByKey(questionKey: string, nextQuestion: Section["questions"][number]) {
    const idx = section.questions.findIndex((q) => q.key === questionKey);
    if (idx < 0) return;
    onChange({
      ...section,
      questions: section.questions.map((q, i) => (i === idx ? nextQuestion : q)),
    });
  }

  function removeQuestionByKey(questionKey: string) {
    onChange({
      ...section,
      questions: section.questions
        .filter((q) => q.key !== questionKey)
        .map((q, i) => ({
          ...q,
          order: i,
        })),
    });
  }

  function moveQuestion(questionKey: string, delta: number) {
    const sorted = [...section.questions].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((q) => q.key === questionKey);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= sorted.length) return;
    const a = sorted[i];
    const b = sorted[j];
    onChange({
      ...section,
      questions: section.questions.map((q) => {
        if (q.key === a.key) return { ...q, order: b.order };
        if (q.key === b.key) return { ...q, order: a.order };
        return q;
      }),
    });
  }

  const sortedQuestions = [...section.questions].sort((a, b) => a.order - b.order);

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
          <input
            value={section.description ?? ""}
            onChange={(e) => onChange({ ...section, description: e.target.value })}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="section description"
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
          <button type="button" onClick={addQuestion} className="rounded-xl border px-4 py-2 text-sm font-medium">
            질문 추가
          </button>
          <button type="button" onClick={onRemove} className="rounded-xl border px-4 py-2 text-sm font-medium">
            섹션 삭제
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {section.questions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-gray-500">
            이 섹션에 질문이 없습니다.
          </div>
        ) : (
          sortedQuestions.map((question, qi) => (
            <QuestionItemEditor
              key={question.key}
              question={question}
              documentTypes={documentTypes}
              canMoveUp={qi > 0}
              canMoveDown={qi < sortedQuestions.length - 1}
              onMoveUp={() => moveQuestion(question.key, -1)}
              onMoveDown={() => moveQuestion(question.key, 1)}
              onChange={(next) => updateQuestionByKey(question.key, next)}
              onRemove={() => removeQuestionByKey(question.key)}
            />
          ))
        )}
      </div>
    </div>
  );
}
