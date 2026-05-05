import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

type CheckStatus = "PASS" | "FAIL" | "WARN";

type CheckResult = {
  name: string;
  status: CheckStatus;
  message: string;
  detail?: unknown;
};

function pass(name: string, message: string, detail?: unknown): CheckResult {
  return { name, status: "PASS", message, detail };
}

function fail(name: string, message: string, detail?: unknown): CheckResult {
  return { name, status: "FAIL", message, detail };
}

function warn(name: string, message: string, detail?: unknown): CheckResult {
  return { name, status: "WARN", message, detail };
}

function escapeMarkdownCell(value: string): string {
  return value.replaceAll("|", String.raw`\|`);
}

function hasDatabaseUrl(): CheckResult {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim().length === 0) {
    return fail("DATABASE_URL", "DATABASE_URL이 설정되어 있지 않습니다.");
  }

  if (
    databaseUrl.includes("user:password@localhost") ||
    databaseUrl.includes("example") ||
    databaseUrl.includes("dummy")
  ) {
    return warn(
      "DATABASE_URL",
      "DATABASE_URL이 더미 값일 가능성이 있습니다. 실 개발 DB인지 확인하세요.",
    );
  }

  return pass("DATABASE_URL", "DATABASE_URL이 설정되어 있습니다.");
}

