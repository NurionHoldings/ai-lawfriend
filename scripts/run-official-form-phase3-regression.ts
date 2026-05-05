import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

type RegressionStep = {
  name: string;
  command: string;
  args: string[];
  requiredFiles?: string[];
};

type StepResult = {
  name: string;
  command: string;
  status: "PASS" | "FAIL" | "SKIP";
  message: string;
};

const projectRoot = process.cwd();

function fileExists(relativePath: string): boolean {
  return existsSync(join(projectRoot, relativePath));
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ");
}

function runStep(step: RegressionStep): StepResult {
  const missingFiles = step.requiredFiles?.filter((file) => !fileExists(file)) ?? [];

  if (missingFiles.length > 0) {
    return {
      name: step.name,
      command: formatCommand(step.command, step.args),
      status: "SKIP",
      message: `필수 파일 없음: ${missingFiles.join(", ")}`,
    };
  }

  try {
    execFileSync(step.command, step.args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
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

const steps: RegressionStep[] = [
  {
    name: "Phase 3-1 필수항목 validator 테스트",
    command: "npx",
    args: [
      "vitest",
      "run",
      "src/features/document-generation/official-form-required-field-validator.test.ts",
    ],
    requiredFiles: [
      "src/features/document-generation/official-form-required-field-validator.test.ts",
    ],
  },
  {
    name: "Phase 3-2 NO_UNVERIFIED_FACTS prompt guardrail 테스트",
    command: "npx",
    args: [
      "vitest",
      "run",
      "src/features/document-generation/build-document-generation-prompt.test.ts",
    ],
    requiredFiles: [
      "src/features/document-generation/build-document-generation-prompt.test.ts",
    ],
  },
  {
    name: "Phase 3-4 guardrail violation suggestion 테스트",
    command: "npx",
    args: [
      "vitest",
      "run",
      "src/features/document-generation/document-generation-guardrail-suggestions.test.ts",
    ],
    requiredFiles: [
      "src/features/document-generation/document-generation-guardrail-suggestions.test.ts",
    ],
  },
  {
    name: "Phase 3-5 guardrail trace 테스트",
    command: "npx",
    args: [
      "vitest",
      "run",
      "src/features/document-generation/document-generation-guardrail-trace.test.ts",
    ],
    requiredFiles: [
      "src/features/document-generation/document-generation-guardrail-trace.test.ts",
    ],
  },
  {
    name: "Phase 3-8 print summary 테스트",
    command: "npx",
    args: [
      "vitest",
      "run",
      "src/features/document-generation/document-guardrail-print-summary.test.ts",
    ],
    requiredFiles: [
      "src/features/document-generation/document-guardrail-print-summary.test.ts",
    ],
  },
  {
    name: "Phase 3 document-generation targeted eslint",
    command: "npx",
    args: [
      "eslint",
      "src/features/document-generation/official-form-required-fields.ts",
      "src/features/document-generation/official-form-required-field-validator.ts",
      "src/features/document-generation/official-form-required-field-validator.test.ts",
      "src/features/document-generation/document-generation-policy.ts",
      "src/features/document-generation/build-document-generation-prompt.ts",
      "src/features/document-generation/build-document-generation-prompt.test.ts",
      "src/features/document-generation/document-generation-guardrail-suggestions.ts",
      "src/features/document-generation/document-generation-guardrail-suggestions.test.ts",
      "src/features/document-generation/document-generation-guardrail-trace.ts",
      "src/features/document-generation/document-generation-guardrail-trace.test.ts",
      "src/features/document-generation/document-guardrail-print-summary.ts",
      "src/features/document-generation/document-guardrail-print-summary.test.ts",
    ],
    requiredFiles: [
      "src/features/document-generation/official-form-required-fields.ts",
      "src/features/document-generation/official-form-required-field-validator.ts",
      "src/features/document-generation/official-form-required-field-validator.test.ts",
      "src/features/document-generation/document-generation-policy.ts",
      "src/features/document-generation/build-document-generation-prompt.ts",
      "src/features/document-generation/build-document-generation-prompt.test.ts",
      "src/features/document-generation/document-generation-guardrail-suggestions.ts",
      "src/features/document-generation/document-generation-guardrail-suggestions.test.ts",
      "src/features/document-generation/document-generation-guardrail-trace.ts",
      "src/features/document-generation/document-generation-guardrail-trace.test.ts",
      "src/features/document-generation/document-guardrail-print-summary.ts",
      "src/features/document-generation/document-guardrail-print-summary.test.ts",
    ],
  },
  {
    name: "TypeScript 전체 타입 검사",
    command: "npx",
    args: ["tsc", "--noEmit"],
  },
  {
    name: "전체 lint",
    command: "npm",
    args: ["run", "lint"],
  },
];

const results = steps.map(runStep);
const failedResults = results.filter((result) => result.status === "FAIL");
const skippedResults = results.filter((result) => result.status === "SKIP");

console.log("\n\n================ Phase 3 Regression Summary ================\n");

for (const result of results) {
  console.log(`[${result.status}] ${result.name}`);
  console.log(`  command: ${result.command}`);
  console.log(`  message: ${result.message}`);
  console.log("");
}

console.log("============================================================\n");

if (skippedResults.length > 0) {
  console.log("주의: SKIP 항목이 있습니다. 파일명 또는 실제 경로를 확인하세요.\n");
}

if (failedResults.length > 0) {
  console.error("Phase 3 회귀 검증 실패 항목이 있습니다.");
  process.exit(1);
}

console.log("Phase 3 회귀 검증 전체 통과");
