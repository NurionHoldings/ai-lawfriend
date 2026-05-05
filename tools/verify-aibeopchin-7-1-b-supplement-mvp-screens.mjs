import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_SCREEN_QA_CHECKLIST.md",
  "src/components/supplement-requests/supplement-request-status-badge.tsx",
  "src/components/supplement-requests/supplement-request-mvp-client.tsx",
  "src/app/(protected)/cases/[caseId]/supplement/page.tsx",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `필수 파일 누락: ${file}`);
}

const page = read("src/app/(protected)/cases/[caseId]/supplement/page.tsx");
const client = read("src/components/supplement-requests/supplement-request-mvp-client.tsx");
const badge = read("src/components/supplement-requests/supplement-request-status-badge.tsx");
const checklist = read("docs/project-governance/AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_SCREEN_QA_CHECKLIST.md");

const requiredTexts = [
  [page, "SupplementRequestMvpClient", "page가 MVP client를 렌더링하지 않습니다."],
  [client, "새 보완 요청", "보완 요청 작성 버튼이 없습니다."],
  [client, "보완 응답 제출", "의뢰인 응답 제출 버튼이 없습니다."],
  [client, "nextActionsFor", "상태별 액션 함수가 없습니다."],
  [client, "canCreate", "생성 권한 UI guard가 없습니다."],
  [client, "canRespond", "응답 권한 UI guard가 없습니다."],
  [client, "POST", "API POST 호출이 없습니다."],
  [client, "/responses", "응답 route 호출이 없습니다."],
  [client, "/status", "상태전이 route 호출이 없습니다."],
  [badge, "CLIENT_RESPONDED", "상태 배지에 CLIENT_RESPONDED가 없습니다."],
  [checklist, "USER에게 생성 버튼 미노출", "QA 체크리스트에 USER 생성 버튼 미노출 항목이 없습니다."],
  [checklist, "LAWYER/ADMIN/SUPER_ADMIN에게 작성 폼 노출", "QA 체크리스트에 LAWYER 생성 버튼 노출 항목이 없습니다."],
  [checklist, "CLOSED/CANCELLED/EXPIRED", "QA 체크리스트에 terminal 상태 액션 미노출 항목이 없습니다."],
];

for (const [content, text, message] of requiredTexts) {
  assert(content.includes(text), message);
}

console.log("✅ AI법친 7.1-B supplement MVP screens verification PASS");
