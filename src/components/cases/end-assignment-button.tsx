"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { requireOkData } from "@/lib/client/api-error";

type Props = {
  caseId: string;
  assignmentId: string;
};

export default function EndAssignmentButton({ caseId, assignmentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnd = async () => {
    const confirmed = window.confirm("이 배정을 종료하시겠습니까?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/cases/${caseId}/assignments/${assignmentId}`,
        {
          method: "DELETE",
        }
      );

      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "배정 종료에 실패했습니다.");
      } catch (e) {
        alert(
          e instanceof Error ? e.message : "배정 종료에 실패했습니다.",
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleEnd}
      disabled={loading}
      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 disabled:opacity-50"
    >
      {loading ? "종료 중..." : "배정 종료"}
    </button>
  );
}
