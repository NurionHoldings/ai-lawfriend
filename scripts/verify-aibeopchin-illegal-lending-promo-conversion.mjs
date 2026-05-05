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

assertIncludes(".env.production.example", [
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "NEXT_PUBLIC_AIBEOPCHIN_PROMO_ANALYTICS_ENABLED",
  "NEXT_PUBLIC_ILLEGAL_LENDING_PROMO_VARIANT",
]);

assertIncludes("src/features/illegal-lending/promo/illegal-lending-promo-events.ts", [
  "illegal_lending_report_form_view",
  "illegal_lending_report_form_start",
  "illegal_lending_report_submit_attempt",
  "illegal_lending_report_submit_success",
  "illegal_lending_attachment_upload_success",
  "illegal_lending_lawyer_review_request_success",
]);

assertIncludes(
  "src/features/illegal-lending/promo/illegal-lending-current-variant.ts",
  ["getCurrentIllegalLendingPromoVariant"],
);

assertIncludes(
  "src/components/illegal-lending/illegal-lending-report-form-analytics.tsx",
  ["REPORT_FORM_VIEW", "trackIllegalLendingPromoEvent"],
);

assertIncludes("src/components/illegal-lending/illegal-lending-report-form.tsx", [
  "REPORT_FORM_START",
  "REPORT_SUBMIT_ATTEMPT",
  "REPORT_SUBMIT_SUCCESS",
  "REPORT_SUBMIT_FAIL",
  "IllegalLendingReportFormAnalytics",
]);

assertIncludes(
  "src/components/illegal-lending/illegal-lending-attachment-upload-form.tsx",
  [
    "ATTACHMENT_UPLOAD_ATTEMPT",
    "ATTACHMENT_UPLOAD_SUCCESS",
    "ATTACHMENT_UPLOAD_FAIL",
  ],
);

assertIncludes(
  "src/components/illegal-lending/illegal-lending-lawyer-review-button.tsx",
  [
    "LAWYER_REVIEW_REQUEST_ATTEMPT",
    "LAWYER_REVIEW_REQUEST_SUCCESS",
    "LAWYER_REVIEW_REQUEST_FAIL",
  ],
);

assertIncludes("docs/project-governance/ILLEGAL_LENDING_GA_REPORT_TEMPLATE.md", [
  "권장 Funnel",
  "illegal_lending_report_submit_success",
  "Variant별 비교",
]);

assertIncludes(
  "docs/project-governance/ILLEGAL_LENDING_META_PIXEL_EVENT_MAP.md",
  [
    "Custom Conversion",
    "illegal_lending_report_submit_success",
    "illegal_lending_attachment_upload_success",
  ],
);

assertIncludes("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", [
  "ILLEGAL-LENDING-PROMO-CONVERSION-MEASUREMENT",
  "신고서 작성 전환 이벤트",
  "Variant별 리포트 템플릿",
]);

const failed = checks.filter((check) => !check.passed);

console.log("\nAI법친 불법사금융 홍보 성과 측정 verifier\n");
for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-illegal-lending-promo-conversion PASS\n");
