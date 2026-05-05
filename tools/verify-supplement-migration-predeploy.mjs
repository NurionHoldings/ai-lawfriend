import { readFileSync } from "node:fs";
import { join } from "node:path";

const migrationPath = join(
  process.cwd(),
  "prisma/migrations/20260503193000_add_supplement_request_phase1/migration.sql",
);
const runbookPath = join(process.cwd(), "docs/supplement-request-migration-runbook.md");

function assertIncludes(content, token, label, errors) {
  if (!content.includes(token)) {
    errors.push(`${label}: '${token}' 누락`);
  }
}

function main() {
  const errors = [];

  let migrationSql = "";
  let runbook = "";

  try {
    migrationSql = readFileSync(migrationPath, "utf8");
  } catch {
    errors.push(`migration 파일을 읽을 수 없습니다: ${migrationPath}`);
  }

  try {
    runbook = readFileSync(runbookPath, "utf8");
  } catch {
    errors.push(`runbook 파일을 읽을 수 없습니다: ${runbookPath}`);
  }

  if (migrationSql) {
    assertIncludes(
      migrationSql,
      'CREATE TYPE "SupplementRequestStatus"',
      "migration 검증",
      errors,
    );
    assertIncludes(
      migrationSql,
      'CREATE TABLE "SupplementRequest"',
      "migration 검증",
      errors,
    );
    assertIncludes(
      migrationSql,
      'CREATE TABLE "SupplementRequestAuditLog"',
      "migration 검증",
      errors,
    );

    const forbiddenTokens = ["LegalFormSource", "DocumentGenerationTrace", "AuthAccount"];
    for (const token of forbiddenTokens) {
      if (migrationSql.includes(token)) {
        errors.push(`supplement 외 범위로 보이는 토큰 발견: ${token}`);
      }
    }
  }

  if (runbook) {
    const requiredCommands = [
      "npm run verify:supplement-migration-predeploy",
      "npm run db:deploy",
      "npm run db:generate",
      "npm run verify:predeploy-lock",
    ];

    for (const command of requiredCommands) {
      assertIncludes(runbook, command, "runbook 검증", errors);
    }
  }

  if (errors.length > 0) {
    console.error("[verify:supplement-migration-predeploy] FAIL");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("[verify:supplement-migration-predeploy] PASS");
}

main();
