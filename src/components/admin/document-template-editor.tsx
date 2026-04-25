"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { DocumentTemplateDefinition, DocumentType } from "@/lib/definitions";
import {
  DOCUMENT_TYPE_LABELS,
  QUESTION_SET_CATALOG_STATUS_LABELS,
  type QuestionSetStatus,
} from "@/lib/definitions";
import { DocumentTemplateMetaForm } from "@/components/admin/document-template-meta-form";
import { DocumentTemplateSectionEditor } from "@/components/admin/document-template-section-editor";
import { getDocumentTemplatePublishBlockerMessage } from "@/lib/document-template-repository";
import { readJsonApiErrorMessage, requireOkData } from "@/lib/client/api-error";

type Props = {
  item: {
    id: string;
    code: string;
    version: string;
    type: string;
    title: string;
    description: string | null;
    definitionJson: unknown;
    updatedAt: string;
    catalogStatus: string;
    publishedAt: string | null;
    archivedAt: string | null;
  };
};

function asDocType(s: string): DocumentType {
  if (s === "STATEMENT" || s === "OPINION" || s === "CONSULT_NOTE") return s;
  return "STATEMENT";
}

function buildFallbackDefinition(item: Props["item"]): DocumentTemplateDefinition {
  return {
    version: item.version,
    code: item.code,
    type: asDocType(item.type),
    title: item.title,
    description: item.description ?? "",
    sections: [],
  };
}

function mergeDefinition(item: Props["item"]): DocumentTemplateDefinition {
  const raw = item.definitionJson;
  const fallback = buildFallbackDefinition(item);
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Partial<DocumentTemplateDefinition>;
    return {
      ...fallback,
      ...o,
      title: o.title ?? item.title,
      code: o.code ?? item.code,
      version: o.version ?? item.version,
      type: o.type ?? asDocType(item.type),
      description: o.description ?? fallback.description,
      sections: Array.isArray(o.sections) ? o.sections : [],
    };
  }
  return fallback;
}

