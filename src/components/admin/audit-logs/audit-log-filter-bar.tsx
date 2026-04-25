"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuditLogFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(
    () => searchParams.get("q") ?? searchParams.get("search") ?? ""
  );
  const [actorUserId, setActorUserId] = useState(
    () => searchParams.get("actorUserId") ?? ""
  );
  const [entityType, setEntityType] = useState(
    () => searchParams.get("entityType") ?? ""
  );
  const [entityId, setEntityId] = useState(
    () => searchParams.get("entityId") ?? ""
  );
  const [action, setAction] = useState(() => searchParams.get("action") ?? "");

  function apply() {
    const next = new URLSearchParams(searchParams.toString());

    const setOrDelete = (key: string, value: string) => {
      if (value.trim()) next.set(key, value.trim());
      else next.delete(key);
    };

    setOrDelete("q", q);
    next.delete("search");
    setOrDelete("actorUserId", actorUserId);
    setOrDelete("entityType", entityType);
    setOrDelete("entityId", entityId);
    setOrDelete("action", action);
    next.delete("page");

    router.push(`/admin/audit-logs?${next.toString()}`);
  }

  function reset() {
    router.push("/admin/audit-logs");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="통합 검색 (q)"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={actorUserId}
          onChange={(e) => setActorUserId(e.target.value)}
          placeholder="actorUserId"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          placeholder="entityType"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="entityId"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="action"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={apply}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          필터 적용
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
