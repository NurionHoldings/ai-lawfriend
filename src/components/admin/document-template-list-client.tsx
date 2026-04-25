"use client";

import Link from "next/link";
import {
  DOCUMENT_TYPE_LABELS,
  QUESTION_SET_CATALOG_STATUS_LABELS,
  type DocumentType,
  type QuestionSetStatus,
} from "@/lib/definitions";

type Item = {
  id: string;
  code: string;
  version: string;
  type: string;
  title: string;
  catalogStatus: string;
  updatedAt: string;
};

const CATALOG_FILTER_KEYS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const satisfies readonly QuestionSetStatus[];

type CatalogFilter = "all" | QuestionSetStatus;

function documentTypeLabel(type: string) {
  if (type in DOCUMENT_TYPE_LABELS) {
    return DOCUMENT_TYPE_LABELS[type as DocumentType];
  }
  return type;
}

function catalogStatusLabel(status: string) {
  if (status in QUESTION_SET_CATALOG_STATUS_LABELS) {
    return QUESTION_SET_CATALOG_STATUS_LABELS[status as QuestionSetStatus];
  }
  return status;
}

function chipClass(active: boolean) {
  return `inline-flex rounded-full border px-3 py-1 text-xs font-medium no-underline ${
    active
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  }`;
}

/** `?catalog=`·`?page=` — 칩 변경 시 page는 생략(1페이지). */
function listHref(catalog: CatalogFilter, pageNum: number): string {
  if (catalog === "all" && pageNum <= 1) return "/admin/document-templates";
  const p = new URLSearchParams();
  if (catalog !== "all") p.set("catalog", catalog);
  if (pageNum > 1) p.set("page", String(pageNum));
  return `/admin/document-templates?${p.toString()}`;
}

