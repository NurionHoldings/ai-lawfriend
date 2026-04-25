import { describe, expect, it } from "vitest";
import { bulkJobScheduleBulkUpdateSchema } from "@/lib/validators/bulk-job-schedule-bulk-update";

describe("bulkJobScheduleBulkUpdateSchema", () => {
  it("bulk cancel 통과", () => {
    const parsed = bulkJobScheduleBulkUpdateSchema.safeParse({
      action: "cancel",
      scheduleIds: ["s1", "s2"],
    });
    expect(parsed.success).toBe(true);
  });

  it("bulk reschedule 통과", () => {
    const parsed = bulkJobScheduleBulkUpdateSchema.safeParse({
      action: "reschedule",
      scheduleIds: ["s1", "s2"],
      scheduledFor: "2026-04-18T13:00:00.000Z",
      note: "일괄 이동",
    });
    expect(parsed.success).toBe(true);
  });

  it("빈 ids 실패", () => {
    const parsed = bulkJobScheduleBulkUpdateSchema.safeParse({
      action: "cancel",
      scheduleIds: [],
    });
    expect(parsed.success).toBe(false);
  });
});
