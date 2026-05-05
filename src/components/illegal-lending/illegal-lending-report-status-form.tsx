"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  {
    value: "DRAFT_SUBMITTED",
    label: "접수됨",
  },
  {
    value: "REVIEW_READY",
    label: "검토 가능",
  },
  {
    value: "REFERRED_TO_LAWYER",
    label: "변호사 연결",
  },
  {
    value: "CLOSED",
    label: "종료",
  },
] as const;

export function IllegalLendingReportStatusForm({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/illegal-lending-reports/${reportId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, reason }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };

      if (!res.ok || !data.ok) {
        setMessage(data.message || "상태 변경에 실패했습니다.");
        return;
      }

      setMessage("상태가 변경되었습니다.");
      setReason("");
      router.refresh();
    } catch {
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <label className="mb-2 block text-xs font-semibold text-slate-400">처리 상태</label>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            void updateStatus();
          }}
          disabled={loading || status === currentStatus}
          className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "변경 중" : "변경"}
        </button>
      </div>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="상태 변경 사유를 입력하세요. 예: 피해내용 확인 완료, 변호사 연결 필요 등"
        className="mt-3 min-h-20 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-100 outline-none focus:border-cyan-300"
      />
      {message ? <p className="mt-2 text-xs text-slate-300">{message}</p> : null}
    </div>
  );
}