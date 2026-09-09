import { createHash, timingSafeEqual } from "node:crypto";
import {
  AI_CORE_SMOKE_MARKER,
  AI_CORE_SMOKE_PRODUCTION_ORIGIN,
  AI_CORE_SMOKE_SITE_ID,
  assertStrongBootstrapSecret,
  deriveSmokeAccountPassword,
} from "../../../scripts/lib/ai-core-production-smoke-bootstrap-policy.mjs";

export { assertStrongBootstrapSecret, deriveSmokeAccountPassword };

export const PRODUCTION_SMOKE_CONFIRMATION = Object.freeze({
  confirm: AI_CORE_SMOKE_MARKER,
  siteId: AI_CORE_SMOKE_SITE_ID,
});

type RuntimeIdentity = {
  requestOrigin?: string;
  nodeEnv?: string;
  context?: string;
  siteId?: string;
};

export function resolveRuntimeEnvironmentValue(
  netlifyValue: string | undefined,
  processValue: string | undefined,
): string | undefined {
  return netlifyValue?.trim() || processValue?.trim() || undefined;
}

export function isExactProductionRuntime(identity: RuntimeIdentity): boolean {
  if (identity.requestOrigin !== AI_CORE_SMOKE_PRODUCTION_ORIGIN) return false;
  if (identity.nodeEnv && identity.nodeEnv !== "production") return false;
  if (identity.context && identity.context !== "production") return false;
  if (identity.siteId && identity.siteId !== AI_CORE_SMOKE_SITE_ID) return false;
  return true;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function hasValidBearerSecret(
  authorization: string | null,
  expectedSecret: string,
): boolean {
  if (!authorization?.startsWith("Bearer ")) return false;
  const supplied = authorization.slice("Bearer ".length);
  if (!supplied || supplied.includes(" ")) return false;
  return timingSafeEqual(digest(supplied), digest(expectedSecret));
}

export function hasExactBootstrapConfirmation(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const body = value as Record<string, unknown>;
  return (
    Object.keys(body).length === 2 &&
    body.confirm === PRODUCTION_SMOKE_CONFIRMATION.confirm &&
    body.siteId === PRODUCTION_SMOKE_CONFIRMATION.siteId
  );
}
