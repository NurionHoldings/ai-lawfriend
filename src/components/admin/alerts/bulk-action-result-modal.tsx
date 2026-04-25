"use client";

import { Fragment, useState } from "react";
import type { AlertBulkActionResult } from "@/types/alert-bulk";

type Props = {
  open: boolean;
  onClose: () => void;
  result: AlertBulkActionResult | null;
  retryContext?: {
    payload?: Record<string, unknown>;
  } | null;
  onRetryFailures?: (params: {
    action: AlertBulkActionResult["action"];
    alertEventIds: string[];
    payload?: Record<string, unknown>;
  }) => Promise<void>;
};

export function BulkActionResultModal({
  open,
  onClose,
  result,
  retryContext,
  onRetryFailures,
}: Props) {
  const [retrying, setRetrying] = useState(false);

  if (!open || !result) return null;

  const snapshot = result;

  async function handleRetryFailures() {
    if (!onRetryFailures) return;
    if (!snapshot.failures.length) return;

    try {
      setRetrying(true);
      await onRetryFailures({
        action: snapshot.action,
        alertEventIds: snapshot.failures.map((item) => item.alertEventId),
        payload: retryContext?.payload,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "실패 항목 재실행 중 오류가 발생했습니다.");
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">대량 액션 처리 결과</h2>
            <p className="mt-1 text-sm text-slate-500">
              액션:{" "}
              <span className="font-medium text-slate-700">{result.action}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 px-6 py-5">
          <SummaryCard label="요청 건수" value={result.requestedCount} />
          <SummaryCard label="성공 건수" value={result.successCount} accent="green" />
          <SummaryCard label="실패 건수" value={result.failureCount} accent="red" />
        </div>

        <div className="max-h-[55vh] overflow-y-auto border-t border-slate-200 px-6 py-5">
          {result.failureCount === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              모든 대상이 정상 처리되었습니다.
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">실패 항목 상세</h3>

                {onRetryFailures && (
                  <button
                    type="button"
                    onClick={() => void handleRetryFailures()}
                    disabled={retrying}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {retrying ? "재실행 중..." : "실패 항목만 재실행"}
                  </button>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        경고 ID
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        사건 ID
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">제목</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        실패 사유
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {result.failures.map((item) => (
                      <tr key={`${item.alertEventId}-${item.reason}`}>
                        <td className="px-4 py-3 text-slate-700">{item.alertEventId}</td>
                        <td className="px-4 py-3 text-slate-500">{item.caseId ?? "-"}</td>
                        <td className="px-4 py-3 text-slate-700">{item.title ?? "-"}</td>
                        <td className="px-4 py-3 text-rose-600">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.successCount > 0 && (
            <Fragment>
              <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-800">성공 항목</h3>
              <div className="flex flex-wrap gap-2">
                {result.successes.map((item) => (
                  <span
                    key={item.alertEventId}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                  >
                    {item.title ?? item.alertEventId}
                  </span>
                ))}
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: number;
  accent?: "slate" | "green" | "red";
}) {
  const color =
    accent === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : accent === "red"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-2xl border px-4 py-4 ${color}`}>
      <div className="text-xs font-medium">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
