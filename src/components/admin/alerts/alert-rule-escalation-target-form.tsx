"use client";

import { useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

const GROUPS = ["ADMINS", "LAWYERS", "ASSIGNEE", "CUSTOM_USERS"] as const;

type Group = (typeof GROUPS)[number];

type Rule = {
  id: string;
  escalationTargetGroups?: Group[];
  escalationUserIdsJson?: unknown;
};

function parseCustomIds(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string");
  }
  return [];
}

export function AlertRuleEscalationTargetForm({
  rule,
  onSaved,
}: {
  rule: Rule;
  onSaved?: () => void;
}) {
  const [groups, setGroups] = useState<Group[]>(
    rule.escalationTargetGroups?.length ? rule.escalationTargetGroups : ["ADMINS"]
  );
  const [customUserIds, setCustomUserIds] = useState(
    parseCustomIds(rule.escalationUserIdsJson).join(", ")
  );
  const [loading, setLoading] = useState(false);

  function toggleGroup(group: Group) {
    setGroups((prev) =>
      prev.includes(group) ? prev.filter((x) => x !== group) : [...prev, group]
    );
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/alert-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalationTargetGroups: groups.length ? groups : ["ADMINS"],
          escalationUserIdsJson: customUserIds
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        }),
      });

      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "에스컬레이션 대상 저장 실패");
      onSaved?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">에스컬레이션 대상 그룹</div>

      <div className="flex flex-wrap gap-2">
        {GROUPS.map((group) => (
          <label
            key={group}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${
              groups.includes(group) ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={groups.includes(group)}
              onChange={() => toggleGroup(group)}
              className="sr-only"
            />
            {group}
          </label>
        ))}
      </div>

      <div className="mt-3">
        <textarea
          value={customUserIds}
          onChange={(e) => setCustomUserIds(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
          placeholder="CUSTOM_USERS 선택 시 userId를 쉼표로 구분해서 입력"
        />
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={loading}
        className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "저장 중..." : "에스컬레이션 대상 저장"}
      </button>
    </div>
  );
}
