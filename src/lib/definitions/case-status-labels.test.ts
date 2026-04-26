import { describe, expect, it } from "vitest";
import { CaseStatusEnum, CASE_STATUS_LABELS, type CaseStatus } from "./case-status";
import { getCaseStatusMeta } from "./case-status-definition";

describe("CASE_STATUS_LABELS", () => {
  const statuses = CaseStatusEnum.options;

  it("covers every canonical CaseStatus (zod enum)", () => {
    for (const s of statuses) {
      expect(CASE_STATUS_LABELS[s]).toBeDefined();
      expect(CASE_STATUS_LABELS[s].length).toBeGreaterThan(0);
    }
  });

  it("does not contain non-canonical keys", () => {
    const allowed = new Set<string>(statuses);
    for (const key of Object.keys(CASE_STATUS_LABELS)) {
      expect(allowed.has(key)).toBe(true);
    }
    expect(Object.keys(CASE_STATUS_LABELS).length).toBe(statuses.length);
  });

  it("matches STATUS_META labels in case-status-definition (single display standard)", () => {
    for (const s of statuses) {
      expect(CASE_STATUS_LABELS[s]).toBe(getCaseStatusMeta(s as CaseStatus).label);
    }
  });
});
