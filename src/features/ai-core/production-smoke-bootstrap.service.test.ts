import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { provisionProductionSmokeFixtures } from "./production-smoke-bootstrap.service";

describe("provisionProductionSmokeFixtures", () => {
  it("returns the persisted completion without mutating any fixture", async () => {
    const queryRaw = vi.fn(async () => [{ pg_advisory_xact_lock: null }]);
    const findFirst = vi.fn(async () => ({ entityId: "case-already-created" }));
    const tx = {
      $queryRaw: queryRaw,
      auditLog: { findFirst },
      user: {
        findUnique: vi.fn(() => {
          throw new Error("fixture mutation must not start");
        }),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as unknown as PrismaClient;

    await expect(
      provisionProductionSmokeFixtures({
        prisma,
        adminEmail: "admin@example.com",
        adminPassword: "admin-password-long-enough",
        accountPasswords: {
          CLIENT: "client-password-long-enough",
          LAWYER: "lawyer-password-long-enough",
          STAFF: "staff-password-long-enough",
        },
      }),
    ).resolves.toEqual({
      caseId: "case-already-created",
      adminCreated: false,
      alreadyProvisioned: true,
    });
    expect(queryRaw).toHaveBeenCalledOnce();
    expect(findFirst).toHaveBeenCalledOnce();
    expect(tx.user.findUnique).not.toHaveBeenCalled();
  });
});
