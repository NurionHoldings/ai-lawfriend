import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_CORE_SMOKE_ACCOUNTS,
  AI_CORE_SMOKE_SITE_ID,
  deriveSmokeAccountPassword,
} from "./ai-core-production-smoke-bootstrap-policy.mjs";
import {
  assertProductionSmokeBootstrapResponse,
  buildProductionSmokeEnvironmentEntries,
  runProductionSmokeBootstrapWorkflow,
} from "./ai-core-production-smoke-runtime-bootstrap.mjs";
import { buildNetlifyEnvSyncInvocation } from "./netlify-production-env-sync.mjs";

const secret = "runtime-bootstrap-secret-that-is-long-enough";

describe("AI Core runtime bootstrap operator workflow", () => {
  it("accepts only a matching successful endpoint response", () => {
    assert.deepEqual(
      assertProductionSmokeBootstrapResponse(201, {
        ok: true,
        status: "provisioned",
        caseId: "case-1",
        siteId: AI_CORE_SMOKE_SITE_ID,
      }),
      { status: "provisioned", caseId: "case-1" },
    );
    assert.throws(() =>
      assertProductionSmokeBootstrapResponse(200, {
        ok: true,
        status: "provisioned",
        caseId: "case-1",
        siteId: AI_CORE_SMOKE_SITE_ID,
      }),
    );
    assert.throws(() =>
      assertProductionSmokeBootstrapResponse(201, {
        ok: true,
        status: "provisioned",
        caseId: "case-1",
        siteId: "wrong-site",
      }),
    );
    assert.throws(() =>
      assertProductionSmokeBootstrapResponse(201, {
        ok: true,
        status: "provisioned",
        caseId: "case-1\nforged-log-line",
        siteId: AI_CORE_SMOKE_SITE_ID,
      }),
    );
  });

  it("builds the exact email, derived password, and case environment set", () => {
    const values = Object.fromEntries(
      buildProductionSmokeEnvironmentEntries(secret, "case-1"),
    );
    assert.deepEqual(Object.keys(values), [
      "OPS_SMOKE_CLIENT_EMAIL",
      "OPS_SMOKE_CLIENT_PASSWORD",
      "OPS_SMOKE_LAWYER_EMAIL",
      "OPS_SMOKE_LAWYER_PASSWORD",
      "OPS_SMOKE_STAFF_EMAIL",
      "OPS_SMOKE_STAFF_PASSWORD",
      "OPS_SMOKE_CASE_ID",
    ]);
    assert.equal(
      values.OPS_SMOKE_CLIENT_EMAIL,
      AI_CORE_SMOKE_ACCOUNTS.CLIENT.email,
    );
    assert.equal(
      values.OPS_SMOKE_CLIENT_PASSWORD,
      deriveSmokeAccountPassword(secret, "CLIENT"),
    );
    assert.equal(values.OPS_SMOKE_CASE_ID, "case-1");
    assert.ok(!Object.values(values).includes(secret));
  });

  it("calls the endpoint before syncing and keeps passwords out of OS argv", async () => {
    const events = [];
    const synced = [];
    const result = await runProductionSmokeBootstrapWorkflow({
      bootstrapSecret: secret,
      requestBootstrap: async ({ authorization, body }) => {
        events.push("endpoint");
        assert.equal(authorization, `Bearer ${secret}`);
        assert.equal(body.siteId, AI_CORE_SMOKE_SITE_ID);
        return {
          httpStatus: 200,
          body: {
            ok: true,
            status: "already_provisioned",
            caseId: "case-from-runtime",
            siteId: AI_CORE_SMOKE_SITE_ID,
          },
        };
      },
      syncEnvironment: async (key, value) => {
        events.push(key);
        synced.push([key, value]);
        const invocation = buildNetlifyEnvSyncInvocation({
          key,
          value,
          cwd: "C:\\repo",
          helperPath: "C:\\repo\\scripts\\env-sync.mjs",
          npmExecPath: "C:\\node\\npm-cli.js",
          nodeExecutable: "C:\\node\\node.exe",
          baseEnvironment: { PATH: "C:\\Windows\\system32" },
        });
        assert.ok(invocation.args.every((argument) => argument !== value));
        if (key.endsWith("_PASSWORD")) {
          assert.equal(
            invocation.options.env.ARKAON_NETLIFY_ENV_SYNC_SECRET,
            "1",
          );
        }
      },
    });

    assert.deepEqual(result, {
      status: "already_provisioned",
      caseId: "case-from-runtime",
    });
    assert.equal(events[0], "endpoint");
    assert.equal(synced.at(-1)?.[0], "OPS_SMOKE_CASE_ID");
  });

  it("does not sync any environment value after an invalid response", async () => {
    let syncCalls = 0;
    await assert.rejects(
      runProductionSmokeBootstrapWorkflow({
        bootstrapSecret: secret,
        requestBootstrap: async () => ({
          httpStatus: 500,
          body: { ok: false },
        }),
        syncEnvironment: async () => {
          syncCalls += 1;
        },
      }),
      /invalid response/,
    );
    assert.equal(syncCalls, 0);
  });
});
