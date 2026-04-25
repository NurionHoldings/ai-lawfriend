import { describe, expect, it } from "vitest";
import { resolveDuePreset } from "@/lib/ops-queue/due-date";

describe("resolveDuePreset", () => {
  it("END_OF_TODAY는 당일 23:59:59.999(로컬)로 반환한다", () => {
    const now = new Date(2026, 3, 18, 10, 15, 0);
    const result = resolveDuePreset("END_OF_TODAY", now);

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(18);
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
  });

  it("TOMORROW_9AM은 다음날 오전 9시(로컬)로 반환한다", () => {
    const now = new Date(2026, 3, 18, 1, 0, 0);
    const result = resolveDuePreset("TOMORROW_9AM", now);

    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(19);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });
});
