"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { OpsQueueBoardColumn } from "@/lib/ops-queue/types";
import { OpsQueueBoardFilterBar } from "@/components/admin/alerts/ops-queue/OpsQueueBoardFilterBar";
import { OpsQueueWipBanner } from "@/components/admin/alerts/ops-queue/OpsQueueWipBanner";
import { OpsQueueMoveCommentModal } from "@/components/admin/alerts/ops-queue/OpsQueueMoveCommentModal";
import { OpsQueueDetailSlideOver } from "@/components/admin/alerts/ops-queue/OpsQueueDetailSlideOver";
import { OpsQueueCardQuickActions } from "@/components/admin/alerts/ops-queue/OpsQueueCardQuickActions";
import { OpsQueueDueAtQuickActions } from "@/components/admin/alerts/ops-queue/OpsQueueDueAtQuickActions";
import { OpsQueueBulkEditToolbar } from "@/components/admin/alerts/ops-queue/OpsQueueBulkEditToolbar";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { getFeatureFlags } from "@/lib/feature-flags";
import {
  applyOptimisticBoardMove,
  applyOptimisticQuickUpdate,
} from "@/lib/ops-queue/optimistic";
import { hasMinRole } from "@/lib/auth/roles";
import { requireOkResponseBody } from "@/lib/client/api-error";

type OpsQueueItem = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  boardColumn: OpsQueueBoardColumn;
  boardOrder: number;
  dueAt?: string | null;
  taxonomy: string;
  caseId?: string | null;
  assigneeUserId?: string | null;
  assignee?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
};

type BoardResponse = {
  ok: boolean;
  items: OpsQueueItem[];
  filters: {
    assigneeId?: string;
    priority?: string;
    taxonomy?: string;
    q?: string;
    overdueOnly?: boolean;
    includeDone?: boolean;
  };
  wipLimits?: Record<string, number>;
  wipWarnings: Record<
    string,
    {
      count: number;
      limit: number;
      percent: number;
      isNearLimit: boolean;
      isOverLimit: boolean;
    }
  >;
  options: {
    taxonomies: string[];
    assignees: {
      id: string;
      name?: string | null;
      email?: string | null;
    }[];
  };
};

type BoardProps = {
  currentUserRole: string;
};

const columns: { key: OpsQueueBoardColumn; label: string }[] = [
  { key: "TRIAGE", label: "분류대기" },
  { key: "QUEUED", label: "대기열" },
  { key: "WORKING", label: "작업중" },
  { key: "BLOCKED", label: "보류" },
  { key: "DONE", label: "완료" },
];

