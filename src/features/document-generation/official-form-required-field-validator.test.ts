import { describe, expect, it } from "vitest";
import {
  hasMeaningfulOfficialFormAnswer,
  validateOfficialFormRequiredFields,
} from "./official-form-required-field-validator";

describe("official-form-required-field-validator", () => {
  it("blocks generation when statement blocking fields are missing", () => {
    const result = validateOfficialFormRequiredFields({
      documentType: "STATEMENT",
      answers: {
        incident_date: "2026-05-01",
        incident_place: "",
        incident_timeline: "   ",
        witness_detail: [],
      },
    });

    expect(result.shouldBlockGeneration).toBe(true);
    expect(result.blockingFields.map((field) => field.fieldKey)).toEqual([
      "statement.incident_place",
      "statement.incident_timeline",
    ]);
    expect(result.warningFields.map((field) => field.fieldKey)).toEqual([
      "statement.witness_detail",
    ]);
  });

  it("allows generation when only warning fields are missing", () => {
    const result = validateOfficialFormRequiredFields({
      documentType: "CONSULT_NOTE",
      answers: {
        incident_date: "2026-05-01",
        incident_place: "서울",
        incident_timeline: "의뢰인 상담 요약",
        desired_result: "",
        current_status: null,
      },
    });

    expect(result.shouldBlockGeneration).toBe(false);
    expect(result.blockingFields).toEqual([]);
    expect(result.warningFields.map((field) => field.fieldKey)).toEqual([
      "consult.requested_action",
    ]);
    expect(result.suggestedQuestions).toContain("원하는 조치나 추가 요청사항이 있으면 입력해 주세요.");
  });

  it("treats one populated question key as enough to satisfy a field", () => {
    const result = validateOfficialFormRequiredFields({
      documentType: "OPINION",
      answers: {
        incident_date: "2026-05-01",
        incident_place: "부산",
        incident_timeline: "분쟁 경위",
        current_status: "검토 필요",
        witness_detail: "참고인 1명",
      },
    });

    expect(result.shouldBlockGeneration).toBe(false);
    expect(result.missingFields).toEqual([]);
  });

  it("uses document-type registry only and ignores unknown types", () => {
    const result = validateOfficialFormRequiredFields({
      documentType: "UNKNOWN",
      answers: {},
    });

    expect(result.shouldBlockGeneration).toBe(false);
    expect(result.missingFields).toEqual([]);
    expect(result.suggestedQuestions).toEqual([]);
  });

  it("treats null, undefined, blank strings, and empty arrays as missing answers", () => {
    expect(hasMeaningfulOfficialFormAnswer(null)).toBe(false);
    expect(hasMeaningfulOfficialFormAnswer(undefined)).toBe(false);
    expect(hasMeaningfulOfficialFormAnswer("   ")).toBe(false);
    expect(hasMeaningfulOfficialFormAnswer([])).toBe(false);
    expect(hasMeaningfulOfficialFormAnswer(false)).toBe(true);
    expect(hasMeaningfulOfficialFormAnswer(0)).toBe(true);
    expect(hasMeaningfulOfficialFormAnswer(["", "value"])).toBe(true);
  });
});