"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { readJsonApiErrorMessage, requireOkResponseBody } from "@/lib/client/api-error";
import {
  FilterPresetSaveDialog,
  type BoardFilterSnapshot,
} from "./filter-preset-save-dialog";

type Preset = {
  id: string;
  name: string;
  isDefault: boolean;
  scope: string;
  status: string | null;
  severity: string | null;
  ruleCode: string | null;
  escalationLevel: number | null;
  assigneeUserId: string | null;
  dueFrom: string | null;
  dueTo: string | null;
  q: string | null;
};

export function FilterPresetBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/alerts/filter-presets", { cache: "no-store" });
    const raw = await res.json().catch(() => null);
    try {
      const body = requireOkResponseBody(res, raw, "프리셋을 불러오지 못했습니다.");
      const list = body.presets;
      if (Array.isArray(list)) setPresets(list as Preset[]);
    } catch {
      /* 목록 실패 시 이전 상태 유지 */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const current = useMemo((): BoardFilterSnapshot => {
    const esc = searchParams.get("escalationLevel");
    return {
      status: searchParams.get("status") || "",
      severity: searchParams.get("severity") || "",
      ruleCode: searchParams.get("ruleCode") || "",
      escalationLevel: esc && esc !== "ALL" ? Number(esc) : null,
      assigneeUserId: searchParams.get("assigneeUserId") || "",
      dueFrom: searchParams.get("dueFrom") || "",
      dueTo: searchParams.get("dueTo") || "",
      q: searchParams.get("q") || "",
    };
  }, [searchParams]);

  function applyPreset(preset: Preset) {
    const next = new URLSearchParams();

    if (preset.status) next.set("status", preset.status);
    if (preset.severity) next.set("severity", preset.severity);
    if (preset.ruleCode) next.set("ruleCode", preset.ruleCode);
    if (typeof preset.escalationLevel === "number") {
      next.set("escalationLevel", String(preset.escalationLevel));
    }
    if (preset.assigneeUserId) next.set("assigneeUserId", preset.assigneeUserId);
    if (preset.dueFrom) {
      const d =
        typeof preset.dueFrom === "string"
          ? preset.dueFrom.slice(0, 10)
          : String(preset.dueFrom).slice(0, 10);
      next.set("dueFrom", d);
    }
    if (preset.dueTo) {
      const d =
        typeof preset.dueTo === "string"
          ? preset.dueTo.slice(0, 10)
          : String(preset.dueTo).slice(0, 10);
      next.set("dueTo", d);
    }
    if (preset.q) next.set("q", preset.q);

    router.push(`${pathname}?${next.toString()}`);
  }

  async function removePreset(presetId: string) {
    if (!confirm("이 프리셋을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/admin/alerts/filter-presets/${presetId}`, {
      method: "DELETE",
    });

    const raw = await res.json().catch(() => null);
    try {
      requireOkResponseBody(res, raw, "삭제에 실패했습니다.");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : readJsonApiErrorMessage(raw, "삭제에 실패했습니다."));
      return;
    }

    await load();
  }

  async function makeDefault(presetId: string) {
    const res = await fetch(`/api/admin/alerts/filter-presets/${presetId}/default`, {
      method: "POST",
    });

    const raw = await res.json().catch(() => null);
    try {
      requireOkResponseBody(res, raw, "기본 프리셋 설정에 실패했습니다.");
    } catch (e: unknown) {
      alert(
        e instanceof Error ? e.message : readJsonApiErrorMessage(raw, "기본 프리셋 설정에 실패했습니다."),
      );
      return;
    }

    await load();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800"
            >
              <button
                type="button"
                onClick={() => applyPreset(preset)}
                className="hover:text-slate-950"
              >
                {preset.name}
                {preset.isDefault ? " · 기본" : ""}
              </button>
              <button
                type="button"
                onClick={() => void makeDefault(preset.id)}
                className="text-slate-400 hover:text-slate-800"
                title="기본으로 지정"
              >
                ★
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPreset(preset);
                  setSaveOpen(true);
                }}
                className="text-slate-400 hover:text-blue-700"
                title="수정"
              >
                ✎
              </button>
              <button
                type="button"
                onClick={() => void removePreset(preset.id)}
                className="text-slate-400 hover:text-red-600"
                title="삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <button
            type="button"
            onClick={() => {
              setEditingPreset(null);
              setSaveOpen(true);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            프리셋 저장
          </button>
        </div>
      </div>

      <FilterPresetSaveDialog
        open={saveOpen}
        onClose={() => {
          setSaveOpen(false);
          setEditingPreset(null);
        }}
        presetId={editingPreset?.id ?? null}
        initialName={editingPreset?.name ?? ""}
        initialScope={
          editingPreset?.scope === "TEAM" ? "TEAM" : "PRIVATE"
        }
        initialIsDefault={editingPreset?.isDefault ?? false}
        currentFilters={current}
        onSaved={() => void load()}
      />
    </div>
  );
}
