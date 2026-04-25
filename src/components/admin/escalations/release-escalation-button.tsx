"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requireOkResponseBody } from "@/lib/client/api-error";

export function ReleaseEscalationButton({
  escalationId,
  disabled,
}: {
  escalationId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onRelease() {
    const reason = prompt("해제 사유를 입력해주세요.");
    if (!reason) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/alert-escalations/${escalationId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "해제 처리에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "해제 처리에 실패했습니다.");
        return;
      }

      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={() => void onRelease()}
      className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? "처리 중..." : "해제"}
    </button>
  );
}
