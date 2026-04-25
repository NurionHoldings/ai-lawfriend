"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

type AuditLogRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  message: string | null;
  metadata: unknown;
  createdAt: string;
  actor?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

type Props = {
  auditLogId: string | null;
  open: boolean;
  onClose: () => void;
};

function prettyColumnLabel(column?: string | null) {
  switch (column) {
    case "TRIAGE":
      return "분류대기";
    case "QUEUED":
      return "대기열";
    case "WORKING":
      return "작업중";
    case "BLOCKED":
      return "보류";
    case "DONE":
      return "완료";
    default:
      return column ?? "-";
  }
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function AuditLogDetailPanel({ auditLogId, open, onClose }: Props) {
  const [item, setItem] = useState<AuditLogRow | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!open || !auditLogId) return;
      setLoading(true);

      const res = await fetch(`/api/admin/audit-logs/${auditLogId}`, {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      try {
        const body = requireOkResponseBody(
          res,
          raw,
          "감사로그를 불러오지 못했습니다.",
        );
        if (!ignore) {
          const it = body.item;
          setItem(
            it && typeof it === "object" ? (it as AuditLogRow) : null,
          );
        }
      } catch {
        if (!ignore) {
          setItem(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [auditLogId, open]);

  if (!open) return null;

  const meta = asRecord(item?.metadata);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">감사로그 상세</h2>
            <p className="text-sm text-slate-500">OpsQueue 보드 이동 이력 상세</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-sm text-slate-500">불러오는 중...</div>
          ) : !item ? (
            <div className="text-sm text-slate-500">표시할 로그가 없습니다.</div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">기본 정보</div>
                <div className="grid gap-2 text-sm text-slate-700">
                  <div>
                    <span className="font-medium">액션:</span> {item.action}
                  </div>
                  <div>
                    <span className="font-medium">메시지:</span> {item.message ?? "-"}
                  </div>
                  <div>
                    <span className="font-medium">엔터티:</span> {item.entityType} / {item.entityId}
                  </div>
                  <div>
                    <span className="font-medium">행위자:</span>{" "}
                    {item.actor?.name ?? item.actor?.email ?? "-"}
                  </div>
                  <div>
                    <span className="font-medium">생성시각:</span>{" "}
                    {new Date(item.createdAt).toLocaleString("ko-KR")}
                  </div>
                </div>
              </section>

              {item.action === "ops_queue.board.move" ? (
                <section className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-900">보드 이동 상세</div>
                  <div className="grid gap-2 text-sm text-slate-700">
                    <div>
                      <span className="font-medium">항목 제목:</span>{" "}
                      {String(meta.title ?? "-")}
                    </div>
                    <div>
                      <span className="font-medium">이동:</span>{" "}
                      {prettyColumnLabel(meta.fromColumn as string | undefined)} →{" "}
                      {prettyColumnLabel(meta.toColumn as string | undefined)}
                    </div>
                    <div>
                      <span className="font-medium">상태:</span> {String(meta.fromStatus ?? "-")} →{" "}
                      {String(meta.toStatus ?? "-")}
                    </div>
                    <div>
                      <span className="font-medium">순서:</span> {String(meta.fromOrder ?? "-")} →{" "}
                      {String(meta.toOrder ?? "-")}
                    </div>
                    <div>
                      <span className="font-medium">코멘트:</span>{" "}
                      {meta.comment != null && String(meta.comment).length > 0
                        ? String(meta.comment)
                        : "-"}
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">원본 JSON (metadata)</div>
                <pre className="overflow-x-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-800">
                  {JSON.stringify(item.metadata ?? {}, null, 2)}
                </pre>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
