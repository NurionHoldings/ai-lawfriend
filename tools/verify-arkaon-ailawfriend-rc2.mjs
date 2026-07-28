import fs from "node:fs";

const required = [
  "src/features/arkaon/arkaon.policy.ts",
  "src/features/arkaon/arkaon.adapter.ts",
  "src/features/arkaon/arkaon.analyzer.ts",
  "src/features/arkaon/arkaon.ledger.ts",
  "src/features/arkaon/arkaon.service.ts",
  "src/features/arkaon/arkaon.schema.ts",
  "src/app/api/admin/arkaon/snapshot/route.ts",
  "src/app/api/admin/arkaon/control-center/route.ts",
  "src/app/api/admin/arkaon/proposals/[proposalId]/approve/route.ts",
  "src/app/api/admin/arkaon/proposals/[proposalId]/reject/route.ts",
  "src/app/(protected)/admin/arkaon/page.tsx",
  "src/components/admin/arkaon/arkaon-control-center.tsx",
  "docs/arkaon/ARKAON_AILAWFRIEND_RC2.md",
  "prisma/migrations/20260728183000_arkaon_control_plane_persistence_rc2/migration.sql",
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`missing: ${file}`);
}

const policy = fs.readFileSync("src/features/arkaon/arkaon.policy.ts", "utf8");
for (const marker of [
  "adviceOnly: true",
  "l3Enabled: false",
  "executeEnabled: false",
  "LEGAL_JUDGMENT_CHANGE",
  "PRODUCTION_DEPLOY",
]) {
  if (!policy.includes(marker)) throw new Error(`policy marker missing: ${marker}`);
}
if (!policy.includes("AILAWFRIEND-RC2") && !policy.includes("AILAWFRIEND-RC3")) {
  throw new Error("policy marker missing: AILAWFRIEND-RC2|RC3");
}

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
for (const model of [
  "model ArkaonIssue",
  "model ArkaonDiagnosis",
  "model ArkaonPlan",
  "model ArkaonProposal",
  "model ArkaonApproval",
  "model ArkaonRun",
  "model ArkaonBrainMeta",
]) {
  if (!schema.includes(model)) throw new Error(`schema missing ${model}`);
}

const repo = fs.readFileSync(
  "src/features/control-tower-brain/control-tower-brain.repository.ts",
  "utf8",
);
if (repo.includes("In-memory Control Tower Brain state (no production DB migration)")) {
  throw new Error("brain repository still documents pure in-memory production store");
}
if (!repo.includes("prisma.arkaonIssue") || !repo.includes("useMemoryStore")) {
  throw new Error("brain repository must use Prisma with memory test fallback");
}

const autoFix = fs.readFileSync(
  "src/features/control-tower-brain/phase60e-safe-auto-fix.service.ts",
  "utf8",
);
if (autoFix.includes("Safe auto-fix audit recorded. Doc/meta file writes remain manual")) {
  throw new Error("misleading auto-fix executed semantics still present");
}
if (!autoFix.includes("executed: false")) {
  throw new Error("auto-fix must keep executed:false when no mutation occurs");
}

const consoleUi = fs.readFileSync(
  "src/components/admin/arkaon/arkaon-control-center.tsx",
  "utf8",
);
for (const marker of ["WHY", "EVIDENCE", "RISK", "RECOMMENDED ACTION", "POLICY RESULT", "HUMAN DECISION"]) {
  if (!consoleUi.includes(marker)) throw new Error(`control center missing ${marker}`);
}

const layout = fs.readFileSync("src/app/(protected)/layout.tsx", "utf8");
if (!layout.includes('href="/admin/arkaon"')) {
  throw new Error("admin nav missing ARKAON Control Center link");
}

console.log("ARKAON × AI법친 RC2 VERIFY PASS");
