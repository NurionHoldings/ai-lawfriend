"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  QUESTION_SET_CATALOG_STATUS_LABELS,
  type QuestionSetDefinition,
  type QuestionSetStatus,
} from "@/lib/definitions";
import { QuestionSetMetaForm } from "@/components/admin/question-set-meta-form";
import { QuestionSetSectionEditor } from "@/components/admin/question-set-section-editor";
import { requireOkData } from "@/lib/client/api-error";

type EditorItem = {
  id: string;
  code: string;
  version: string;
  title: string;
  description: string | null;
  catalogStatus: string;
  supportedDocumentTypes: string[];
  visibleToRoles: string[];
  definitionJson: unknown;
  publishedAt: string | null;
  archivedAt: string | null;
  updatedAt: string;
};

type EditorProps = {
  item: EditorItem;
};

function asStatus(s: string): QuestionSetStatus {
  if (s === "PUBLISHED" || s === "ARCHIVED" || s === "DRAFT") return s;
  return "DRAFT";
}

function buildFallbackDefinition(item: EditorItem): QuestionSetDefinition {
  return {
    version: item.version,
    code: item.code || "UNNAMED",
    title: item.title,
    description: item.description ?? "",
    status: asStatus(item.catalogStatus),
    supportedDocumentTypes:
      item.supportedDocumentTypes.length > 0
        ? (item.supportedDocumentTypes as QuestionSetDefinition["supportedDocumentTypes"])
        : ["STATEMENT"],
    visibleToRoles:
      item.visibleToRoles.length > 0
        ? (item.visibleToRoles as QuestionSetDefinition["visibleToRoles"])
        : ["ADMIN", "LAWYER", "STAFF", "CLIENT"],
    sections: [],
  };
}

function mergeDefinition(item: EditorItem): QuestionSetDefinition {
  const raw = item.definitionJson;
  const fallback = buildFallbackDefinition(item);
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Partial<QuestionSetDefinition>;
    return {
      ...fallback,
      ...o,
      title: o.title ?? item.title,
      code: o.code ?? item.code ?? fallback.code,
      version: o.version ?? item.version,
      description: o.description ?? fallback.description,
      status: o.status ?? asStatus(item.catalogStatus),
      supportedDocumentTypes:
        Array.isArray(o.supportedDocumentTypes) && o.supportedDocumentTypes.length > 0
          ? (o.supportedDocumentTypes as QuestionSetDefinition["supportedDocumentTypes"])
          : fallback.supportedDocumentTypes,
      visibleToRoles:
        Array.isArray(o.visibleToRoles) && o.visibleToRoles.length > 0
          ? (o.visibleToRoles as QuestionSetDefinition["visibleToRoles"])
          : fallback.visibleToRoles,
      sections: Array.isArray(o.sections) ? o.sections : [],
    };
  }
  return fallback;
}

