import fs from "node:fs";

const required = [
  "src/features/arkaon/arkaon.policy.ts",
  "src/features/arkaon/arkaon.adapter.ts",
  "src/features/arkaon/arkaon.analyzer.ts",
  "src/features/arkaon/arkaon.ledger.ts",
  "src/features/arkaon/arkaon.service.ts",
  "src/app/api/admin/arkaon/snapshot/route.ts",
  "src/app/api/admin/arkaon/proposals/[proposalId]/approve/route.ts",
  "docs/arkaon/ARKAON_AILAWFRIEND_RC1.md",
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`missing: ${file}`);
}
const policy = fs.readFileSync("src/features/arkaon/arkaon.policy.ts", "utf8");
for (const marker of ["adviceOnly: true", "l3Enabled: false", "executeEnabled: false", "LEGAL_JUDGMENT_CHANGE", "PRODUCTION_DEPLOY"]) {
  if (!policy.includes(marker)) throw new Error(`policy marker missing: ${marker}`);
}
const autoFix = fs.readFileSync("src/features/control-tower-brain/phase60e-safe-auto-fix.service.ts", "utf8");
if (autoFix.includes("Safe auto-fix audit recorded. Doc/meta file writes remain manual")) {
  throw new Error("misleading auto-fix executed semantics still present");
}
console.log("ARKAON × AI법친 RC1 VERIFY PASS");
