"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { requireOkData } from "@/lib/client/api-error";
import {
  formatLegalFormSourceLabel,
  LEGAL_FORM_SOURCE_PROVIDER_LABELS,
  type LegalFormSourceOption,
} from "@/lib/legal-form-source";

type TemplateSourceMode = "OFFICIAL_SOURCE" | "INTERNAL_STANDARD";

type Props = Readonly<{
  sources: LegalFormSourceOption[];
}>;

export function DocumentTemplateCreateClient({ sources }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("새 문서 템플릿");
  const [code, setCode] = useState("NEW_TEMPLATE");
  const [version, setVersion] = useState("1.0.0");
  const [type, setType] = useState("STATEMENT");
  const [sourceMode, setSourceMode] = useState<TemplateSourceMode>("INTERNAL_STANDARD");
  const [sourceId, setSourceId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedSource = sources.find((item) => item.id === sourceId) ?? null;

  async function handleCreate() {
    try {
      setSubmitting(true);

      const res = await fetch("/api/document-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          code,
          version,
          type,
          sourceId: sourceMode === "OFFICIAL_SOURCE" ? sourceId || null : null,
          sourceProvider: sourceMode === "INTERNAL_STANDARD" ? "INTERNAL_STANDARD" : null,
        }),
      });

      const raw = await res.json().catch(() => null);
      const data = requireOkData<{ id: string }>(res, raw, "템플릿 생성에 실패했습니다.");

      router.push(`/admin/document-templates/${data.id}`);
      router.refresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "템플릿 생성에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
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
        <Link
          href="/admin/legal-form-sources"
          className="underline hover:text-gray-900"
          title="공식서식 원천자료 목록"
        >
          공식서식 소스
        </Link>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <Link href="/admin" className="underline hover:text-gray-900" title="관리자 콘솔">
          관리자 콘솔
        </Link>
      </div>
      <h1 className="text-xl font-semibold">문서 템플릿 생성</h1>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        「생성」하면 <strong className="text-gray-700">초안</strong> 레코드가 만들어지고 곧바로{" "}
        <strong className="text-gray-700">편집기</strong>로 이동합니다. 인터뷰 질문셋과 같은 말로{" "}
        <strong className="text-gray-700">게시됨</strong>이 되어야 사건 문서 생성에서 선택됩니다. 게시
        전까지는 목록·칩에서도 <strong className="text-gray-700">초안</strong> 단계와 같습니다. 목록으로
        돌아올 때는 항목이 <strong className="text-gray-700">수정일 최신 순</strong>으로 보이며, 페이지당
        건수·<span className="whitespace-nowrap font-mono text-[0.7rem]">?page=</span> 안내는 목록
        화면 상단과 같습니다.
      </p>

      <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-950">
        <p>
          <strong className="font-semibold">초안으로 시작</strong> — 이 화면에서는 제목·코드·버전·타입만
          정합니다. 섹션·문단은 편집기에서 채운 뒤 <strong className="font-semibold">저장</strong>하고{" "}
          <strong className="font-semibold">게시</strong>하세요. 게시 전에는 사건에서 이 템플릿으로 문서를
          만들 수 없습니다.
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
        <strong className="font-semibold">게시 전 운영 주의</strong> — 편집기와 같은 규칙입니다. 서버는{" "}
        <code className="rounded bg-amber-100/80 px-1 text-[0.7rem]">publish</code> 시{" "}
        <strong className="font-semibold">마지막으로 저장된</strong>{" "}
        <strong className="font-semibold">definitionJson</strong>만 스키마·최소 구조(섹션 ≥1·문단 합계
        ≥1)로 검사합니다. 화면에서만 고치고 <strong className="font-semibold">저장</strong>하지 않으면
        검사에 반영되지 않습니다. 문단 본문·필수 플래그 등은 이 단계에서 막지 않습니다.
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="template-create-title" className="mb-1 block text-sm font-medium">
            제목
          </label>
          <input
            id="template-create-title"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="template-create-code" className="mb-1 block text-sm font-medium">
            코드
          </label>
          <input
            id="template-create-code"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="template-create-version" className="mb-1 block text-sm font-medium">
            버전
          </label>
          <input
            id="template-create-version"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="template-create-type" className="mb-1 block text-sm font-medium">
            문서 타입
          </label>
          <select
            id="template-create-type"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="STATEMENT">STATEMENT</option>
            <option value="OPINION">OPINION</option>
            <option value="CONSULT_NOTE">CONSULT_NOTE</option>
          </select>
        </div>

        <div>
          <label htmlFor="template-create-source-mode" className="mb-1 block text-sm font-medium">
            출처 기준
          </label>
          <select
            id="template-create-source-mode"
            className="w-full rounded-xl border px-3 py-2 text-sm"
            value={sourceMode}
            onChange={(e) => setSourceMode(e.target.value as TemplateSourceMode)}
          >
            <option value="INTERNAL_STANDARD">내부표준 템플릿</option>
            <option value="OFFICIAL_SOURCE">공식서식 소스 연결</option>
          </select>
        </div>

        {sourceMode === "OFFICIAL_SOURCE" ? (
          <div>
            <label htmlFor="template-create-source-id" className="mb-1 block text-sm font-medium">
              공식서식 소스
            </label>
            <select
              id="template-create-source-id"
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
            >
              <option value="">소스를 선택하세요</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {formatLegalFormSourceLabel(source)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              선택한 소스의 provider, URL, 해시는 템플릿에 스냅샷으로 저장됩니다.
            </p>
          </div>
        ) : null}

        {sourceMode === "OFFICIAL_SOURCE" && sourceId ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-700">
            {selectedSource ? (
              <>
                <div>
                  <strong>출처명:</strong> {formatLegalFormSourceLabel(selectedSource)}
                </div>
                <div>
                  <strong>출처군:</strong> {LEGAL_FORM_SOURCE_PROVIDER_LABELS[selectedSource.provider]}
                </div>
                <div>
                  <strong>문서유형:</strong> {selectedSource.documentType}
                </div>
                <div>
                  <strong>해시:</strong> {selectedSource.fileHash ?? "-"}
                </div>
              </>
            ) : (
              "선택한 소스 정보를 찾을 수 없습니다."
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          title="초안으로 저장된 뒤 편집기로 이동합니다"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "생성 중..." : "생성"}
        </button>
      </div>
    </div>
  );
}
