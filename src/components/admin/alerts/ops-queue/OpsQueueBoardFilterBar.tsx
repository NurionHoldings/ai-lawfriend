"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type AssigneeOption = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type Props = {
  taxonomyOptions: string[];
  assigneeOptions: AssigneeOption[];
  onApply: (params: URLSearchParams) => void;
};

function readIncludeDone(sp: URLSearchParams): boolean {
  const v = sp.get("includeDone");
  if (v === "true") return true;
  if (v === "false") return false;
  return sp.get("onlyOpen") !== "true";
}

export function OpsQueueBoardFilterBar({
  taxonomyOptions,
  assigneeOptions,
  onApply,
}: Props) {
  const sp = useSearchParams();

  const [assigneeId, setAssigneeId] = useState(() => sp.get("assigneeId") ?? "");
  const [priority, setPriority] = useState(() => sp.get("priority") ?? "");
  const [taxonomy, setTaxonomy] = useState(() => sp.get("taxonomy") ?? "");
  const [q, setQ] = useState(() => sp.get("q") ?? "");
  const [overdueOnly, setOverdueOnly] = useState(() => sp.get("overdueOnly") === "true");
  const [includeDone, setIncludeDone] = useState(() => readIncludeDone(sp));

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (assigneeId) p.set("assigneeId", assigneeId);
    if (priority) p.set("priority", priority);
    if (taxonomy) p.set("taxonomy", taxonomy);
    if (q) p.set("q", q);
    if (overdueOnly) p.set("overdueOnly", "true");
    p.set("includeDone", includeDone ? "true" : "false");
    return p;
  }, [assigneeId, priority, taxonomy, q, overdueOnly, includeDone]);

  function reset() {
    setAssigneeId("");
    setPriority("");
    setTaxonomy("");
    setQ("");
    setOverdueOnly(false);
    setIncludeDone(true);
    onApply(new URLSearchParams());
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목/설명 검색"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        />

        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        >
          <option value="">전체 담당자</option>
          {assigneeOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name ?? a.email ?? a.id}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        >
          <option value="">전체 우선순위</option>
          <option value="LOW">LOW</option>
          <option value="NORMAL">NORMAL</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>

        <select
          value={taxonomy}
          onChange={(e) => setTaxonomy(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        >
          <option value="">전체 taxonomy</option>
          {taxonomyOptions.map((taxonomyValue) => (
            <option key={taxonomyValue} value={taxonomyValue}>
              {taxonomyValue}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
          />
          overdue만
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={includeDone}
            onChange={(e) => setIncludeDone(e.target.checked)}
          />
          완료 포함
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onApply(params)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          필터 적용
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
