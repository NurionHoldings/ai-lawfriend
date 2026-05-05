import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

type CheckStatus = "PASS" | "FAIL" | "WARN";

type CheckResult = {
  name: string;
  status: CheckStatus;
  message: string;
  detail?: unknown;
};

const prisma = new PrismaClient();

function pass(name: string, message: string, detail?: unknown): CheckResult {
  return { name, status: "PASS", message, detail };
}

function fail(name: string, message: string, detail?: unknown): CheckResult {
  return { name, status: "FAIL", message, detail };
}

function warn(name: string, message: string, detail?: unknown): CheckResult {
  return { name, status: "WARN", message, detail };
}

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

function maskDatabaseUrl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    if (url.password) {
      url.password = "****";
    }
    if (url.username) {
      url.username = `${url.username.slice(0, 2)}****`;
    }
    return url.toString();
  } catch {
    return "<unparseable DATABASE_URL>";
  }
}

function parseDatabaseUrl(): { result: CheckResult; url?: URL } {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim().length === 0) {
    return {
      result: fail("DATABASE_URL", "DATABASE_URL이 설정되어 있지 않습니다."),
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    return {
      result: fail(
        "DATABASE_URL",
        "DATABASE_URL 형식이 올바르지 않습니다.",
        maskDatabaseUrl(databaseUrl),
      ),
    };
  }

  const suspiciousTokens = [
    "user:password",
    "example",
    "dummy",
    "localhost:5432/aibeopchin",
    "your_database",
    "DB_NAME",
  ];

  const isSuspicious = suspiciousTokens.some((token) => databaseUrl.includes(token));

  if (isSuspicious) {
    return {
      result: fail(
        "DATABASE_URL",
        "DATABASE_URL이 더미 값일 가능성이 높아 중단합니다.",
        maskDatabaseUrl(databaseUrl),
      ),
      url: parsedUrl,
    };
  }

  return {
    result: pass(
      "DATABASE_URL",
      "DATABASE_URL 형식이 확인되었습니다.",
      maskDatabaseUrl(databaseUrl),
    ),
    url: parsedUrl,
  };
}

