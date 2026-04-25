"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { requireOkData } from "@/lib/client/api-error";

type Props = {
  caseId: string;
  memoId: string;
};

export default function DeleteTimelineMemoButton({ caseId, memoId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("이 메모를 삭제하시겠습니까?");
    if (!confirmed) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/timeline/${memoId}`, {
        method: "DELETE",
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "메모 삭제에 실패했습니다.");
      } catch (e) {
        alert(
          e instanceof Error ? e.message : "메모 삭제에 실패했습니다.",
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
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 disabled:opacity-50"
    >
      {loading ? "삭제 중..." : "삭제"}
    </button>
  );
}
