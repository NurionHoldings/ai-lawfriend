"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type AuditLogRow = {
  id: string;
  action: string;
  message: string | null;
  createdAt: string;
  actor?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

type TimelineRow = {
  id: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

type Props = {
  opsQueueTicketId: string;
  recentAuditLogs: AuditLogRow[];
};

type TabKey = "detail" | "audit" | "timeline" | "notifications";

export function OpsQueueDetailTabs({
  opsQueueTicketId,
  recentAuditLogs,
}: Props) {
  const [tab, setTab] = useState<TabKey>("detail");
  const [timelineItems, setTimelineItems] = useState<TimelineRow[]>([]);
  const [notificationItems, setNotificationItems] = useState<NotificationRow[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    if (tab !== "timeline") return;

    let ignore = false;

    async function load() {
      setLoadingTimeline(true);
      const res = await fetch(
        `/api/admin/alerts/ops-queue/${opsQueueTicketId}/timeline`,
        { cache: "no-store" },
      );
      const raw = await res.json().catch(() => null);
      try {
        const json = requireOkResponseBody(res, raw, "타임라인 조회 실패");
        if (!ignore) {
          setTimelineItems((json.items as TimelineRow[] | undefined) ?? []);
        }
      } catch {
        if (!ignore) {
          setTimelineItems([]);
        }
      }

      if (!ignore) setLoadingTimeline(false);
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [tab, opsQueueTicketId]);

  useEffect(() => {
    if (tab !== "notifications") return;

    let ignore = false;

    async function load() {
      setLoadingNotifications(true);
      const res = await fetch(
        `/api/admin/alerts/ops-queue/${opsQueueTicketId}/notifications`,
        { cache: "no-store" },
      );
      const raw = await res.json().catch(() => null);
      try {
        const json = requireOkResponseBody(res, raw, "알림 조회 실패");
        if (!ignore) {
          setNotificationItems((json.items as NotificationRow[] | undefined) ?? []);
        }
      } catch {
        if (!ignore) {
          setNotificationItems([]);
        }
      }

      if (!ignore) setLoadingNotifications(false);
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [tab, opsQueueTicketId]);

  const tabBtn = (key: TabKey, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`rounded-xl border border-slate-200 px-3 py-2 text-sm ${
        tab === key ? "bg-slate-100 font-medium text-slate-900" : "text-slate-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {tabBtn("detail", "상세")}
        {tabBtn("audit", "감사로그")}
        {tabBtn("timeline", "타임라인")}
        {tabBtn("notifications", "알림")}
      </div>

      {tab === "detail" ? (
        <div className="text-sm text-slate-500">
          상단 상세·편집 영역에서 내용을 확인하거나 수정할 수 있습니다.
        </div>
      ) : null}

      {tab === "audit" ? (
        <div className="space-y-3">
          {!recentAuditLogs.length ? (
            <div className="text-sm text-slate-500">최근 감사로그가 없습니다.</div>
          ) : (
            recentAuditLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 text-sm font-medium text-slate-900">
                  {log.message ?? log.action}
                </div>
                <div className="text-xs text-slate-500">
                  {log.actor?.name ?? log.actor?.email ?? "-"} ·{" "}
                  {new Date(log.createdAt).toLocaleString("ko-KR")}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "timeline" ? (
        <div className="space-y-3">
          {loadingTimeline ? (
            <div className="text-sm text-slate-500">타임라인 로딩 중...</div>
          ) : !timelineItems.length ? (
            <div className="text-sm text-slate-500">표시할 타임라인이 없습니다.</div>
          ) : (
            timelineItems.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 text-sm font-medium text-slate-900 whitespace-pre-wrap">
                  {row.content}
                </div>
                <div className="text-xs text-slate-500">
                  {row.author?.name ?? row.author?.email ?? "-"} ·{" "}
                  {new Date(row.createdAt).toLocaleString("ko-KR")}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === "notifications" ? (
        <div className="space-y-3">
          {loadingNotifications ? (
            <div className="text-sm text-slate-500">알림 로딩 중...</div>
          ) : !notificationItems.length ? (
            <div className="text-sm text-slate-500">표시할 알림이 없습니다.</div>
          ) : (
            notificationItems.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 text-sm font-medium text-slate-900">{row.title}</div>
                <div className="text-sm text-slate-600">{row.body}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {new Date(row.createdAt).toLocaleString("ko-KR")}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
