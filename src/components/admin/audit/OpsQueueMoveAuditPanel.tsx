"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { AuditLogDetailPanel } from "@/components/admin/audit/AuditLogDetailPanel";

type AuditItem = {
  id: string;
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
  opsQueueTicketId?: string;
};

function label(column?: string | null) {
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

function metaRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function OpsQueueMoveAuditPanel({ opsQueueTicketId }: Props) {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuditLogId, setSelectedAuditLogId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const qs = opsQueueTicketId
          ? `?opsQueueTicketId=${encodeURIComponent(opsQueueTicketId)}`
          : "";
        const res = await fetch(`/api/admin/audit-logs/ops-queue-moves${qs}`, {
          cache: "no-store",
        });
        const raw = await res.json().catch(() => null);
        const body = requireOkResponseBody(
          res,
          raw,
          "이동 이력을 불러오지 못했습니다.",
        );
        if (!ignore) {
          setItems(
            Array.isArray(body.items) ? (body.items as AuditItem[]) : [],
          );
        }
      } catch {
        if (!ignore) {
          setItems([]);
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
  }, [opsQueueTicketId]);

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">OpsQueue 이동 감사로그</h2>
          <p className="mt-1 text-sm text-slate-500">
            보드 이동 이력을 최근 순으로 확인합니다.
          </p>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">불러오는 중...</div>
        ) : !items.length ? (
          <div className="text-sm text-slate-500">표시할 이동 이력이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const m = metaRecord(item.metadata);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedAuditLogId(item.id)}
                  className="block w-full rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-900">
                      {item.message ?? item.id}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString("ko-KR")}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>
                      행위자: {item.actor?.name ?? item.actor?.email ?? "-"}
                    </span>
                    <span>
                      이동: {label(m.fromColumn as string)} → {label(m.toColumn as string)}
                    </span>
                    {m.comment != null && String(m.comment).length > 0 ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                        코멘트 있음
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AuditLogDetailPanel
        auditLogId={selectedAuditLogId}
        open={!!selectedAuditLogId}
        onClose={() => setSelectedAuditLogId(null)}
      />
    </>
  );
}
