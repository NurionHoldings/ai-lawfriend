"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { AlertCardQuickActions } from "./alert-card-quick-actions";

type StaffUser = { id: string; name: string };

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

export function DndAlertTaskCard({
  item,
  onOpenDetail,
  staffUsers,
  onQuickActionDone,
  selectionEnabled,
  checked,
  onToggle,
}: {
  item: Item;
  onOpenDetail: (id: string) => void;
  staffUsers: StaffUser[];
  onQuickActionDone: () => void;
  selectionEnabled?: boolean;
  checked?: boolean;
  onToggle?: (id: string, next: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: "alert-card",
      status: item.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const slaTone =
    item.slaState === "OVERDUE"
      ? "bg-rose-100 text-rose-700"
      : item.slaState === "DUE_SOON"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  const escTone =
    item.escalationLevel === "LEVEL_3"
      ? "bg-rose-600 text-white"
      : item.escalationLevel === "LEVEL_2"
        ? "bg-rose-100 text-rose-700"
        : item.escalationLevel === "LEVEL_1"
          ? "bg-amber-100 text-amber-700"
          : "bg-slate-100 text-slate-600";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${isDragging ? "opacity-70" : ""}`}
    >
      {selectionEnabled && onToggle ? (
        <label
          className="mb-2 flex items-center gap-2 text-xs text-slate-600"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={!!checked}
            onChange={(e) => onToggle(item.id, e.target.checked)}
          />
          선택
        </label>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpenDetail(item.id)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold">
              {item.severity}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${slaTone}`}>
              {item.slaState}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${escTone}`}>
              {item.escalationLevel}
            </span>
            {item.rule ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px]">
                {item.rule.code}
              </span>
            ) : null}
          </div>

          <div className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</div>
          <div className="mt-2 line-clamp-3 text-xs text-slate-600">{item.message}</div>

          <div className="mt-3 space-y-1 text-[11px] text-slate-500">
            <div>담당자: {item.assigneeUser?.name ?? item.assigneeUser?.email ?? "-"}</div>
            <div>기한: {item.dueAt ? new Date(item.dueAt).toLocaleString() : "-"}</div>
          </div>
        </button>

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 rounded-xl border border-slate-200 px-2 py-1 text-xs"
          aria-label="드래그 핸들"
        >
          ⋮⋮
        </button>
      </div>

      <AlertCardQuickActions
        alertId={item.id}
        users={staffUsers}
        onDone={onQuickActionDone}
      />
    </div>
  );
}
