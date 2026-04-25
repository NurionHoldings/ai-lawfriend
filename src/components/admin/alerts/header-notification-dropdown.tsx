"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 17a2 2 0 0 0 4 0" />
    </svg>
  );
}

type Props = {
  pollMs?: number;
};

export function HeaderNotificationDropdown({ pollMs = 30000 }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedAlertEventId, setSelectedAlertEventId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/admin/notifications/unread-count", {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "읽지 않은 알림 수 조회 실패");
      setUnreadCount(Number((data as { unreadCount?: number }).unreadCount ?? 0));
    } catch {
      /* ignore */
    }
  }

  async function fetchList() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications?unreadOnly=false&pageSize=8", {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      const data = requireOkResponseBody(res, raw, "알림함 조회 실패");
      setItems((data.items as NotificationItem[] | undefined) ?? []);
      setUnreadCount(Number((data as { unreadCount?: number }).unreadCount ?? 0));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function markOneRead(notificationId: string) {
    try {
      const res = await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "읽음 처리 실패");
        await fetchList();
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }
  }

  async function markAllRead() {
    try {
      const res = await fetch("/api/admin/notifications/read-all", {
        method: "PATCH",
      });
      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "전체 읽음 실패");
        await fetchList();
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    void fetchUnreadCount();
    const id = window.setInterval(() => void fetchUnreadCount(), pollMs);
    return () => window.clearInterval(id);
  }, [pollMs]);

  useEffect(() => {
    if (!open) return;
    void fetchList();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const badgeText = useMemo(() => {
    if (unreadCount > 99) return "99+";
    return String(unreadCount);
  }, [unreadCount]);

  async function openAlertDetail(item: NotificationItem) {
    if (!item.readAt) {
      await markOneRead(item.id);
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
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-white shadow-sm hover:bg-zinc-50"
          aria-label="관리자 알림"
        >
          <BellIcon />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-[22px] items-center justify-center rounded-full bg-rose-600 px-1.5 py-1 text-[11px] font-bold leading-none text-white shadow">
              {badgeText}
            </span>
          ) : null}
        </button>

        {open ? (
          <div className="absolute right-0 z-[70] mt-3 w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[24px] border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <div className="text-sm font-semibold">알림함</div>
                <div className="text-xs text-zinc-500">읽지 않음 {unreadCount}건</div>
              </div>
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-zinc-50"
              >
                전체 읽음
              </button>
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-zinc-500">불러오는 중...</div>
              ) : items.length > 0 ? (
                <div className="divide-y">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void openAlertDetail(item)}
                      className={`block w-full px-4 py-3 text-left transition hover:bg-zinc-50 ${
                        item.readAt ? "bg-white" : "bg-amber-50/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {!item.readAt ? (
                              <span className="h-2 w-2 rounded-full bg-rose-500" />
                            ) : null}
                            <div className="truncate text-sm font-semibold">{item.title}</div>
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs text-zinc-600">
                            {item.body}
                          </div>
                          <div className="mt-2 text-[11px] text-zinc-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {!item.readAt ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void markOneRead(item.id);
                            }}
                            className="shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium hover:bg-white"
                          >
                            읽음
                          </button>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-zinc-500">알림이 없습니다.</div>
              )}
            </div>

            <div className="border-t px-4 py-3">
              <Link
                href="/admin/notifications"
                className="block rounded-xl bg-black px-3 py-2 text-center text-sm font-semibold text-white"
              >
                전체 알림함 보기
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <AlertDetailModal
        eventId={selectedAlertEventId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onChanged={() => {
          void fetchUnreadCount();
          void fetchList();
        }}
      />
    </>
  );
}
