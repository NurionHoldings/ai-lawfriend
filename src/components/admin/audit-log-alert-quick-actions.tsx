"use client";

import { requireOkResponseBody } from "@/lib/client/api-error";

export function AuditLogAlertQuickActions() {
  async function scanNow() {
    try {
      const res = await fetch("/api/admin/alert-events/scan", { method: "POST" });
      const raw = await res.json().catch(() => null);
      const body = requireOkResponseBody(res, raw, "스캔 실패");
      const result = body.result as { createdAlertCount?: number } | undefined;
      alert(`신규 경고 알림 ${result?.createdAlertCount ?? 0}건 생성`);
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "스캔 요청에 실패했습니다.",
      );
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="/admin/alerts/rules"
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
      >
        경고 규칙 관리
      </a>
      <a
        href="/admin/alerts/history"
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
      >
        경고 이력 보기
      </a>
      <a
        href="/admin/notifications"
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
      >
        알림함
      </a>
      <button
        type="button"
        onClick={scanNow}
        className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm"
      >
        지금 스캔
      </button>
    </div>
  );
}
