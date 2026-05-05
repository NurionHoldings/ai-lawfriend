import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

type PreflightStep = {
  name: string;
  command: string;
  args: string[];
  requiredFiles?: string[];
  allowSkip?: boolean;
};

type StepStatus = "PASS" | "FAIL" | "SKIP";

type StepResult = {
  name: string;
  command: string;
  status: StepStatus;
  message: string;
};

const projectRoot = process.cwd();

function fileExists(relativePath: string): boolean {
  return existsSync(join(projectRoot, relativePath));
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ");
}

function runStep(step: PreflightStep): StepResult {
  const missingFiles = step.requiredFiles?.filter((file) => !fileExists(file)) ?? [];

  if (missingFiles.length > 0) {
    return {
      name: step.name,
      command: formatCommand(step.command, step.args),
      status: step.allowSkip ? "SKIP" : "FAIL",
      message: `필수 파일 없음: ${missingFiles.join(", ")}`,
    };
  }

  try {
    execFileSync(step.command, step.args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: true,
    });

    return {
      name: step.name,
      command: formatCommand(step.command, step.args),
      status: "PASS",
      message: "정상 통과",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return {
      name: step.name,
      command: formatCommand(step.command, step.args),
      status: "FAIL",
      message,
    };
  }
}

const steps: PreflightStep[] = [
  {
    name: "Phase 2 DB preflight",
    command: "npm",
    args: ["run", "verify:phase2-db-preflight"],
  },
  {
    name: "Phase 2 official form full verify",
    command: "npm",
    args: ["run", "verify:official-form-phase2:full"],
  },
  {
    name: "Phase 3 official form / guardrail regression",
    command: "npm",
    args: ["run", "verify:official-form-phase3"],
    requiredFiles: ["scripts/run-official-form-phase3-regression.ts"],
  },
  {
    name: "Canonical source verification",
    command: "npm",
    args: ["run", "verify:canonical-sources"],
  },
  {
    name: "TypeScript noEmit",
    command: "npx",
    args: ["tsc", "--noEmit"],
  },
  {
    name: "Workspace lint",
    command: "npm",
    args: ["run", "lint"],
  },
  {
    name: "AI법친 navigator syntax check",
    command: "py",
    args: ["-3", "-m", "py_compile", "tools/aibeopchin_navigator.py"],
    requiredFiles: ["tools/aibeopchin_navigator.py"],
    allowSkip: true,
  },
  {
    name: "Release Candidate manual QA closure",
    command: "npm",
    args: ["run", "verify:release-candidate:manual-qa"],
    requiredFiles: [
      "scripts/verify-release-candidate-manual-qa.ts",
      "docs/project-governance/release-candidate-manual-qa-results.json",
    ],
  },
];

const results = steps.map(runStep);
const failedResults = results.filter((result) => result.status === "FAIL");
const skippedResults = results.filter((result) => result.status === "SKIP");

console.log("\n\n================ Release Candidate Preflight Summary ================\n");

for (const result of results) {
  console.log(`[${result.status}] ${result.name}`);
  console.log(`  command: ${result.command}`);
  console.log(`  message: ${result.message}`);
  console.log("");
}

console.log("====================================================================\n");

if (skippedResults.length > 0) {
  console.log("주의: SKIP 항목이 있습니다. 필수 차단은 아니지만 릴리스 노트에 기록하십시오.\n");
}

if (failedResults.length > 0) {
  console.error("릴리스 후보 사전검증 실패 항목이 있습니다. Phase 4 진입을 보류합니다.");
  process.exit(1);
}

console.log("릴리스 후보 사전검증 전체 통과. Phase 4 진입 가능 후보 상태입니다.");