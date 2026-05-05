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

assertIncludes(
  "src/features/jeonse-damage/promo/jeonse-damage-promo-events.ts",
  [
    "jeonse_damage_landing_view",
    "jeonse_damage_cta_click",
    "jeonse_damage_report_submit_success",
    "jeonse_damage_lawyer_review_request_success",
  ],
);

assertIncludes(
  "src/features/jeonse-damage/promo/jeonse-damage-promo-analytics.ts",
  ["trackJeonseDamagePromoEvent", "gtag", "trackCustom"],
);

assertIncludes(
  "src/features/jeonse-damage/promo/jeonse-damage-promo-variants.ts",
  [
    "JEONSE_DAMAGE_PROMO_COPIES",
    "NEXT_PUBLIC_JEONSE_DAMAGE_PROMO_VARIANT",
    "getClientJeonseDamagePromoVariant",
  ],
);

assertIncludes(
  "src/features/jeonse-damage/promo/jeonse-damage-popup-policy.ts",
  [
    "NEXT_PUBLIC_JEONSE_DAMAGE_PROMO_POPUP_ENABLED",
    "NEXT_PUBLIC_JEONSE_DAMAGE_PROMO_POPUP_COOLDOWN_HOURS",
    "shouldShowJeonseDamagePromoPopup",
  ],
);

assertIncludes("src/components/jeonse-damage/jeonse-damage-landing.tsx", [
  "전세사기·보증금 반환 피해",
  "JeonseDamageTrackedLink",
  "JeonseDamageLandingAnalytics",
  "/jeonse-damage/report",
]);

assertIncludes("src/app/(public)/jeonse-damage/page.tsx", [
  "JeonseDamageLanding",
  "openGraph",
  "/og/jeonse-damage-report.png",
]);

assertIncludes("src/app/(public)/free/jeonse-damage-report/page.tsx", [
  "JeonseDamageShortLinkAnalytics",
  "JeonseDamageLanding",
]);

assertIncludes("src/components/jeonse-damage/jeonse-damage-promo-popup.tsx", [
  "JeonseDamagePromoPopup",
  "POPUP_VIEW",
  "POPUP_CTA_CLICK",
  "/jeonse-damage/report",
]);

assertIncludes("src/components/layout/site-promo-popup-provider.tsx", [
  "JeonseDamagePromoPopup",
  "/jeonse-damage/report",
]);

assertIncludes(
  "src/components/jeonse-damage/jeonse-damage-report-form-analytics.tsx",
  ["REPORT_FORM_VIEW", "trackJeonseDamagePromoEvent"],
);

assertIncludes("src/components/jeonse-damage/jeonse-damage-report-form.tsx", [
  "REPORT_FORM_START",
  "REPORT_SUBMIT_SUCCESS",
  "JeonseDamageReportFormAnalytics",
]);

assertIncludes(
  "src/components/jeonse-damage/jeonse-damage-attachment-upload-form.tsx",
  ["ATTACHMENT_UPLOAD_SUCCESS", "trackJeonseDamagePromoEvent"],
);

assertIncludes(
  "src/components/jeonse-damage/jeonse-damage-lawyer-review-button.tsx",
  ["LAWYER_REVIEW_REQUEST_SUCCESS", "trackJeonseDamagePromoEvent"],
);

assertIncludes("docs/project-governance/JEONSE_DAMAGE_PROMO_AB_TEST_COPY.md", [
  "Variant A",
  "Variant B",
  "피해자로 인정됩니다",
]);

assertIncludes("docs/project-governance/JEONSE_DAMAGE_GA_REPORT_TEMPLATE.md", [
  "핵심 Funnel",
  "jeonse_damage_report_submit_success",
]);

assertIncludes("docs/project-governance/JEONSE_DAMAGE_META_PIXEL_EVENT_MAP.md", [
  "Custom Conversion",
  "jeonse_damage_attachment_upload_success",
]);

assertIncludes("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", [
  "JEONSE-DAMAGE-PROMO-CONVERSION",
  "랜딩페이지",
  "SNS 공유 경로",
  "GA/Meta",
]);

const failed = checks.filter((check) => !check.passed);

console.log("\nAI법친 전세사기·보증금 반환 피해 서류 정리센터 홍보 전환 verifier\n");

for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-jeonse-damage-promo PASS\n");