function checkProductionSafety(url?: URL): CheckResult {
  if (!url) {
    return fail("DB_SAFETY", "DATABASE_URL 파싱 실패로 DB 안전성 확인이 불가능합니다.");
  }

  const host = url.hostname.toLowerCase();
  const databaseName = url.pathname.replace(/^\//, "").toLowerCase();
  const envName = process.env.NODE_ENV;
  const allowProductionMigrate = process.env.ALLOW_PHASE2_PRODUCTION_MIGRATE === "1";

  const productionLike = [host, databaseName].some((value) =>
    ["prod", "production", "live", "real"].some((token) => value.includes(token)),
  );

  if (envName === "production" && !allowProductionMigrate) {
    return fail(
      "DB_SAFETY",
      "NODE_ENV=production 상태에서는 Phase 2 migrate dev 실행을 차단합니다. 개발 DB에서 실행하세요.",
      { host, databaseName, envName },
    );
  }

  if (productionLike && !allowProductionMigrate) {
    return fail(
      "DB_SAFETY",
      "DATABASE_URL이 운영 DB처럼 보입니다. migrate dev는 개발 DB에서만 실행하세요.",
      { host, databaseName },
    );
  }

  return pass("DB_SAFETY", "DATABASE_URL이 운영 DB로 보이지 않습니다.", {
    host,
    databaseName,
    envName: envName ?? null,
  });
}

async function checkDbConnectivity(): Promise<CheckResult> {
  try {
    const rows = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
    return pass("DB_CONNECTIVITY", "DB 연결에 성공했습니다.", rows[0] ?? null);
  } catch (error) {
    return fail(
      "DB_CONNECTIVITY",
      "DB 연결에 실패했습니다. DATABASE_URL, 계정, 비밀번호, 네트워크, DB 권한을 확인하세요.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function checkCurrentDatabaseAndUser(): Promise<CheckResult> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{ database_name: string; current_user: string; current_schema: string }>
    >`SELECT current_database() AS database_name, current_user AS current_user, current_schema() AS current_schema`;

    return pass("DB_IDENTITY", "현재 연결된 DB와 user를 확인했습니다.", rows[0] ?? null);
  } catch (error) {
    return fail(
      "DB_IDENTITY",
      "현재 DB/user 확인에 실패했습니다.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function checkPostgresPrivileges(): Promise<CheckResult[]> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        can_connect: boolean;
        has_schema_usage: boolean;
        has_schema_create: boolean;
        can_create_temp: boolean;
      }>
    >`
      SELECT
        has_database_privilege(current_user, current_database(), 'CONNECT') AS can_connect,
        has_schema_privilege(current_user, current_schema(), 'USAGE') AS has_schema_usage,
        has_schema_privilege(current_user, current_schema(), 'CREATE') AS has_schema_create,
        has_database_privilege(current_user, current_database(), 'TEMP') AS can_create_temp
    `;

    const row = rows[0];
    if (!row) {
      return [fail("DB_PRIVILEGES", "권한 점검 결과가 비어 있습니다.")];
    }

    return [
      row.can_connect
        ? pass("DB_PRIVILEGE_CONNECT", "현재 user가 DB CONNECT 권한을 갖고 있습니다.")
        : fail("DB_PRIVILEGE_CONNECT", "현재 user에게 DB CONNECT 권한이 없습니다."),
      row.has_schema_usage
        ? pass("DB_PRIVILEGE_SCHEMA_USAGE", "현재 user가 schema USAGE 권한을 갖고 있습니다.")
        : fail("DB_PRIVILEGE_SCHEMA_USAGE", "현재 user에게 schema USAGE 권한이 없습니다."),
      row.has_schema_create
        ? pass("DB_PRIVILEGE_SCHEMA_CREATE", "현재 user가 schema CREATE 권한을 갖고 있습니다.")
        : fail(
            "DB_PRIVILEGE_SCHEMA_CREATE",
            "현재 user에게 schema CREATE 권한이 없습니다. Prisma migrate dev에 필요합니다.",
          ),
      row.can_create_temp
        ? pass("DB_PRIVILEGE_TEMP", "현재 user가 TEMP 권한을 갖고 있습니다.")
        : warn(
            "DB_PRIVILEGE_TEMP",
            "현재 user에게 TEMP 권한이 없습니다. 일부 검증에서 제약이 있을 수 있습니다.",
          ),
    ];
  } catch (error) {
    return [
      fail(
        "DB_PRIVILEGES",
        "PostgreSQL 권한 점검 쿼리에 실패했습니다.",
        error instanceof Error ? error.message : error,
      ),
    ];
  }
}

async function checkMigrationTableAccess(): Promise<CheckResult> {
  try {
    const rows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = current_schema()
        AND table_name = '_prisma_migrations'
      LIMIT 1
    `;

    if (rows.length === 0) {
      return warn(
        "PRISMA_MIGRATION_TABLE_LOOKUP",
        "_prisma_migrations 테이블이 아직 없거나 조회 결과가 비어 있습니다. 첫 migration 전일 수 있습니다.",
      );
    }

    return pass(
      "PRISMA_MIGRATION_TABLE_LOOKUP",
      "_prisma_migrations 테이블 조회 가능 여부 확인 쿼리에 성공했습니다.",
      rows[0],
    );
  } catch (error) {
    return fail(
      "PRISMA_MIGRATION_TABLE_LOOKUP",
      "_prisma_migrations 테이블 조회 가능 여부 확인에 실패했습니다.",
      error instanceof Error ? error.message : error,
    );
  }
}

function renderGrantSql(): string {
  return `-- PostgreSQL 권한 보강 예시입니다. your_database / your_user를 실제 값으로 바꿔 DB 관리자 계정에서 실행하세요.
GRANT CONNECT ON DATABASE your_database TO your_user;
GRANT TEMP ON DATABASE your_database TO your_user;
GRANT USAGE, CREATE ON SCHEMA public TO your_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO your_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO your_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO your_user;`;
}

function renderMarkdown(results: CheckResult[]): string {
  const { dateId, timestamp } = getKstDateInfo(new Date());
  const hasFail = results.some((result) => result.status === "FAIL");
  const hasWarn = results.some((result) => result.status === "WARN");
  let overall: CheckStatus = "PASS";

  if (hasFail) {
    overall = "FAIL";
  } else if (hasWarn) {
    overall = "WARN";
  }

  const rows = results
    .map(
      (result) => `| ${result.name} | ${result.status} | ${escapeMarkdownCell(result.message)} |`,
    )
    .join("\n");

  return `## [EVIDENCE-${dateId}-PHASE2-DB-PREFLIGHT]

### 목적
- Phase 2 full verify 실행 전 실 DB 연결, 안전성, PostgreSQL 권한 상태를 사전 점검.
- Prisma migrate P1010과 같은 권한 문제를 실행 전에 분리 진단.

### 실행 시각
- ${timestamp}

### 사전 점검 결과

| 항목 | 결과 | 메시지 |
|---|---:|---|
${rows}

### 종합 판정
- ${overall}

### 판정 기준
- PASS: Phase 2 full verify 진행 가능.
- WARN: 진행은 가능할 수 있으나 실 DB/권한/데이터 상태 확인 필요.
- FAIL: Phase 2 full verify 실행 전 수정 필요.

### 권한 보강 SQL 예시

\`\`\`sql
${renderGrantSql()}
\`\`\`

### 다음 단계
- PASS/WARN 허용 범위 확인 후 npm run verify:official-form-phase2:full 실행.
- FAIL이 있으면 DATABASE_URL 또는 DB 권한을 수정한 뒤 재실행.
`;
}

function printResults(results: CheckResult[]) {
  console.log("\n=== Phase 2 DB Preflight Check ===\n");

  for (const result of results) {
    console.log(`[${result.status}] ${result.name}: ${result.message}`);
    if (result.detail && process.env.VERBOSE_PHASE2_CHECK === "1") {
      console.dir(result.detail, { depth: null });
    }
  }

  console.log("\n=== IMPLEMENTATION_EVIDENCE.md append block ===\n");
  console.log(renderMarkdown(results));
}

async function main() {
  const results: CheckResult[] = [];
  const parsed = parseDatabaseUrl();
  results.push(parsed.result);

  if (parsed.result.status === "FAIL") {
    printResults(results);
    process.exitCode = 1;
    return;
  }

  const safetyResult = checkProductionSafety(parsed.url);
  results.push(safetyResult);

  if (safetyResult.status === "FAIL") {
    printResults(results);
    process.exitCode = 1;
    return;
  }

  const connectivity = await checkDbConnectivity();
  results.push(connectivity);

  if (connectivity.status === "FAIL") {
    printResults(results);
    process.exitCode = 1;
    return;
  }

  results.push(
    await checkCurrentDatabaseAndUser(),
    ...(await checkPostgresPrivileges()),
    await checkMigrationTableAccess(),
  );

  printResults(results);

  const hasFail = results.some((result) => result.status === "FAIL");
  process.exitCode = hasFail ? 1 : 0;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });