"use client";

import { useEffect, useState } from "react";
import { AlertDetailModal } from "./alert-detail-modal";
import { requireOkResponseBody } from "@/lib/client/api-error";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  targetHref: string | null;
  createdAt: string;
  alertEvent: {
    id: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  } | null;
};

export function AdminNotificationPanel() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedAlertEventId, setSelectedAlertEventId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?unreadOnly=false&pageSize=20", {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "알림함 조회 실패");
      setItems((data.items as NotificationItem[] | undefined) ?? []);
      setUnreadCount(Number((data as { unreadCount?: number }).unreadCount ?? 0));
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchItems();
  }, []);

  async function readOne(id: string) {
    const res = await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
    const raw = await res.json().catch(() => null);
    try {
      requireOkResponseBody(res, raw, "읽음 처리 실패");
      await fetchItems();
    } catch {
      /* ignore */
    }
  }

  async function readAll() {
    const res = await fetch("/api/admin/notifications/read-all", { method: "PATCH" });
    const raw = await res.json().catch(() => null);
    try {
      requireOkResponseBody(res, raw, "전체 읽음 실패");
      await fetchItems();
    } catch {
      /* ignore */
    }
  }

  async function openDetail(item: NotificationItem) {
    if (!item.readAt) {
      await readOne(item.id);
    }

    if (item.alertEvent?.id) {
      setSelectedAlertEventId(item.alertEvent.id);
      setDetailOpen(true);
      return;
    }

    if (item.targetHref) {
      window.location.href = item.targetHref;
    }
  }

  return (
    <>
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">관리자 알림함</h2>
            <p className="mt-1 text-sm text-zinc-500">읽지 않은 알림 {unreadCount}건</p>
          </div>
          <button type="button" onClick={readAll} className="rounded-xl border px-3 py-2 text-sm">
            전체 읽음
          </button>
        </div>

        {loading ? <div>불러오는 중...</div> : null}

        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void openDetail(item)}
              className={`block w-full rounded-2xl border p-4 text-left ${
                item.readAt ? "bg-zinc-50" : "border-amber-200 bg-amber-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="mt-1 text-sm text-zinc-600">{item.body}</div>
                  <div className="mt-2 text-xs text-zinc-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
                {!item.readAt ? (
                  <span className="rounded-full bg-rose-600 px-2 py-1 text-[11px] font-bold text-white">
                    NEW
                  </span>
                ) : null}
              </div>
            </button>
          ))}

          {!loading && items.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-zinc-500">
              알림이 없습니다.
            </div>
          ) : null}
        </div>
      </div>

      <AlertDetailModal
        eventId={selectedAlertEventId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onChanged={fetchItems}
      />
    </>
  );
}
