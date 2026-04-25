import { describe, expect, it } from "vitest";
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import type { QuestionSetQuestion } from "@/features/question-set/question-set.types";
import { isQuestionVisible, resolveInterviewQuestions } from "./interview-branching.utils";

function ctx(partial: Partial<CaseAccessContext> = {}): CaseAccessContext {
  return {
    caseId: "c1",
    ownerUserId: "o1",
    status: "IN_INTERVIEW",
    title: "t",
    isOwner: false,
    isAdmin: false,
    isAssignedLawyer: false,
    isAssignedStaff: false,
    canRead: true,
    canWriteCase: true,
    canManageStaffFeatures: false,
    ...partial,
  };
}

describe("interview-branching visibility (PR-346-A audience + access)", () => {
  const baseQ: QuestionSetQuestion = {
    id: "1",
    key: "k1",
    label: "L",
    type: "TEXT",
    required: false,
    order: 1,
    active: true,
  };

  it("CLIENT_ONLY: owner sees; non-owner does not", () => {
    const q = { ...baseQ, audience: "CLIENT_ONLY" as const };
    const owner = resolveInterviewQuestions([q], {}, ctx({ isOwner: true }));
    expect(owner[0].isVisible).toBe(true);
    const lawyer = resolveInterviewQuestions([q], {}, ctx({ isAssignedLawyer: true }));
    expect(lawyer[0].isVisible).toBe(false);
  });

  it("LAWYER_ONLY: assigned lawyer sees; owner does not", () => {
    const q = { ...baseQ, audience: "LAWYER_ONLY" as const };
    const lawyer = resolveInterviewQuestions([q], {}, ctx({ isAssignedLawyer: true }));
    expect(lawyer[0].isVisible).toBe(true);
    const owner = resolveInterviewQuestions([q], {}, ctx({ isOwner: true }));
    expect(owner[0].isVisible).toBe(false);
  });

  it("isQuestionVisible respects visibilityRule after audience passes", () => {
    const q: QuestionSetQuestion = {
      ...baseQ,
      audience: "ALL",
      visibilityRule: {
        mode: "ALL",
        conditions: [
          {
            id: "c1",
            sourceQuestionKey: "other",
            operator: "EQUALS",
            value: true,
          },
        ],
      },
    };
    const hidden = isQuestionVisible(q, {}, ctx({ isOwner: true }));
    expect(hidden).toBe(false);
    const shown = isQuestionVisible(q, { other: true }, ctx({ isOwner: true }));
    expect(shown).toBe(true);
  });
});
