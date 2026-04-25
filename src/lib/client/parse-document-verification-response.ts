import {
  documentVerificationResultSchema,
  type DocumentVerificationResult,
} from "@/features/document-verification/document-verification.validators";

const badShape = () =>
  new Error("문서 검증 응답 형식이 올바르지 않습니다.");

export type DocumentVerificationVerifyResult = DocumentVerificationResult;

/**
 * `POST /api/document-verification` 응답 `data` 본문 — `requireOkData` 뒤에 적용(서비스와 동일 `documentVerificationResultSchema`).
 */
export function assertDocumentVerificationResult(
  data: unknown,
): DocumentVerificationResult {
  const r = documentVerificationResultSchema.safeParse(data);
  if (!r.success) {
    throw badShape();
  }
  return r.data;
}
