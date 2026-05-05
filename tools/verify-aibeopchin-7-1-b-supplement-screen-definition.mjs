import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const definitionFile = path.join(
  root,
  "docs",
  "project-governance",
  "AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_SCREEN_DEFINITION.md"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(fs.existsSync(definitionFile), "7.1-B 보완 요청 화면 정의서 파일이 없습니다.");

  const definition = fs.readFileSync(definitionFile, "utf8");

  const requiredTexts = [
    "AI법친 7.1-B — 보완 요청 화면 정의서",
    "변호사 사건 보완 요청 탭",
    "보완 요청 작성 화면",
    "보완 요청 상세 / 재검토 화면",
    "의뢰인 보완 요청 목록",
    "의뢰인 보완 요청 상세 / 응답 입력",
    "의뢰인 보완 제출 완료 화면",
    "관리자 보완 요청 현황",
    "관리자 보완 요청 상세 / 로그",
    "상태별 UI 기준",
    "권한별 UI 노출 기준",
    "보안 / 개인정보 UI 기준",
    "AI 표시 기준",
    "화면 QA 기준",
    "USER에게 생성 버튼 미노출",
    "LAWYER에게 생성 버튼 노출",
    "화면 실제 구현",
    "AI법친 7.1-B — 보완 요청 화면 QA 체크리스트 작성",
  ];

  for (const text of requiredTexts) {
    assert(definition.includes(text), `화면 정의서 필수 문구 누락: ${text}`);
  }

  console.log("✅ AI법친 7.1-B supplement screen definition verification PASS");
}

try {
  main();
} catch (error) {
  console.error("❌ AI법친 7.1-B supplement screen definition verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
