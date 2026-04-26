import { describe, expect, it } from "vitest";
import { getAllowedCaseActions } from "@/lib/case-action-guard";

const baseFacts = {
  interviewCompleted: true,
  hasDraftDocument: true,
  hasApprovedDocument: true,
};

describe("getAllowedCaseActions — RB-05 (표시 vs PATCH /status 실행)", () => {
  it("HOLD에서는 PUT_ON_HOLD를 숨기고 RESUME_FROM_HOLD만 허용 (CASE_TRANSITIONS 정합)", () => {
    const a = getAllowedCaseActions({
      role: "LAWYER",
      caseStatus: "HOLD",
      facts: baseFacts,
    });
    expect(a.PUT_ON_HOLD).toBe(false);
    expect(a.RESUME_FROM_HOLD).toBe(true);
  });

  it("DELIVERED에서는 PUT_ON_HOLD 허용·CLOSE_CASE 허용(변호사)", () => {
    const a = getAllowedCaseActions({
      role: "LAWYER",
      caseStatus: "DELIVERED",
      facts: baseFacts,
    });
    expect(a.PUT_ON_HOLD).toBe(true);
    expect(a.CLOSE_CASE).toBe(true);
  });
});
