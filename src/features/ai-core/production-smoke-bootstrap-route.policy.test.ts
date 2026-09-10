import { describe, expect, it } from "vitest";
import {
  AI_CORE_SMOKE_PRODUCTION_ORIGIN,
  AI_CORE_SMOKE_SITE_ID,
} from "../../../scripts/lib/ai-core-production-smoke-bootstrap-policy.mjs";
import {
  PRODUCTION_SMOKE_CONFIRMATION,
  assertStrongBootstrapSecret,
  classifyProductionSmokeBootstrapError,
  deriveSmokeAccountPassword,
  hasExactBootstrapConfirmation,
  hasValidBearerSecret,
  isExactProductionRuntime,
  resolveProductionRequestOrigin,
  resolveRuntimeEnvironmentValue,
} from "./production-smoke-bootstrap-route.policy";

describe("production smoke bootstrap route policy", () => {
  const secret = "a-strong-bootstrap-secret-with-32-characters";

  it("requires the exact production origin and rejects conflicting runtime values", () => {
    expect(
      isExactProductionRuntime({
        requestOrigin: AI_CORE_SMOKE_PRODUCTION_ORIGIN,
        nodeEnv: "production",
        context: "production",
        siteId: AI_CORE_SMOKE_SITE_ID,
      }),
    ).toBe(true);
    expect(
      isExactProductionRuntime({
        requestOrigin: AI_CORE_SMOKE_PRODUCTION_ORIGIN,
      }),
    ).toBe(true);
    expect(
      isExactProductionRuntime({
        requestOrigin: "https://deploy-preview.example.netlify.app",
        nodeEnv: "production",
        context: "production",
        siteId: AI_CORE_SMOKE_SITE_ID,
      }),
    ).toBe(false);
    expect(
      isExactProductionRuntime({
        requestOrigin: AI_CORE_SMOKE_PRODUCTION_ORIGIN,
        context: "deploy-preview",
      }),
    ).toBe(false);
    expect(
      isExactProductionRuntime({
        requestOrigin: AI_CORE_SMOKE_PRODUCTION_ORIGIN,
        siteId: "another-site",
      }),
    ).toBe(false);
  });

  it("prefers Netlify runtime values and falls back to process values", () => {
    expect(
      resolveRuntimeEnvironmentValue(" netlify-production ", "process-preview"),
    ).toBe("netlify-production");
    expect(resolveRuntimeEnvironmentValue(undefined, " process-value ")).toBe(
      "process-value",
    );
    expect(resolveRuntimeEnvironmentValue("   ", " process-value ")).toBe(
      "process-value",
    );
    expect(resolveRuntimeEnvironmentValue(undefined, undefined)).toBeUndefined();
  });

  it("resolves the exact production origin through trusted proxy headers", () => {
    const headers = new Headers({
      "x-forwarded-proto": "https",
      "x-forwarded-host": "xn--ai-e61jh10d.com",
    });
    expect(
      resolveProductionRequestOrigin(
        "https://internal.example.netlify.app/internal/path",
        headers,
      ),
    ).toBe(AI_CORE_SMOKE_PRODUCTION_ORIGIN);
    expect(
      resolveProductionRequestOrigin(
        `${AI_CORE_SMOKE_PRODUCTION_ORIGIN}/internal/path`,
        new Headers(),
      ),
    ).toBe(AI_CORE_SMOKE_PRODUCTION_ORIGIN);
    expect(
      resolveProductionRequestOrigin(
        "https://internal.example.netlify.app/internal/path",
        new Headers({
          "x-forwarded-proto": "http",
          "x-forwarded-host": "xn--ai-e61jh10d.com",
        }),
      ),
    ).toBeUndefined();
    expect(
      resolveProductionRequestOrigin(
        "https://internal.example.netlify.app/internal/path",
        new Headers({
          "x-forwarded-proto": "https",
          "x-forwarded-host": "deploy-preview.example.netlify.app",
        }),
      ),
    ).toBeUndefined();
  });

  it("requires a strong standalone bootstrap secret", () => {
    expect(assertStrongBootstrapSecret(secret)).toBe(secret);
    expect(() => assertStrongBootstrapSecret("too-short")).toThrow(/32 to 256/);
    expect(() =>
      assertStrongBootstrapSecret(
        "secret with spaces that is definitely long enough",
      ),
    ).toThrow(/non-whitespace ASCII/);
  });

  it("classifies bootstrap failures without returning sensitive details", () => {
    expect(
      classifyProductionSmokeBootstrapError(
        new Error("production bootstrap requires Netlify Database runtime"),
      ),
    ).toBe("DATABASE_BINDING_UNAVAILABLE");
    expect(
      classifyProductionSmokeBootstrapError(
        new Error("OPS_SMOKE_ADMIN_PASSWORD does not match the account"),
      ),
    ).toBe("ADMIN_CONFIGURATION_INVALID");
    expect(
      classifyProductionSmokeBootstrapError(
        new Error("CLIENT smoke identity collision"),
      ),
    ).toBe("FIXTURE_COLLISION");
    expect(
      classifyProductionSmokeBootstrapError(
        new Error("bootstrap uniqueness or serialization conflict detected"),
      ),
    ).toBe("TRANSACTION_CONFLICT");
    expect(classifyProductionSmokeBootstrapError({ code: "P2022" })).toBe(
      "DATABASE_SCHEMA_MISMATCH",
    );
    expect(classifyProductionSmokeBootstrapError({ code: "P2003" })).toBe(
      "DATABASE_CONSTRAINT_ERROR",
    );
    expect(classifyProductionSmokeBootstrapError({ code: "P2028" })).toBe(
      "DATABASE_TRANSACTION_ERROR",
    );
    expect(classifyProductionSmokeBootstrapError({ code: "P2010" })).toBe(
      "DATABASE_QUERY_ERROR",
    );
    expect(classifyProductionSmokeBootstrapError(new Error("unknown"))).toBe(
      "BOOTSTRAP_FAILED",
    );
  });

  it("compares an exact Bearer credential without length leakage", () => {
    expect(hasValidBearerSecret(`Bearer ${secret}`, secret)).toBe(true);
    expect(hasValidBearerSecret("Bearer wrong", secret)).toBe(false);
    expect(hasValidBearerSecret(`Basic ${secret}`, secret)).toBe(false);
    expect(hasValidBearerSecret(`Bearer ${secret} extra`, secret)).toBe(false);
  });

  it("requires the exact two-field production confirmation", () => {
    expect(hasExactBootstrapConfirmation(PRODUCTION_SMOKE_CONFIRMATION)).toBe(
      true,
    );
    expect(
      hasExactBootstrapConfirmation({
        ...PRODUCTION_SMOKE_CONFIRMATION,
        extra: true,
      }),
    ).toBe(false);
    expect(
      hasExactBootstrapConfirmation({
        ...PRODUCTION_SMOKE_CONFIRMATION,
        siteId: "wrong",
      }),
    ).toBe(false);
  });

  it("derives stable, role-separated credentials without returning the secret", () => {
    const client = deriveSmokeAccountPassword(secret, "CLIENT");
    const lawyer = deriveSmokeAccountPassword(secret, "LAWYER");
    expect(client).toBe(deriveSmokeAccountPassword(secret, "CLIENT"));
    expect(client).not.toBe(lawyer);
    expect(client).not.toContain(secret);
    expect(client.length).toBeGreaterThanOrEqual(16);
  });
});
