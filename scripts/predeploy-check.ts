import { execSync } from "node:child_process";
import { getOAuthEnvValidationErrors } from "../src/lib/auth/oauth";

function run(label: string, command: string) {
  console.log(`\n[PREDEPLOY] ${label}`);
  execSync(command, { stdio: "inherit" });
}

function validateEnvironment() {
  console.log("\n[PREDEPLOY] Environment");
  const errors = getOAuthEnvValidationErrors();

  if (errors.length === 0) {
    console.log("[PREDEPLOY] Auth env validation passed");
    return;
  }

  throw new Error(`[PREDEPLOY] Auth env validation failed:\n- ${errors.join("\n- ")}`);
}

function main() {
  validateEnvironment();
  run("Supplement migration predeploy gate", "npm run verify:supplement-migration-predeploy");
  run("Type check", "npx tsc --noEmit");
  run("Lint", "npm run lint");
  run("Unit tests", "npm run test");
  run("Build", "npm run build");
}

main();
