import { describe, expect, it } from "vitest";
import { AI_CORE_SMOKE_SITE_ID } from "../../../scripts/lib/ai-core-production-smoke-bootstrap-policy.mjs";
import {
  PRODUCTION_SMOKE_CONFIRMATION,
  assertStrongBootstrapSecret,
  deriveSmokeAccountPassword,
  hasExactBootstrapConfirmation,
  hasValidBearerSecret,
  isExactProductionRuntime,
} from "./production-smoke-bootstrap-route.policy";

describe("production smoke bootstrap route policy", () => {
  const secret = "a-strong-bootstrap-secret-with-32-characters";

  it("accepts only the exact production site runtime", () => {
    expect(
      isExactProductionRuntime({
        nodeEnv: "production",
        context: "production",
        siteId: AI_CORE_SMOKE_SITE_ID,
      }),
    ).toBe(true);
    expect(
      isExactProductionRuntime({
        nodeEnv: "production",
        context: "deploy-preview",
        siteId: AI_CORE_SMOKE_SITE_ID,
      }),
    ).toBe(false);
    expect(
      isExactProductionRuntime({
        nodeEnv: "production",
        context: "production",
        siteId: "another-site",
      }),
    ).toBe(false);
  });

  it("requires a strong standalone bootstrap secret", () => {
    expect(assertStrongBootstrapSecret(secret)).toBe(secret);
    expect(() => assertStrongBootstrapSecret("too-short")).toThrow(/32 to 256/);
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