export function DocumentTemplateListClient({
  items,
  canCreate,
  catalogQuery = null,
  pagination,
}: {
  items: Item[];
  canCreate?: boolean;
  /** 서버 findMany where와 동일. null이면 전체 */
  catalogQuery?: QuestionSetStatus | null;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}) {
  const catalogFilter: CatalogFilter =
    catalogQuery && CATALOG_FILTER_KEYS.includes(catalogQuery as (typeof CATALOG_FILTER_KEYS)[number])
      ? catalogQuery
      : "all";

  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="카탈로그 상태 필터">
        <span className="text-xs font-medium text-gray-500">카탈로그 상태</span>
        <Link
          href={listHref("all", 1)}
          className={chipClass(catalogFilter === "all")}
          aria-current={catalogFilter === "all" ? "page" : undefined}
          title="서버에서 catalogStatus 필터 없음 · 1페이지"
        >
          전체
        </Link>
        {CATALOG_FILTER_KEYS.map((key) => (
          <Link
            key={key}
            href={listHref(key, 1)}
            className={chipClass(catalogFilter === key)}
            aria-current={catalogFilter === key ? "page" : undefined}
            title={`질문셋과 동일 라벨 · 서버 where.catalogStatus=${key} · 1페이지`}
          >
            {QUESTION_SET_CATALOG_STATUS_LABELS[key]}
          </Link>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        질문셋 관리 화면과 같은 말(초안·게시됨·보관됨)로 상태를 읽을 수 있습니다:{" "}
        {CATALOG_FILTER_KEYS.map((k) => QUESTION_SET_CATALOG_STATUS_LABELS[k]).join(" · ")}. 행 순서는{" "}
        <strong className="font-medium text-slate-700">수정일 최신 순</strong>(서버{" "}
        <span className="whitespace-nowrap font-mono text-[0.65rem]">orderBy</span>와 동일)입니다. 칩과
        주소의 <span className="whitespace-nowrap font-mono text-[0.7rem]">?catalog=</span> 값은 이 목록이
        DB에서 가져올 때 쓰는 카탈로그 필터와 항상 같습니다. 여러 페이지일 때{" "}
        <span className="whitespace-nowrap font-mono text-[0.7rem]">?page=</span>가 붙으며 필터와 함께
        유지됩니다.
      </p>
      {pagination && pagination.total > 0 ? (
        <p className="text-xs text-gray-600">
          총 <strong className="font-medium text-slate-800">{pagination.total}</strong>건
          {pagination.totalPages > 1 ? (
            <>
              {" "}
              · <strong className="font-medium text-slate-800">{pagination.page}</strong>/
              {pagination.totalPages}페이지 (페이지당 {pagination.pageSize}건)
            </>
          ) : null}
        </p>
      ) : null}

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="grid grid-cols-[1.2fr_0.65fr_0.65fr_0.75fr_1fr_120px] gap-3 border-b px-4 py-3 text-xs font-semibold text-gray-500">
          <div>템플릿</div>
          <div>버전</div>
          <div>타입</div>
          <div>카탈로그 상태</div>
          <div>수정일</div>
          <div></div>
        </div>

        <div className="divide-y">
          {items.length === 0 && catalogFilter === "all" ? (
            <div className="p-6 text-sm text-gray-500">
              <p>등록된 문서 템플릿이 없습니다.</p>
              <p className="mt-2 text-xs text-gray-400">
                새 템플릿은 <strong className="text-gray-600">생성</strong> 화면에서 초안으로 만든 뒤
                편집기에서 내용을 채우고 <strong className="text-gray-600">저장</strong>·
                <strong className="text-gray-600">게시</strong>해야 사건 문서 생성 시 선택됩니다.
                (인터뷰 질문셋과 동일한 카탈로그 흐름: 초안·게시됨·보관됨. 게시 검사는{" "}
                <strong className="text-gray-600">마지막 저장분</strong> 기준입니다.)
              </p>
              <p className="mt-2 text-xs text-gray-400">
                <Link href="/admin" className="font-medium text-slate-700 underline">
                  관리자 콘솔
                </Link>
                {" · "}
                <Link href="/admin/question-sets" className="font-medium text-slate-700 underline">
                  인터뷰 질문셋 관리
                </Link>
                {" — 동일 카탈로그 라벨(초안·게시됨·보관됨). "}
                <Link
                  href="/admin/document-templates?catalog=DRAFT"
                  className="font-medium text-slate-700 underline"
                >
                  초안만
                </Link>
                이 비어 있는지도 확인해 보세요.
              </p>
              {canCreate ? (
                <p className="mt-3">
                  <Link href="/admin/document-templates/new" className="font-medium text-blue-600 underline">
                    템플릿 생성
                  </Link>
                </p>
              ) : null}
            </div>
          ) : items.length === 0 && catalogFilter !== "all" ? (
            <div className="p-6 text-sm text-gray-500">
              <p>
                선택한 카탈로그 상태(
                <strong className="text-gray-700">
                  {QUESTION_SET_CATALOG_STATUS_LABELS[catalogFilter as QuestionSetStatus]}
                </strong>
                )에 해당하는 템플릿이 없습니다.
              </p>
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                <Link href="/admin/document-templates" className="font-medium text-slate-900 underline">
                  전체 목록 보기
                </Link>
                {catalogFilter === "PUBLISHED" ? (
                  <Link
                    href="/admin/document-templates?catalog=DRAFT"
                    className="font-medium text-slate-700 underline"
                  >
                    초안만(게시 전 확인)
                  </Link>
                ) : null}
                {catalogFilter === "DRAFT" ? (
                  <Link
                    href="/admin/document-templates?catalog=PUBLISHED"
                    className="font-medium text-slate-700 underline"
                  >
                    게시됨만
                  </Link>
                ) : null}
                {catalogFilter === "ARCHIVED" ? (
                  <Link
                    href="/admin/document-templates?catalog=PUBLISHED"
                    className="font-medium text-slate-700 underline"
                  >
                    게시됨만
                  </Link>
                ) : null}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                질문셋 목록의 상태 열도 같은 라벨(
                {CATALOG_FILTER_KEYS.map((k) => QUESTION_SET_CATALOG_STATUS_LABELS[k]).join(" · ")})을
                씁니다.{" "}
                <Link href="/admin/question-sets" className="font-medium text-slate-700 underline">
                  인터뷰 질문셋 관리
                </Link>
              </p>
              <p className="mt-2 text-xs text-gray-400">
                <Link href="/admin" className="font-medium text-slate-700 underline">
                  관리자 콘솔
                </Link>
                로 돌아가 다른 작업을 이어갈 수 있습니다.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.2fr_0.65fr_0.65fr_0.75fr_1fr_120px] gap-3 px-4 py-4 text-sm"
              >
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.code}</div>
                </div>
                <div>{item.version}</div>
                <div>{documentTypeLabel(item.type)}</div>
                <div>{catalogStatusLabel(item.catalogStatus)}</div>
                <div>{new Date(item.updatedAt).toLocaleString()}</div>
                <div className="text-right">
                  <Link
                    href={`/admin/document-templates/${item.id}`}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                    title="저장·게시·보관은 편집 화면에서"
                  >
                    편집
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700"
          aria-label="템플릿 목록 페이지 이동"
        >
          <div className="text-xs text-slate-600">
            같은 <span className="font-mono">catalog</span> 필터 안에서만 넘깁니다.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {page > 1 ? (
              <Link
                href={listHref(catalogFilter, page - 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
              >
                이전
              </Link>
            ) : (
              <span className="rounded-lg border border-transparent px-3 py-1.5 text-xs text-slate-400">
                이전
              </span>
            )}
            <span className="text-xs tabular-nums text-slate-600">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={listHref(catalogFilter, page + 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
              >
                다음
              </Link>
            ) : (
              <span className="rounded-lg border border-transparent px-3 py-1.5 text-xs text-slate-400">
                다음
              </span>
            )}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
