"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type RelatedAuditLog = {
  id: string;
  action: string;
  createdAt: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
};

type Props = {
  eventId: string | null;
};

export function RelatedAuditLogsPanel({ eventId }: Props) {
  const [items, setItems] = useState<RelatedAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchItems = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `/api/admin/alert-events/${eventId}/related-audit-logs`,
        { cache: "no-store" }
      );
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "관련 로그 조회 실패");
      setItems((data.items as RelatedAuditLog[] | undefined) ?? []);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">관련 감사로그 묶음</div>
        <button
          type="button"
          onClick={() => void fetchItems()}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
        >
          새로고침
        </button>
      </div>

      {loading ? <div className="text-sm text-zinc-500">불러오는 중...</div> : null}
      {message ? <div className="text-sm text-red-600">{message}</div> : null}

      {!loading && !message ? (
        <div className="space-y-2">
          {items.length > 0 ? (
            items.map((log) => (
              <div key={log.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium">
                    {log.action}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-2 grid gap-2 text-xs text-zinc-600 md:grid-cols-3">
                  <div>로그 ID: {log.id}</div>
                  <div>행위자: {log.actorUserId ?? "-"}</div>
                  <div>
                    엔티티: {log.entityType ?? "-"} / {log.entityId ?? "-"}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/audit-logs?highlight=${encodeURIComponent(log.id)}`}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                  >
                    감사로그로 이동
                  </Link>

                  {log.entityType === "CASE" && log.entityId ? (
                    <Link
                      href={`/cases/${log.entityId}`}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                    >
                      사건 상세로 이동
                    </Link>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-zinc-500">
              관련 감사로그가 없습니다.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
