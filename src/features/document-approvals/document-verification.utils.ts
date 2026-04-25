import { createHash } from "crypto";

export type BuildDocumentVerificationCodeInput = {
  documentId: string;
  versionId: string;
  versionNumber: number;
  title: string;
  content: string;
  lockedAt: Date | string | null;
};

function canonicalPayload(input: BuildDocumentVerificationCodeInput): string {
  const locked =
    input.lockedAt instanceof Date
      ? input.lockedAt.toISOString()
      : input.lockedAt != null && input.lockedAt !== ""
        ? String(input.lockedAt)
        : "";
  return [
    input.documentId,
    input.versionId,
    String(input.versionNumber),
    input.title,
    input.content,
    locked,
  ].join("|");
}

/**
 * 승인 잠금 버전 기준 검증코드(짧은 코드 + 전체 SHA-256 해시).
 * 동일 입력이면 항상 동일한 해시가 생성됩니다.
 */
export function buildDocumentVerificationCode(
  input: BuildDocumentVerificationCodeInput,
) {
  const payload = canonicalPayload(input);
  const fullHash = createHash("sha256").update(payload, "utf8").digest("hex");
  const upper = fullHash.toUpperCase();
  const shortCode = [
    upper.slice(0, 8),
    upper.slice(8, 16),
    upper.slice(16, 24),
    upper.slice(24, 32),
  ].join("-");

  return { shortCode, fullHash };
}