async function checkDatabaseConnectivity(): Promise<CheckResult> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return pass("DB_CONNECTIVITY", "실제 DB 연결에 성공했습니다.");
  } catch (error) {
    return fail(
      "DB_CONNECTIVITY",
      "실제 DB 연결에 실패했습니다. DATABASE_URL 권한/접속 대상을 확인하세요.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function checkInternalStandardSource(): Promise<CheckResult> {
  const source = await prisma.legalFormSource.findUnique({
    where: { id: "internal-standard-source" },
    select: {
      id: true,
      provider: true,
      sourceName: true,
      sourceUrl: true,
      documentType: true,
      status: true,
    },
  });

  if (!source) {
    return fail(
      "internal-standard-source",
      "internal-standard-source seed가 없습니다. npx prisma db seed를 실행해야 합니다.",
    );
  }

  if (source.provider !== "INTERNAL_STANDARD") {
    return fail(
      "internal-standard-source.provider",
      "provider가 INTERNAL_STANDARD가 아닙니다.",
      source,
    );
  }

  if (source.status !== "ACTIVE") {
    return fail(
      "internal-standard-source.status",
      "status가 ACTIVE가 아닙니다.",
      source,
    );
  }

  return pass("internal-standard-source", "내부표준 source seed가 정상입니다.", source);
}

async function checkDocumentGenerationTraceTable(): Promise<CheckResult> {
  try {
    const count = await prisma.documentGenerationTrace.count();
    return pass("DocumentGenerationTrace", "DocumentGenerationTrace 테이블 접근에 성공했습니다.", {
      count,
    });
  } catch (error) {
    return fail(
      "DocumentGenerationTrace",
      "DocumentGenerationTrace 테이블 접근에 실패했습니다. migration이 적용되었는지 확인하세요.",
      error instanceof Error ? error.message : error,
    );
  }
}

async function checkTemplateSourceSnapshots(): Promise<CheckResult> {
  const templates = await prisma.documentTemplate.findMany({
    where: { catalogStatus: "PUBLISHED" },
    select: {
      id: true,
      code: true,
      version: true,
      title: true,
      sourceId: true,
      sourceProvider: true,
      sourceUrl: true,
      sourceHash: true,
      source: {
        select: {
          id: true,
          status: true,
          provider: true,
          sourceName: true,
          sourceUrl: true,
          fileHash: true,
        },
      },
    },
    take: 50,
    orderBy: { updatedAt: "desc" },
  });

  if (templates.length === 0) {
    return warn(
      "DocumentTemplate.source",
      "게시된 DocumentTemplate이 없습니다. E2E 생성 검증 전 게시 템플릿을 준비하세요.",
    );
  }

  const invalidOfficialTemplates = templates.filter((template) => {
    if (template.sourceProvider === "INTERNAL_STANDARD") {
      return false;
    }

    if (!template.sourceId) {
      return true;
    }

    if (!template.source) {
      return true;
    }

    if (!template.sourceUrl && !template.source.sourceUrl) {
      return true;
    }

    return false;
  });

  if (invalidOfficialTemplates.length > 0) {
    return fail(
      "DocumentTemplate.source",
      "공식기관 provider인데 source 연결 또는 sourceUrl 스냅샷이 부족한 게시 템플릿이 있습니다.",
      invalidOfficialTemplates,
    );
  }

  return pass("DocumentTemplate.source", "게시 템플릿의 source 연결 기본 조건이 정상입니다.", {
    checked: templates.length,
  });
}

async function checkInactiveOrArchivedSourcesLinkedToPublishedTemplates(): Promise<CheckResult> {
  const rows = await prisma.documentTemplate.findMany({
    where: {
      catalogStatus: "PUBLISHED",
      NOT: { sourceProvider: "INTERNAL_STANDARD" },
      source: {
        is: {
          status: { in: ["INACTIVE", "ARCHIVED"] },
        },
      },
    },
    select: {
      id: true,
      code: true,
      version: true,
      sourceProvider: true,
      sourceId: true,
      source: {
        select: {
          status: true,
          sourceName: true,
        },
      },
    },
  });

  if (rows.length === 0) {
    return pass(
      "published-template.active-source",
      "INACTIVE/ARCHIVED source에 연결된 게시 템플릿이 없습니다.",
    );
  }

  return warn(
    "published-template.active-source",
    "INACTIVE/ARCHIVED source에 연결된 게시 템플릿이 있습니다. 런타임 생성 차단 E2E 대상으로 사용하거나, 운영 전 정리하세요.",
    rows,
  );
}

async function checkTraceSnapshotFields(): Promise<CheckResult> {
  const traces = await prisma.documentGenerationTrace.findMany({
    select: {
      id: true,
      legalDocumentId: true,
      templateCode: true,
      templateVersion: true,
      templateTitle: true,
      sourceProvider: true,
      sourceName: true,
      sourceUrl: true,
      generatedSnapshotAt: true,
      approvedSnapshotAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (traces.length === 0) {
    return warn(
      "DocumentGenerationTrace.snapshot",
      "아직 생성된 trace가 없습니다. generate → approve → verify E2E 실행 후 다시 확인하세요.",
    );
  }

  const broken = traces.filter((trace) => {
    if (!trace.legalDocumentId) return true;
    if (!trace.templateCode) return true;
    if (!trace.templateVersion) return true;
    if (!trace.templateTitle) return true;
    if (!trace.sourceProvider) return true;
    if (!trace.generatedSnapshotAt) return true;
    return false;
  });

  if (broken.length > 0) {
    return fail(
      "DocumentGenerationTrace.snapshot",
      "필수 스냅샷 필드가 비어 있는 trace가 있습니다.",
      broken,
    );
  }

  return pass("DocumentGenerationTrace.snapshot", "최근 trace 스냅샷 필수 필드가 정상입니다.", {
    checked: traces.length,
  });
}

async function checkApprovedTraceSnapshots(): Promise<CheckResult> {
  const approvedTraceCount = await prisma.documentGenerationTrace.count({
    where: {
      approvedSnapshotAt: { not: null },
    },
  });

  if (approvedTraceCount === 0) {
    return warn(
      "DocumentGenerationTrace.approvedSnapshotAt",
      "approvedSnapshotAt이 기록된 trace가 없습니다. approve E2E 실행 후 다시 확인하세요.",
    );
  }

  return pass(
    "DocumentGenerationTrace.approvedSnapshotAt",
    "승인 스냅샷이 기록된 trace가 있습니다.",
    {
      approvedTraceCount,
    },
  );
}

function renderMarkdown(results: CheckResult[]): string {
  const now = new Date();
  const hasFail = results.some((result) => result.status === "FAIL");
  const hasWarn = results.some((result) => result.status === "WARN");
  let overall: CheckStatus = "PASS";
  if (hasFail) {
    overall = "FAIL";
  } else if (hasWarn) {
    overall = "WARN";
  }
  const evidenceDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replaceAll("-", "");
  const executionTimeKst = `${new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now)} KST`;

  const rows = results
    .map(
      (result) => `| ${result.name} | ${result.status} | ${escapeMarkdownCell(result.message)} |`,
    )
    .join("\n");

  return `## [EVIDENCE-${evidenceDate}-PHASE2-RUNTIME-LINKAGE-DB-CHECK]

### 목적
- Phase 2 runtime linkage의 실 DB 구조와 source trace 기본 조건을 자동 점검.
- 운영 완료 판정 전 DB 기준 PASS/FAIL/WARN 근거 확보.

### 실행 시각
- ${executionTimeKst}

### 자동 점검 결과

| 항목 | 결과 | 메시지 |
|---|---:|---|
${rows}

### 종합 판정
- ${overall}

### 해석
- PASS: 해당 항목은 현재 DB 기준 정상.
- WARN: 구조는 접근 가능하나 E2E 데이터가 없거나 운영 전 확인이 필요.
- FAIL: Phase 2 운영 완료 판정 전 반드시 수정 필요.

### 다음 수동 E2E 체크리스트
- [ ] INTERNAL_STANDARD 템플릿 문서 생성 성공
- [ ] ACTIVE 공식서식 source 템플릿 문서 생성 성공
- [ ] INACTIVE source 문서 생성 차단 확인
- [ ] ARCHIVED source 문서 생성 차단 확인
- [ ] trace 없는 문서 승인 차단 확인
- [ ] 정상 trace 문서 승인 시 approvedSnapshotAt 기록 확인
- [ ] 검증코드 조회 시 public-safe sourceTrace 반환 확인
`;
}

function printResults(results: CheckResult[]) {
  console.log("\n=== Phase 2 Official Form Runtime Linkage DB Check ===\n");

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
  const databaseUrlResult = hasDatabaseUrl();
  results.push(databaseUrlResult);

  if (databaseUrlResult.status === "FAIL") {
    printResults(results);
    process.exitCode = 1;
    return;
  }

  const connectivityResult = await checkDatabaseConnectivity();
  results.push(connectivityResult);

  if (connectivityResult.status === "FAIL") {
    printResults(results);
    process.exitCode = 1;
    return;
  }

  results.push(
    ...(await Promise.all([
      checkInternalStandardSource(),
      checkDocumentGenerationTraceTable(),
      checkTemplateSourceSnapshots(),
      checkInactiveOrArchivedSourcesLinkedToPublishedTemplates(),
      checkTraceSnapshotFields(),
      checkApprovedTraceSnapshots(),
    ])),
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