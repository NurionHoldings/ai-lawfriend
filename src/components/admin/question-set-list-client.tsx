"use client";

import Link from "next/link";
import {
  QUESTION_SET_CATALOG_STATUS_LABELS,
  type QuestionSetStatus,
} from "@/lib/definitions";

type Item = {
  id: string;
  code: string | null;
  version: string;
  title: string;
  status: string;
  publishedAt: string | null;
  archivedAt: string | null;
  updatedAt: string;
};

function catalogStatusLabel(status: string) {
  if (status in QUESTION_SET_CATALOG_STATUS_LABELS) {
    return QUESTION_SET_CATALOG_STATUS_LABELS[status as QuestionSetStatus];
  }
  return status;
}

export function QuestionSetListClient({
  items,
  canCreate,
}: {
  items: Item[];
  canCreate?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="grid grid-cols-[1.3fr_0.7fr_1fr_1fr_1fr_120px] gap-3 border-b px-4 py-3 text-xs font-semibold text-gray-500">
        <div>질문셋</div>
        <div>버전</div>
        <div>상태</div>
        <div>게시일</div>
        <div>수정일</div>
        <div></div>
      </div>

      <div className="divide-y">
        {items.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            등록된 질문셋이 없습니다.
            {canCreate ? (
              <span className="ml-1">
                <Link href="/admin/question-sets/new" className="text-blue-600 underline">
                  새로 만들기
                </Link>
              </span>
            ) : null}
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1.3fr_0.7fr_1fr_1fr_1fr_120px] gap-3 px-4 py-4 text-sm"
            >
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="mt-1 text-xs text-gray-500">{item.code ?? "-"}</div>
              </div>
              <div>{item.version}</div>
              <div>{catalogStatusLabel(item.status)}</div>
              <div>{item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "-"}</div>
              <div>{new Date(item.updatedAt).toLocaleString()}</div>
              <div className="text-right">
                <Link
                  href={`/admin/question-sets/${item.id}`}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                >
                  편집
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
