import { Prisma, PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { AI_CORE_SMOKE_MARKER } from "../../../scripts/lib/ai-core-production-smoke-bootstrap-policy.mjs";
import { acquireProductionSmokeAdvisoryLock } from "./production-smoke-bootstrap.service";

const hasPostgres = /^postgres(?:ql)?:\/\//i.test(process.env.DATABASE_URL ?? "");
const describePostgres = hasPostgres ? describe : describe.skip;
const prisma = hasPostgres ? new PrismaClient() : null;

describePostgres("production smoke advisory lock (PostgreSQL)", () => {
  afterAll(async () => {
    await prisma?.$disconnect();
  });

  it("returns only a Prisma-supported text value and keeps the lock transaction-scoped", async () => {
    if (!prisma) throw new Error("PostgreSQL test client is unavailable");

    let releaseFirstTransaction!: () => void;
    const release = new Promise<void>((resolve) => {
      releaseFirstTransaction = resolve;
    });
    let firstLockAcquired!: () => void;
    let firstLockFailed!: (error: unknown) => void;
    const acquired = new Promise<void>((resolve, reject) => {
      firstLockAcquired = resolve;
      firstLockFailed = reject;
    });

    const firstTransaction = prisma.$transaction(async (tx) => {
      try {
        await acquireProductionSmokeAdvisoryLock(tx);
        firstLockAcquired();
        await release;
      } catch (error) {
        firstLockFailed(error);
        throw error;
      }
    });

    await acquired;
    try {
      const during = await prisma.$queryRaw<Array<{ acquired: boolean }>>(
        Prisma.sql`SELECT pg_try_advisory_xact_lock(hashtext(${AI_CORE_SMOKE_MARKER})::bigint) AS acquired`,
      );
      expect(during).toEqual([{ acquired: false }]);
    } finally {
      releaseFirstTransaction();
    }
    await firstTransaction;

    const after = await prisma.$transaction((tx) =>
      tx.$queryRaw<Array<{ acquired: boolean }>>(
        Prisma.sql`SELECT pg_try_advisory_xact_lock(hashtext(${AI_CORE_SMOKE_MARKER})::bigint) AS acquired`,
      ),
    );
    expect(after).toEqual([{ acquired: true }]);
  });
});
