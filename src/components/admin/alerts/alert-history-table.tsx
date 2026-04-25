"use client";

import { useCallback, useEffect, useState } from "react";
import { SeverityBadge } from "./severity-badge";
import { StatusBadge } from "./status-badge";
import { AlertDetailModal } from "./alert-detail-modal";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Item = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  detectedAt: string;
  entityType: string | null;
  entityId: string | null;
  actorUser: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
  rule: {
    id: string;
    name: string;
    code: string;
  } | null;
};

export function AlertHistoryTable() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (severity) params.set("severity", severity);
      if (q) params.set("q", q);

      const res = await fetch(`/api/admin/alert-events?${params.toString()}`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "조회 실패");
      setItems((data.items as Item[] | undefined) ?? []);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [status, severity, q]);

  useEffect(() => {
    void fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function scanNow() {
    try {
      const res = await fetch("/api/admin/alert-events/scan", { method: "POST" });
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "스캔 실패");
      const result = data.result as { createdAlertCount?: number } | undefined;
      await fetchItems();
      alert(`스캔 완료: 신규 생성 ${Number(result?.createdAlertCount ?? 0)}건`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  }

  async function updateStatus(
    id: string,
    nextStatus: "ACKNOWLEDGED" | "IGNORED" | "RESOLVED"
  ) {
    try {
      const res = await fetch(`/api/admin/alert-events/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const raw = await res.json().catch(() => null);
      requireOkResponseBody(res, raw, "상태 변경 실패");
      await fetchItems();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  }

  function openDetail(eventId: string) {
    setSelectedEventId(eventId);
    setDetailOpen(true);
  }

  return (
    <>
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">경고 이력</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchItems()}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={scanNow}
              className="rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white"
            >
              지금 스캔
            </button>
          </div>
        </div>

        <div className="mb-4 grid gap-2 md:grid-cols-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목/메시지/엔티티 검색"
            className="rounded-xl border px-3 py-2"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border px-3 py-2"
          >
            <option value="">전체 상태</option>
            <option value="OPEN">OPEN</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="IGNORED">IGNORED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-xl border px-3 py-2"
          >
            <option value="">전체 심각도</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
          <button
            type="button"
            onClick={() => void fetchItems()}
            className="rounded-xl border px-3 py-2 text-sm font-medium"
          >
            필터 적용
          </button>
        </div>

        {loading ? <div>불러오는 중...</div> : null}
        {message ? <div className="text-red-600">{message}</div> : null}

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => openDetail(item.id)}
                  className="text-left font-semibold hover:underline"
                >
                  {item.title}
                </button>
                <SeverityBadge severity={item.severity} />
                <StatusBadge status={item.status} />
                {item.rule ? (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs">
                    {item.rule.code}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 text-sm text-zinc-700">{item.message}</div>

              <div className="mt-3 grid gap-2 text-xs text-zinc-500 md:grid-cols-4">
                <div>감지시각: {new Date(item.detectedAt).toLocaleString()}</div>
                <div>행위자: {item.actorUser?.name ?? item.actorUser?.email ?? "-"}</div>
                <div>
                  엔티티: {item.entityType ?? "-"} / {item.entityId ?? "-"}
                </div>
                <div>규칙명: {item.rule?.name ?? "-"}</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openDetail(item.id)}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  상세보기
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(item.id, "ACKNOWLEDGED")}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  확인
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(item.id, "IGNORED")}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  무시
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(item.id, "RESOLVED")}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  해결
                </button>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-zinc-500">
              표시할 경고 이력이 없습니다.
            </div>
          ) : null}
        </div>
      </div>

      <AlertDetailModal
        eventId={selectedEventId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onChanged={fetchItems}
      />
    </>
  );
}
