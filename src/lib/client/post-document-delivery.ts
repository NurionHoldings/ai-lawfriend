import { requireOkData } from "@/lib/client/api-error";

export type DocumentDeliveryPostBody = {
  channel: string;
  recipient?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

/** 서버 `deliverLegalDocumentPost` + `ok(result)` = `{ ok: true, data }` (domain envelope). */
export type DocumentDeliveryResult = {
  delivered: true;
  legalDocumentId: string;
  caseId: string;
};

/**
 * `POST /api/documents/:documentId/delivery` (또는 동일 본문의 `legal-documents/.../delivery`) 응답 파싱.
 * 서버는 항상 `ok({ delivered, legalDocumentId, caseId })` — `requireOkData` 직접 이관 (R8-303).
 */
export async function postDocumentDelivery(
  documentId: string,
  body: DocumentDeliveryPostBody,
  options?: { path?: "documents" | "legal-documents" },
): Promise<DocumentDeliveryResult> {
  const path = options?.path ?? "documents";
  const base =
    path === "documents"
      ? `/api/documents/${encodeURIComponent(documentId)}/delivery`
      : `/api/legal-documents/${encodeURIComponent(documentId)}/delivery`;

  const res = await fetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = await res.json();
  return requireOkData<DocumentDeliveryResult>(
    res,
    raw,
    "문서 전달 처리에 실패했습니다.",
  );
}
