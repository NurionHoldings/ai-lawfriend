import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type StepStatus = "PASS" | "FAIL" | "SKIP";

type PreflightStep = {
  name: string;
  command?: string;
  args?: string[];
  requiredFiles?: string[];
  check?: () => StepStatus;
  message?: string;
  allowSkip?: boolean;
};

type StepResult = {
  name: string;
  status: StepStatus;
  command: string;
  message: string;
};

const projectRoot = process.cwd();

function fileExists(relativePath: string): boolean {
  return existsSync(join(projectRoot, relativePath));
}

function readTextFile(relativePath: string): string {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

function formatCommand(command?: string, args: string[] = []): string {
  if (!command) {
    return "-";
  }

  return [command, ...args].join(" ");
}

function runCommandStep(step: PreflightStep): StepResult {
  const missingFiles = step.requiredFiles?.filter((file) => !fileExists(file)) ?? [];

  if (missingFiles.length > 0) {
    return {
      name: step.name,
      status: step.allowSkip ? "SKIP" : "FAIL",
      command: formatCommand(step.command, step.args),
      message: `필수 파일 없음: ${missingFiles.join(", ")}`,
    };
  }

  if (step.check) {
    const status = step.check();

    return {
      name: step.name,
      status,
      command: "-",
      message: step.message ?? "문서 기준 확인",
    };
  }

  if (!step.command) {
    return {
      name: step.name,
      status: "FAIL",
      command: "-",
      message: "실행 명령이 정의되지 않았습니다.",
    };
  }

  try {
    execFileSync(step.command, step.args ?? [], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: true,
    });

    return {
      name: step.name,
      status: "PASS",
      command: formatCommand(step.command, step.args),
      message: "정상 통과",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return {
      name: step.name,
      status: "FAIL",
      command: formatCommand(step.command, step.args),
      message,
    };
  }
}

function checkManualQaApproved(): StepStatus {
  if (!fileExists("docs/project-governance/release-candidate-manual-qa-results.json")) {
    return "FAIL";
  }

  const raw = readTextFile("docs/project-governance/release-candidate-manual-qa-results.json");

  return raw.includes('"phase4EntryDecision": "APPROVED"') &&
    raw.includes('"status": "PASS"')
    ? "PASS"
    : "FAIL";
}

function checkPhase4EntryCriteriaDoc(): StepStatus {
  return fileExists("docs/project-governance/PHASE4_ENTRY_CRITERIA.md")
    ? "PASS"
    : "FAIL";
}

const steps: PreflightStep[] = [
  {
    name: "Release Candidate 통합 검증",
    command: "npm",
    args: ["run", "verify:release-candidate"],
  },
  {
    name: "Release Candidate 수동 QA 검증",
    command: "npm",
    args: ["run", "verify:release-candidate:manual-qa"],
  },
  {
    name: "Manual QA APPROVED 상태 확인",
    check: checkManualQaApproved,
    message: "manual QA 결과 파일의 status=PASS, phase4EntryDecision=APPROVED 확인",
    requiredFiles: [
      "docs/project-governance/release-candidate-manual-qa-results.json",
    ],
  },
  {
    name: "Phase 4 착수 기준 문서 확인",
    check: checkPhase4EntryCriteriaDoc,
    message: "PHASE4_ENTRY_CRITERIA.md 존재 확인",
    requiredFiles: ["docs/project-governance/PHASE4_ENTRY_CRITERIA.md"],
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
];

const results = steps.map(runCommandStep);
const failedResults = results.filter((result) => result.status === "FAIL");
const skippedResults = results.filter((result) => result.status === "SKIP");

console.log("\n\n================ Phase 4 Entry Preflight Summary ================\n");

for (const result of results) {
  console.log(`[${result.status}] ${result.name}`);
  console.log(`  command: ${result.command}`);
  console.log(`  message: ${result.message}`);
  console.log("");
}

console.log("================================================================\n");

if (skippedResults.length > 0) {
  console.log("주의: SKIP 항목이 있습니다. Phase 4 착수 증빙에 기록하십시오.\n");
}

if (failedResults.length > 0) {
  console.error("Phase 4 착수 preflight 실패. Phase 4 착수를 보류합니다.");
  process.exit(1);
}

console.log("Phase 4 착수 preflight 전체 통과. Phase 4 착수 가능 상태입니다.");
