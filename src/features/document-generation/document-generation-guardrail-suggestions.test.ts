import { describe, expect, it } from "vitest";
import {
  buildGuardrailViolationSuggestions,
  classifyGuardrailViolationIssue,
} from "./document-generation-guardrail-suggestions";

describe("document-generation-guardrail-suggestions", () => {
  it("classifies case law reference issues", () => {
    expect(
      classifyGuardrailViolationIssue("검증되지 않은 판례번호로 보이는 표현이 포함되어 있습니다."),
    ).toBe("CASE_LAW_REFERENCE");
  });

  it("classifies legal article reference issues", () => {
    expect(
      classifyGuardrailViolationIssue("법령 조문 표현이 포함되어 있습니다. 입력 근거 확인이 필요합니다."),
    ).toBe("LEGAL_ARTICLE_REFERENCE");
  });

  it("classifies overconfident assertion issues", () => {
    expect(
      classifyGuardrailViolationIssue("과도하게 단정적인 표현이 포함되어 있습니다."),
    ).toBe("OVERCONFIDENT_ASSERTION");
  });

  it("falls back to unclassified", () => {
    expect(classifyGuardrailViolationIssue("알 수 없는 안전 정책 위반")).toBe("UNCLASSIFIED");
  });

  it("builds suggested questions for each issue", () => {
    const suggestions = buildGuardrailViolationSuggestions([
      "검증되지 않은 판례번호로 보이는 표현이 포함되어 있습니다.",
      "법령 조문 표현이 포함되어 있습니다. 입력 근거 확인이 필요합니다.",
      "과도하게 단정적인 표현이 포함되어 있습니다.",
    ]);

    expect(suggestions).toHaveLength(3);
    expect(suggestions[0]?.type).toBe("CASE_LAW_REFERENCE");
    expect(suggestions[0]?.suggestedQuestions.length).toBeGreaterThan(0);
    expect(suggestions[1]?.type).toBe("LEGAL_ARTICLE_REFERENCE");
    expect(suggestions[2]?.type).toBe("OVERCONFIDENT_ASSERTION");
  });
});