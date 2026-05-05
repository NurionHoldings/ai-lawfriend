import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const serviceFile = path.join(
  root,
  "src",
  "features",
  "supplement-request",
  "supplement-request.service.ts"
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const service = fs.readFileSync(serviceFile, "utf8");

const requiredTexts = [
  "SUPPLEMENT_ALLOWED_TRANSITIONS",
  'DRAFT: ["SENT", "CANCELLED"]',
  'SENT: ["CLIENT_VIEWED", "CLIENT_RESPONDED", "CANCELLED", "EXPIRED"]',
  'CLIENT_VIEWED: ["CLIENT_RESPONDED", "EXPIRED"]',
  'CLIENT_RESPONDED: ["UNDER_REVIEW"]',
  'UNDER_REVIEW: ["ACCEPTED", "NEEDS_MORE_INFO"]',
  'NEEDS_MORE_INFO: ["SENT"]',
  'ACCEPTED: ["CLOSED"]',
  "CLOSED: []",
  "CANCELLED: []",
  "EXPIRED: []",
  "canCreateSupplementRequest",
  "canRespondSupplementRequest",
  "canReviewSupplementRequest",
  "canCancelSupplementRequest",
  "보완 요청은 변호사 또는 관리자만 생성할 수 있습니다.",
  "보완 요청 대상 의뢰인만 응답할 수 있습니다.",
];

for (const text of requiredTexts) {
  assert(service.includes(text), `service guard alignment 누락: ${text}`);
}

console.log("✅ AI법친 7.1-B supplement guard alignment verification PASS");
