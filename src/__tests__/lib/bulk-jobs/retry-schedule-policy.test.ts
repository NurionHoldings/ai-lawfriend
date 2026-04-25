import { describe, expect, it } from "vitest";
import {
  getDeferredRetryDelayMinutes,
  buildScheduledRetryTime,
} from "@/lib/bulk-jobs/retry-schedule-policy";

describe("retry-schedule-policy", () => {
  it("RATE_LIMIT은 30분 후 재시도", () => {
    expect(getDeferredRetryDelayMinutes("RATE_LIMIT")).toBe(30);
  });

  it("TIMEOUT은 15분 후 재시도", () => {
    expect(getDeferredRetryDelayMinutes("TIMEOUT")).toBe(15);
  });

  it("기본값은 60분", () => {
    expect(getDeferredRetryDelayMinutes("UNKNOWN")).toBe(60);
  });

  it("scheduledFor를 올바르게 계산한다", () => {
    const now = new Date("2026-04-17T00:00:00.000Z");
    const scheduled = buildScheduledRetryTime({
      taxonomy: "TIMEOUT",
      now,
    });

    expect(scheduled.toISOString()).toBe("2026-04-17T00:15:00.000Z");
  });
});
