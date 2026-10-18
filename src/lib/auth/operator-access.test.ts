import { describe, expect, it } from "vitest";
import { selectUniqueActiveSuperAdmin } from "./operator-access";

const active = { id: "a", role: "SUPER_ADMIN", status: "ACTIVE" };

describe("operator access account binding", () => {
  it("selects the only active super admin", () => {
    expect(selectUniqueActiveSuperAdmin([active])).toEqual(active);
  });
  it("fails closed if there are none or multiple", () => {
    expect(selectUniqueActiveSuperAdmin([])).toBeNull();
    expect(selectUniqueActiveSuperAdmin([active, { ...active, id: "b" }])).toBeNull();
  });
  it("never binds inactive or non-super-admin accounts", () => {
    expect(selectUniqueActiveSuperAdmin([{ ...active, status: "SUSPENDED" }])).toBeNull();
    expect(selectUniqueActiveSuperAdmin([{ ...active, role: "ADMIN" }])).toBeNull();
  });
});
