import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const definitionFile = path.join(
  root,
  "docs",
  "project-governance",
  "AIBEOPCHIN_7_1_CANDIDATE_FINALIZATION_DEFINITION.md"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(fs.existsSync(definitionFile), "7.1 후보 확정 정의서 파일이 없습니다.");

  const definition = fs.readFileSync(definitionFile, "utf8");

  const requiredTexts = [
    "AI법친 7.1 — 후보 확정 정의서",
    "6.x 신규 기능 추가 금지",
    "7.1-A",
    "7.1-B",
    "7.1-C",
    "7.1-D",
    "7.1-E",
    "보완 요청 워크플로우",
    "변호사 검토 메모 고도화",
    "운영 로그 / 보안 감사 리포트",
    "PDF / 요약본 표현 고도화",
    "알림 / 메일 연동",
    "AI법친 7.1-B — 보완 요청 워크플로우",
    "DB schema 즉시 변경",
    "AI 법률판단 자동화",
    "AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_WORKFLOW_DEFINITION.md",
  ];

  for (const text of requiredTexts) {
    assert(definition.includes(text), `정의서에 필수 문구가 없습니다: ${text}`);
  }

  console.log("✅ AI법친 7.1 candidate definition verification PASS");
}

try {
  main();
} catch (error) {
  console.error("❌ AI법친 7.1 candidate definition verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
