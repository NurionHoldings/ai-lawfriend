import { describe, expect, it } from "vitest";
import {
  getOpsQueueSlaHours,
  buildOpsQueueDueAt,
  getOpsQueueSlaState,
} from "@/lib/ops-queue/sla-policy";

describe("ops queue sla policy", () => {
  it("HIGH는 8시간 SLA", () => {
    expect(getOpsQueueSlaHours("HIGH")).toBe(8);
  });

  it("dueAt 계산", () => {
    const createdAt = new Date("2026-04-18T00:00:00.000Z");
    const dueAt = buildOpsQueueDueAt({
      createdAt,
      severity: "MEDIUM",
    });

    expect(dueAt.toISOString()).toBe("2026-04-19T00:00:00.000Z");
  });

  it("overdue 판단", () => {
    const state = getOpsQueueSlaState({
      createdAt: new Date("2026-04-17T00:00:00.000Z"),
      severity: "LOW",
      status: "OPEN",
      now: new Date("2026-04-21T01:00:00.000Z"),
    });

    expect(state.overdue).toBe(true);
  });

  it("resolved면 overdue false", () => {
    const state = getOpsQueueSlaState({
      createdAt: new Date("2026-04-17T00:00:00.000Z"),
      severity: "HIGH",
      status: "RESOLVED",
      now: new Date("2026-04-18T12:00:00.000Z"),
    });

    expect(state.overdue).toBe(false);
  });
});
