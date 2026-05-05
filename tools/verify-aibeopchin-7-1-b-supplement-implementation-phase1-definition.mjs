import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const definitionFile = path.join(
  root,
  "docs",
  "project-governance",
  "AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_IMPLEMENTATION_PHASE1_DEFINITION.md"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(fs.existsSync(definitionFile), "7.1-B 보완 요청 구현 착수(1단계) 정의서 파일이 없습니다.");

  const definition = fs.readFileSync(definitionFile, "utf8");

  const requiredTexts = [
    "AI법친 7.1-B — 보완 요청 구현 착수(스키마/레포지토리 1단계) 정의서",
    "Prisma schema 초안 트랙",
    "repository skeleton 트랙",
    "SupplementRequest",
    "SupplementRequestItem",
    "SupplementResponse",
    "SupplementResponseAttachment",
    "SupplementRequestStatusLog",
    "SupplementRequestAuditLog",
    "검증 순서",
    "verify:aibeopchin-7-1-b-supplement-implementation-phase1-definition",
    "기존 CaseStatus 변경 없음",
    "기존 CasePackageShareStatus 변경 없음",
    "기존 CasePackageAccessAction 변경 없음",
    "Prisma schema 변경 없음(이번 단계)",
    "DB migration 없음(이번 단계)",
    "API 구현 없음(이번 단계)",
    "화면 구현 없음(이번 단계)",
    "AI법친 7.1-B — Prisma schema 초안 반영(실제 코드)",
  ];

  for (const text of requiredTexts) {
    assert(definition.includes(text), `정의서에 필수 문구가 없습니다: ${text}`);
  }

  console.log("✅ AI법친 7.1-B supplement implementation phase1 definition verification PASS");
}

try {
  main();
} catch (error) {
  console.error("❌ AI법친 7.1-B supplement implementation phase1 definition verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
