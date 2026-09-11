import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/lib/errors";
import { getLawyerMatchAdviceService } from "./lawyer-match-advice.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

const { createCaseAssignment } = vi.hoisted(() => ({
  createCaseAssignment: vi.fn(),
}));

vi.mock("@/features/case-assignments/case-assignment.repository", () => ({
  findAssignableLawyers: vi.fn(async () => [
    { id: "law-1", name: "변호사A", email: "a@test", role: "LAWYER" },
  ]),
  findActiveAssignmentsByCaseId: vi.fn(async () => []),
  createCaseAssignment,
}));

vi.mock("@/features/cases/case.permissions", () => ({
  assertAdminOnly: (user: SessionUser) => {
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      throw new ForbiddenError();
    }
  },
  getCaseAccessContext: vi.fn(async () => ({})),
}));

describe("getLawyerMatchAdviceService", () => {
  it("returns advice_only for admin without creating assignment", async () => {
    const admin: SessionUser = {
      id: "admin-1",
      name: "Admin",
      email: "admin@test",
      role: "ADMIN",
      status: "ACTIVE",
    };
    const advice = await getLawyerMatchAdviceService(admin, "case-1");
    expect(advice.mode).toBe("advice_only");
    expect(advice.policy.createsAssignment).toBe(false);
    expect(createCaseAssignment).not.toHaveBeenCalled();
  });

  it("blocks non-admin", async () => {
    const lawyer: SessionUser = {
      id: "law-1",
      name: "L",
      email: "l@test",
      role: "LAWYER",
      status: "ACTIVE",
    };
    await expect(getLawyerMatchAdviceService(lawyer, "case-1")).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
