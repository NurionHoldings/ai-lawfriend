import { loadEnvConfig } from "@next/env";
import { spawn } from "node:child_process";
import path from "node:path";

loadEnvConfig(process.cwd());

type StepResult = {
  name: string;
  command: string;
  status: "PASS" | "FAIL";
  exitCode: number | null;
};

function getKstDateInfo(now: Date) {
  const dateId = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replaceAll("-", "");
  const timestamp = `${new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now)} KST`;

  return { dateId, timestamp };
}

function escapeMarkdownCell(value: string): string {
  return value.replaceAll("|", String.raw`\|`);
}

function wrapInlineCode(value: string): string {
  return `\`${value}\``;
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ");
}

function resolveCommand(command: string): string {
  if (process.platform !== "win32") {
    return command;
  }

  if (command === "npm") {
    return "npm.cmd";
  }

  if (command === "npx") {
    return "npx.cmd";
  }

  return command;
}

function getSpawnSpec(command: string, args: string[]): { command: string; args: string[] } {
  const executable = resolveCommand(command);

  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", formatCommand(executable, args)],
    };
  }

  return { command: executable, args };
}

function runCommand(name: string, command: string, args: string[]): Promise<StepResult> {
  return new Promise((resolve) => {
    console.log(`\n=== ${name} ===`);
    console.log(`$ ${formatCommand(command, args)}`);
    const spawnSpec = getSpawnSpec(command, args);

    const child = spawn(spawnSpec.command, spawnSpec.args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    });

    child.on("close", (code) => {
      resolve({
        name,
        command: formatCommand(command, args),
        status: code === 0 ? "PASS" : "FAIL",
        exitCode: code,
      });
    });
  });
}

function renderEvidence(results: StepResult[]): string {
  const now = new Date();
  const { dateId, timestamp } = getKstDateInfo(now);
  const hasFail = results.some((result) => result.status === "FAIL");

  const rows = results
    .map(
      (result) =>
        `| ${result.name} | ${result.status} | ${escapeMarkdownCell(wrapInlineCode(result.command))} | ${result.exitCode ?? "-"} |`,
    )
    .join("\n");

  const judgment = hasFail
    ? "FAIL: Phase 2 운영 완료 판정 전 실패 항목을 수정해야 함."
    : "PASS: 명령 기준 Phase 2 확정 검증 통과. 단, generate → approve → verify E2E 수동 체크 결과도 함께 기록해야 함.";

  return `## [EVIDENCE-${dateId}-PHASE2-FULL-VERIFY]

### 목적
- Phase 2 runtime linkage의 실 DB 기준 확정 검증 명령을 일괄 실행.
- preflight, migration, seed, 정적 검증, 공식서식 Phase 2 DB 점검 결과를 PASS/FAIL로 기록.

### 실행 시각
- ${timestamp}

### 실행 결과

| 단계 | 결과 | 명령 | 종료코드 |
|---|---:|---|---:|
${rows}

### 판정
- ${judgment}

### 후속 E2E 체크리스트
- [ ] INTERNAL_STANDARD 템플릿 문서 생성 성공
- [ ] ACTIVE 공식서식 source 템플릿 문서 생성 성공
- [ ] INACTIVE source 문서 생성 차단 확인
- [ ] ARCHIVED source 문서 생성 차단 확인
- [ ] trace 없는 문서 승인 차단 확인
- [ ] 정상 trace 문서 승인 시 approvedSnapshotAt 기록 확인
- [ ] 검증코드 조회 시 public-safe sourceTrace 반환 확인
`;
}

function renderManualE2ETemplate(): string {
  const { dateId } = getKstDateInfo(new Date());

  return `## [EVIDENCE-${dateId}-PHASE2-GENERATE-APPROVE-VERIFY-E2E]

### 목적
- Phase 2 runtime linkage의 실제 generate → approve → verify 흐름 검증.

### E2E 결과

| 항목 | 결과 | 근거 |
|---|---:|---|
| INTERNAL_STANDARD 템플릿 문서 생성 | PASS/FAIL |  |
| ACTIVE 공식서식 source 템플릿 문서 생성 | PASS/FAIL |  |
| INACTIVE source 문서 생성 차단 | PASS/FAIL |  |
| ARCHIVED source 문서 생성 차단 | PASS/FAIL |  |
| trace 없는 문서 승인 차단 | PASS/FAIL |  |
| 정상 trace 문서 승인 시 approvedSnapshotAt 기록 | PASS/FAIL |  |
| 검증코드 조회 시 public-safe sourceTrace 반환 | PASS/FAIL |  |

### 판정
- Phase 2 운영 완료: 완료/보류

### 보류 사유
- 실패 또는 미확인 항목이 있으면 여기에 기록.
`;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(
      "DATABASE_URL이 없습니다. .env.local 또는 실행 환경에 실 개발 DB DATABASE_URL을 설정하세요.",
    );
    process.exitCode = 1;
    return;
  }

  const steps: Array<[string, string, string[]]> = [
    ["DB preflight", "npm", ["run", "verify:phase2-db-preflight"]],
    ["Prisma migrate", "npx", ["prisma", "migrate", "dev", "--name", "add-document-generation-trace"]],
    ["Prisma seed", "npx", ["prisma", "db", "seed"]],
    ["Prisma validate", "npx", ["prisma", "validate"]],
    ["Prisma generate", "npx", ["prisma", "generate"]],
    ["TypeScript", "npx", ["tsc", "--noEmit", "--pretty", "false"]],
    ["Lint", "npm", ["run", "lint"]],
    ["Canonical sources", "npm", ["run", "verify:canonical-sources"]],
    [
      "Navigator py_compile",
      process.platform === "win32" ? "py" : "python3",
      process.platform === "win32"
        ? ["-3", "-m", "py_compile", path.join("tools", "aibeopchin_navigator.py")]
        : ["-m", "py_compile", path.join("tools", "aibeopchin_navigator.py")],
    ],
    ["Official form Phase2 DB check", "npm", ["run", "verify:official-form-phase2"]],
  ];

  const results: StepResult[] = [];

  for (const [name, command, args] of steps) {
    const result = await runCommand(name, command, args);
    results.push(result);

    if (result.status === "FAIL") {
      console.error(`\n[STOP] ${name} 실패. 이후 단계는 실행하지 않습니다.`);
      break;
    }
  }

  console.log("\n=== IMPLEMENTATION_EVIDENCE.md append block ===\n");
  console.log(renderEvidence(results));
  console.log("\n=== MANUAL E2E TEMPLATE ===\n");
  console.log(renderManualE2ETemplate());

  const hasFail = results.some((result) => result.status === "FAIL");
  process.exitCode = hasFail ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});