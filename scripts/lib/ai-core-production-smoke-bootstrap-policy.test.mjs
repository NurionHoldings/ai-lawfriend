import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_CORE_SMOKE_ACCOUNTS,
  AI_CORE_SMOKE_MARKER,
  assertExactSmokeCase,
  assertExactSmokeCollision,
  extractLinkedSiteId,
  resolveProductionDatabaseUrl,
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
      assertExactSmokeCase({ ownerUserId: "client", description: "real case" }, "client"),
    );
  });

  it("recognizes supported Netlify status JSON shapes", () => {
    assert.equal(extractLinkedSiteId({ site: { siteId: "expected" } }), "expected");
    assert.equal(extractLinkedSiteId({ siteData: { id: "expected" } }), "expected");
    assert.equal(
      extractLinkedSiteId({ siteData: { "site-id": "expected" } }),
      "expected",
    );
    assert.equal(extractLinkedSiteId({}), null);
  });

  it("prefers an injected PostgreSQL URL and rejects a redacted CLI value", () => {
    assert.equal(
      resolveProductionDatabaseUrl("postgresql://injected", "********************"),
      "postgresql://injected",
    );
    assert.throws(
      () => resolveProductionDatabaseUrl("", "********************"),
      /unavailable or redacted/,
    );
  });
});
