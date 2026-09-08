import crypto from "node:crypto";

export const PUBLIC_REPORT_UPLOAD_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function createPublicReportUploadToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function hashPublicReportUploadToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function safelyEqual(left: string, right: string): boolean {
  const leftValue = Buffer.from(left);
  const rightValue = Buffer.from(right);
  return leftValue.length === rightValue.length && crypto.timingSafeEqual(leftValue, rightValue);
}

/**
 * New records persist only a SHA-256 token digest. The raw-value comparison is a
 * temporary compatibility path for reports created before this hardening.
 */
export function isValidPublicReportUploadToken(input: {
  suppliedToken: string;
  storedToken: string | null;
  createdAt: Date;
  now?: Date;
}): boolean {
  if (!input.suppliedToken || !input.storedToken) return false;
  const now = input.now?.getTime() ?? Date.now();
  if (now > input.createdAt.getTime() + PUBLIC_REPORT_UPLOAD_TOKEN_TTL_MS) {
    return false;
  }

  const digest = hashPublicReportUploadToken(input.suppliedToken);
  return safelyEqual(input.storedToken, digest) || safelyEqual(input.storedToken, input.suppliedToken);
}
