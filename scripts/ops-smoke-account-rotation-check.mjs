/**
 * Policy gate for OPS_SMOKE account rotation.
 * Does not login, mutate DB, or print secret values.
 *
 * Usage:
 *   npm run ops:smoke-account-rotation-check
 *   PLAYWRIGHT_BASE_URL=https://staging.example.com npm run ops:smoke-account-rotation-check
 */
import { isLocalhostOrigin } from "./lib/staging-secrets-env-policy.mjs";

const SEED_DEFAULT_PASSWORDS = new Set(["Admin1234!", "password123!"]);
const SEED_DEFAULT_EMAILS = new Set([
  "admin@aibupchin.com",
  "lawyer@aibupchin.com",
  "user@aibupchin.com",
  "staff@example.com",
  "admin@test.com",
]);

const ROLES = ["CLIENT", "LAWYER", "STAFF", "ADMIN"];

const baseUrl = (
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.STAGING_BASE_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

const isRemote =
  !isLocalhostOrigin(baseUrl) && process.env.STAGING_ALLOW_LOCAL !== "1";

function mask(value) {
  if (!value) return "(empty)";
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}…${value.slice(-2)} (len=${value.length})`;
}

function main() {
  console.log(`[ops-smoke-account-rotation-check] baseUrl=${baseUrl} remote=${isRemote}`);

  const failures = [];
  const warnings = [];

  for (const role of ROLES) {
    const email = process.env[`OPS_SMOKE_${role}_EMAIL`]?.trim() || "";
    const password = process.env[`OPS_SMOKE_${role}_PASSWORD`]?.trim() || "";

    console.log(`- ${role}: email=${mask(email)} password=${password ? "set" : "missing"}`);

    if (isRemote) {
      if (!email) failures.push(`missing OPS_SMOKE_${role}_EMAIL`);
      if (!password) failures.push(`missing OPS_SMOKE_${role}_PASSWORD`);
    }

    if (email && SEED_DEFAULT_EMAILS.has(email.toLowerCase())) {
      const msg = `${role} email matches seed default (${email})`;
      if (isRemote) failures.push(msg);
      else warnings.push(msg);
    }

    if (password && SEED_DEFAULT_PASSWORDS.has(password)) {
      const msg = `${role} password matches seed default`;
      if (isRemote) failures.push(msg);
      else warnings.push(msg);
    }
  }

  const caseId = process.env.OPS_SMOKE_CASE_ID?.trim() || "";
  console.log(`- CASE_ID: ${caseId ? mask(caseId) : "(empty)"}`);
  if (isRemote && !caseId) {
    failures.push("missing OPS_SMOKE_CASE_ID");
  }

  for (const w of warnings) console.warn(`WARN — ${w}`);
  for (const f of failures) console.error(`FAIL — ${f}`);

  if (failures.length > 0) {
    console.error(
      `\nops-smoke-account-rotation-check FAIL (${failures.length}). See docs/operations/OPS_SMOKE_ACCOUNT_ROTATION_RUNBOOK.md`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `\nops-smoke-account-rotation-check PASS (${warnings.length} warning(s)). Rotation of live secrets is HQ ops — this gate only blocks seed defaults on remote.`,
  );
}

main();
