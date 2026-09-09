/**
 * Calls the production-internal ARKAON bootstrap route, validates its response,
 * then syncs the deterministic fictional account credentials to Netlify.
 *
 * OPS_SMOKE_BOOTSTRAP_SECRET must be injected through the process environment.
 * It is never accepted as a command-line argument or printed.
 */
import { execFileSync } from "node:child_process";
import process from "node:process";
import {
  AI_CORE_SMOKE_PRODUCTION_ORIGIN,
  AI_CORE_SMOKE_SITE_ID,
  extractLinkedSiteId,
} from "./lib/ai-core-production-smoke-bootstrap-policy.mjs";
import {
  AI_CORE_SMOKE_RUNTIME_PATH,
  runProductionSmokeBootstrapWorkflow,
} from "./lib/ai-core-production-smoke-runtime-bootstrap.mjs";
import { syncNetlifyProductionEnvironmentVariable } from "./lib/netlify-production-env-sync.mjs";

function netlifyStatus() {
  const isWindows = process.platform === "win32";
  const executable = isWindows ? process.env.ComSpec || "cmd.exe" : "npx";
  const args = isWindows
    ? ["/d", "/s", "/c", "npx.cmd netlify status --json"]
    : ["netlify", "status", "--json"];
  return execFileSync(executable, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  }).trim();
}

async function requestBootstrap({ authorization, body }) {
  const response = await fetch(
    `${AI_CORE_SMOKE_PRODUCTION_ORIGIN}${AI_CORE_SMOKE_RUNTIME_PATH}`,
    {
      method: "POST",
      headers: {
        authorization,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(60_000),
    },
  );

  let responseBody;
  try {
    responseBody = await response.json();
  } catch {
    throw new Error("production smoke bootstrap returned non-JSON data");
  }
  return { httpStatus: response.status, body: responseBody };
}

async function main() {
  if (!process.argv.includes("--confirm-production")) {
    throw new Error("explicit --confirm-production flag is required");
  }

  const status = JSON.parse(netlifyStatus());
  const linkedSiteId = extractLinkedSiteId(status);
  if (linkedSiteId !== AI_CORE_SMOKE_SITE_ID) {
    throw new Error(
      `wrong Netlify site (${linkedSiteId ?? "unlinked"}); expected ${AI_CORE_SMOKE_SITE_ID}`,
    );
  }

  const result = await runProductionSmokeBootstrapWorkflow({
    bootstrapSecret: process.env.OPS_SMOKE_BOOTSTRAP_SECRET,
    requestBootstrap,
    syncEnvironment: (key, value) =>
      syncNetlifyProductionEnvironmentVariable(key, value),
  });

  console.log(
    `PASS — fictional smoke ${result.status}; caseId ${result.caseId} and role credentials synced`,
  );
  console.log(
    "FINAL SEPARATE STEP — after login smoke verification, remove OPS_SMOKE_BOOTSTRAP_SECRET from the Netlify production context.",
  );
  console.log(
    "No password or database URL was printed; no message, payment, order, or delete was performed.",
  );
}

main().catch(() => {
  console.error(
    "[ops-ai-core-production-smoke-runtime-bootstrap] failed; no secret or password was printed",
  );
  process.exit(1);
});
