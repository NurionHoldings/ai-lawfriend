import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const definitionFile = path.join(
  root,
  "docs",
  "project-governance",
  "AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_DATA_STRUCTURE_DEFINITION.md"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(fs.existsSync(definitionFile), "7.1-B 보완 요청 데이터 구조 정의서 파일이 없습니다.");

  const definition = fs.readFileSync(definitionFile, "utf8");

  const requiredTexts = [
    "AI법친 7.1-B — 보완 요청 데이터 구조 정의서",
    "SupplementRequest 후보 모델",
    "SupplementRequestItem 후보 모델",
    "SupplementResponse 후보 모델",
    "SupplementResponseAttachment 후보 모델",
    "SupplementRequestStatusLog 후보 모델",
    "SupplementRequestAuditLog 후보 모델",
    "기존 도메인 relation 기준",
    "민감정보 마스킹 기준",
    "Prisma schema 변경 전제와 migration 보류 원칙",
    "API 명세 참조용 필드명 고정",
    "기존 CaseStatus 변경 없음",
    "기존 CasePackageShareStatus 변경 없음",
    "기존 CasePackageAccessAction 변경 없음",
    "Prisma schema 변경 없음",
    "DB migration 없음",
    "AI법친 7.1-B — 보완 요청 API 명세 정의서",
  ];

  for (const text of requiredTexts) {
    assert(definition.includes(text), `정의서에 필수 문구가 없습니다: ${text}`);
  }

  console.log("✅ AI법친 7.1-B supplement data structure definition verification PASS");
}

try {
  main();
} catch (error) {
  console.error("❌ AI법친 7.1-B supplement data structure definition verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