export function OpsQueueKanbanBoard({ currentUserRole }: BoardProps) {
  const { pushToast } = useToast();
  const flags = getFeatureFlags();
  const canEdit = hasMinRole(currentUserRole, "ADMIN");
  const showBulkToolbar = canEdit && flags.OPS_QUEUE_BULK_EDIT;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<OpsQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [options, setOptions] = useState<BoardResponse["options"]>({
    taxonomies: [],
    assignees: [],
  });
  const [wipWarnings, setWipWarnings] = useState<BoardResponse["wipWarnings"]>({});

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{
    itemId: string | null;
    toColumn: OpsQueueBoardColumn | null;
    toOrder: number;
  }>({
    itemId: null,
    toColumn: null,
    toOrder: 0,
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null);
  const suppressCardClickRef = useRef(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const queryString = searchParams?.toString() ?? "";

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    const qs = queryString;
    const res = await fetch(
      `/api/admin/alerts/ops-queue/board${qs ? `?${qs}` : ""}`,
      { cache: "no-store" },
    );
    const raw = await res.json().catch(() => null);
    try {
      const json = requireOkResponseBody(res, raw, "보드 조회 실패") as unknown as BoardResponse;
      if (json.items) {
        setItems(json.items);
        setOptions(json.options);
        setWipWarnings(json.wipWarnings ?? {});
      }
    } catch {
      /* 이전 항목 유지 */
    }
    setLoading(false);
  }, [queryString]);

  useEffect(() => {
    void fetchBoard();
  }, [fetchBoard]);

  const grouped = useMemo(() => {
    const map = new Map<OpsQueueBoardColumn, OpsQueueItem[]>();
    for (const col of columns) map.set(col.key, []);
    for (const item of items) {
      const col = item.boardColumn;
      if (map.has(col)) {
        map.get(col)!.push(item);
      } else {
        map.get("TRIAGE")!.push(item);
      }
    }
    for (const col of columns) {
      map.get(col.key)?.sort((a, b) => a.boardOrder - b.boardOrder);
    }
    return map;
  }, [items]);

  function requestMove(itemId: string, toColumn: OpsQueueBoardColumn, toOrder: number) {
    if (!canEdit) {
      pushToast({
        kind: "warning",
        title: "권한 없음",
        description: "보드 이동은 관리자만 할 수 있습니다.",
      });
      return;
    }
    setMoveTarget({
      itemId,
      toColumn,
      toOrder,
    });
    setMoveModalOpen(true);
  }

  function applyFilterParams(params: URLSearchParams) {
    const qs = params.toString();
    router.push(`/admin/alerts/ops-queue/board${qs ? `?${qs}` : ""}`);
  }

  function openDetail(ticketId: string) {
    setDetailTicketId(ticketId);
    setDetailOpen(true);
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        운영 큐 보드 로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!canEdit ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          STAFF 권한으로 조회 전용 모드입니다. 카드 이동, 일괄 수정, 재분배 적용은 제한됩니다.
        </div>
      ) : null}

      <OpsQueueBoardFilterBar
        key={queryString}
        taxonomyOptions={options.taxonomies}
        assigneeOptions={options.assignees}
        onApply={applyFilterParams}
      />

      {showBulkToolbar ? (
        <OpsQueueBulkEditToolbar
          selectedIds={selectedIds}
          onDone={async () => {
            setSelectedIds([]);
            await fetchBoard();
          }}
        />
      ) : null}

      <OpsQueueWipBanner warnings={wipWarnings} />

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => {
          const columnItems = grouped.get(column.key) ?? [];
          const warning = wipWarnings[column.key];

          return (
            <div
              key={column.key}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                if (!dragId) return;
                requestMove(dragId, column.key, columnItems.length);
                setDragId(null);
              }}
            >
              <div className="mb-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{column.label}</h3>
                  <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
                    {columnItems.length}
                  </span>
                </div>

                {warning ? (
                  <div
                    className={`mt-2 rounded-xl px-2 py-1 text-[11px] ${
                      warning.isOverLimit
                        ? "bg-red-100 text-red-700"
                        : warning.isNearLimit
                          ? "bg-amber-100 text-amber-800"
                          : "bg-white text-slate-500"
                    }`}
                  >
                    WIP {warning.count}/{warning.limit}
                    {warning.isOverLimit
                      ? " · 초과"
                      : warning.isNearLimit
                        ? " · 근접"
                        : ""}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                {columnItems.map((item, index) => {
                  const overdue =
                    item.dueAt ? new Date(item.dueAt).getTime() < Date.now() : false;

                  return (
                    <div
                      key={item.id}
                      data-testid="ops-queue-card"
                      draggable={canEdit}
                      onDragStart={() => setDragId(item.id)}
                      onDragEnd={() => {
                        suppressCardClickRef.current = true;
                        window.setTimeout(() => {
                          suppressCardClickRef.current = false;
                        }, 150);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.stopPropagation();
                        if (!dragId || dragId === item.id) return;
                        requestMove(dragId, column.key, index);
                        setDragId(null);
                      }}
                      onClick={() => {
                        if (suppressCardClickRef.current) return;
                        openDetail(item.id);
                      }}
                      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-start gap-2">
                          {showBulkToolbar ? (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelected(item.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 shrink-0"
                              aria-label={`선택 ${item.title}`}
                            />
                          ) : null}
                          <div className="line-clamp-2 text-sm font-medium text-slate-900">
                            {item.title}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-slate-200 px-2 py-0.5 text-[10px]">
                          {item.priority}
                        </span>
                      </div>

                      {item.description ? (
                        <p className="mb-2 line-clamp-3 text-xs text-slate-500">{item.description}</p>
                      ) : null}

                      <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.taxonomy}</span>
                        {item.caseId ? (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                            사건 연결
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                        <span>
                          담당: {item.assignee?.name ?? item.assignee?.email ?? "미배정"}
                        </span>
                        {item.dueAt ? (
                          <span className={overdue ? "font-semibold text-red-600" : ""}>
                            기한: {new Date(item.dueAt).toLocaleString("ko-KR")}
                          </span>
                        ) : null}
                      </div>

                      {canEdit ? (
                        <>
                          <OpsQueueCardQuickActions
                            opsQueueTicketId={item.id}
                            currentAssigneeUserId={item.assigneeUserId ?? item.assignee?.id ?? null}
                            currentAssignee={item.assignee ?? null}
                            currentPriority={
                              item.priority === "LOW" ||
                              item.priority === "NORMAL" ||
                              item.priority === "HIGH" ||
                              item.priority === "URGENT"
                                ? item.priority
                                : "NORMAL"
                            }
                            onUpdated={() => void fetchBoard()}
                            onOptimisticUpdate={(patch) => {
                              if (!flags.OPS_QUEUE_OPTIMISTIC_UI) return;
                              setItems((prev) =>
                                applyOptimisticQuickUpdate(prev, item.id, {
                                  assigneeUserId: patch.assigneeUserId,
                                  assignee: patch.assignee ?? undefined,
                                  priority: patch.priority,
                                }),
                              );
                            }}
                          />

                          <OpsQueueDueAtQuickActions
                            opsQueueTicketId={item.id}
                            currentDueAt={item.dueAt ?? null}
                            onUpdated={() => void fetchBoard()}
                            onOptimisticUpdate={(dueAt) => {
                              if (!flags.OPS_QUEUE_OPTIMISTIC_UI) return;
                              setItems((prev) =>
                                applyOptimisticQuickUpdate(prev, item.id, {
                                  dueAt,
                                }),
                              );
                            }}
                          />
                        </>
                      ) : null}
                    </div>
                  );
                })}

                {!columnItems.length ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-4 text-center text-xs text-slate-400">
                    항목 없음
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <OpsQueueMoveCommentModal
        open={moveModalOpen}
        itemId={moveTarget.itemId}
        toColumn={moveTarget.toColumn}
        toOrder={moveTarget.toOrder}
        onClose={() => {
          setMoveModalOpen(false);
          setMoveTarget({
            itemId: null,
            toColumn: null,
            toOrder: 0,
          });
        }}
        onSubmitted={() => void fetchBoard()}
        onOptimisticSuccess={({ itemId, toColumn, toOrder }) => {
          if (!flags.OPS_QUEUE_OPTIMISTIC_UI) return;
          setItems((prev) =>
            applyOptimisticBoardMove(prev, itemId, toColumn, toOrder),
          );
        }}
      />

      <OpsQueueDetailSlideOver
        open={detailOpen}
        opsQueueTicketId={detailTicketId}
        allowEdit={canEdit}
        onClose={() => {
          setDetailOpen(false);
          setDetailTicketId(null);
        }}
        onUpdated={() => void fetchBoard()}
      />
    </div>
  );
}
