"use client";

import { useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Rule = {
  id: string;
  name: string;
  code: string;
  slaHours: number | null;
  dueSoonHours: number | null;
  escalationLevel1Hours: number | null;
  escalationLevel2Hours: number | null;
  escalationLevel3Hours: number | null;
};

type Props = {
  rule: Rule;
  onSaved?: () => void;
};

export function AlertRuleSlaForm({ rule, onSaved }: Props) {
  const [slaHours, setSlaHours] = useState(rule.slaHours?.toString() ?? "");
  const [dueSoonHours, setDueSoonHours] = useState(rule.dueSoonHours?.toString() ?? "24");
  const [l1, setL1] = useState(rule.escalationLevel1Hours?.toString() ?? "");
  const [l2, setL2] = useState(rule.escalationLevel2Hours?.toString() ?? "");
  const [l3, setL3] = useState(rule.escalationLevel3Hours?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/alert-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slaHours: slaHours ? Number(slaHours) : null,
          dueSoonHours: dueSoonHours ? Number(dueSoonHours) : null,
          escalationLevel1Hours: l1 ? Number(l1) : null,
          escalationLevel2Hours: l2 ? Number(l2) : null,
          escalationLevel3Hours: l3 ? Number(l3) : null,
        }),
      });

      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "SLA 설정 저장 실패");
      onSaved?.();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">SLA / 에스컬레이션 설정</div>

      <div className="grid gap-3 md:grid-cols-5">
        <input
          value={slaHours}
          onChange={(e) => setSlaHours(e.target.value)}
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="SLA 시간"
        />
        <input
          value={dueSoonHours}
          onChange={(e) => setDueSoonHours(e.target.value)}
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="임박 기준"
        />
        <input
          value={l1}
          onChange={(e) => setL1(e.target.value)}
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="L1(시간)"
        />
        <input
          value={l2}
          onChange={(e) => setL2(e.target.value)}
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="L2(시간)"
        />
        <input
          value={l3}
          onChange={(e) => setL3(e.target.value)}
          type="number"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="L3(시간)"
        />
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={loading}
        className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "저장 중..." : "SLA 저장"}
      </button>
    </div>
  );
}
