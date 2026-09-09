import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_CORE_SMOKE_ACCOUNTS,
  AI_CORE_SMOKE_ADMIN_NAME,
  AI_CORE_SMOKE_MARKER,
  assertStrongSmokeAdminPassword,
  assertExactSmokeCase,
  assertExactSmokeCollision,
  decideSmokeAdminBootstrap,
  ensureSmokeAdministrator,
  extractLinkedSiteId,
  normalizeSmokeAdminEmail,
  resolveProductionDatabaseUrl,
  resolveRequiredProductionSecret,
} from "./ai-core-production-smoke-bootstrap-policy.mjs";

describe("AI Core production smoke bootstrap policy", () => {
  it("accepts an absent or exact active dedicated smoke identity", () => {
    assert.doesNotThrow(() =>
      assertExactSmokeCollision(null, AI_CORE_SMOKE_ACCOUNTS.CLIENT, "CLIENT"),
    );
    assert.doesNotThrow(() =>
      assertExactSmokeCollision(
        { ...AI_CORE_SMOKE_ACCOUNTS.CLIENT, status: "ACTIVE" },
        AI_CORE_SMOKE_ACCOUNTS.CLIENT,
        "CLIENT",
      ),
    );
  });

  it("refuses role, name, or lifecycle collisions", () => {
    for (const changed of [
      { name: "실제 사용자" },
      { role: "ADMIN" },
      { status: "SUSPENDED" },
    ]) {
      assert.throws(() =>
        assertExactSmokeCollision(
          { ...AI_CORE_SMOKE_ACCOUNTS.CLIENT, status: "ACTIVE", ...changed },
          AI_CORE_SMOKE_ACCOUNTS.CLIENT,
          "CLIENT",
        ),
      );
    }
  });

  it("only accepts the marked smoke case owned by the smoke client", () => {
    assert.doesNotThrow(() =>
      assertExactSmokeCase(
        { ownerUserId: "client", description: AI_CORE_SMOKE_MARKER },
        "client",
      ),
    );
    assert.throws(() =>
      assertExactSmokeCase(
        { ownerUserId: "someone-else", description: AI_CORE_SMOKE_MARKER },
        "client",
      ),
    );
    assert.throws(() =>
      assertExactSmokeCase(
        { ownerUserId: "client", description: "real case" },
        "client",
      ),
    );
  });

  it("recognizes supported Netlify status JSON shapes", () => {
    assert.equal(
      extractLinkedSiteId({ site: { siteId: "expected" } }),
      "expected",
    );
    assert.equal(
      extractLinkedSiteId({ siteData: { id: "expected" } }),
      "expected",
    );
    assert.equal(
      extractLinkedSiteId({ siteData: { "site-id": "expected" } }),
      "expected",
    );
    assert.equal(extractLinkedSiteId({}), null);
  });

  it("prefers an injected PostgreSQL URL and rejects a redacted CLI value", () => {
    assert.equal(
      resolveProductionDatabaseUrl(
        "postgresql://injected",
        "********************",
      ),
      "postgresql://injected",
    );
    assert.throws(
      () => resolveProductionDatabaseUrl("", "********************"),
      /unavailable or redacted/,
    );
  });

  it("prefers locally injected production secrets and refuses masked values", () => {
    assert.equal(
      resolveRequiredProductionSecret(" local-secret ", "cli-secret", "SECRET"),
      "local-secret",
    );
    assert.equal(
      resolveRequiredProductionSecret(undefined, "cli-secret", "SECRET"),
      "cli-secret",
    );
    for (const masked of [
      "",
      "********************",
      "<redacted>",
      "[REDACTED]",
    ]) {
      assert.throws(
        () => resolveRequiredProductionSecret(undefined, masked, "SECRET"),
        /unavailable or redacted/,
      );
    }
  });

  it("normalizes the admin email and requires a long administrator password", () => {
    assert.equal(
      normalizeSmokeAdminEmail(" ARKAON.ADMIN@EXAMPLE.COM "),
      "arkaon.admin@example.com",
    );
    assert.equal(AI_CORE_SMOKE_ADMIN_NAME, "아르카온관리자");
    assert.equal(
      assertStrongSmokeAdminPassword("correct horse battery staple"),
      "correct horse battery staple",
    );
    assert.throws(
      () => normalizeSmokeAdminEmail("not-an-email"),
      /valid email/,
    );
    assert.throws(
      () => assertStrongSmokeAdminPassword("too-short"),
      /16 to 100/,
    );
  });

  it("creates only the first SUPER_ADMIN and reuses only an active privileged identity", () => {
    assert.equal(decideSmokeAdminBootstrap(null, 0), "CREATE");
    assert.equal(
      decideSmokeAdminBootstrap({ role: "SUPER_ADMIN", status: "ACTIVE" }, 1),
      "REUSE",
    );
    assert.equal(
      decideSmokeAdminBootstrap({ role: "ADMIN", status: "ACTIVE" }, 4),
      "REUSE",
    );
    assert.throws(
      () => decideSmokeAdminBootstrap(null, 1),
      /another privileged admin exists/,
    );
    for (const existing of [
      { role: "USER", status: "ACTIVE" },
      { role: "SUPER_ADMIN", status: "SUSPENDED" },
    ]) {
      assert.throws(
        () => decideSmokeAdminBootstrap(existing, 1),
        /ACTIVE ADMIN or SUPER_ADMIN/,
      );
    }
  });

  it("creates the first administrator with only the minimum privileged fields", async () => {
    const creates = [];
    const tx = {
      user: {
        findUnique: async () => null,
        count: async () => 0,
        create: async (input) => {
          creates.push(input);
          return { id: "admin-1", ...input.data };
        },
      },
    };

    const result = await ensureSmokeAdministrator({
      tx,
      email: "admin@example.com",
      password: "supplied-secret",
      passwordHash: "bcrypt-hash",
      verifyPassword: async () => true,
    });

    assert.equal(result.created, true);
    assert.equal(result.admin.name, AI_CORE_SMOKE_ADMIN_NAME);
    assert.deepEqual(creates[0].data, {
      email: "admin@example.com",
      passwordHash: "bcrypt-hash",
      name: AI_CORE_SMOKE_ADMIN_NAME,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: creates[0].data.emailVerifiedAt,
    });
    assert.ok(creates[0].data.emailVerifiedAt instanceof Date);
  });

  it("verifies and returns an existing administrator without a write", async () => {
    const existing = {
      id: "admin-1",
      email: "admin@example.com",
      name: "기존 관리자명",
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: "stored-hash",
    };
    let verified = null;
    const tx = {
      user: {
        findUnique: async () => existing,
        count: async () =>
          assert.fail("count must not run for an existing admin"),
        create: async () => assert.fail("existing admin must not be mutated"),
      },
    };

    const result = await ensureSmokeAdministrator({
      tx,
      email: existing.email,
      password: "supplied-secret",
      passwordHash: "unused-new-hash",
      verifyPassword: async (...args) => {
        verified = args;
        return true;
      },
    });

    assert.deepEqual(result, { admin: existing, created: false });
    assert.deepEqual(verified, ["supplied-secret", "stored-hash"]);
  });

  it("refuses an existing administrator password mismatch without a write", async () => {
    const existing = {
      id: "admin-1",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      passwordHash: "stored-hash",
    };
    const tx = {
      user: {
        findUnique: async () => existing,
        count: async () =>
          assert.fail("count must not run for an existing admin"),
        create: async () => assert.fail("password mismatch must not write"),
      },
    };

    await assert.rejects(
      ensureSmokeAdministrator({
        tx,
        email: "admin@example.com",
        password: "wrong-secret",
        passwordHash: "unused-new-hash",
        verifyPassword: async () => false,
      }),
      /does not match.*refusing to overwrite/,
    );
  });
});