export function QuestionSetEditor({ item }: EditorProps) {
  const [definition, setDefinition] = useState<QuestionSetDefinition>(() => mergeDefinition(item));
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const sectionCount = definition.sections.length;
  const questionCount = useMemo(
    () => definition.sections.reduce((acc, section) => acc + section.questions.length, 0),
    [definition.sections],
  );

  function updateMeta(patch: Partial<QuestionSetDefinition>) {
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
          description: "",
          order: prev.sections.length,
          questions: [],
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

  function updateSection(nextSection: QuestionSetDefinition["sections"][number]) {
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

  async function saveDefinition() {
    try {
      setSaving(true);

      const res = await fetch(`/api/question-sets/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: definition.title,
          description: definition.description ?? "",
          supportedDocumentTypes: definition.supportedDocumentTypes,
          visibleToRoles: definition.visibleToRoles,
          definitionJson: definition,
        }),
      });

      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "질문셋 저장에 실패했습니다.");

      alert("질문셋이 저장되었습니다.");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "질문셋 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function publishDefinition() {
    try {
      setPublishing(true);
      const res = await fetch(`/api/question-sets/${item.id}/publish`, {
        method: "PATCH",
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "질문셋 게시에 실패했습니다.");
      alert("질문셋이 게시되었습니다.");
      location.reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "질문셋 게시에 실패했습니다.");
    } finally {
      setPublishing(false);
    }
  }

  async function archiveDefinition() {
    try {
      setArchiving(true);
      const res = await fetch(`/api/question-sets/${item.id}/archive`, {
        method: "PATCH",
      });
      const raw = await res.json().catch(() => null);
      requireOkData(res, raw, "질문셋 보관에 실패했습니다.");
      alert("질문셋이 보관되었습니다.");
      location.reload();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "질문셋 보관에 실패했습니다.");
    } finally {
      setArchiving(false);
    }
  }

  const sortedSections = [...definition.sections].sort((a, b) => a.order - b.order);

  const catalogStatusKey = asStatus(item.catalogStatus);
  const catalogStatusLabel =
    QUESTION_SET_CATALOG_STATUS_LABELS[catalogStatusKey] ?? item.catalogStatus;
  const isArchived = item.catalogStatus === "ARCHIVED";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong className="font-semibold">저장·게시(정책)</strong> — <strong>저장</strong>은{" "}
        <code className="rounded bg-amber-100/80 px-1">definitionJson</code>·제목·메타만
        갱신하고, 사건 <strong>인터뷰</strong>가 쓰는 플랫{" "}
        <code className="rounded bg-amber-100/80 px-1">QuestionSet.questions</code>(A안)은
        <strong> 이 저장으로는 바뀌지 않습니다.</strong> A안에 정의를 반영하려면 <strong>게시</strong>를
        누르세요. 게시(<code className="rounded bg-amber-100/80 px-1">PATCH …/publish</code>)에 성공하면
        같은 요청에서 최신 <code className="rounded bg-amber-100/80 px-1">definitionJson</code>이 A안
        <code className="rounded bg-amber-100/80 px-1">questions</code>로 투영·저장됩니다(초회·재게시
        동일). 이미 쌓인 DB만 점검·보정(백필)이나 시드는 운영 절차·
        <span className="whitespace-nowrap">EVIDENCE-20260425-344</span>·
        <span className="whitespace-nowrap">A §4.5</span>를 따릅니다. (근거:{" "}
        <span className="whitespace-nowrap">EVIDENCE-20260425-343</span> ·{" "}
        <span className="whitespace-nowrap">QUESTION_SET_DEFINITION §14-1</span>)
      </div>

      {isArchived ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong className="font-semibold">보관됨</strong> — 이 버전은 카탈로그에서 보관 상태입니다.
          수정이 필요하면 새 질문셋을 만들거나 운영 절차에 따라 복제·재게시를 검토하세요. (하단 편집은
          잠금 정책 도입 전까지 가능하나, 저장 시 팀 규칙을 따르세요.)
        </div>
      ) : null}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{definition.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {definition.code} · v{definition.version} · {catalogStatusLabel}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/question-sets"
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              목록
            </Link>
            <button
              type="button"
              onClick={saveDefinition}
              disabled={saving || isArchived}
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              onClick={publishDefinition}
              disabled={publishing || isArchived}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {publishing ? "게시 중..." : "게시"}
            </button>
            <button
              type="button"
              onClick={archiveDefinition}
              disabled={archiving || isArchived}
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
            <div className="text-xs text-gray-500">질문 수</div>
            <div className="mt-1 text-lg font-semibold">{questionCount}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-xs text-gray-500">수정일</div>
            <div className="mt-1 text-sm font-semibold">
              {new Date(item.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <QuestionSetMetaForm definition={definition} onChange={updateMeta} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">섹션 편집</h2>
          <button
            type="button"
            onClick={addSection}
            disabled={isArchived}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            섹션 추가
          </button>
        </div>

        {definition.sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-gray-500">
            섹션이 없습니다. 새 섹션을 추가해 주세요.
          </div>
        ) : (
          sortedSections.map((section, i) => (
            <QuestionSetSectionEditor
              key={section.key}
              section={section}
              documentTypes={definition.supportedDocumentTypes}
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
