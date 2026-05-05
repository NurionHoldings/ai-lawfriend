import { describe, expect, it } from "vitest";
import {
  buildDocumentGenerationGuardrailTrace,
  readGuardrailTraceFromSnapshot,
  toPublicSafeGuardrailTrace,
} from "./document-generation-guardrail-trace";

describe("document-generation-guardrail-trace", () => {
  it("builds a passed guardrail trace", () => {
    const trace = buildDocumentGenerationGuardrailTrace({
      generationPolicy: "NO_UNVERIFIED_FACTS",
      guardrailCheckStatus: "PASSED",
      checkedAt: new Date("2026-05-01T00:00:00.000Z"),
      warningMissingFields: [
        {
          fieldKey: "defendantAddress",
          label: "피고소인 주소",
          severity: "WARNING",
          suggestedQuestions: ["피고소인의 주소를 알고 계신가요?"],
        },
      ],
    });

    expect(trace.generationPolicy).toBe("NO_UNVERIFIED_FACTS");
    expect(trace.guardrailCheckStatus).toBe("PASSED");
    expect(trace.guardrailIssues).toEqual([]);
    expect(trace.warningMissingFields).toHaveLength(1);
    expect(trace.checkedAt).toBe("2026-05-01T00:00:00.000Z");
  });

  it("builds a failed guardrail trace with public-safe suggestions", () => {
    const trace = buildDocumentGenerationGuardrailTrace({
      generationPolicy: "NO_UNVERIFIED_FACTS",
      guardrailCheckStatus: "FAILED",
      guardrailIssues: ["검증되지 않은 판례번호로 보이는 표현이 포함되어 있습니다."],
      guardrailSuggestions: [
        {
          type: "CASE_LAW_REFERENCE",
          issue: "검증되지 않은 판례번호로 보이는 표현이 포함되어 있습니다.",
          suggestedQuestions: ["해당 판례 근거 자료가 있나요?"],
        },
      ],
      checkedAt: new Date("2026-05-01T00:00:00.000Z"),
    });

    expect(trace.guardrailCheckStatus).toBe("FAILED");
    expect(trace.guardrailIssues).toHaveLength(1);
    expect(trace.guardrailSuggestions).toHaveLength(1);
    expect(trace.guardrailSuggestions[0]?.type).toBe("CASE_LAW_REFERENCE");
  });

  it("filters non-warning missing fields", () => {
    const trace = buildDocumentGenerationGuardrailTrace({
      generationPolicy: "NO_UNVERIFIED_FACTS",
      guardrailCheckStatus: "PASSED",
      warningMissingFields: [
        {
          fieldKey: "victimName",
          label: "피해자 성명",
          severity: "BLOCKING",
          suggestedQuestions: ["피해자 성명은 무엇인가요?"],
        },
        {
          fieldKey: "defendantAddress",
          label: "피고소인 주소",
          severity: "WARNING",
          suggestedQuestions: ["피고소인의 주소를 알고 계신가요?"],
        },
      ],
    });

    expect(trace.warningMissingFields).toHaveLength(1);
    expect(trace.warningMissingFields[0]?.fieldKey).toBe("defendantAddress");
  });

  it("returns public-safe guardrail trace", () => {
    const trace = buildDocumentGenerationGuardrailTrace({
      generationPolicy: "NO_UNVERIFIED_FACTS",
      guardrailCheckStatus: "PASSED",
    });

    expect(toPublicSafeGuardrailTrace(trace)).toEqual({
      generationPolicy: trace.generationPolicy,
      guardrailCheckStatus: trace.guardrailCheckStatus,
      guardrailIssues: trace.guardrailIssues,
      warningMissingFields: trace.warningMissingFields,
      checkedAt: trace.checkedAt,
    });
    expect(toPublicSafeGuardrailTrace(null)).toBeNull();
  });

  it("reads a public-safe guardrail trace from snapshot json", () => {
    const trace = readGuardrailTraceFromSnapshot({
      guardrailTrace: {
        generationPolicy: "NO_UNVERIFIED_FACTS",
        guardrailCheckStatus: "PASSED",
        guardrailIssues: ["ignored? no"],
        warningMissingFields: [
          {
            fieldKey: "defendantAddress",
            label: "피고소인 주소",
            severity: "WARNING",
            suggestedQuestions: ["피고소인의 주소를 알고 계신가요?"],
          },
        ],
        checkedAt: "2026-05-01T00:00:00.000Z",
      },
    });

    expect(trace?.generationPolicy).toBe("NO_UNVERIFIED_FACTS");
    expect(trace?.guardrailCheckStatus).toBe("PASSED");
    expect(trace?.warningMissingFields).toHaveLength(1);
    expect(trace?.guardrailSuggestions).toEqual([]);
  });
});