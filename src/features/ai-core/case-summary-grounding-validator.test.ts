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
      allowedSourceRefs: ["answer:background", "rule_based"],
      grounding: [
        { claim: "임금 미지급을 주장합니다.", sourceRefs: ["answer:background"] },
        { claim: "2026년 1월 퇴사", sourceRefs: ["answer:background"] },
        { claim: "급여명세서 확인", sourceRefs: ["rule_based"] },
      ],
    }).passed).toBe(true);
  });

  it("rejects missing and invented refs", () => {
    const result = validateCaseSummaryGrounding({
      content,
      allowedSourceRefs: ["answer:background"],
      grounding: [
        { claim: "임금 미지급을 주장합니다.", sourceRefs: ["invented:precedent"] },
      ],
    });
    expect(result.passed).toBe(false);
    expect(result.issues.join(" ")).toContain("unknown case summary source refs");
    expect(result.issues.join(" ")).toContain("ungrounded case summary claim");
  });
});
