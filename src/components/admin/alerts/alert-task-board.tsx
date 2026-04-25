"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  rectIntersection,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertDetailModal } from "./alert-detail-modal";
import { DndAlertLane } from "./dnd-alert-lane";
import { AlertBoardFilters } from "./alert-board-filters";
import { FilterPresetBar } from "./filter-preset-bar";
import { AlertBulkActionBar } from "./alert-bulk-action-bar";
import { BulkActionResultModal } from "./bulk-action-result-modal";
import { BulkActionJobStatusModal } from "./bulk-action-job-status-modal";
import { runBulkQueuePipeline } from "./run-bulk-queue-pipeline";
import type { AlertBulkActionResult } from "@/types/alert-bulk";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Item = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  slaState: "ON_TRACK" | "DUE_SOON" | "OVERDUE";
  escalationLevel: "NONE" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  dueAt: string | null;
  detectedAt: string;
  assigneeUser: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  rule: {
    code: string;
  } | null;
};

type Lanes = {
  OPEN: Item[];
  ACKNOWLEDGED: Item[];
  RESOLVED: Item[];
  IGNORED: Item[];
};

const laneMeta = [
  { key: "OPEN", label: "대기", tone: "bg-slate-100" },
  { key: "ACKNOWLEDGED", label: "진행중", tone: "bg-sky-100" },
  { key: "RESOLVED", label: "해결", tone: "bg-emerald-100" },
  { key: "IGNORED", label: "무시", tone: "bg-slate-200" },
] as const;

const laneKeys: Array<keyof Lanes> = ["OPEN", "ACKNOWLEDGED", "RESOLVED", "IGNORED"];

type RuleOption = { code: string; name: string };
type StaffUser = { id: string; name: string; email?: string | null };

