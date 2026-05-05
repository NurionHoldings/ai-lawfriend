import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const operationFile = path.join(
  root,
  "data",
  "operations",
  "aibeopchin-6x-operation-stabilization.json"
);

const predeployCandidates = [
  path.join(root, "predeploy-lock-results.json"),
  path.join(root, "docs", "project-governance", "predeploy-lock-results.json")
];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function findPredeployFile() {
  const found = predeployCandidates.find((filePath) => fs.existsSync(filePath));
  if (!found) {
    throw new Error(
      `Missing predeploy lock file. checked: ${predeployCandidates.join(", ")}`
    );
  }
  return found;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const operation = readJson(operationFile);
  const predeploy = readJson(findPredeployFile());

  assert(
    operation.status === "PRODUCTION_DEPLOYED_AND_LOCKED",
    "operation status must be PRODUCTION_DEPLOYED_AND_LOCKED"
  );

  assert(
    operation.deploymentStatus === "PRODUCTION_DEPLOYED_AND_LOCKED",
    "operation deploymentStatus must be PRODUCTION_DEPLOYED_AND_LOCKED"
  );

  assert(operation.featureFreeze === true, "6.x featureFreeze must be true");

  assert(
    operation.smokeTestResultsSummary === "14/14 PASS",
    "operation smokeTestResultsSummary must be 14/14 PASS"
  );

  assert(
    predeploy.deploymentStatus === "PRODUCTION_DEPLOYED_AND_LOCKED" ||
      predeploy.status === "PRODUCTION_DEPLOYED_AND_LOCKED",
    "predeploy-lock-results.json must be locked"
  );

  const smokeTests = Array.isArray(operation.smokeTests)
    ? operation.smokeTests
    : [];

  assert(smokeTests.length === 14, "SMOKE test count must be 14");

  const failed = smokeTests.filter((item) => item.result !== "PASS");
  assert(
    failed.length === 0,
    `SMOKE tests not PASS: ${failed.map((x) => x.id).join(", ")}`
  );

  const securityChecks = operation.securityChecks ?? {};

  assert(
    securityChecks.databaseUrlRawValueExposed === false,
    "DATABASE_URL raw value must not be exposed"
  );

  assert(
    securityChecks.accessTokenRawValueExposed === false,
    "accessToken raw value must not be exposed"
  );

  assert(
    securityChecks.optionalPinOrHashExposed === false,
    "optionalPin/hash must not be exposed"
  );

  assert(
    securityChecks.attachmentDirectUrlExposed === false,
    "attachment direct URL must not be exposed"
  );

  assert(
    securityChecks.publicSafeOutputMaintained === true,
    "public-safe output must be maintained"
  );

  console.log("AI법친 6.x operation lock verification PASS");
  console.log(`- status: ${operation.status}`);
  console.log(`- smoke: ${operation.smokeTestResultsSummary}`);
  console.log(`- featureFreeze: ${operation.featureFreeze}`);
}

try {
  main();
} catch (error) {
  console.error("AI법친 6.x operation lock verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
