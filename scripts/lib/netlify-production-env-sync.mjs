import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import process from "node:process";

export const NETLIFY_ENV_SYNC_INTERNAL_FLAG = "--internal-netlify-env-sync";
export const NETLIFY_ENV_SYNC_VALUE_KEY = "ARKAON_NETLIFY_ENV_SYNC_VALUE";
const NETLIFY_ENV_SYNC_NAME_KEY = "ARKAON_NETLIFY_ENV_SYNC_NAME";
const NETLIFY_ENV_SYNC_SECRET_KEY = "ARKAON_NETLIFY_ENV_SYNC_SECRET";
const NETLIFY_PACKAGE_SPEC = "netlify@27.5.1";
const MODULE_PATH = fileURLToPath(import.meta.url);

const PASSWORD_ENV_KEYS = new Set([
  "OPS_SMOKE_ADMIN_PASSWORD",
  "OPS_SMOKE_CLIENT_PASSWORD",
  "OPS_SMOKE_LAWYER_PASSWORD",
  "OPS_SMOKE_STAFF_PASSWORD",
]);

export function isSmokePasswordEnvironmentKey(key) {
  return PASSWORD_ENV_KEYS.has(key);
}

function assertEnvironmentInput(key, value) {
  if (!/^[A-Z0-9_]+$/.test(key)) {
    throw new Error("unsafe Netlify environment variable key refused");
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Netlify production env ${key} cannot be empty`);
  }
}

export function buildNetlifyEnvSetArguments(key, value) {
  assertEnvironmentInput(key, value);
  const options = ["--context", "production", "--force"];
  if (isSmokePasswordEnvironmentKey(key)) options.push("--secret");
  return ["env:set", ...options, "--", key, value];
}

export function buildNetlifyEnvSyncInvocation({
  key,
  value,
  cwd,
  helperPath,
  npmExecPath,
  nodeExecutable = process.execPath,
  baseEnvironment = process.env,
}) {
  assertEnvironmentInput(key, value);
  if (!npmExecPath) {
    throw new Error(
      "npm_execpath is unavailable; run the bootstrap through its npm script",
    );
  }
  return {
    executable: nodeExecutable,
    args: [
      npmExecPath,
      "exec",
      "--yes",
      `--package=${NETLIFY_PACKAGE_SPEC}`,
      "--",
      nodeExecutable,
      helperPath,
      NETLIFY_ENV_SYNC_INTERNAL_FLAG,
    ],
    options: {
      cwd,
      env: {
        ...baseEnvironment,
        [NETLIFY_ENV_SYNC_NAME_KEY]: key,
        [NETLIFY_ENV_SYNC_VALUE_KEY]: value,
        [NETLIFY_ENV_SYNC_SECRET_KEY]: isSmokePasswordEnvironmentKey(key)
          ? "1"
          : "0",
      },
      shell: false,
      stdio: "inherit",
      windowsHide: true,
    },
  };
}

function findNetlifyPackageRoot(environment = process.env) {
  for (const pathEntry of (environment.PATH ?? "").split(delimiter)) {
    const normalized = pathEntry.replace(/^"|"$/g, "");
    if (!normalized) continue;
    const nodeModules = dirname(normalized);
    for (const packageName of ["netlify", "netlify-cli"]) {
      const root = join(nodeModules, packageName);
      if (
        existsSync(join(root, "dist", "commands", "main.js")) &&
        existsSync(join(root, "dist", "utils", "run-program.js"))
      ) {
        return root;
      }
    }
  }
  throw new Error("Netlify CLI package root could not be resolved from PATH");
}

async function runInternalNetlifyEnvSync() {
  const key = process.env[NETLIFY_ENV_SYNC_NAME_KEY] ?? "";
  const value = process.env[NETLIFY_ENV_SYNC_VALUE_KEY] ?? "";
  const secretMarker = process.env[NETLIFY_ENV_SYNC_SECRET_KEY];
  assertEnvironmentInput(key, value);
  if (isSmokePasswordEnvironmentKey(key) && secretMarker !== "1") {
    throw new Error(
      "smoke password environment variables must be Netlify secrets",
    );
  }

  const packageRoot = findNetlifyPackageRoot();
  const [{ createMainCommand }, { runProgram }] = await Promise.all([
    import(
      pathToFileURL(join(packageRoot, "dist", "commands", "main.js")).href
    ),
    import(
      pathToFileURL(join(packageRoot, "dist", "utils", "run-program.js")).href
    ),
  ]);
  const program = createMainCommand();
  const inMemoryCliArguments = buildNetlifyEnvSetArguments(key, value);
  try {
    await runProgram(program, [
      process.execPath,
      join(packageRoot, "bin", "run.js"),
      ...inMemoryCliArguments,
    ]);
    program.onEnd();
  } catch (error) {
    program.onEnd(error);
    throw error;
  } finally {
    delete process.env[NETLIFY_ENV_SYNC_VALUE_KEY];
  }
}

export function syncNetlifyProductionEnvironmentVariable(
  key,
  value,
  { spawn = execFileSync, cwd = process.cwd() } = {},
) {
  const invocation = buildNetlifyEnvSyncInvocation({
    key,
    value,
    cwd,
    helperPath: resolve(
      dirname(MODULE_PATH),
      "netlify-production-env-sync.mjs",
    ),
    npmExecPath: process.env.npm_execpath,
  });
  spawn(invocation.executable, invocation.args, invocation.options);
}

if (process.argv.includes(NETLIFY_ENV_SYNC_INTERNAL_FLAG)) {
  runInternalNetlifyEnvSync().catch(() => {
    console.error("Netlify production environment synchronization failed");
    process.exitCode = 1;
  });
}
