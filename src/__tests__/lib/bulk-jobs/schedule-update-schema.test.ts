import { describe, expect, it } from "vitest";
import { bulkJobScheduleUpdateSchema } from "@/lib/validators/bulk-job-schedule-update";

describe("bulkJobScheduleUpdateSchema", () => {
  it("cancel payload 통과", () => {
    const parsed = bulkJobScheduleUpdateSchema.safeParse({
      action: "cancel",
    });
    expect(parsed.success).toBe(true);
  });

  it("reschedule payload 통과", () => {
    const parsed = bulkJobScheduleUpdateSchema.safeParse({
      action: "reschedule",
      scheduledFor: "2026-04-18T12:30:00.000Z",
      note: "한 시간 뒤 재실행",
    });
    expect(parsed.success).toBe(true);
  });

  it("잘못된 payload 실패", () => {
    const parsed = bulkJobScheduleUpdateSchema.safeParse({
      action: "reschedule",
    });
    expect(parsed.success).toBe(false);
  });
});
