import { createHash, timingSafeEqual } from "node:crypto";
import {
  AI_CORE_SMOKE_MARKER,
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
  nodeEnv?: string;
  context?: string;
  siteId?: string;
};

export function isExactProductionRuntime(identity: RuntimeIdentity): boolean {
  return (
    identity.nodeEnv === "production" &&
    identity.context === "production" &&
    identity.siteId === AI_CORE_SMOKE_SITE_ID
  );
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
