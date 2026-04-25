"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireOkData } from "@/lib/client/api-error";

type Props = {
  caseId: string;
  canUseStaffNote: boolean;
  /** URL `draft` 쿼리 등으로 전달된 조치 초안 */
  initialDraft?: string;
  /** 경고에서 넘어온 경우 메모 저장 시 연결 */
  linkedAlertEventId?: string;
};

export default function TimelineMemoForm({
  caseId,
  canUseStaffNote,
  initialDraft,
  linkedAlertEventId,
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [memoType, setMemoType] = useState<"USER_NOTE" | "STAFF_NOTE">(
    "USER_NOTE"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialDraft) {
      setContent(initialDraft);
    }
  }, [initialDraft]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("메모 내용을 입력해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/cases/${caseId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          memoType,
          ...(linkedAlertEventId
            ? {
                alertEventId: linkedAlertEventId,
                noteType: "ALERT_ACTION_DRAFT",
              }
            : {}),
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "메모 저장에 실패했습니다.");
      } catch (e) {
        alert(
          e instanceof Error ? e.message : "메모 저장에 실패했습니다.",
        );
        return;
      }

      setContent("");
      setMemoType("USER_NOTE");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {canUseStaffNote ? (
        <select
          value={memoType}
          onChange={(e) =>
            setMemoType(e.target.value as "USER_NOTE" | "STAFF_NOTE")
          }
          className="rounded-xl border px-4 py-3 text-sm"
        >
          <option value="USER_NOTE">일반 메모</option>
          <option value="STAFF_NOTE">내부 메모</option>
        </select>
      ) : null}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="w-full rounded-xl border px-4 py-3 text-sm"
        placeholder="사건 진행 메모를 입력하세요."
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "저장 중..." : "메모 추가"}
      </button>
    </form>
  );
}