export function DocumentTemplateEditor({ item }: Props) {
  const router = useRouter();
  const [definition, setDefinition] = useState<DocumentTemplateDefinition>(() =>
    mergeDefinition(item),
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const catalogStatusKey = (
    item.catalogStatus in QUESTION_SET_CATALOG_STATUS_LABELS
      ? item.catalogStatus
      : "DRAFT"
  ) as QuestionSetStatus;
  const catalogStatusLabel =
    QUESTION_SET_CATALOG_STATUS_LABELS[catalogStatusKey] ?? item.catalogStatus;
  const isArchived = item.catalogStatus === "ARCHIVED";
  const isDraft = item.catalogStatus === "DRAFT";
  const isPublished = item.catalogStatus === "PUBLISHED";

  const sectionCount = definition.sections.length;
  const paragraphCount = useMemo(
    () => definition.sections.reduce((acc, section) => acc + section.paragraphs.length, 0),
    [definition.sections],
  );

  /** 편집 중 정의 기준 미리보기(실제 게시 검사는 DB에 저장된 definitionJson). */
  const publishBlockerPreview = useMemo(
    () => getDocumentTemplatePublishBlockerMessage(definition),
    [definition],
  );

  function updateMeta(patch: Partial<DocumentTemplateDefinition>) {
    setDefinition((prev) => ({
      ...prev,
      ...patch,
    }));
  }

  function addSection() {
    setDefinition((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          key: `section_${prev.sections.length + 1}`,
          title: `새 섹션 ${prev.sections.length + 1}`,
          order: prev.sections.length,
          type: "BODY",
          paragraphs: [],
        },
      ],
    }));
  }

  function moveSection(sectionKey: string, delta: number) {
    setDefinition((prev) => {
      const sorted = [...prev.sections].sort((a, b) => a.order - b.order);
      const i = sorted.findIndex((s) => s.key === sectionKey);
      if (i < 0) return prev;
      const j = i + delta;
      if (j < 0 || j >= sorted.length) return prev;
      const a = sorted[i];
      const b = sorted[j];
      return {
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.key === a.key) return { ...s, order: b.order };
          if (s.key === b.key) return { ...s, order: a.order };
          return s;
        }),
      };
    });
  }

  function updateSection(nextSection: DocumentTemplateDefinition["sections"][number]) {
    setDefinition((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.key === nextSection.key ? nextSection : section,
      ),
    }));
  }

  function removeSection(sectionKey: string) {
    setDefinition((prev) => ({
      ...prev,
      sections: prev.sections
        .filter((section) => section.key !== sectionKey)
        .map((section, index) => ({
          ...section,
          order: index,
        })),
    }));
  }

  async function publishTemplate() {
    if (isDraft) {
      const ok = window.confirm(
        "게시 시 서버가 정의 JSON 스키마와 최소 구조(섹션 1개 이상·문단 합계 1개 이상)를 검사합니다. 통과하지 못하면 게시되지 않습니다. 저장된 내용으로 게시할까요?",
      );
      if (!ok) return;
    }
    try {
      setPublishing(true);
      const res = await fetch(`/api/document-templates/${item.id}/publish`, {
        method: "PATCH",
      });
      const raw = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = readJsonApiErrorMessage(raw, "게시에 실패했습니다.");
        alert(
          res.status === 422
            ? `${msg}\n\n※ 게시 검사는 「저장」된 내용 기준입니다. 편집만 하고 저장하지 않았다면 먼저 저장하세요.`
            : msg,
        );
        return;
      }
      try {
        requireOkData(res, raw, "게시에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "게시에 실패했습니다.");
        return;
      }
      setNotice(
        "게시되었습니다. 사건 문서 생성 시 이 버전을 선택할 수 있습니다. 상단 「목록」 또는 목록 화면의 「게시됨」 칩·주소의 ?catalog=PUBLISHED로 같은 상태만 모아 확인할 수 있습니다.",
      );
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  async function archiveTemplate() {
    try {
      setArchiving(true);
      const res = await fetch(`/api/document-templates/${item.id}/archive`, {
        method: "PATCH",
      });
      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "보관에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "보관에 실패했습니다.");
        return;
      }
      setNotice(
        "보관되었습니다. 사건 문서 생성에서는 더 이상 선택되지 않습니다. 목록에서 「보관됨」 칩 또는 ?catalog=ARCHIVED로 모아 볼 수 있습니다.",
      );
      router.refresh();
    } finally {
      setArchiving(false);
    }
  }

  async function saveDefinition() {
    try {
      setSaving(true);

      const res = await fetch(`/api/document-templates/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: definition.title,
          description: definition.description ?? "",
          definitionJson: definition,
        }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "템플릿 저장에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "템플릿 저장에 실패했습니다.");
        return;
      }

      alert("문서 템플릿이 저장되었습니다.");
    } finally {
      setSaving(false);
    }
  }

  const sortedSections = [...definition.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
        <Link
          href="/admin/document-templates"
          className="underline hover:text-gray-900"
          title="목록 · ?catalog=·?page= 칩과 서버 catalogStatus 조회가 같습니다"
        >
          ← 문서 템플릿 목록
        </Link>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <Link
          href="/admin/question-sets"
          className="underline hover:text-gray-900"
          title="상태 열과 같은 한글: 초안·게시됨·보관됨"
        >
          인터뷰 질문셋 관리
        </Link>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <Link href="/admin" className="underline hover:text-gray-900" title="관리자 콘솔">
          관리자 콘솔
        </Link>
      </div>

      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <p>{notice}</p>
          <p className="mt-2 text-xs font-normal text-emerald-900/90">
            <span className="font-medium">목록·카탈로그:</span>{" "}
            <Link
              href="/admin/document-templates"
              className="underline"
              title="목록 · ?catalog=·?page= 칩과 서버 catalogStatus 조회가 같습니다"
            >
              전체
            </Link>
            {" · "}
            <Link
              href="/admin/document-templates?catalog=DRAFT"
              className="underline"
              title={QUESTION_SET_CATALOG_STATUS_LABELS.DRAFT}
            >
              초안만
            </Link>
            {" · "}
            <Link
              href="/admin/document-templates?catalog=PUBLISHED"
              className="underline"
              title={QUESTION_SET_CATALOG_STATUS_LABELS.PUBLISHED}
            >
              게시됨만
            </Link>
            {" · "}
            <Link
              href="/admin/document-templates?catalog=ARCHIVED"
              className="underline"
              title={QUESTION_SET_CATALOG_STATUS_LABELS.ARCHIVED}
            >
              보관됨만
            </Link>
            <span className="mx-1 text-emerald-800/80">|</span>
            <span className="font-medium">질문셋과 동일 라벨:</span>{" "}
            <Link
              href="/admin/question-sets"
              className="underline"
              title="상태 열과 같은 한글: 초안·게시됨·보관됨"
            >
              인터뷰 질문셋 관리
            </Link>
            {" · "}
            <Link href="/admin" className="underline" title="관리자 콘솔">
              관리자 콘솔
            </Link>
          </p>
        </div>
      ) : null}

      {isArchived ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p>
            <strong className="font-semibold">보관됨</strong> — 질문셋의 &quot;보관됨&quot;과 같이
            카탈로그에서 제외된 버전입니다. 수정·게시·재보관은 불가하며, 사건 문서 생성 화면에서도
            선택되지 않습니다.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            <Link
              href="/admin/document-templates"
              className="font-medium underline"
              title="목록 · ?catalog=·?page= 칩과 서버 catalogStatus 조회가 같습니다"
            >
              문서 템플릿 목록
            </Link>
            <Link
              href="/admin/document-templates?catalog=ARCHIVED"
              className="font-medium underline"
              title="서버 where.catalogStatus = ARCHIVED"
            >
              보관됨만 보기
            </Link>
            <Link
              href="/admin/question-sets"
              className="font-medium underline"
              title="상태 열과 같은 한글: 초안·게시됨·보관됨"
            >
              인터뷰 질문셋 관리
            </Link>
            <Link href="/admin" className="font-medium underline" title="관리자 콘솔">
              관리자 콘솔
            </Link>
          </p>
          <p className="mt-2 text-xs text-amber-900/85">
            질문셋 목록의 상태 열과 같은 말(초안·게시됨·보관됨)을 씁니다. 칩·주소{" "}
            <span className="whitespace-nowrap font-mono text-[0.65rem]">?catalog=ARCHIVED</span>는 서버
            필터와 동일합니다.
          </p>
        </div>
      ) : null}

      {isDraft ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
            <p>
              <strong className="font-semibold">초안</strong> — 게시하기 전까지 사건에서 이 템플릿으로
              문서를 만들 수 없습니다. 섹션·문단 구성을 마친 뒤 상단의{" "}
              <strong className="font-semibold">게시</strong>를 눌러 주세요.
            </p>
            <p className="mt-2 text-xs text-sky-900/90">
              운영상으로는 내용을 채운 뒤 게시하는 것이 좋습니다. 게시 후에는 목록에서 「게시됨」으로
              표시되며, 인터뷰 질문셋의 「게시됨」과 같은 카탈로그 단계입니다.
            </p>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
            <strong className="font-semibold">게시 전 운영 주의</strong> — 서버는{" "}
            <code className="rounded bg-amber-100/80 px-1 text-[0.7rem]">publish</code> 시{" "}
            <strong className="font-semibold">마지막으로 저장된</strong>{" "}
            <strong className="font-semibold">definitionJson</strong>만 스키마·최소 구조(섹션 ≥1·문단
            합계 ≥1)로 검사합니다. 화면에서만 고치고 저장하지 않으면 검사에 반영되지 않습니다. 문단
            본문·필수 플래그 등은 이 단계에서 막지 않습니다.
            <span className="mt-2 block border-t border-amber-200/80 pt-2">
              <strong className="font-semibold">편집 중 구성 미리보기</strong> — 지금 편집기에 보이는
              트리 기준입니다. 게시 검사는 DB에 마지막으로 저장된 정의와만 대조하므로, 미리보기 메시지와
              실제 게시 결과가 다르면 먼저 「저장」해 주세요.{" "}
              {publishBlockerPreview ? (
                <span className="mt-1 block text-amber-900">{publishBlockerPreview}</span>
              ) : (
                <span className="mt-1 block text-emerald-900">
                  이 구성만 보면 최소 조건을 충족합니다. 게시 전 「저장」을 잊지 마세요.
                </span>
              )}
            </span>
          </div>
        </div>
      ) : null}

      {isPublished ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <p>
            <strong className="font-semibold">게시됨</strong> — 사건 문서 생성에 사용 가능한 버전입니다.
            내용을 수정한 뒤에는 <strong className="font-semibold">저장</strong>만 하면 됩니다. 더 이상
            쓰지 않을 때만 <strong className="font-semibold">보관</strong>하세요.
          </p>
          <p className="mt-2 text-xs text-emerald-900/90">
            보관하면 목록·편집에서는 읽기만 가능하고, 질문셋의 「보관됨」과 같이 선택 카탈로그에서
            빠집니다.
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{definition.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {definition.code} · v{definition.version} ·{" "}
              {DOCUMENT_TYPE_LABELS[definition.type] ?? definition.type} · {catalogStatusLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/document-templates"
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              title="카탈로그 칩·?catalog=·?page= 와 서버 조회가 일치합니다"
            >
              목록
            </Link>
            <button
              type="button"
              onClick={saveDefinition}
              disabled={saving || isArchived}
              title={
                isArchived
                  ? "보관된 템플릿은 편집 내용을 저장할 수 없습니다."
                  : "게시 검사·게시 반영에는 저장된 정의가 사용됩니다."
              }
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={() => void publishTemplate()}
              disabled={publishing || isArchived || isPublished}
              title={
                isPublished
                  ? "이미 게시된 템플릿입니다. 변경 사항은 저장으로 반영됩니다."
                  : isDraft
                    ? "게시 시 서버가 최소 섹션·문단 구조를 검사합니다. 클릭 시 확인 창이 열립니다."
                    : "서버에 저장된 정의 기준으로 게시 검사 후 게시합니다."
              }
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {publishing ? "게시 중..." : "게시"}
            </button>
            <button
              type="button"
              onClick={() => void archiveTemplate()}
              disabled={archiving || isArchived}
              title="보관으로 전환합니다. 즉시 서버에 반영되며 사건 문서 생성에서는 선택되지 않습니다."
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {archiving ? "보관 중..." : "보관"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-gray-500">섹션 수</div>
            <div className="mt-1 text-lg font-semibold">{sectionCount}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-gray-500">문단 수</div>
            <div className="mt-1 text-lg font-semibold">{paragraphCount}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-gray-500">수정일</div>
            <div className="mt-1 text-sm font-semibold">
              {new Date(item.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <DocumentTemplateMetaForm definition={definition} onChange={updateMeta} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">섹션 편집</h2>
          <button
            type="button"
            onClick={addSection}
            disabled={isArchived}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="편집 트리에 새 섹션을 넣습니다. 서버·게시 검사에는 「저장」 후 반영됩니다."
          >
            섹션 추가
          </button>
        </div>

        {definition.sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-gray-500">
            <p>섹션이 없습니다. 새 섹션을 추가해 주세요.</p>
            <p className="mt-2 text-xs text-gray-400">
              게시 시 서버는 섹션 1개 이상·문단 합계 1개 이상을 요구합니다. 질문셋과 같이{" "}
              <strong className="text-gray-600">초안</strong> 단계에서 구조를 맞춘 뒤 게시하세요.
            </p>
          </div>
        ) : (
          sortedSections.map((section, i) => (
            <DocumentTemplateSectionEditor
              key={section.key}
              section={section}
              canMoveUp={i > 0}
              canMoveDown={i < sortedSections.length - 1}
              onMoveUp={() => moveSection(section.key, -1)}
              onMoveDown={() => moveSection(section.key, 1)}
              onChange={updateSection}
              onRemove={() => removeSection(section.key)}
            />
          ))
        )}
      </div>
    </div>
  );
}
