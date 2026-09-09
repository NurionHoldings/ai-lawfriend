/**
 * Idempotently provisions dedicated fictional production-smoke records and syncs
 * their generated credentials to the already-linked Netlify production context.
 * It never sends messages, charges money, or deletes data.
 *
 * Run only from the linked ai-lawfriend checkout:
 *   npm run ops:ai-core-production-smoke-bootstrap -- --confirm-production
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import process from "node:process";
import {
  AI_CORE_SMOKE_ACCOUNTS,
  AI_CORE_SMOKE_SITE_ID,
  assertStrongSmokeAdminPassword,
  extractLinkedSiteId,
  normalizeSmokeAdminEmail,
  resolveProductionDatabaseUrl,
  resolveRequiredProductionSecret,
} from "./lib/ai-core-production-smoke-bootstrap-policy.mjs";
import { syncNetlifyProductionEnvironmentVariable } from "./lib/netlify-production-env-sync.mjs";

function netlify(args, { capture = true } = {}) {
  const isWindows = process.platform === "win32";
  if (isWindows && args.some((arg) => !/^[A-Za-z0-9:_-]+$/.test(arg))) {
    throw new Error("unsafe Netlify CLI argument refused");
  }
  const executable = isWindows ? process.env.ComSpec || "cmd.exe" : "npx";
  const executableArgs = isWindows
    ? ["/d", "/s", "/c", `npx.cmd netlify ${args.join(" ")}`]
    : ["netlify", ...args];
  return execFileSync(executable, executableArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    windowsHide: true,
  }).trim();
}

function setProductionEnv(key, value) {
  syncNetlifyProductionEnvironmentVariable(key, value);
}

function readProductionEnv(key) {
  const value = netlify(["env:get", key, "--context", "production"]);
  if (!value) throw new Error(`Netlify production env ${key} is missing`);
  return value;
}

function readRequiredProductionSecret(key) {
  const injected = process.env[key];
  if (injected?.trim()) {
    return resolveRequiredProductionSecret(injected, undefined, key);
  }
  return resolveRequiredProductionSecret(
    undefined,
    readProductionEnv(key),
    key,
  );
}

function generatedPassword() {
  return `ArK!${randomBytes(18).toString("base64url")}9z`;
}

async function main() {
  if (!process.argv.includes("--confirm-production")) {
    throw new Error("explicit --confirm-production flag is required");
  }

  const statusText = netlify(["status", "--json"]);
  const status = JSON.parse(statusText);
  const linkedSiteId = extractLinkedSiteId(status);
  if (linkedSiteId !== AI_CORE_SMOKE_SITE_ID) {
    throw new Error(
      `wrong Netlify site (${linkedSiteId ?? "unlinked"}); expected ${AI_CORE_SMOKE_SITE_ID}`,
    );
  }

  const injectedDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = resolveProductionDatabaseUrl(
    injectedDatabaseUrl,
    /^postgres(?:ql)?:\/\//.test(injectedDatabaseUrl?.trim() ?? "")
      ? undefined
      : readProductionEnv("DATABASE_URL"),
  );
  const adminEmail = normalizeSmokeAdminEmail(
    readRequiredProductionSecret("OPS_SMOKE_ADMIN_EMAIL"),
  );
  const adminPassword = assertStrongSmokeAdminPassword(
    readRequiredProductionSecret("OPS_SMOKE_ADMIN_PASSWORD"),
  );
  const { PrismaClient } = await import("@prisma/client");
  const { provisionProductionSmokeFixtures } = await import(
    "../src/features/ai-core/production-smoke-bootstrap.service.ts"
  );
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
  const passwords = Object.fromEntries(
    Object.keys(AI_CORE_SMOKE_ACCOUNTS).map((label) => [
      label,
      generatedPassword(),
    ]),
  );

  let provisioned;
  try {
    provisioned = await provisionProductionSmokeFixtures({
      prisma,
      adminEmail,
      adminPassword,
      accountPasswords: passwords,
    });
  } finally {
    await prisma.$disconnect();
    if (injectedDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = injectedDatabaseUrl;
    }
  }

  if (provisioned.alreadyProvisioned) {
    console.log(
      `PASS — fictional smoke case ${provisioned.caseId} was already provisioned`,
    );
    console.log("PASS — no credentials or records were changed");
    return;
  }

  const envValues = {
    OPS_SMOKE_ADMIN_EMAIL: adminEmail,
    OPS_SMOKE_ADMIN_PASSWORD: adminPassword,
    OPS_SMOKE_CLIENT_EMAIL: AI_CORE_SMOKE_ACCOUNTS.CLIENT.email,
    OPS_SMOKE_CLIENT_PASSWORD: passwords.CLIENT,
    OPS_SMOKE_LAWYER_EMAIL: AI_CORE_SMOKE_ACCOUNTS.LAWYER.email,
    OPS_SMOKE_LAWYER_PASSWORD: passwords.LAWYER,
    OPS_SMOKE_STAFF_EMAIL: AI_CORE_SMOKE_ACCOUNTS.STAFF.email,
    OPS_SMOKE_STAFF_PASSWORD: passwords.STAFF,
    OPS_SMOKE_CASE_ID: provisioned.caseId,
  };
  for (const [key, value] of Object.entries(envValues)) {
    setProductionEnv(key, value);
  }

  console.log(`PASS — fictional smoke case ${provisioned.caseId} provisioned`);
  console.log(
    provisioned.adminCreated
      ? "PASS — first 아르카온관리자 SUPER_ADMIN provisioned"
      : "PASS — existing ACTIVE privileged administrator verified without mutation",
  );
  console.log(
    "PASS — CLIENT/LAWYER/STAFF credentials synced to Netlify production",
  );
  console.log(
    "No password values were printed; no external messages, payments, or deletes occurred.",
  );
}

main().catch((error) => {
  console.error(
    `[ops-ai-core-production-smoke-bootstrap] ${error.message ?? error}`,
  );
  process.exit(1);
});
