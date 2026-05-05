import { execFileSync } from "node:child_process";

type RegressionStep = {
  name: string;
  command: string;
  args: string[];
};

type StepResult = {
  name: string;
  command: string;
  status: "PASS" | "FAIL";
  message: string;
};

function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ");
}

function runStep(step: RegressionStep): StepResult {
  try {
    execFileSync(step.command, step.args, {
      cwd: process.cwd(),
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

const steps: RegressionStep[] = [
  {
    name: "Case package 6.1 DTO / builder regression",
    command: "npm",
    args: ["run", "verify:case-package-6-1"],
  },
  {
    name: "Case package 6.2 code / consent policy regression",
    command: "npm",
    args: ["run", "verify:case-package-6-2"],
  },
  {
    name: "Case package 6.3 Prisma / API regression",
    command: "npm",
    args: ["run", "verify:case-package-6-3"],
  },
  {
    name: "Case package 6.4 client share settings UI regression",
    command: "npm",
    args: ["run", "verify:case-package-6-4"],
  },
  {
    name: "Case package 6.5 lawyer lookup / detail UI regression",
    command: "npm",
    args: ["run", "verify:case-package-6-5"],
  },
  {
    name: "Case package 6.6 attachment permission regression",
    command: "npm",
    args: ["run", "verify:case-package-6-6"],
  },
  {
    name: "Case package 6.7 access logs / revoke regression",
    command: "npm",
    args: ["run", "verify:case-package-6-7"],
  },
  {
    name: "Case package 6.8 package PDF summary regression",
    command: "npm",
    args: ["run", "verify:case-package-6-8"],
  },
  {
    name: "Case package 6.9 privacy / security / consent regression",
    command: "npm",
    args: ["run", "verify:case-package-6-9"],
  },
  {
    name: "Prisma schema validate",
    command: "npx",
    args: ["prisma", "validate"],
  },
  {
    name: "Prisma client generate",
    command: "npx",
    args: ["prisma", "generate"],
  },
  {
    name: "Navigator syntax check",
    command: "py",
    args: ["-3", "-m", "py_compile", "tools/aibeopchin_navigator.py"],
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

const results = steps.map(runStep);
const failedResults = results.filter((result) => result.status === "FAIL");

console.log(
  "\n================ AI법친 6.x Case Package Regression Summary ================\n",
);

for (const result of results) {
  console.log(`[${result.status}] ${result.name}`);
  console.log(`  command: ${result.command}`);
  console.log(`  message: ${result.message}`);
  console.log("");
}

console.log(
  "============================================================================\n",
);

if (failedResults.length > 0) {
  console.error("AI법친 6.x 사건 패키지 회귀 검증 실패 항목이 있습니다.");
  process.exit(1);
}

console.log("AI법친 6.x 사건 패키지 회귀 검증 전체 PASS.");
