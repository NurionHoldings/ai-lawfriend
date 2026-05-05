"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  ["DRAFT_SUBMITTED", "접수됨"],
  ["REVIEW_READY", "검토 가능"],
  ["DOCUMENTS_CHECKED", "서류 확인"],
  ["REFERRED_TO_LAWYER", "변호사 연결"],
  ["CLOSED", "종료"],
] as const;

export function JeonseDamageStatusForm({
  reportId,
  currentStatus,
}: Readonly<{
  reportId: string;
  currentStatus: string;
}>) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function updateStatus() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `/api/admin/jeonse-damage-reports/${reportId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, reason }),
        },
      );

      const data = await res.json();
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
      <label className="mb-2 block text-xs font-semibold text-slate-400">
        처리 상태
      </label>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
        >
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
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
        placeholder="상태 변경 사유를 입력하세요."
        className="mt-3 min-h-20 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-100 outline-none focus:border-cyan-300"
      />

      {message ? <p className="mt-2 text-xs text-slate-300">{message}</p> : null}
    </div>
  );
}
