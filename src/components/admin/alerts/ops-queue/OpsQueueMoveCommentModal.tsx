"use client";

import { useEffect, useState } from "react";
import type { OpsQueueBoardColumn } from "@/lib/ops-queue/types";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { requireOkResponseBody } from "@/lib/client/api-error";

type Props = {
  open: boolean;
  itemId: string | null;
  toColumn: OpsQueueBoardColumn | null;
  toOrder: number;
  onClose: () => void;
  onSubmitted: () => void;
  onOptimisticSuccess?: (args: {
    itemId: string;
    toColumn: OpsQueueBoardColumn;
    toOrder: number;
  }) => void;
};

function getColumnLabel(column: OpsQueueBoardColumn | null) {
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
      return "-";
  }
}

export function OpsQueueMoveCommentModal({
  open,
  itemId,
  toColumn,
  toOrder,
  onClose,
  onSubmitted,
  onOptimisticSuccess,
}: Props) {
  const { pushToast } = useToast();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setComment("");
      setLoading(false);
    }
  }, [open]);

  if (!open || !itemId || !toColumn) return null;

  const resolvedItemId = itemId;
  const resolvedToColumn = toColumn;

  async function handleSubmit() {
    setLoading(true);

    try {
      onOptimisticSuccess?.({
        itemId: resolvedItemId,
        toColumn: resolvedToColumn,
        toOrder,
      });

      const res = await fetch("/api/admin/alerts/ops-queue/board/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: resolvedItemId,
          toColumn: resolvedToColumn,
          toOrder,
          comment,
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "보드 이동 실패");
      } catch (e: unknown) {
        pushToast({
          kind: "error",
          title: "보드 이동 실패",
          description: e instanceof Error ? e.message : "보드 이동 실패",
        });
        onSubmitted();
        return;
      }

      pushToast({
        kind: "success",
        title: "보드 이동 완료",
        description: `${getColumnLabel(toColumn)}로 이동되었습니다.`,
      });

      onSubmitted();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">보드 이동 코멘트</h2>
          <p className="mt-1 text-sm text-slate-500">
            이동 대상 컬럼:{" "}
            <span className="font-medium text-slate-700">{getColumnLabel(toColumn)}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">코멘트</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="이동 사유나 작업 메모를 입력하세요. 비워두어도 이동은 가능합니다."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <div className="text-right text-xs text-slate-400">{comment.length}/1000</div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "저장 중..." : "이동 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