export function AlertTaskBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [lanes, setLanes] = useState<Lanes>({
    OPEN: [],
    ACKNOWLEDGED: [],
    RESOLVED: [],
    IGNORED: [],
  });
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [rules, setRules] = useState<RuleOption[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<AlertBulkActionResult | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [lastBulkContext, setLastBulkContext] = useState<{
    assigneeUserId?: string;
    note?: string;
  } | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allIds = useMemo(
    () => laneKeys.flatMap((k) => lanes[k].map((x) => x.id)),
    [lanes]
  );

  const allChecked =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  function onToggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) return [...new Set([...prev, id])];
      return prev.filter((x) => x !== id);
    });
  }

  function toggleAll(checked: boolean) {
    if (checked) setSelectedIds(allIds);
    else setSelectedIds([]);
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  const bulkUsers = useMemo(
    () => staffUsers.map((u) => ({ id: u.id, name: u.name ?? u.email ?? u.id })),
    [staffUsers]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchBoard = useCallback(async () => {
    const params = new URLSearchParams(searchParams.toString());
    if (overdueOnly) params.set("overdueOnly", "true");
    else params.delete("overdueOnly");

    const res = await fetch(`/api/admin/alerts/board?${params.toString()}`, {
      cache: "no-store",
    });
    const raw = await res.json().catch(() => null);
    try {
      const data = requireOkResponseBody(res, raw, "보드 조회 실패");
      const lanesVal = data.lanes as Lanes | undefined;
      if (lanesVal) setLanes(lanesVal);
      const rulesVal = data.rules as RuleOption[] | undefined;
      if (rulesVal) setRules(rulesVal);
      const staff = data.staffUsers as StaffUser[] | undefined;
      if (staff) {
        setStaffUsers(
          staff.map((u) => ({
            id: u.id,
            name: u.name ?? u.email ?? u.id,
          })),
        );
      }
    } catch {
      /* 이전 레인 상태 유지 */
    }
  }, [overdueOnly, searchParams]);

  async function saveLaneOrder(status: keyof Lanes, items: Item[]): Promise<boolean> {
    if (items.length === 0) return true;

    const res = await fetch("/api/admin/alerts/board/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        orderedIds: items.map((x) => x.id),
      }),
    });
    const raw = await res.json().catch(() => null);
    try {
      requireOkResponseBody(res, raw, "순서 저장 실패");
      return true;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "순서 저장 실패");
      return false;
    }
  }

  function findStatusByCardId(id: string): keyof Lanes | null {
    for (const key of laneKeys) {
      if (lanes[key].some((x) => x.id === id)) return key;
    }
    return null;
  }

  function findIndexByCardId(status: keyof Lanes, id: string) {
    return lanes[status].findIndex((x) => x.id === id);
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const fromStatus = findStatusByCardId(activeId);
    if (!fromStatus) return;

    const toStatus = laneKeys.includes(overId as keyof Lanes)
      ? (overId as keyof Lanes)
      : findStatusByCardId(overId);

    if (!toStatus) return;

    if (fromStatus === toStatus) {
      const oldIndex = findIndexByCardId(fromStatus, activeId);
      let newIndex: number;
      if (laneKeys.includes(overId as keyof Lanes)) {
        newIndex = Math.max(0, lanes[fromStatus].length - 1);
      } else {
        newIndex = findIndexByCardId(fromStatus, overId);
      }
      if (oldIndex < 0 || newIndex < 0) return;
      if (oldIndex === newIndex) return;

      const nextLanes: Lanes = {
        ...lanes,
        [fromStatus]: arrayMove(lanes[fromStatus], oldIndex, newIndex),
      };
      setLanes(nextLanes);
      const ok = await saveLaneOrder(fromStatus, nextLanes[fromStatus]);
      if (!ok) await fetchBoard();
      return;
    }

    const nextLanes: Lanes = {
      OPEN: [...lanes.OPEN],
      ACKNOWLEDGED: [...lanes.ACKNOWLEDGED],
      RESOLVED: [...lanes.RESOLVED],
      IGNORED: [...lanes.IGNORED],
    };

    const fromIndex = findIndexByCardId(fromStatus, activeId);
    if (fromIndex < 0) return;

    const [moved] = nextLanes[fromStatus].splice(fromIndex, 1);

    let insertIndex: number;
    if (laneKeys.includes(overId as keyof Lanes)) {
      insertIndex = nextLanes[toStatus].length;
    } else {
      const overIdx = findIndexByCardId(toStatus, overId);
      insertIndex = overIdx < 0 ? nextLanes[toStatus].length : overIdx;
    }

    nextLanes[toStatus].splice(insertIndex, 0, {
      ...moved,
      status: toStatus,
    });

    setLanes(nextLanes);

    const okFrom = await saveLaneOrder(fromStatus, nextLanes[fromStatus]);
    const okTo = await saveLaneOrder(toStatus, nextLanes[toStatus]);
    if (!okFrom || !okTo) await fetchBoard();
  }

  async function runSlaScan() {
    const res = await fetch("/api/admin/alert-events/sla-scan", { method: "POST" });
    const raw = await res.json().catch(() => null);
    try {
      const body = requireOkResponseBody(res, raw, "SLA 스캔 실패");
      const result = body.result as { warningCreatedCount?: number } | undefined;
      await fetchBoard();
      alert(`SLA 스캔 완료: ${Number(result?.warningCreatedCount ?? 0)}건 경고 생성`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "SLA 스캔 실패");
    }
  }

  async function runEscalationScan() {
    const res = await fetch("/api/admin/alert-events/escalation-scan", { method: "POST" });
    const raw = await res.json().catch(() => null);
    try {
      const body = requireOkResponseBody(res, raw, "에스컬레이션 스캔 실패");
      const result = body.result as { notificationCount?: number } | undefined;
      await fetchBoard();
      alert(`에스컬레이션 스캔 완료: ${Number(result?.notificationCount ?? 0)}건 알림 생성`);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "에스컬레이션 스캔 실패");
    }
  }

  useEffect(() => {
    void fetchBoard();
  }, [fetchBoard]);

  return (
    <>
      <FilterPresetBar />

      <AlertBoardFilters rules={rules} users={staffUsers} />

      <AlertBulkActionBar
        selectedIds={selectedIds}
        users={bulkUsers}
        onClear={clearSelection}
        onJobQueued={(id) => {
          setActiveJobId(id);
          setJobModalOpen(true);
        }}
        onBulkComplete={(result, ctx) => {
          setBulkResult(result);
          setLastBulkContext({
            assigneeUserId: ctx.assigneeUserId,
            note: ctx.note,
          });
          setBulkModalOpen(true);
          setJobModalOpen(false);
          setActiveJobId(null);
        }}
      />

      <BulkActionJobStatusModal
        open={jobModalOpen}
        jobId={activeJobId}
        onClose={() => {
          setJobModalOpen(false);
          setActiveJobId(null);
        }}
      />

      <BulkActionResultModal
        open={bulkModalOpen}
        result={bulkResult}
        retryContext={
          lastBulkContext
            ? {
                payload: {
                  ...(lastBulkContext.assigneeUserId
                    ? { assigneeUserId: lastBulkContext.assigneeUserId }
                    : {}),
                  ...(lastBulkContext.note ? { note: lastBulkContext.note } : {}),
                },
              }
            : null
        }
        onRetryFailures={async (params) => {
          const result = await runBulkQueuePipeline({
            action: params.action,
            alertEventIds: params.alertEventIds,
            payload: {
              assigneeUserId: params.payload?.assigneeUserId as string | undefined,
              note: params.payload?.note as string | undefined,
            },
            onJobQueued: (id) => {
              setActiveJobId(id);
              setJobModalOpen(true);
            },
          });

          setBulkResult(result);
          setLastBulkContext({
            assigneeUserId: params.payload?.assigneeUserId as string | undefined,
            note: params.payload?.note as string | undefined,
          });
          setBulkModalOpen(true);
          setJobModalOpen(false);
          setActiveJobId(null);
          router.refresh();
        }}
        onClose={() => setBulkModalOpen(false)}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">칸반형 Alert Task 보드</h2>
            <p className="mt-1 text-sm text-slate-500">
              드래그앤드롭 상태 이동 + 카드 순서 저장
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
              />
              SLA 초과만 보기
            </label>

            <button
              type="button"
              onClick={() => void runSlaScan()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium"
            >
              SLA 스캔
            </button>

            <button
              type="button"
              onClick={() => void runEscalationScan()}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium"
            >
              에스컬레이션 스캔
            </button>

            <button
              type="button"
              onClick={() => void fetchBoard()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          현재 목록 전체 선택
        </label>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragEnd={(e) => void onDragEnd(e)}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {laneMeta.map((lane) => (
            <DndAlertLane
              key={lane.key}
              laneId={lane.key}
              label={lane.label}
              tone={lane.tone}
              items={lanes[lane.key]}
              staffUsers={staffUsers}
              onQuickActionDone={fetchBoard}
              selectionEnabled
              selectedIds={selectedSet}
              onToggleSelect={onToggleSelect}
              onOpenDetail={(eventId) => {
                setSelectedEventId(eventId);
                setDetailOpen(true);
              }}
            />
          ))}
        </div>
      </DndContext>

      <AlertDetailModal
        eventId={selectedEventId}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onChanged={fetchBoard}
      />
    </>
  );
}
