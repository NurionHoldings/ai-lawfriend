"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { requireOkResponseBody } from "@/lib/client/api-error";
import { getFeatureFlags } from "@/lib/feature-flags";

type Suggestion = {
  opsQueueTicketId: string;
  title: string;
  currentAssigneeUserId: string | null;
  currentAssigneeName: string;
  suggestedAssigneeUserId: string | null;
  suggestedAssigneeName: string;
  reason: string[];
};

type RecommendationGroup = {
  column: string;
  currentCount: number;
  limit: number;
  overflowCount: number;
  suggestions: Suggestion[];
};

const columnLabel: Record<string, string> = {
  TRIAGE: "분류대기",
  QUEUED: "대기열",
  WORKING: "작업중",
  BLOCKED: "보류",
  DONE: "완료",
};

type CardProps = {
  /** 재분배 적용 버튼·체크박스 표시 여부 (역할·기능 플래그와 함께 사용) */
  canApply?: boolean;
};

export function OpsQueueRebalanceRecommendationCard({ canApply = true }: CardProps) {
  const { pushToast } = useToast();
  const flags = getFeatureFlags();
  const showApply = canApply && flags.OPS_QUEUE_REBALANCE_APPLY;

  const [items, setItems] = useState<RecommendationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [applying, setApplying] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/alerts/ops-queue/rebalance-recommendations", {
      cache: "no-store",
    });
    const raw = await res.json().catch(() => null);
    try {
      const json = requireOkResponseBody(res, raw, "재분배 추천 조회 실패");
      setItems((json.recommendations as RecommendationGroup[] | undefined) ?? []);
    } catch {
      setItems([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const flatSuggestions = useMemo(
    () => items.flatMap((group) => group.suggestions),
    [items],
  );

  const selectedPayload = flatSuggestions
    .filter((s) => selectedIds.includes(s.opsQueueTicketId))
    .map((s) => ({
      opsQueueTicketId: s.opsQueueTicketId,
      suggestedAssigneeUserId: s.suggestedAssigneeUserId,
      reason: s.reason,
    }));

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function applySelected() {
    if (!selectedPayload.length) return;

    setApplying(true);
    try {
      const res = await fetch("/api/admin/alerts/ops-queue/rebalance-apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: selectedPayload,
          note: note.trim() || undefined,
        }),
      });

      const applyRaw = await res.json().catch(() => null);
      let appliedCount = 0;
      try {
        const json = requireOkResponseBody(res, applyRaw, "재분배 적용 실패");
        appliedCount = Number((json as { appliedCount?: number }).appliedCount ?? 0);
      } catch (e: unknown) {
        pushToast({
          kind: "error",
          title: "재분배 적용 실패",
          description: e instanceof Error ? e.message : "재분배 적용에 실패했습니다.",
        });
        return;
      }

      pushToast({
        kind: "success",
        title: "재분배 적용 완료",
        description: `${appliedCount}건 반영되었습니다.`,
      });
      setSelectedIds([]);
      setNote("");
      await load();
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">WIP 초과 재분배 추천</h2>
        <p className="mt-1 text-sm text-slate-500">
          추천 항목을 선택한 뒤 실제 담당자 재분배를 적용할 수 있습니다.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">추천 계산 중...</div>
      ) : !items.length ? (
        <div className="text-sm text-slate-500">현재 재분배 추천이 없습니다.</div>
      ) : (
        <div className="space-y-4">
          {items.map((group) => (
            <div key={group.column} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <div className="text-sm font-semibold text-slate-900">
                  {columnLabel[group.column] ?? group.column}
                </div>
                <div className="text-xs text-red-600">
                  {group.currentCount}/{group.limit} · 초과 {group.overflowCount}건
                </div>
              </div>

              <div className="space-y-3">
                {group.suggestions.map((s) => (
                  <label
                    key={s.opsQueueTicketId}
                    className="block rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-start gap-3">
                      {showApply ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s.opsQueueTicketId)}
                          onChange={() => toggle(s.opsQueueTicketId)}
                          className="mt-1"
                        />
                      ) : null}

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 text-sm font-medium text-slate-900">{s.title}</div>
                        <div className="text-xs text-slate-500">
                          현재 담당: {s.currentAssigneeName} → 추천 담당:{" "}
                          {s.suggestedAssigneeName}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {s.reason.map((r) => (
                            <span
                              key={r}
                              className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-600"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {showApply ? (
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 text-sm font-medium text-slate-900">
                선택 {selectedIds.length}건 적용
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="재분배 적용 메모"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedIds.length || applying}
                  onClick={() => void applySelected()}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                >
                  {applying ? "적용 중..." : "선택 항목 재분배 적용"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
              재분배 적용은 관리자 또는 기능 플래그가 활성화된 경우에만 사용할 수 있습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
