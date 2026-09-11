import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "@/lib/errors";
import { listAssignableLawyersService } from "@/features/case-assignments/case-assignment.service";
import type { SessionUser } from "@/lib/auth/require-session-user";

/**
 * Product truth: ADMIN manual **assignment** list only.
 * There is no recommendation/matching engine in mainline yet.
 */
vi.mock("@/features/case-assignments/case-assignment.repository", () => ({
  findAssignableLawyers: vi.fn(async () => [
    { id: "law-1", name: "변호사A", email: "law-a@test", role: "LAWYER" },
  ]),
}));

const adminUser: SessionUser = {
  id: "admin-1",
  name: "Admin",
  email: "admin@test",
  role: "ADMIN",
  status: "ACTIVE",
};

const clientUser: SessionUser = {
  id: "client-1",
  name: "Client",
  email: "client@test",
  role: "USER",
  status: "ACTIVE",
};

const lawyerUser: SessionUser = {
  id: "law-1",
  name: "Lawyer",
  email: "lawyer@test",
  role: "LAWYER",
  status: "ACTIVE",
};

describe("case-lawyer-assignment.service (not matching)", () => {
  it("allows admin to list assignable lawyers", async () => {
    const lawyers = await listAssignableLawyersService(adminUser);
    expect(lawyers.length).toBeGreaterThan(0);
  });

  it("blocks client from listing assignable lawyers", async () => {
    await expect(listAssignableLawyersService(clientUser)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("blocks lawyer from listing assignable lawyers", async () => {
    await expect(listAssignableLawyersService(lawyerUser)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
