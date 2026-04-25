import { describe, expect, it } from "vitest";
import {
  buildRecommendedActionDedupeKey,
  buildOpsQueueDedupeKey,
  buildScheduleDedupeKey,
} from "@/lib/bulk-jobs/recommended-action-dedupe";

describe("recommended action dedupe keys", () => {
  it("job dedupe key 생성", () => {
    expect(
      buildRecommendedActionDedupeKey({
        sourceJobId: "job1",
        taxonomy: "TIMEOUT",
        bulkVariant: "retry_failed_items",
      }),
    ).toBe("recommended-action:job1:TIMEOUT:retry_failed_items");
  });

  it("ops queue dedupe key 생성", () => {
    expect(
      buildOpsQueueDedupeKey({
        sourceJobId: "job1",
        taxonomy: "AUTH_PERMISSION",
        bulkVariant: "mark_permission_check",
      }),
    ).toBe("ops-queue:job1:AUTH_PERMISSION:mark_permission_check");
  });

  it("schedule dedupe key 생성", () => {
    expect(
      buildScheduleDedupeKey({
        sourceJobId: "job1",
        taxonomy: "RATE_LIMIT",
        bulkVariant: "wait_and_retry_later",
      }),
    ).toBe("schedule:job1:RATE_LIMIT:wait_and_retry_later");
  });
});
