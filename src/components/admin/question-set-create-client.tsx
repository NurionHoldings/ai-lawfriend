"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requireOkData } from "@/lib/client/api-error";

export function QuestionSetCreateClient() {
  const router = useRouter();
  const [title, setTitle] = useState("새 질문셋");
  const [code, setCode] = useState("NEW_QUESTION_SET");
  const [version, setVersion] = useState("1.0.0");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    try {
      setSubmitting(true);

      const res = await fetch("/api/question-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          code,
          version,
        }),
      });

      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ id: string }>(res, raw, "질문셋 생성에 실패했습니다.");

      router.push(`/admin/question-sets/${data.id}`);
      router.refresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "질문셋 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4">
        <Link href="/admin/question-sets" className="text-sm text-gray-600 underline hover:text-gray-900">
          ← 목록
        </Link>
      </div>
      <h1 className="text-xl font-semibold">질문셋 생성</h1>
      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">제목</label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">코드</label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">버전</label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "생성 중..." : "생성"}
        </button>
      </div>
    </div>
  );
}
