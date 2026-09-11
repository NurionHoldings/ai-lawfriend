import { describe, expect, it } from "vitest";
import {
  canTransitionCaseStatus,
  getCaseStatusLabel,
} from "@/lib/definitions/case-status-definition";
import { findLifecycleByStatus } from "@/lib/definitions/case-lifecycle-definition";
import { hasDefinedPermission } from "@/lib/definitions/permission-definition";

describe("case definitions", () => {
  it("returns status labels from centralized definition", () => {
    expect(getCaseStatusLabel("CREATED")).toBe("사건 생성");
    expect(getCaseStatusLabel("IN_INTERVIEW")).toBe("인터뷰 진행 중");
  });

  it("allows only declared status transitions", () => {
    expect(canTransitionCaseStatus("CREATED", "IN_INTERVIEW")).toBe(true);
    expect(canTransitionCaseStatus("CREATED", "DELETED")).toBe(false);
  });

  it("maps lifecycle from status", () => {
    expect(
      findLifecycleByStatus("CREATED").some((item) => item.code === "CAS-3100"),
    ).toBe(true);
    expect(
      findLifecycleByStatus("CLOSED").some((item) => item.code === "CAS-3700"),
    ).toBe(true);
  });

  it("uses role permission definitions", () => {
    expect(hasDefinedPermission("LAWYER", "case", "update")).toBe(true);
    expect(hasDefinedPermission("USER", "admin.platform", "read")).toBe(false);
  });
});
