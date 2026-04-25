import { describe, expect, it } from "vitest";
import { canRequestSoftDelete } from "@/features/cases/case.permissions";
import type { SessionUser } from "@/lib/auth/require-session-user";

const user = (id: string, role: SessionUser["role"]): SessionUser => ({
  id,
  email: "u@test.local",
  name: "U",
  role,
  status: "ACTIVE",
});

describe("canRequestSoftDelete (UI = softDeleteCaseService)", () => {
  it("DELETED: false", () => {
    expect(
      canRequestSoftDelete(user("u1", "USER"), {
        ownerUserId: "u1",
        status: "DELETED",
      }),
    ).toBe(false);
  });

  it("owner USER: true", () => {
    expect(
      canRequestSoftDelete(user("u1", "USER"), {
        ownerUserId: "u1",
        status: "CREATED",
      }),
    ).toBe(true);
  });

  it("non-owner USER: false", () => {
    expect(
      canRequestSoftDelete(user("u2", "USER"), {
        ownerUserId: "u1",
        status: "CREATED",
      }),
    ).toBe(false);
  });

  it("ADMIN: true (any owner)", () => {
    expect(
      canRequestSoftDelete(user("admin", "ADMIN"), {
        ownerUserId: "u1",
        status: "IN_INTERVIEW",
      }),
    ).toBe(true);
  });

  it("SUPER_ADMIN: true", () => {
    expect(
      canRequestSoftDelete(user("s", "SUPER_ADMIN"), {
        ownerUserId: "u1",
        status: "HOLD",
      }),
    ).toBe(true);
  });
});
