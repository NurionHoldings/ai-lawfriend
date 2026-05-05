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

assertIncludes("src/components/analytics/promo-analytics-provider.tsx", [
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "anonymize_ip",
  "fbq",
]);

assertIncludes(
  "src/features/illegal-lending/promo/illegal-lending-promo-events.ts",
  [
    "illegal_lending_landing_view",
    "illegal_lending_cta_click",
    "illegal_lending_popup_cta_click",
    "illegal_lending_variant_assigned",
  ],
);

assertIncludes(
  "src/features/illegal-lending/promo/illegal-lending-promo-analytics.ts",
  [
    "trackIllegalLendingPromoEvent",
    "gtag",
    "trackCustom",
    "NEXT_PUBLIC_AIBEOPCHIN_PROMO_ANALYTICS_ENABLED",
  ],
);

assertIncludes(
  "src/features/illegal-lending/promo/illegal-lending-promo-variants.ts",
  [
    "ILLEGAL_LENDING_PROMO_COPIES",
    "NEXT_PUBLIC_ILLEGAL_LENDING_PROMO_VARIANT",
    "getClientIllegalLendingPromoVariant",
  ],
);

assertIncludes(
  "src/features/illegal-lending/promo/illegal-lending-popup-policy.ts",
  [
    "NEXT_PUBLIC_AIBEOPCHIN_PROMO_POPUP_ENABLED",
    "NEXT_PUBLIC_AIBEOPCHIN_PROMO_POPUP_COOLDOWN_HOURS",
    "shouldShowIllegalLendingPromoPopup",
  ],
);

assertIncludes(
  "src/components/illegal-lending/illegal-lending-tracked-link.tsx",
  [
    "IllegalLendingTrackedLink",
    "CTA_CLICK",
    "trackIllegalLendingPromoEvent",
  ],
);

assertIncludes(
  "src/components/illegal-lending/illegal-lending-landing-analytics.tsx",
  ["LANDING_VIEW", "VARIANT_ASSIGNED"],
);

assertIncludes(
  "src/components/illegal-lending/illegal-lending-short-link-analytics.tsx",
  ["SHORT_LINK_VIEW"],
);

assertIncludes("src/components/illegal-lending/illegal-lending-promo-popup.tsx", [
  "POPUP_VIEW",
  "POPUP_CTA_CLICK",
  "POPUP_DISMISS",
  "POPUP_DISMISS_TODAY",
]);

assertIncludes("src/components/illegal-lending/illegal-lending-landing.tsx", [
  "getClientIllegalLendingPromoVariant",
  "IllegalLendingTrackedLink",
  "IllegalLendingLandingAnalytics",
]);

assertIncludes("docs/project-governance/ILLEGAL_LENDING_PROMO_AB_TEST_COPY.md", [
  "Variant A",
  "Variant B",
  "무료 법률상담",
  "illegal_lending_cta_click",
]);

assertIncludes("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", [
  "ILLEGAL-LENDING-PROMO-OPS-OPTIMIZATION",
  "GA/Meta Pixel 이벤트",
  "팝업 노출 정책",
  "SNS 광고 문구 A/B 테스트",
]);

const failed = checks.filter((check) => !check.passed);

console.log("\nAI법친 불법사금융 홍보 운영 최적화 verifier\n");

for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-illegal-lending-promo-ops PASS\n");