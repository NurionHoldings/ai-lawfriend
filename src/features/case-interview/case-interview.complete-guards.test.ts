import { describe, expect, it } from "vitest";
import {
  assertCaseTerminalAllowsInterviewComplete,
  assertInInterviewForNewComplete,
} from "./case-interview.service";

describe("completeCaseInterviewService 가드 (IV-04 / LC-03 / ST-03)", () => {
  it("종결·반려·삭제는 거부", () => {
    expect(() => assertCaseTerminalAllowsInterviewComplete("CLOSED")).toThrow(
      /종결·반려·삭제/,
    );
    expect(() => assertCaseTerminalAllowsInterviewComplete("REJECTED")).toThrow();
    expect(() => assertCaseTerminalAllowsInterviewComplete("DELETED")).toThrow();
  });

  it("신규 완료는 IN_INTERVIEW만 허용(CASE_TRANSITIONS COMPLETE_INTERVIEW와 정합)", () => {
    expect(() => assertInInterviewForNewComplete("IN_INTERVIEW")).not.toThrow();
  });

  it("CREATED·INTAKE_PENDING는 안내 메시지와 함께 거부", () => {
    expect(() => assertInInterviewForNewComplete("CREATED")).toThrow(/인터뷰 진행 중/);
    expect(() => assertInInterviewForNewComplete("INTAKE_PENDING")).toThrow(
      /인터뷰 진행 중/,
    );
  });

  it("보류·이미 이후 단계는 거부", () => {
    expect(() => assertInInterviewForNewComplete("HOLD")).toThrow(/보류/);
    expect(() => assertInInterviewForNewComplete("INTERVIEW_DONE")).toThrow(
      /현재 사건 단계/,
    );
  });
});
