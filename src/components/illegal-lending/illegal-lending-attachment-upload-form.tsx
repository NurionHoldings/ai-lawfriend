"use client";

import { useState } from "react";
import { getCurrentIllegalLendingPromoVariant } from "@/features/illegal-lending/promo/illegal-lending-current-variant";
import { trackIllegalLendingPromoEvent } from "@/features/illegal-lending/promo/illegal-lending-promo-analytics";
import { ILLEGAL_LENDING_PROMO_EVENTS } from "@/features/illegal-lending/promo/illegal-lending-promo-events";

const ATTACHMENT_OPTIONS = [
  ["MESSAGE_CAPTURE", "문자·카카오톡·메신저 캡처"],
  ["CALL_RECORDING", "통화녹음"],
  ["BANK_TRANSFER", "계좌이체·입출금 내역"],
  ["CONTRACT_OR_NOTE", "계약서·차용증"],
  ["ID_OR_PERSONAL_INFO_REQUEST", "신분증·개인정보 요구 내역"],
  ["THREAT_EVIDENCE", "협박·불법추심 증거"],
  ["OTHER", "기타"],
] as const;

export function IllegalLendingAttachmentUploadForm({
  reportId,
  uploadToken,
}: Readonly<{
  reportId: string;
  uploadToken: string;
}>) {
  const [attachmentType, setAttachmentType] = useState("MESSAGE_CAPTURE");
  const [memo, setMemo] = useState("");
  const [uploadedByName, setUploadedByName] = useState("");
  const [uploadedByPhone, setUploadedByPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) {
      setMessage("업로드할 파일을 선택해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      trackIllegalLendingPromoEvent(
        ILLEGAL_LENDING_PROMO_EVENTS.ATTACHMENT_UPLOAD_ATTEMPT,
        {
          source: "attachment_upload",
          variant: getCurrentIllegalLendingPromoVariant(),
          reportId,
          attachmentType,
          fileSize: file.size,
          fileType: file.type,
        },
      );

      const formData = new FormData();
      formData.append("uploadToken", uploadToken);
      formData.append("attachmentType", attachmentType);
      formData.append("memo", memo);
      formData.append("uploadedByName", uploadedByName);
      formData.append("uploadedByPhone", uploadedByPhone);
      formData.append("file", file);

      const res = await fetch(
        `/api/public/illegal-lending-reports/${reportId}/attachments`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = (await res.json()) as { ok: boolean; message?: string };

      if (!res.ok || !data.ok) {
        trackIllegalLendingPromoEvent(
          ILLEGAL_LENDING_PROMO_EVENTS.ATTACHMENT_UPLOAD_FAIL,
          {
            source: "attachment_upload",
            variant: getCurrentIllegalLendingPromoVariant(),
            reportId,
            attachmentType,
            reason: data.message || "response_not_ok",
          },
        );
        setMessage(data.message || "업로드에 실패했습니다.");
        return;
      }

      trackIllegalLendingPromoEvent(
        ILLEGAL_LENDING_PROMO_EVENTS.ATTACHMENT_UPLOAD_SUCCESS,
        {
          source: "attachment_upload",
          variant: getCurrentIllegalLendingPromoVariant(),
          reportId,
          attachmentType,
          fileSize: file.size,
          fileType: file.type,
        },
      );

      setMessage("첨부파일이 업로드되었습니다.");
      setMemo("");
      setFile(null);
    } catch {
      trackIllegalLendingPromoEvent(
        ILLEGAL_LENDING_PROMO_EVENTS.ATTACHMENT_UPLOAD_FAIL,
        {
          source: "attachment_upload",
          variant: getCurrentIllegalLendingPromoVariant(),
          reportId,
          attachmentType,
          reason: "network_error",
        },
      );
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-slate-900/80 p-6">
      <h2 className="text-xl font-bold text-slate-100">증거자료 첨부</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        문자, 카카오톡, 통화녹음, 계좌이체내역, 계약서, 차용증 등 피해 입증자료를 첨부할 수 있습니다.
        파일은 관리자만 열람할 수 있도록 비공개 저장됩니다.
      </p>
      <div className="mt-4 grid gap-4">
        <select
          value={attachmentType}
          onChange={(event) => setAttachmentType(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300"
        >
          {ATTACHMENT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={uploadedByName}
          onChange={(event) => setUploadedByName(event.target.value)}
          placeholder="업로드자 성명"
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300"
        />
        <input
          value={uploadedByPhone}
          onChange={(event) => setUploadedByPhone(event.target.value)}
          placeholder="업로드자 연락처"
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-300"
        />
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="첨부자료 설명"
          className="min-h-24 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-100 outline-none focus:border-cyan-300"
        />
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100"
        />
        <button
          type="button"
          onClick={() => {
            void upload();
          }}
          disabled={loading}
          className="rounded-2xl bg-cyan-300 px-5 py-4 font-bold text-slate-950 disabled:opacity-40"
        >
          {loading ? "업로드 중..." : "증거자료 업로드"}
        </button>
        {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      </div>
    </div>
  );
}