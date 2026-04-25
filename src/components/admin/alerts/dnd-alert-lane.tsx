"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DndAlertTaskCard } from "./dnd-alert-task-card";

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

export function DndAlertLane({
  laneId,
  label,
  tone,
  items,
  onOpenDetail,
  staffUsers,
  onQuickActionDone,
  selectionEnabled,
  selectedIds,
  onToggleSelect,
}: {
  laneId: "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "IGNORED";
  label: string;
  tone: string;
  items: Item[];
  onOpenDetail: (id: string) => void;
  staffUsers: StaffUser[];
  onQuickActionDone: () => void;
  selectionEnabled?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string, checked: boolean) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: laneId,
    data: {
      type: "lane",
      status: laneId,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[420px] rounded-2xl border p-3 ${isOver ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50"}`}
    >
      <div className={`mb-3 rounded-xl px-3 py-2 text-sm font-semibold ${tone}`}>
        {label} ({items.length})
      </div>

      <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((item) => (
              <DndAlertTaskCard
                key={item.id}
                item={item}
                onOpenDetail={onOpenDetail}
                staffUsers={staffUsers}
                onQuickActionDone={onQuickActionDone}
                selectionEnabled={selectionEnabled}
                checked={selectedIds.has(item.id)}
                onToggle={onToggleSelect}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              카드가 없습니다.
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
