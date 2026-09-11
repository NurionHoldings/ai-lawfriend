import { describe, expect, it } from "vitest";
import { buildLawyerMatchAdvice, scoreLawyerMatchCandidates } from "./lawyer-match-advice";

describe("lawyer-match-advice (advice_only)", () => {
  it("marks mode advice_only and never enables auto-assign", () => {
    const advice = buildLawyerMatchAdvice({
      caseId: "case-1",
      candidates: [
        { lawyerUserId: "b", displayName: "변호사B" },
        { lawyerUserId: "a", displayName: "변호사A" },
      ],
      now: new Date("2026-09-11T00:00:00.000Z"),
    });
    expect(advice.mode).toBe("advice_only");
    expect(advice.policy.autoAssignEnabled).toBe(false);
    expect(advice.policy.createsAssignment).toBe(false);
    expect(advice.candidates.length).toBe(2);
    expect(advice.candidates[0].score).toBeGreaterThanOrEqual(advice.candidates[1].score);
  });

  it("disqualifies already assigned lawyers", () => {
    const scored = scoreLawyerMatchCandidates([
      { lawyerUserId: "x", displayName: "X", alreadyAssigned: true },
      { lawyerUserId: "y", displayName: "Y" },
    ]);
    expect(scored[0].lawyerUserId).toBe("y");
    expect(scored.find((c) => c.lawyerUserId === "x")?.disqualify).toBe("already_assigned");
  });
});
