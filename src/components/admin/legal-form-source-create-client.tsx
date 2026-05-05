"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { requireOkData } from "@/lib/client/api-error";
import {
  LEGAL_FORM_SOURCE_PROVIDER_LABELS,
  LEGAL_FORM_SOURCE_PROVIDER_VALUES,
  type LegalFormSourceProviderValue,
} from "@/lib/legal-form-source";

export function LegalFormSourceCreateClient() {
  const router = useRouter();
  const [provider, setProvider] = useState<LegalFormSourceProviderValue>("SCOURT");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [documentType, setDocumentType] = useState("COMPLAINT");
  const [category, setCategory] = useState("CRIMINAL");
  const [officialFormCode, setOfficialFormCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileMimeType, setFileMimeType] = useState("application/x-hwp");
  const [fileHash, setFileHash] = useState("");
  const [storageKey, setStorageKey] = useState("");
  const [downloadedAt, setDownloadedAt] = useState(new Date().toISOString().slice(0, 10));
  const [effectiveDate, setEffectiveDate] = useState("");
  const [licenseNote, setLicenseNote] = useState("");
  const [parsedText, setParsedText] = useState("");
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    try {
      setSubmitting(true);

      const res = await fetch("/api/legal-form-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          sourceName,
          sourceUrl,
          documentType,
          category: category || null,
          officialFormCode: officialFormCode || null,
          fileName: fileName || null,
          fileMimeType: fileMimeType || null,
          fileHash: fileHash || null,
          storageKey: storageKey || null,
          downloadedAt: downloadedAt
            ? new Date(`${downloadedAt}T00:00:00.000Z`).toISOString()
            : null,
          effectiveDate: effectiveDate
            ? new Date(`${effectiveDate}T00:00:00.000Z`).toISOString()
            : null,
          licenseNote: licenseNote || null,
          parsedText: parsedText || null,
          memo: memo || null,
        }),
      });

      const raw = await res.json().catch(() => null);
      requireOkData<{ id: string }>(res, raw, "공식서식 소스 등록에 실패했습니다.");
      router.push("/admin/legal-form-sources");
      router.refresh();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "공식서식 소스 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
        <Link href="/admin/legal-form-sources" className="underline hover:text-gray-900">
          ← 공식서식 소스 목록
        </Link>
        <span className="text-gray-300" aria-hidden>
          |
        </span>
        <Link href="/admin/document-templates" className="underline hover:text-gray-900">
          문서 템플릿 관리자
        </Link>
      </div>

      <h1 className="text-xl font-semibold">공식서식 소스 등록</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        출처명, 문서유형, URL, 해시, 날짜를 남겨 공식서식 원천자료를 추적합니다.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="legal-form-source-provider" className="mb-1 block text-sm font-medium">
            출처군
          </label>
          <select
            id="legal-form-source-provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value as LegalFormSourceProviderValue)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          >
            {LEGAL_FORM_SOURCE_PROVIDER_VALUES.map((value) => (
              <option key={value} value={value}>
                {LEGAL_FORM_SOURCE_PROVIDER_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="legal-form-source-name" className="mb-1 block text-sm font-medium">
            출처명
          </label>
          <input
            id="legal-form-source-name"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-document-type" className="mb-1 block text-sm font-medium">
            문서유형
          </label>
          <input
            id="legal-form-source-document-type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-category" className="mb-1 block text-sm font-medium">
            카테고리
          </label>
          <input
            id="legal-form-source-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-official-code" className="mb-1 block text-sm font-medium">
            공식서식 코드
          </label>
          <input
            id="legal-form-source-official-code"
            value={officialFormCode}
            onChange={(e) => setOfficialFormCode(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="legal-form-source-url" className="mb-1 block text-sm font-medium">
            출처 URL
          </label>
          <input
            id="legal-form-source-url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-file-name" className="mb-1 block text-sm font-medium">
            파일명
          </label>
          <input
            id="legal-form-source-file-name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-file-mime" className="mb-1 block text-sm font-medium">
            파일 MIME 타입
          </label>
          <input
            id="legal-form-source-file-mime"
            value={fileMimeType}
            onChange={(e) => setFileMimeType(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-file-hash" className="mb-1 block text-sm font-medium">
            파일 해시
          </label>
          <input
            id="legal-form-source-file-hash"
            value={fileHash}
            onChange={(e) => setFileHash(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm font-mono"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-storage-key" className="mb-1 block text-sm font-medium">
            스토리지 키
          </label>
          <input
            id="legal-form-source-storage-key"
            value={storageKey}
            onChange={(e) => setStorageKey(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-downloaded-at" className="mb-1 block text-sm font-medium">
            다운로드일
          </label>
          <input
            id="legal-form-source-downloaded-at"
            type="date"
            value={downloadedAt}
            onChange={(e) => setDownloadedAt(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="legal-form-source-effective-date" className="mb-1 block text-sm font-medium">
            시행일
          </label>
          <input
            id="legal-form-source-effective-date"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="legal-form-source-license-note" className="mb-1 block text-sm font-medium">
            이용조건 메모
          </label>
          <textarea
            id="legal-form-source-license-note"
            value={licenseNote}
            onChange={(e) => setLicenseNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="legal-form-source-parsed-text" className="mb-1 block text-sm font-medium">
            원문 추출 텍스트
          </label>
          <textarea
            id="legal-form-source-parsed-text"
            value={parsedText}
            onChange={(e) => setParsedText(e.target.value)}
            rows={6}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="legal-form-source-memo" className="mb-1 block text-sm font-medium">
            운영 메모
          </label>
          <textarea
            id="legal-form-source-memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full rounded-xl border px-3 py-2 text-sm"
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
          {submitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}