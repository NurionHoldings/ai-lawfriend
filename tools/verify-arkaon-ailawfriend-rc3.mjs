import fs from "node:fs";

const required = [
  "src/features/arkaon/arkaon.policy.ts",
  "src/features/arkaon/arkaon.service.ts",
  "src/features/arkaon/arkaon.repository.ts",
  "src/features/arkaon/arkaon.types.ts",
  "src/features/arkaon/skills/registry.ts",
  "src/features/arkaon/skills/types.ts",
  "src/features/arkaon/skills/executor.ts",
  "src/features/arkaon/skills/verifier.ts",
  "src/features/arkaon/skills/claim-execution-slot.ts",
  "src/features/arkaon/skills/idempotency-gate.ts",
  "src/features/arkaon/skills/ailawfriend/retry-failed-internal-job-after-human-approval.ts",
  "src/features/arkaon/skills/arkaon-l2-skill-rc3.lock-validation.test.ts",
  "prisma/migrations/20260728193000_arkaon_execution_active_unique_rc3/migration.sql",
  "src/app/api/admin/arkaon/proposals/[proposalId]/approve/route.ts",
  "src/app/api/admin/arkaon/proposals/[proposalId]/execute/route.ts",
  "src/app/api/admin/arkaon/proposals/[proposalId]/verify/route.ts",
  "src/app/(protected)/admin/arkaon/page.tsx",
  "docs/arkaon/ARKAON_RC3_LOCK_REQUIRED.md",
  "docs/arkaon/evidence/rc3-concurrent-execute-latest.json",
  "scripts/verify-arkaon-rc3-staging-concurrent-execute.ts",
  "prisma/migrations/20260728190000_arkaon_safe_l2_action_design_rc3/migration.sql",
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`missing: ${file}`);
}

const policy = fs.readFileSync("src/features/arkaon/arkaon.policy.ts", "utf8");
for (const marker of [
  "AILAWFRIEND-RC3",
  "LOCKED_SAFE_L2",
  "L1_ADVICE",
  "L2_HUMAN_APPROVED_EXECUTION",
  "L3_AUTONOMOUS_EXECUTION",
  "l3Enabled: false",
  "executeEnabled: false",
  "evaluateL2SkillExecution",
  "LEGAL_JUDGMENT_CHANGE",
  "CLIENT_VISIBLE_SEND",
  "PRODUCTION_DEPLOY",
]) {
  if (!policy.includes(marker)) throw new Error(`policy marker missing: ${marker}`);
}
if (policy.includes("ARKAON AI법친 RC1 is advice_only")) {
  throw new Error("RC2 LOCKFIX regress: RC1 execute denial string must not remain");
}
if (!policy.includes("ARKAON_POLICY_VERSION}")) {
  throw new Error("execute denial must interpolate ARKAON_POLICY_VERSION");
}

const approve = fs.readFileSync(
  "src/app/api/admin/arkaon/proposals/[proposalId]/approve/route.ts",
  "utf8",
);
if (approve.includes("executeApprovedSkill") || approve.includes("executeArkaon")) {
  throw new Error("approve route must not call execute");
}

const executor = fs.readFileSync("src/features/arkaon/skills/executor.ts", "utf8");
if (!executor.includes("export async function executeApprovedSkill")) {
  throw new Error("executeApprovedSkill must be a separate export");
}
if (!executor.includes("claimArkaonExecutionSlot")) {
  throw new Error("executor must claim execution slot atomically (Idempotency+race)");
}
if (executor.includes("assertArkaonExecutionIdempotency") && !executor.includes("claimArkaonExecutionSlot")) {
  throw new Error("executor must not rely on check-then-create alone");
}

const skill = fs.readFileSync(
  "src/features/arkaon/skills/ailawfriend/retry-failed-internal-job-after-human-approval.ts",
  "utf8",
);
for (const marker of [
  "retry_failed_internal_job_after_human_approval",
  'sourceType: "CRON"',
  "EXTERNAL_MESSAGE",
  "operatorQueueRetryJobService",
  "mutatesLegalJudgment: false",
  "clientVisibleSend: false",
  "invokesCronRerunApi: false",
]) {
  if (!skill.includes(marker)) throw new Error(`skill marker missing: ${marker}`);
}
if (skill.includes('"DOCUMENT_PIPELINE"') || skill.includes('"AI_CALL"')) {
  throw new Error("first L2 skill must remain CRON-only after survey");
}

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
if (!schema.includes("model ArkaonExecution")) throw new Error("ArkaonExecution model missing");
if (!schema.includes("skillId")) throw new Error("proposal skillId missing");

const consoleUi = fs.readFileSync("src/components/admin/arkaon/arkaon-control-center.tsx", "utf8");
for (const marker of [
  "EXECUTION AVAILABLE",
  "EXECUTION BLOCKED",
  "EXECUTED",
  "VERIFIED",
  "FAILED",
  "Execute L2 Skill",
]) {
  if (!consoleUi.includes(marker)) throw new Error(`control center missing ${marker}`);
}

const claim = fs.readFileSync("src/features/arkaon/skills/claim-execution-slot.ts", "utf8");
if (!claim.includes("claimArkaonExecutionSlot") || !claim.includes("P2002")) {
  throw new Error("claim slot must handle unique violation race (P2002)");
}
if (!executor.includes("claimArkaonExecutionSlot")) {
  throw new Error("executor must claim execution slot atomically");
}

const migration = fs.readFileSync(
  "prisma/migrations/20260728193000_arkaon_execution_active_unique_rc3/migration.sql",
  "utf8",
);
if (!migration.includes("ArkaonExecution_proposalId_skillId_active_uidx")) {
  throw new Error("partial unique index migration missing for concurrent EXECUTE");
}

console.log("ARKAON × AI법친 RC3 STATIC VERIFY PASS");
console.log("RC3 STATUS: LOCKED_SAFE_L2");
