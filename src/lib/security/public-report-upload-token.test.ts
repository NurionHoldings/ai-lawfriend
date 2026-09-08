import { describe, expect, it } from "vitest";
import {
  PUBLIC_REPORT_UPLOAD_TOKEN_TTL_MS,
  hashPublicReportUploadToken,
  isValidPublicReportUploadToken,
} from "./public-report-upload-token";

describe("public report upload token", () => {
  const token = "a".repeat(48);
  const createdAt = new Date("2026-09-08T00:00:00.000Z");

  it("accepts a current SHA-256 token and rejects a different token", () => {
    const storedToken = hashPublicReportUploadToken(token);
    expect(
      isValidPublicReportUploadToken({ suppliedToken: token, storedToken, createdAt, now: createdAt }),
    ).toBe(true);
    expect(
      isValidPublicReportUploadToken({ suppliedToken: `${token}x`, storedToken, createdAt, now: createdAt }),
    ).toBe(false);
  });

  it("permits legacy plaintext records only during their existing upload window", () => {
    expect(
      isValidPublicReportUploadToken({ suppliedToken: token, storedToken: token, createdAt, now: createdAt }),
    ).toBe(true);
    expect(
      isValidPublicReportUploadToken({
        suppliedToken: token,
        storedToken: token,
        createdAt,
        now: new Date(createdAt.getTime() + PUBLIC_REPORT_UPLOAD_TOKEN_TTL_MS + 1),
      }),
    ).toBe(false);
  });
});
