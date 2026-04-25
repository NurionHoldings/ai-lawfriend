import { describe, expect, it } from "vitest";
import { getAllowedLifecycleActionsForCase } from "@/lib/cases/allowed-actions";

/**
 * [277] STAFF + 인터뷰 완료 직후 상태(INTERVIEW_DONE)에서의 허용 액션 — `CASE_TRANSITIONS`·`getAvailableTransitions` 정합
 * (UI/API `completeCaseInterviewService` 응답의 `allowedLifecycleActions`와 동일 함수 축)
 */
describe("[277] allowedActions — STAFF after interview (INTERVIEW_DONE)", () => {
  it("STAFF at IN_INTERVIEW: COMPLETE_INTERVIEW is available (transition rule — 실제 complete는 서비스·필수응답)", () => {
    const a = getAllowedLifecycleActionsForCase("IN_INTERVIEW", "STAFF");
    expect(a).toContain("COMPLETE_INTERVIEW");
  });

  it("STAFF at INTERVIEW_DONE: GENERATE_DRAFT + PUT_ON_HOLD (REJECT는 LAWYER/ADMIN만 — STAFF 제외)", () => {
    const a = getAllowedLifecycleActionsForCase("INTERVIEW_DONE", "STAFF");
    expect(a.sort()).toEqual(["GENERATE_DRAFT", "PUT_ON_HOLD"].sort());
  });

  it("LAWYER at INTERVIEW_DONE: includes REJECT_CASE (STAFF과 구분)", () => {
    const staff = getAllowedLifecycleActionsForCase("INTERVIEW_DONE", "STAFF");
    const lawyer = getAllowedLifecycleActionsForCase("INTERVIEW_DONE", "LAWYER");
    expect(lawyer).toContain("REJECT_CASE");
    expect(staff).not.toContain("REJECT_CASE");
  });
});
