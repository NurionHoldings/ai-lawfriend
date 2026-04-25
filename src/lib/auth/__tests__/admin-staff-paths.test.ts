import { describe, expect, it } from "vitest";
import { isStaffAllowedAdminPath } from "@/lib/auth/admin-staff-paths";

describe("isStaffAllowedAdminPath", () => {
  it("allows exact staff paths", () => {
    expect(isStaffAllowedAdminPath("/admin/alerts/ops-queue")).toBe(true);
    expect(isStaffAllowedAdminPath("/admin/alerts/ops-dashboard")).toBe(true);
    expect(isStaffAllowedAdminPath("/admin/audit-logs")).toBe(true);
  });

  it("allows nested staff paths", () => {
    expect(isStaffAllowedAdminPath("/admin/alerts/ops-queue/123")).toBe(true);
    expect(isStaffAllowedAdminPath("/admin/audit-logs/detail/abc")).toBe(true);
  });

  it("blocks similar but unintended prefixes", () => {
    expect(isStaffAllowedAdminPath("/admin/alerts/operations")).toBe(false);
    expect(isStaffAllowedAdminPath("/admin/alerts/ops")).toBe(false);
    expect(isStaffAllowedAdminPath("/admin/users")).toBe(false);
  });
});
