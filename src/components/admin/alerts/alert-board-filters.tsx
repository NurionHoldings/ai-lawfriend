"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RuleOption = { code: string; name: string };
type UserOption = { id: string; name: string };

type Props = {
  rules: RuleOption[];
  users: UserOption[];
};

export function AlertBoardFilters({ rules, users }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());

    if (!value || value === "ALL") {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          defaultValue={searchParams.get("severity") || "ALL"}
          onChange={(e) => updateParam("severity", e.target.value)}
        >
          <option value="ALL">전체 심각도</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>

        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          defaultValue={searchParams.get("ruleCode") || "ALL"}
          onChange={(e) => updateParam("ruleCode", e.target.value)}
        >
          <option value="ALL">전체 규칙</option>
          {rules.map((r) => (
            <option key={r.code} value={r.code}>
              {r.code} · {r.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          defaultValue={searchParams.get("escalationLevel") || "ALL"}
          onChange={(e) => updateParam("escalationLevel", e.target.value)}
        >
          <option value="ALL">전체 에스컬레이션</option>
          <option value="0">L0</option>
          <option value="1">L1</option>
          <option value="2">L2</option>
          <option value="3">L3</option>
        </select>

        <select
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          defaultValue={searchParams.get("assigneeUserId") || "ALL"}
          onChange={(e) => updateParam("assigneeUserId", e.target.value)}
        >
          <option value="ALL">전체 담당자</option>
          <option value="unassigned">미배정</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          defaultValue={searchParams.get("dueFrom") || ""}
          onChange={(e) => updateParam("dueFrom", e.target.value)}
        />

        <input
          type="date"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          defaultValue={searchParams.get("dueTo") || ""}
          onChange={(e) => updateParam("dueTo", e.target.value)}
        />
      </div>

      <div className="mt-3">
        <input
          key={searchParams.get("q") ?? ""}
          type="search"
          placeholder="제목·메시지·사건 제목 검색 (입력 후 포커스 해제 시 적용)"
          defaultValue={searchParams.get("q") || ""}
          onBlur={(e) => updateParam("q", e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
        />
      </div>
    </div>
  );
}
