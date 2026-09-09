import { PrismaClient } from "@prisma/client";
import { getConnectionString } from "@netlify/database";
import {
  AI_CORE_SMOKE_SITE_ID,
  assertStrongSmokeAdminPassword,
  normalizeSmokeAdminEmail,
} from "../../../../../../scripts/lib/ai-core-production-smoke-bootstrap-policy.mjs";
import {
  assertStrongBootstrapSecret,
  deriveSmokeAccountPassword,
  hasExactBootstrapConfirmation,
  hasValidBearerSecret,
  isExactProductionRuntime,
  resolveRuntimeEnvironmentValue,
} from "@/features/ai-core/production-smoke-bootstrap-route.policy";
import { provisionProductionSmokeFixtures } from "@/features/ai-core/production-smoke-bootstrap.service";
import { resolvePrismaDatabaseUrl } from "@/lib/prisma-database-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BODY_BYTES = 2_048;
const FAILURE_WINDOW_MS = 5 * 60 * 1_000;
const MAX_FAILURES_PER_WINDOW = 5;

type NetlifyRuntimeGlobal = typeof globalThis & {
  Netlify?: {
    env?: {
      get(key: string): string | undefined;
    };
  };
};

function runtimeEnvironmentValue(key: string): string | undefined {
  const netlifyValue = (globalThis as NetlifyRuntimeGlobal).Netlify?.env?.get(key);
  return resolveRuntimeEnvironmentValue(netlifyValue, process.env[key]);
}
const failuresByClient = new Map<string, { count: number; resetAt: number }>();

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function clientKey(request: Request): string {
  return (
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function isRateLimited(key: string, now = Date.now()): boolean {
  const state = failuresByClient.get(key);
  if (!state || state.resetAt <= now) {
    failuresByClient.delete(key);
    return false;
  }
  return state.count >= MAX_FAILURES_PER_WINDOW;
}

function recordFailure(key: string, now = Date.now()): void {
  const state = failuresByClient.get(key);
  if (!state || state.resetAt <= now) {
    failuresByClient.set(key, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
    return;
  }
  state.count += 1;
}

function safeErrorSummary(error: unknown): string {
  const message = error instanceof Error ? error.message : "unknown error";
  return message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "<redacted-db-url>");
}

export async function POST(request: Request): Promise<Response> {
  if (
    !isExactProductionRuntime({
      nodeEnv: process.env.NODE_ENV,
      context: runtimeEnvironmentValue("CONTEXT"),
      siteId: runtimeEnvironmentValue("SITE_ID"),
    })
  ) {
    return json(404, { ok: false });
  }

  const key = clientKey(request);
  if (isRateLimited(key)) {
    return json(429, { ok: false });
  }

  if (request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") {
    recordFailure(key);
    return json(415, { ok: false });
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
    recordFailure(key);
    return json(413, { ok: false });
  }

  let bootstrapSecret: string;
  try {
    bootstrapSecret = assertStrongBootstrapSecret(
      runtimeEnvironmentValue("OPS_SMOKE_BOOTSTRAP_SECRET"),
    );
  } catch (error) {
    console.error(
      "ARKAON production smoke bootstrap is not configured:",
      safeErrorSummary(error),
    );
    return json(503, { ok: false });
  }

  if (!hasValidBearerSecret(request.headers.get("authorization"), bootstrapSecret)) {
    recordFailure(key);
    return json(401, { ok: false });
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      recordFailure(key);
      return json(413, { ok: false });
    }
    body = JSON.parse(rawBody);
  } catch {
    recordFailure(key);
    return json(400, { ok: false });
  }
  if (!hasExactBootstrapConfirmation(body)) {
    recordFailure(key);
    return json(400, { ok: false });
  }

  let prisma: PrismaClient | undefined;
  try {
    const database = resolvePrismaDatabaseUrl({
      netlifyDbUrl: getConnectionString(),
    });
    if (database.source !== "NETLIFY_DB_URL") {
      throw new Error("production bootstrap requires Netlify Database runtime");
    }
    const adminEmail = normalizeSmokeAdminEmail(
      runtimeEnvironmentValue("OPS_SMOKE_ADMIN_EMAIL") ?? "",
    );
    const adminPassword = assertStrongSmokeAdminPassword(
      runtimeEnvironmentValue("OPS_SMOKE_ADMIN_PASSWORD") ?? "",
    );

    prisma = new PrismaClient({ datasourceUrl: database.url });
    const result = await provisionProductionSmokeFixtures({
      prisma,
      adminEmail,
      adminPassword,
      accountPasswords: {
        CLIENT: deriveSmokeAccountPassword(bootstrapSecret, "CLIENT"),
        LAWYER: deriveSmokeAccountPassword(bootstrapSecret, "LAWYER"),
        STAFF: deriveSmokeAccountPassword(bootstrapSecret, "STAFF"),
      },
    });

    return json(result.alreadyProvisioned ? 200 : 201, {
      ok: true,
      status: result.alreadyProvisioned
        ? "already_provisioned"
        : "provisioned",
      caseId: result.caseId,
      siteId: AI_CORE_SMOKE_SITE_ID,
    });
  } catch (error) {
    console.error(
      "ARKAON production smoke bootstrap failed:",
      safeErrorSummary(error),
    );
    return json(500, { ok: false });
  } finally {
    await prisma?.$disconnect();
  }
}
