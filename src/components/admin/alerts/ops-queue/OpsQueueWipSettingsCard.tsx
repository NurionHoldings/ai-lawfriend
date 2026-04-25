"use client";

import { useEffect, useState } from "react";
import type { OpsQueueWipConfig } from "@/lib/ops-queue/wip";
import { DEFAULT_OPS_QUEUE_WIP_LIMITS } from "@/lib/ops-queue/wip";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { getFeatureFlags } from "@/lib/feature-flags";

type Props = {
  canManageWip: boolean;
};

export function OpsQueueWipSettingsCard({ canManageWip }: Props) {
  const { pushToast } = useToast();
  const flags = getFeatureFlags();
  const canSave = canManageWip && flags.OPS_QUEUE_WIP_SETTINGS_EDIT;

  const [values, setValues] = useState<OpsQueueWipConfig>(DEFAULT_OPS_QUEUE_WIP_LIMITS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const res = await fetch("/api/admin/alerts/ops-queue/settings/wip-limit", {
        cache: "no-store",
      });
      const raw = await res.json().catch(() => null);
      try {
        const json = requireOkResponseBody(res, raw, "WIP 한도 조회 실패");
        const lim = json.limits as OpsQueueWipConfig | undefined;
        if (!ignore && lim) {
          setValues(lim);
        }
      } catch {
        /* 기본값 유지 */
      }

      if (!ignore) setLoading(false);
    }

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  function patch(key: keyof OpsQueueWipConfig, value: string) {
    setValues((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/alerts/ops-queue/settings/wip-limit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const saveRaw = await res.json().catch(() => null);
      try {
        const json = requireOkResponseBody(res, saveRaw, "저장 실패");
        const lim = json.limits as OpsQueueWipConfig | undefined;
        if (lim) setValues(lim);
      } catch (e: unknown) {
        pushToast({
          kind: "error",
          title: "저장 실패",
          description: e instanceof Error ? e.message : "저장에 실패했습니다.",
        });
        return;
      }
      pushToast({
        kind: "success",
        title: "저장 완료",
        description: "WIP limit 설정이 저장되었습니다.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        WIP 설정 로딩 중...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">OpsQueue WIP limit 설정</h2>
        <p className="mt-1 text-sm text-slate-500">
          컬럼별 동시 처리 한도를 설정합니다. 보드 경고와 함께 연동됩니다.
          {!canSave ? (
            <span className="block text-amber-700">
              저장은 SUPER_ADMIN과 기능 플래그가 모두 허용된 경우에만 가능합니다.
            </span>
          ) : null}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {(["TRIAGE", "QUEUED", "WORKING", "BLOCKED", "DONE"] as const).map((key) => (
          <label key={key} className="space-y-2">
            <div className="text-sm font-medium text-slate-800">{key}</div>
            <input
              type="number"
              min={1}
              readOnly={!canSave}
              value={values[key]}
              onChange={(e) => patch(key, e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 read-only:bg-slate-50"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !canSave}
          className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "저장 중..." : "설정 저장"}
        </button>
      </div>
    </div>
  );
}
