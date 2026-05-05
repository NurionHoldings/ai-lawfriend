import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [];

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function addCheck(name, passed) {
  checks.push({ name, passed });
}

function assertIncludes(file, patterns) {
  addCheck(`file exists: ${file}`, exists(file));

  if (!exists(file)) return;

  const content = read(file);

  for (const pattern of patterns) {
    addCheck(`${file} includes ${pattern}`, content.includes(pattern));
  }
}

assertIncludes(".env.example", [
  "NEXT_PUBLIC_AIBEOPCHIN_FREE_SERVICE_PROMO_MODE",
  "NEXT_PUBLIC_AIBEOPCHIN_FREE_SERVICE_PROMO_ROTATION_SCOPE",
]);

assertIncludes(".env.production.example", [
  "NEXT_PUBLIC_AIBEOPCHIN_FREE_SERVICE_PROMO_MODE",
  "NEXT_PUBLIC_AIBEOPCHIN_FREE_SERVICE_PROMO_ROTATION_SCOPE",
]);

assertIncludes("src/components/layout/free-service-promo-policy.ts", [
  "chooseFreeServicePromoTarget",
  "illegal_only",
  "jeonse_only",
  "disabled",
  "rotation",
]);

assertIncludes("src/components/layout/site-promo-popup-provider.tsx", [
  "chooseFreeServicePromoTarget",
  "IllegalLendingPromoPopup",
  "JeonseDamagePromoPopup",
  'target === "illegal"',
  'target === "jeonse"',
]);

assertIncludes("docs/project-governance/FREE_SERVICE_OG_IMAGE_FINAL_SPEC.md", [
  "불법사금융 피해",
  "전세사기·보증금 반환 피해",
  "법률판단·승소·구제 보장 표현 금지",
]);

assertIncludes(
  "docs/project-governance/FREE_SERVICE_PROMO_EVENT_QA_CHECKLIST.md",
  [
    "illegal_lending_report_submit_success",
    "jeonse_damage_report_submit_success",
    "팝업이 동시에 뜨지 않는다",
    "GA4 DebugView",
    "Meta Events Manager",
  ],
);

assertIncludes("src/app/(admin)/admin/free-service-promo-qa/page.tsx", [
  "무료 유입 서비스 1·2호 홍보 노출 정책 QA",
  "/illegal-lending",
  "/jeonse-damage",
  "/free/illegal-lending-report",
  "/free/jeonse-damage-report",
]);

assertIncludes("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", [
  "FREE-SERVICE-PROMO-POLICY-CLOSURE",
  "Illegal/Jeonse 팝업 상호배타",
  "OG 이미지 최종화",
  "운영 이벤트 수신 체크리스트",
]);

const failed = checks.filter((check) => !check.passed);

console.log("\nAI법친 무료 유입 서비스 홍보 노출 정책 verifier\n");

for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-free-service-promo-policy PASS\n");
