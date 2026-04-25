import { describe, expect, it } from "vitest";
import { canTransitionCaseStatus, getCaseStatusLabel } from "@/lib/definitions/case-status-definition";
import { findLifecycleByStatus } from "@/lib/definitions/case-lifecycle-definition";
import { hasDefinedPermission } from "@/lib/definitions/permission-definition";

describe("case definitions", () => {
  it("returns status labels from centralized definition", () => {
    expect(getCaseStatusLabel("OPEN")).toBe("접수");
    expect(getCaseStatusLabel("IN_PROGRESS")).toBe("진행중");
  });

  it("allows only declared status transitions", () => {
    expect(canTransitionCaseStatus("OPEN", "IN_PROGRESS")).toBe(true);
    expect(canTransitionCaseStatus("IN_PROGRESS", "OPEN")).toBe(false);
  });

  it("maps lifecycle from status", () => {
    expect(findLifecycleByStatus("OPEN")?.code).toBe("CAS-3100");
    expect(findLifecycleByStatus("CLOSED")?.code).toBe("CAS-3700");
  });

  it("uses role permission definitions", () => {
    expect(hasDefinedPermission("LAWYER", "CASE", "UPDATE")).toBe(true);
    expect(hasDefinedPermission("USER", "ADMIN_CONSOLE", "READ")).toBe(false);
  });
});
