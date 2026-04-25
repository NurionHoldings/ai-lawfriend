"use client";

import { useCallback, useEffect, useState } from "react";
import { readJsonApiErrorMessage, requireOkResponseBody } from "@/lib/client/api-error";
import { SeverityBadge } from "./severity-badge";
import { AlertRuleEscalationTargetForm } from "./alert-rule-escalation-target-form";
import { AlertRuleSlaForm } from "./alert-rule-sla-form";

type Rule = {
  id: string;
  name: string;
  code: string;
  type: "ROLE_SPIKE" | "NIGHT_ACTIVITY" | "ACTION_POLICY";
  severity: "INFO" | "WARNING" | "CRITICAL";
  enabled: boolean;
  description: string | null;
  configJson: unknown;
  createdAt: string;
  slaHours: number | null;
  dueSoonHours: number | null;
  escalationLevel1Hours: number | null;
  escalationLevel2Hours: number | null;
  escalationLevel3Hours: number | null;
  escalationTargetGroups?: Array<"ADMINS" | "LAWYERS" | "ASSIGNEE" | "CUSTOM_USERS">;
  escalationUserIdsJson?: unknown;
};

export function AlertRuleList() {
  const [items, setItems] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alert-rules");
      const raw = await res.json().catch(() => null);
      const body = requireOkResponseBody(res, raw, "조회 실패");
      const list = body.rules;
      setItems(Array.isArray(list) ? (list as Rule[]) : []);
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : readJsonApiErrorMessage(null, "오류가 발생했습니다."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRules();
  }, [fetchRules]);

  async function toggleEnabled(rule: Rule) {
    try {
      const res = await fetch(`/api/admin/alert-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !rule.enabled }),
      });
      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "수정 실패");
      await fetchRules();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  }

  if (loading) return <div className="rounded-2xl border bg-white p-5">불러오는 중...</div>;
  if (message)
    return <div className="rounded-2xl border bg-white p-5 text-red-600">{message}</div>;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">등록된 규칙</h2>
        <button
          type="button"
          onClick={() => void fetchRules()}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
        >
          새로고침
        </button>
      </div>

      <div className="space-y-4">
        {items.map((rule) => (
          <div key={rule.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold text-slate-900">{rule.name}</div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{rule.code}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">{rule.type}</span>
              <SeverityBadge severity={rule.severity} />
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${rule.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
              >
                {rule.enabled ? "활성" : "비활성"}
              </span>
            </div>

            {rule.description ? (
              <div className="mt-2 text-sm text-slate-600">{rule.description}</div>
            ) : null}

            <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs">
              {JSON.stringify(rule.configJson, null, 2)}
            </pre>

            <div className="mt-3 text-xs text-slate-500">
              SLA {rule.slaHours ?? "-"}h / Due Soon {rule.dueSoonHours ?? "-"}h / Esc L1{" "}
              {rule.escalationLevel1Hours ?? "-"} / L2 {rule.escalationLevel2Hours ?? "-"} / L3{" "}
              {rule.escalationLevel3Hours ?? "-"}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => toggleEnabled(rule)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium"
              >
                {rule.enabled ? "비활성화" : "활성화"}
              </button>
            </div>

            <div className="mt-4">
              <AlertRuleSlaForm rule={rule} onSaved={fetchRules} />
            </div>

            <div className="mt-4">
              <AlertRuleEscalationTargetForm rule={rule} onSaved={fetchRules} />
            </div>
          </div>
        ))}

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            등록된 규칙이 없습니다.
          </div>
        ) : null}
      </div>
    </div>
  );
}
