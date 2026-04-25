"use client";

import type { ConditionOperator, QuestionCondition } from "@/lib/definitions";
import { ConditionOperatorEnum } from "@/lib/definitions";

type Props = {
  conditions: QuestionCondition[];
  onChange: (next: QuestionCondition[]) => void;
};

const OPERATORS = ConditionOperatorEnum.options;

export function QuestionConditionEditor({ conditions, onChange }: Props) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">조건 분기</div>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...conditions,
              {
                sourceQuestionKey: "",
                operator: "EQ",
                value: "",
              },
            ])
          }
          className="rounded-lg border px-3 py-1.5 text-xs font-medium"
        >
          조건 추가
        </button>
      </div>

      <div className="space-y-3">
        {conditions.length === 0 ? (
          <div className="text-sm text-gray-500">조건 없음</div>
        ) : (
          conditions.map((condition, index) => (
            <div key={index} className="grid gap-2 lg:grid-cols-[1fr_180px_1fr_100px]">
              <input
                value={condition.sourceQuestionKey}
                onChange={(e) => {
                  const next = [...conditions];
                  next[index] = { ...next[index], sourceQuestionKey: e.target.value };
                  onChange(next);
                }}
                className="rounded-xl border px-3 py-2 text-sm"
                placeholder="sourceQuestionKey"
              />

              <select
                value={condition.operator}
                onChange={(e) => {
                  const next = [...conditions];
                  next[index] = {
                    ...next[index],
                    operator: e.target.value as ConditionOperator,
                  };
                  onChange(next);
                }}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                {OPERATORS.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>

              <input
                value={String(condition.value ?? "")}
                onChange={(e) => {
                  const next = [...conditions];
                  next[index] = { ...next[index], value: e.target.value };
                  onChange(next);
                }}
                className="rounded-xl border px-3 py-2 text-sm"
                placeholder="value"
              />

              <button
                type="button"
                onClick={() => onChange(conditions.filter((_, i) => i !== index))}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
