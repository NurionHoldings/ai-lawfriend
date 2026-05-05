import { describe, expect, it } from "vitest";
import {
  checkForbiddenMarketingPhrases,
  checkForbiddenOutputFieldNames,
  maskCasePackageDisplayName,
  sanitizeCasePackageLogForClient,
} from "./case-package-privacy-security-utils";

describe("case-package privacy security utils", () => {
  it("detects forbidden output fields", () => {
    const result = checkForbiddenOutputFieldNames([
      "publicCode",
      "caseTitle",
      "storagePath",
      "accessToken",
    ]);

    expect(result.passed).toBe(false);
    expect(result.violations).toEqual(["storagePath", "accessToken"]);
  });

  it("passes allowed output fields", () => {
    const result = checkForbiddenOutputFieldNames([
      "publicCode",
      "caseTitle",
      "caseSummary",
    ]);

    expect(result).toEqual({
      passed: true,
      violations: [],
    });
  });

  it("detects forbidden marketing phrases", () => {
    const result = checkForbiddenMarketingPhrases(
      "AI가 법률상담을 제공합니다. 승소 가능성을 보장합니다.",
    );

    expect(result.passed).toBe(false);
    expect(result.violations).toEqual([
      "AI가 법률상담을 제공합니다.",
      "승소 가능성을 보장합니다.",
    ]);
  });

  it("masks display name", () => {
    expect(maskCasePackageDisplayName("최인석")).toBe("최**");
    expect(maskCasePackageDisplayName("김")).toBe("*");
    expect(maskCasePackageDisplayName(null)).toBe("의뢰인");
  });

  it("removes ip and userAgent from client log", () => {
    const result = sanitizeCasePackageLogForClient({
      id: "log_1",
      action: "VIEW",
      ip: "127.0.0.1",
      userAgent: "test-agent",
      resultMessage: "ok",
    });

    expect(result).toEqual({
      id: "log_1",
      action: "VIEW",
      resultMessage: "ok",
    });
  });
});
