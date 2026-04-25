import { describe, expect, it } from "vitest";
import {
  hasRoleAtLeast,
  hasMinRole,
  isAdminRole,
  isStaffRole,
} from "@/lib/auth/roles";

describe("roles", () => {
  it("hasRoleAtLeast works for STAFF vs ADMIN", () => {
    expect(hasRoleAtLeast("STAFF", "STAFF")).toBe(true);
    expect(hasRoleAtLeast("STAFF", "ADMIN")).toBe(false);
  });

  it("hasMinRole aliases operations ladder", () => {
    expect(hasMinRole("ADMIN", "STAFF")).toBe(true);
    expect(hasMinRole("STAFF", "SUPER_ADMIN")).toBe(false);
  });

  it("isAdminRole works", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("SUPER_ADMIN")).toBe(true);
    expect(isAdminRole("STAFF")).toBe(false);
  });

  it("isStaffRole works", () => {
    expect(isStaffRole("STAFF")).toBe(true);
    expect(isStaffRole("ADMIN")).toBe(false);
    expect(isStaffRole("SUPER_ADMIN")).toBe(false);
    expect(isStaffRole(null)).toBe(false);
  });

  it("USER/LAWYER minimum uses legacy ladder", () => {
    expect(hasRoleAtLeast("USER", "USER")).toBe(true);
    expect(hasRoleAtLeast("LAWYER", "LAWYER")).toBe(true);
    expect(hasRoleAtLeast("USER", "LAWYER")).toBe(false);
  });
});
