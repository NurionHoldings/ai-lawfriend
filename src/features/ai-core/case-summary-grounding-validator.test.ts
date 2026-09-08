import { describe, expect, it } from "vitest";
import { validateCaseSummaryGrounding } from "./case-summary-grounding-validator";

const content = {
  caseOverview: "임금 미지급을 주장합니다.",
  timeline: ["2026년 1월 퇴사"],
  issues: [],
  riskNotes: [],
  checklist: ["급여명세서 확인"],
};

describe("case-summary-grounding-validator", () => {
  it("accepts only claims linked to known input refs", () => {
    expect(validateCaseSummaryGrounding({
      content,
      sourceTextByRef: { "answer:background": "임금 미지급, 2026년 1월 퇴사", rule_based: "급여명세서 확인" },
      grounding: [
        { claim: "임금 미지급을 주장합니다.", sources: [{ ref: "answer:background", quote: "임금 미지급" }] },
        { claim: "2026년 1월 퇴사", sources: [{ ref: "answer:background", quote: "2026년 1월 퇴사" }] },
        { claim: "급여명세서 확인", sources: [{ ref: "rule_based", quote: "급여명세서 확인" }] },
      ],
    }).passed).toBe(true);
  });

  it("rejects missing and invented refs", () => {
    const result = validateCaseSummaryGrounding({
      content,
      sourceTextByRef: { "answer:background": "임금 미지급" },
      grounding: [
        { claim: "임금 미지급을 주장합니다.", sources: [{ ref: "invented:precedent", quote: "판례" }] },
      ],
    });
    expect(result.passed).toBe(false);
    expect(result.issues.join(" ")).toContain("unknown case summary source refs");
    expect(result.issues.join(" ")).toContain("ungrounded case summary claim");
  });

  it("rejects a fabricated quote even when the ref exists", () => {
    const result = validateCaseSummaryGrounding({
      content: { ...content, timeline: [], checklist: [] },
      sourceTextByRef: { "answer:background": "임금 미지급" },
      grounding: [{
        claim: "임금 미지급을 주장합니다.",
        sources: [{ ref: "answer:background", quote: "대법원 판결" }],
      }],
    });
    expect(result.issues).toContain("case summary source quote not found: answer:background");
  });
});
