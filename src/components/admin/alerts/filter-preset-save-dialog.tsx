"use client";

import { useEffect, useState } from "react";
import { requireOkResponseBody } from "@/lib/client/api-error";

export type BoardFilterSnapshot = {
  status?: string;
  severity?: string;
  ruleCode?: string;
  escalationLevel?: number | null;
  assigneeUserId?: string;
  dueFrom?: string;
  dueTo?: string;
  q?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  presetId?: string | null;
  initialScope?: "PRIVATE" | "TEAM";
  initialIsDefault?: boolean;
  currentFilters: BoardFilterSnapshot;
  onSaved?: () => void;
};

export function FilterPresetSaveDialog({
  open,
  onClose,
  initialName = "",
  presetId,
  initialScope = "PRIVATE",
  initialIsDefault = false,
  currentFilters,
  onSaved,
}: Props) {
  const [name, setName] = useState(initialName);
  const [scope, setScope] = useState<"PRIVATE" | "TEAM">(initialScope);
  const [isDefault, setIsDefault] = useState(initialIsDefault);
  const [overwriteIfExists, setOverwriteIfExists] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setScope(initialScope);
      setIsDefault(initialIsDefault);
      setOverwriteIfExists(false);
    }
  }, [open, initialName, initialScope, initialIsDefault]);

  if (!open) return null;

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;

    const bodyBase = {
      name: trimmed,
      scope,
      isDefault,
      status: currentFilters.status || undefined,
      severity: currentFilters.severity || undefined,
      ruleCode: currentFilters.ruleCode || undefined,
      escalationLevel:
        currentFilters.escalationLevel === null ||
        currentFilters.escalationLevel === undefined ||
        Number.isNaN(currentFilters.escalationLevel)
          ? null
          : currentFilters.escalationLevel,
      assigneeUserId: currentFilters.assigneeUserId || undefined,
      dueFrom: currentFilters.dueFrom || undefined,
      dueTo: currentFilters.dueTo || undefined,
      q: currentFilters.q || undefined,
    };

    try {
      setSaving(true);

      if (presetId) {
        const res = await fetch(`/api/admin/alerts/filter-presets/${presetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bodyBase,
            overwriteByName: overwriteIfExists,
          }),
        });

        const raw = await res.json().catch(() => null);
        const body = requireOkResponseBody(res, raw, "프리셋 수정에 실패했습니다.");
        if (typeof body.mergedIntoPresetId === "string") {
          alert("동일 이름 프리셋에 병합되었습니다.");
        }
      } else {
        const res = await fetch("/api/admin/alerts/filter-presets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...bodyBase,
            overwriteIfExists,
          }),
        });

        const raw = await res.json().catch(() => null);
        const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

        if (res.status === 409 && o.code === "PRESET_NAME_EXISTS") {
          const ok = window.confirm("같은 이름의 프리셋이 있습니다. 덮어쓰시겠습니까?");
          if (!ok) return;

          const retry = await fetch("/api/admin/alerts/filter-presets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bodyBase,
              overwriteIfExists: true,
            }),
          });

          const retryRaw = await retry.json().catch(() => null);
          requireOkResponseBody(retry, retryRaw, "프리셋 저장에 실패했습니다.");
        } else {
          requireOkResponseBody(res, raw, "프리셋 저장에 실패했습니다.");
        }
      }

      onSaved?.();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "프리셋 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {presetId ? "프리셋 수정" : "프리셋 저장"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            현재 보드 필터 상태를 저장하거나 기존 프리셋에 덮어쓸 수 있습니다.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">프리셋 이름</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 미처리 고위험 / 이번주 지연건"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">공개 범위</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={scope}
              onChange={(e) => setScope(e.target.value as "PRIVATE" | "TEAM")}
            >
              <option value="PRIVATE">개인</option>
              <option value="TEAM">팀</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            기본 프리셋으로 지정
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={overwriteIfExists}
              onChange={(e) => setOverwriteIfExists(e.target.checked)}
            />
            같은 이름이 있으면 덮어쓰기(또는 병합)
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={() => void handleSave()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "저장 중..." : presetId ? "수정 저장" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
