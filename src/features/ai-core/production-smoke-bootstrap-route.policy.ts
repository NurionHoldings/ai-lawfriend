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

export type ProductionSmokeBootstrapErrorCode =
  | "DATABASE_BINDING_UNAVAILABLE"
  | "ADMIN_CONFIGURATION_INVALID"
  | "FIXTURE_COLLISION"
  | "TRANSACTION_CONFLICT"
  | "DATABASE_SCHEMA_MISMATCH"
  | "DATABASE_CONSTRAINT_ERROR"
  | "DATABASE_TRANSACTION_ERROR"
  | "DATABASE_QUERY_ERROR"
  | "BOOTSTRAP_FAILED";

export function classifyProductionSmokeBootstrapError(
  error: unknown,
): ProductionSmokeBootstrapErrorCode {
  const message = error instanceof Error ? error.message : "";
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  if (
    /NETLIFY_DB_URL|Netlify Database runtime|connection URL/i.test(message) ||
    /^P10(?:0[0-9]|1[0-7])$/.test(code)
  ) {
    return "DATABASE_BINDING_UNAVAILABLE";
  }
  if (/OPS_SMOKE_ADMIN_/i.test(message)) {
    return "ADMIN_CONFIGURATION_INVALID";
  }
  if (/smoke (?:identity|case title) collision/i.test(message)) {
    return "FIXTURE_COLLISION";
  }
  if (/uniqueness or serialization conflict/i.test(message) || code === "P2034") {
    return "TRANSACTION_CONFLICT";
  }
  if (/^P202[123]$/.test(code)) {
    return "DATABASE_SCHEMA_MISMATCH";
  }
  if (/^P20(?:0[0123]|1[1458]|25)$/.test(code)) {
    return "DATABASE_CONSTRAINT_ERROR";
  }
  if (/^P20(?:24|28)$/.test(code)) {
    return "DATABASE_TRANSACTION_ERROR";
  }
  if (/^P\d{4}$/.test(code)) {
    return "DATABASE_QUERY_ERROR";
  }
  return "BOOTSTRAP_FAILED";
}

const AI_CORE_SMOKE_PRODUCTION_HOST = new URL(
  AI_CORE_SMOKE_PRODUCTION_ORIGIN,
).host;

function firstForwardedValue(value: string | null): string | undefined {
  return value?.split(",", 1)[0]?.trim() || undefined;
}

export function resolveProductionRequestOrigin(
  requestUrl: string,
  headers: Pick<Headers, "get">,
): string | undefined {
  const directOrigin = new URL(requestUrl).origin;
  if (directOrigin === AI_CORE_SMOKE_PRODUCTION_ORIGIN) return directOrigin;

  const forwardedProto = firstForwardedValue(headers.get("x-forwarded-proto"));
  const forwardedHost = firstForwardedValue(headers.get("x-forwarded-host"));
  if (
    forwardedProto === "https" &&
    forwardedHost === AI_CORE_SMOKE_PRODUCTION_HOST
  ) {
    return AI_CORE_SMOKE_PRODUCTION_ORIGIN;
  }
  return undefined;
}

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
