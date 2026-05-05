import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const definitionFile = path.join(
  root,
  "docs",
  "project-governance",
  "AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_WORKFLOW_DEFINITION.md"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(fs.existsSync(definitionFile), "7.1-B 보완 요청 워크플로우 정의서 파일이 없습니다.");

  const definition = fs.readFileSync(definitionFile, "utf8");

  const requiredTexts = [
    "AI법친 7.1-B — 보완 요청 워크플로우 정의서",
    "보완 요청 주체",
    "보완 요청 대상",
    "보완 요청 유형",
    "MISSING_FACT",
    "ADDITIONAL_EVIDENCE",
    "보완 요청 상태값 초안",
    "DRAFT",
    "SENT",
    "CLIENT_RESPONDED",
    "NEEDS_MORE_INFO",
    "의뢰인 재입력 흐름",
    "변호사 재검토 흐름",
    "6.x 사건 패키지와의 연결 방식",
    "권한 원칙",
    "고지문 원칙",
    "AI 개입 원칙",
    "데이터 구조 분리 원칙",
    "API 분리 원칙",
    "화면 분리 원칙",
    "DB schema 변경",
    "API 구현",
    "AI 법률판단 자동화",
    "AI법친 7.1-B — 보완 요청 상태값 정의서",
  ];

  for (const text of requiredTexts) {
    assert(definition.includes(text), `정의서에 필수 문구가 없습니다: ${text}`);
  }

  console.log("✅ AI법친 7.1-B supplement workflow definition verification PASS");
}

try {
  main();
} catch (error) {
  console.error("❌ AI법친 7.1-B supplement workflow definition verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
