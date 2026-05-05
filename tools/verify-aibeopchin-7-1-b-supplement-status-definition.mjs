import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const definitionFile = path.join(
  root,
  "docs",
  "project-governance",
  "AIBEOPCHIN_7_1_B_SUPPLEMENT_REQUEST_STATUS_DEFINITION.md"
);

const serviceFile = path.join(
  root,
  "src",
  "features",
  "supplement-request",
  "supplement-request.service.ts"
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  assert(fs.existsSync(definitionFile), "7.1-B 보완 요청 상태값 정의서 파일이 없습니다.");
  assert(fs.existsSync(serviceFile), "7.1-B 보완 요청 service 파일이 없습니다.");

  const definition = fs.readFileSync(definitionFile, "utf8");
  const service = fs.readFileSync(serviceFile, "utf8");

  const requiredTexts = [
    "AI법친 7.1-B — 보완 요청 상태값 정의서",
    "상태값 canonical 목록",
    "DRAFT",
    "SENT",
    "CLIENT_VIEWED",
    "CLIENT_RESPONDED",
    "UNDER_REVIEW",
    "NEEDS_MORE_INFO",
    "ACCEPTED",
    "CLOSED",
    "CANCELLED",
    "EXPIRED",
    "정상 전이표",
    "금지 전이표",
    "역할별 전이 권한",
    "상태별 화면 표시 기준",
    "만료 처리 기준",
    "취소 처리 기준",
    "재요청 처리 기준",
    "상태 로그 기록 기준",
    "AI 개입 제한",
    "상태값과 6.x 관계",
    "기존 CaseStatus 변경 없음",
    "Prisma schema 변경",
    "AI법친 7.1-B — 보완 요청 데이터 구조 정의서",
    "SENT | UNDER_REVIEW | 의뢰인 응답 없이 재검토 불가",
    "CLIENT_RESPONDED | SENT | 응답 완료 후 단순 발송 상태로 되돌림 금지",
    "CLOSED | SENT | 종료 후 재발송 금지",
    "CANCELLED | SENT | 취소 후 재발송 금지",
    "EXPIRED | SENT | 만료 요청의 직접 재발송 금지",
  ];

  for (const text of requiredTexts) {
    assert(definition.includes(text), `정의서에 필수 문구가 없습니다: ${text}`);
  }

  const requiredServiceSnippets = [
    'DRAFT: ["SENT", "CANCELLED"]',
    'SENT: ["CLIENT_VIEWED", "CLIENT_RESPONDED", "CANCELLED", "EXPIRED"]',
    'CLIENT_VIEWED: ["CLIENT_RESPONDED", "EXPIRED"]',
    'CLIENT_RESPONDED: ["UNDER_REVIEW"]',
    'UNDER_REVIEW: ["ACCEPTED", "NEEDS_MORE_INFO"]',
    'NEEDS_MORE_INFO: ["SENT"]',
    'ACCEPTED: ["CLOSED"]',
    'SUPPLEMENT_ALLOWED_TRANSITIONS',
    'canCreateSupplementRequest',
    'canRespondSupplementRequest',
    'ensureCreatePermission',
    'ensureResponsePermission',
    'ensureStatusTransitionPermission',
    'currentUser.id !== request.targetUserId',
  ];

  for (const text of requiredServiceSnippets) {
    assert(service.includes(text), `service에 필수 전이/권한 가드가 없습니다: ${text}`);
  }

  const forbiddenServiceSnippets = [
    'SENT: ["CLIENT_VIEWED", "CLIENT_RESPONDED", "UNDER_REVIEW", "EXPIRED", "CANCELLED"]',
    'CLIENT_RESPONDED: ["UNDER_REVIEW", "NEEDS_MORE_INFO", "ACCEPTED", "CLOSED", "EXPIRED"]',
    'NEEDS_MORE_INFO: ["SENT", "CANCELLED", "EXPIRED"]',
    'const nextStatus: SupplementRequestStatus =\n    currentUser.id === found.targetUserId ? "CLIENT_RESPONDED" : "UNDER_REVIEW";',
    'UNDER_REVIEW: ["NEEDS_MORE_INFO", "ACCEPTED"]',
    'SENT: ["CLIENT_VIEWED", "CLIENT_RESPONDED", "EXPIRED", "CANCELLED"]',
  ];

  for (const text of forbiddenServiceSnippets) {
    assert(!service.includes(text), `service에 금지된 전이/구조가 남아 있습니다: ${text}`);
  }

  console.log("✅ AI법친 7.1-B supplement status definition verification PASS");
}

try {
  main();
} catch (error) {
  console.error("❌ AI법친 7.1-B supplement status definition verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
