import { describe, expect, it } from "vitest";
import { buildGuardrailPrintSummary } from "./document-guardrail-print-summary";

describe("document-guardrail-print-summary", () => {
  it("returns null when guardrailTrace is missing", () => {
    expect(buildGuardrailPrintSummary(null)).toBeNull();
    expect(buildGuardrailPrintSummary(undefined)).toBeNull();
  });

  it("builds public-safe print summary", () => {
    const summary = buildGuardrailPrintSummary({
      generationPolicy: "NO_UNVERIFIED_FACTS",
      guardrailCheckStatus: "PASSED",
      guardrailIssues: ["이 상세 문구는 출력 요약에 포함되면 안 됩니다."],
      warningMissingFields: [
        {
          fieldKey: "defendantAddress",
          label: "피고소인 주소",
          severity: "WARNING",
          suggestedQuestions: ["이 질문도 출력 요약에는 포함되면 안 됩니다."],
        },
      ],
      checkedAt: "2026-05-01T00:00:00.000Z",
    });

    expect(summary).toEqual({
      generationPolicy: "NO_UNVERIFIED_FACTS",
      guardrailCheckStatusLabel: "통과",
      checkedAtLabel: expect.any(String),
      warningMissingFieldCount: 1,
    });

    expect(JSON.stringify(summary)).not.toContain("상세 문구");
    expect(JSON.stringify(summary)).not.toContain("이 질문도");
    expect(JSON.stringify(summary)).not.toContain("defendantAddress");
  });

  it("maps FAILED status", () => {
    const summary = buildGuardrailPrintSummary({
      generationPolicy: "NO_UNVERIFIED_FACTS",
      guardrailCheckStatus: "FAILED",
      guardrailIssues: [],
      warningMissingFields: [],
      checkedAt: "2026-05-01T00:00:00.000Z",
    });

    expect(summary?.guardrailCheckStatusLabel).toBe("차단");
  });

  it("maps SKIPPED status", () => {
    const summary = buildGuardrailPrintSummary({
      generationPolicy: "NO_UNVERIFIED_FACTS",
      guardrailCheckStatus: "SKIPPED",
      guardrailIssues: [],
      warningMissingFields: [],
      checkedAt: "2026-05-01T00:00:00.000Z",
    });

    expect(summary?.guardrailCheckStatusLabel).toBe("건너뜀");
  });
});