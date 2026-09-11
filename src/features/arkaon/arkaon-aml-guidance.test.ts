import { describe, expect, it } from "vitest";
import { buildAmlGuidance } from "./arkaon-aml-guidance";

describe("arkaon-aml-guidance", () => {
  it("returns propose-only Phase A briefing", () => {
    const guidance = buildAmlGuidance();
    expect(guidance.mode).toBe("read_only_analyze_and_propose");
    expect(guidance.phase).toBe("A");
    expect(guidance.liveGateWired).toBe(false);
    expect(guidance.checklist.length).toBeGreaterThanOrEqual(8);
    expect(guidance.prohibited).toContain("지급·환불 자동 실행");
  });
});
