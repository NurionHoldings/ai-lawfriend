import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { AI_CORE_SMOKE_ACCOUNTS } from "../../../scripts/lib/ai-core-production-smoke-bootstrap-policy.mjs";
import { provisionProductionSmokeFixtures } from "./production-smoke-bootstrap.service";

function buildFreshFixtureTransaction({
  clientCollision = false,
  failAtCaseCreate = false,
  failAtAdvisoryLock = false,
}: {
  clientCollision?: boolean;
  failAtCaseCreate?: boolean;
  failAtAdvisoryLock?: boolean;
} = {}) {
  let sequence = 0;
  const write = <T extends Record<string, unknown>>(
    prefix: string,
    data: T,
  ) => ({
    id: `${prefix}-${++sequence}`,
    ...data,
  });
  const tx = {
    $queryRaw: vi.fn(async () => {
      if (failAtAdvisoryLock) throw new Error("sensitive database detail");
      return [{ pg_advisory_xact_lock: null }];
    }),
    auditLog: {
      findFirst: vi.fn(async () => null),
      create: vi.fn(async ({ data }) => write("audit", data)),
    },
    user: {
      findUnique: vi.fn(async ({ where: { email } }) => {
        if (clientCollision && email === AI_CORE_SMOKE_ACCOUNTS.CLIENT.email) {
          return {
            id: "real-user",
            ...AI_CORE_SMOKE_ACCOUNTS.CLIENT,
            name: "실제 사용자",
            status: "ACTIVE",
          };
        }
        return null;
      }),
      count: vi.fn(async () => 0),
      create: vi.fn(async ({ data }) => write("user", data)),
      update: vi.fn(async ({ data }) => write("user-update", data)),
    },
    lawyerProfile: {
      upsert: vi.fn(async ({ create }) => write("lawyer-profile", create)),
    },
    case: {
      findFirst: vi.fn(async () => null),
      create: vi.fn(async ({ data }) => {
        if (failAtCaseCreate)
          throw new Error("simulated case creation failure");
        return write("case", data);
      }),
      update: vi.fn(async ({ data }) => write("case-update", data)),
    },
    caseAssignment: {
      findFirst: vi.fn(async () => null),
      create: vi.fn(async ({ data }) => write("assignment", data)),
    },
    interview: {
      findFirst: vi.fn(async () => null),
      create: vi.fn(async ({ data }) => write("interview", data)),
      update: vi.fn(async ({ data }) => write("interview-update", data)),
    },
    caseTimelineMemo: {
      findFirst: vi.fn(async () => null),
      create: vi.fn(async ({ data }) => write("memo", data)),
      update: vi.fn(async ({ data }) => write("memo-update", data)),
    },
  };
  return tx;
}

const freshInput = {
  adminEmail: "admin@example.com",
  adminPassword: "admin-password-long-enough",
  accountPasswords: {
    CLIENT: "client-password-long-enough",
    LAWYER: "lawyer-password-long-enough",
    STAFF: "staff-password-long-enough",
  },
} as const;

describe("provisionProductionSmokeFixtures", () => {
  it("classifies an advisory-lock query failure without exposing its detail", async () => {
    const tx = buildFreshFixtureTransaction({ failAtAdvisoryLock: true });
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
        callback(tx),
      ),
    } as unknown as PrismaClient;

    const error = await provisionProductionSmokeFixtures({
      prisma,
      ...freshInput,
    }).catch((caught: unknown) => caught);

    expect(error).toMatchObject({
      name: "ProductionSmokeAdvisoryLockError",
      code: "ARKAON_ADVISORY_LOCK_FAILED",
      message: "production smoke advisory lock query failed",
    });
    expect((error as Error).message).not.toContain("sensitive database detail");
    expect(tx.auditLog.findFirst).not.toHaveBeenCalled();
  });

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

  it("creates the complete approved fictional fixture in one transaction", async () => {
    const tx = buildFreshFixtureTransaction();
    let transactionOptions: unknown;
    const transaction = vi.fn(
      async (callback: (client: typeof tx) => unknown, options: unknown) => {
        transactionOptions = options;
        return callback(tx);
      },
    );
    const prisma = { $transaction: transaction } as unknown as PrismaClient;

    const result = await provisionProductionSmokeFixtures({
      prisma,
      ...freshInput,
    });

    expect(result).toMatchObject({
      adminCreated: true,
      alreadyProvisioned: false,
    });
    expect(result.caseId).toMatch(/^case-/);
    expect(transactionOptions).toEqual({
      isolationLevel: "Serializable",
      maxWait: 10_000,
      timeout: 30_000,
    });
    expect(tx.user.create).toHaveBeenCalledTimes(4);
    expect(tx.caseAssignment.create).toHaveBeenCalledTimes(2);
    expect(tx.interview.create).toHaveBeenCalledOnce();
    expect(tx.caseTimelineMemo.create).toHaveBeenCalledOnce();
    expect(tx.auditLog.create).toHaveBeenCalledOnce();
  });

  it("refuses an identity collision before committing the fixture", async () => {
    const tx = buildFreshFixtureTransaction({ clientCollision: true });
    let committed = false;
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => {
        const result = await callback(tx);
        committed = true;
        return result;
      }),
    } as unknown as PrismaClient;

    await expect(
      provisionProductionSmokeFixtures({ prisma, ...freshInput }),
    ).rejects.toThrow(/CLIENT smoke identity collision/);
    expect(committed).toBe(false);
    expect(tx.user.create).toHaveBeenCalledOnce();
    expect(tx.case.create).not.toHaveBeenCalled();
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });

  it("rolls back staged fixture writes when a later operation fails", async () => {
    const tx = buildFreshFixtureTransaction({ failAtCaseCreate: true });
    const committedWrites: string[] = [];
    const prisma = {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => {
        const stagedWrites = ["administrator-and-role-users"];
        try {
          const result = await callback(tx);
          committedWrites.push(...stagedWrites);
          return result;
        } catch (error) {
          stagedWrites.length = 0;
          throw error;
        }
      }),
    } as unknown as PrismaClient;

    await expect(
      provisionProductionSmokeFixtures({ prisma, ...freshInput }),
    ).rejects.toThrow("simulated case creation failure");
    expect(tx.user.create).toHaveBeenCalledTimes(4);
    expect(committedWrites).toEqual([]);
    expect(tx.auditLog.create).not.toHaveBeenCalled();
  });
});
