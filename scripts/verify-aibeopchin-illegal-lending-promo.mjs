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

function assertFile(file) {
  addCheck(`file exists: ${file}`, exists(file));
}

function assertIncludes(file, patterns) {
  assertFile(file);

  if (!exists(file)) return;

  const content = read(file);

  for (const pattern of patterns) {
    addCheck(`${file} includes ${pattern}`, content.includes(pattern));
  }
}

assertIncludes("src/components/illegal-lending/illegal-lending-landing.tsx", [
  "불법사금융 피해",
  "무료 신고서 작성 시작하기",
  "/illegal-lending/report",
  "법률대리",
  "112",
]);

assertIncludes("src/app/(public)/illegal-lending/page.tsx", [
  "IllegalLendingLanding",
  "openGraph",
  "/og/illegal-lending-report.png",
]);

assertIncludes("src/app/(public)/free/illegal-lending-report/page.tsx", [
  "IllegalLendingLanding",
  "무료 불법사금융 피해 신고서 작성",
]);

assertIncludes("src/components/illegal-lending/illegal-lending-promo-popup.tsx", [
  "AI법친 무료 공익 서비스",
  "무료 신고서 작성하기",
  "/illegal-lending/report",
  "오늘은 그만 보기",
]);

assertIncludes("src/components/layout/site-promo-popup-provider.tsx", [
  "SitePromoPopupProvider",
  "IllegalLendingPromoPopup",
  "/admin",
  "/illegal-lending/report",
]);

assertIncludes("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", [
  "ILLEGAL-LENDING-PROMO-CONVERSION",
  "SNS 홍보용 랜딩페이지",
  "홈페이지 진입 홍보 팝업",
]);

const failed = checks.filter((check) => !check.passed);

console.log("\nAI법친 불법사금융 홍보 전환 세트 verifier\n");

for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-illegal-lending-promo PASS\n");