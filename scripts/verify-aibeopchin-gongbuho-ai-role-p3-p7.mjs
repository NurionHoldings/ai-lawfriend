import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const evidenceTag = "EVIDENCE-20260618-AIBEOPCHIN-GONGBUHO-AI-ROLE-P3-P7-OPERATING-BRIDGE";

function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}

function exists(p) {
  if (!fs.existsSync(path.join(root, p))) throw new Error(`Missing ${p}`);
}

function includes(p, terms) {
  const content = read(p);
  for (const term of terms) {
    if (!content.includes(term)) throw new Error(`Missing "${term}" in ${p}`);
  }
}

exists("src/features/legal-strategy/gongbuho-legal-strategy-workspace.service.ts");
exists("src/features/gongbuho-intelligence-layer/case-gongbuho-learning-bridge.service.ts");
exists("src/features/gongbuho-intelligence-layer/case-real-time-legal-signal-bridge.service.ts");
exists("src/app/api/cases/[caseId]/gongbuho/legal-strategy-workspace/route.ts");
exists("src/components/cases/lawyer-intelligence-review-console.tsx");
exists("src/features/legal-strategy/gongbuho-legal-strategy-workspace.service.test.ts");

includes("src/features/legal-strategy/gongbuho-legal-strategy-workspace.service.ts", [
  "buildGongbuhoLegalStrategyWorkspaceFromReasoningContext",
  "buildEvidenceGapDetectionReport",
  "composeJudgmentReasoningView",
  "clientVisibleAllowed: false",
  "lawyerReviewRequired: true",
]);

includes("src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.policy.ts", [
  "buildReasoningContextTraceEntries",
  "jrs-context-trace-",
]);

includes("src/features/gongbuho-intelligence-layer/case-gongbuho-learning-bridge.service.ts", [
  "createLawyerFeedbackLearningTraceService",
  "buildReusableLegalPatternFromLearningTrace",
  "REJECTED_DECISION",
]);

includes("src/features/gongbuho-intelligence-layer/case-real-time-legal-signal-bridge.service.ts", [
  "buildCaseRealTimeLegalSignal",
  "transitionCaseRealTimeLegalSignal",
  "assertRealTimeLegalSignalTransitionAllowed",
]);

includes("src/app/api/cases/[caseId]/gongbuho/legal-strategy-workspace/route.ts", [
  "buildGongbuhoLegalStrategyWorkspaceForCase",
  "workspaceSummary",
  "diagnostics",
]);

includes("src/components/cases/lawyer-intelligence-review-console.tsx", [
  "공부호 전략 워크스페이스",
  "refreshGongbuhoWorkspace",
  "workspaceSummary",
]);

if (!read("docs/project-governance/IMPLEMENTATION_EVIDENCE.md").includes(evidenceTag)) {
  throw new Error(`IMPLEMENTATION_EVIDENCE.md missing ${evidenceTag}`);
}

if (!read("package.json").includes("verify:aibeopchin-gongbuho-ai-role-p3-p7")) {
  throw new Error("package.json missing verify:aibeopchin-gongbuho-ai-role-p3-p7");
}

execSync(
  "npm run test -- src/features/legal-strategy/gongbuho-legal-strategy-workspace.service.test.ts src/features/gongbuho-intelligence-layer/case-gongbuho-reasoning-context.service.test.ts src/features/legal-strategy/judgment-backed-reasoning/phase64a-judgment-reasoning-source-map.test.ts",
  { stdio: "inherit", cwd: root },
);

console.log("✅ Gongbuho AI role P3-P7 operating bridge verified");
console.log("- P3 orchestrator: P2 reasoning context → Phase 61/62/64 workspace");
console.log("- P4 trace propagation: reasoningContext.sourceTrace reaches source map");
console.log("- P5 learning bridge: lawyer decision → reusable pattern candidate");
console.log("- P6 signal bridge: real-time legal signal lifecycle gate");
console.log("- P7 API/UI bridge: case-scoped lawyer workspace endpoint and tab");
