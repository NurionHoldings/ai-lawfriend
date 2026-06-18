import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const evidenceTag = "EVIDENCE-20260618-AIBEOPCHIN-PREDEPLOY-CODE-PROTECTION";

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing ${file}`);
  }
}

function includes(file, terms) {
  const content = read(file);
  for (const term of terms) {
    if (!content.includes(term)) {
      throw new Error(`Missing "${term}" in ${file}`);
    }
  }
}

exists("scripts/protect-next-build-assets.mjs");

includes("package.json", [
  "\"terser\"",
  "\"javascript-obfuscator\"",
  "protect:build-assets",
  "verify:aibeopchin-predeploy-code-protection",
  "build:protected",
]);

includes("next.config.ts", [
  "productionBrowserSourceMaps: false",
  "removeConsole",
]);

includes("scripts/protect-next-build-assets.mjs", [
  "aibeopchin-next-build-asset-protection",
  "JavaScriptObfuscator.obfuscate",
  "sourceMappingURL=",
  ".next/static/chunks/app",
  ".next/static/chunks/pages",
]);

includes("scripts/predeploy-check.ts", [
  "verify:aibeopchin-predeploy-code-protection",
  "protect:build-assets",
]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(evidenceTag)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${evidenceTag}`);
}

if (fs.existsSync(path.join(root, ".next"))) {
  execSync("node scripts/protect-next-build-assets.mjs", { stdio: "inherit", cwd: root });
}

console.log("verify:aibeopchin-predeploy-code-protection PASS");
