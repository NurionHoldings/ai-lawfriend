import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const definitionFile = path.join(
  root,
  "docs",
  "project-governance",
  "AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_API_SPEC_DEFINITION.md"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(fs.existsSync(definitionFile), "7.1-B 보완 요청 API 명세 정의서 파일이 없습니다.");

  const definition = fs.readFileSync(definitionFile, "utf8");

  const requiredTexts = [
    "AI법친 7.1-B — 보완 요청 API 명세 정의서",
    "Endpoint 후보 목록",
    "/api/cases/{caseId}/supplement-requests",
    "/api/cases/{caseId}/supplement-requests/{requestId}/send",
    "/api/cases/{caseId}/supplement-requests/{requestId}/responses",
    "상태 전이 API 명세",
    "오류 코드 표준안",
    "민감정보 및 마스킹 기준",
    "SupplementRequest",
    "SupplementRequestItem",
    "SupplementResponse",
    "SupplementResponseAttachment",
    "SupplementRequestStatusLog",
    "SupplementRequestAuditLog",
    "기존 CaseStatus 변경 없음",
    "기존 CasePackageShareStatus 변경 없음",
    "기존 CasePackageAccessAction 변경 없음",
    "Prisma schema 변경 없음",
    "DB migration 없음",
    "AI법친 7.1-B — 보완 요청 구현 정의서",
  ];

  for (const text of requiredTexts) {
    assert(definition.includes(text), `정의서에 필수 문구가 없습니다: ${text}`);
  }

  console.log("✅ AI법친 7.1-B supplement api spec definition verification PASS");
}

try {
  main();
} catch (error) {
  console.error("❌ AI법친 7.1-B supplement api spec definition verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
