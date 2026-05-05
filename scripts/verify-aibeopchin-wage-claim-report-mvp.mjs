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

assertIncludes("prisma/schema.prisma", [
  "enum WageClaimReporterType",
  "enum WageClaimEmploymentType",
  "enum WageClaimDamageType",
  "enum WageClaimReportStatus",
  "model WageClaimReport",
]);

assertIncludes("src/features/wage-claim/wage-claim.schema.ts", [
  "CreateWageClaimReportSchema",
  "WAGE_DAMAGE_TYPE_LABEL",
  "WAGE_EMPLOYMENT_TYPE_LABEL",
  "WAGE_REPORTER_TYPE_LABEL",
]);

assertIncludes("src/features/wage-claim/wage-claim-report-generator.ts", [
  "generateWageClaimStatementText",
  "generateWageClaimTableText",
  "generateWageClaimChecklistText",
  "체불금액 확정",
]);

assertIncludes("src/app/api/public/wage-claim-reports/route.ts", [
  "POST",
  "CreateWageClaimReportSchema",
  "generateWageClaimStatementText",
  "wageClaimReport.create",
]);

assertIncludes("src/app/(public)/wage-claim/report/page.tsx", [
  "임금체불 진정서·체불내역 무료 정리센터",
  "WageClaimReportForm",
  "법률판단",
]);

assertIncludes("src/components/wage-claim/wage-claim-report-form.tsx", [
  "무료 진정서 초안 만들기",
  "consentPrivacy",
  "consentNoLegalAdvice",
  "/api/public/wage-claim-reports",
]);

assertIncludes("src/app/(admin)/admin/wage-claim-reports/page.tsx", [
  "임금체불 진정서 관리",
  "/admin/wage-claim-reports",
]);

assertIncludes("src/app/(admin)/admin/wage-claim-reports/[reportId]/page.tsx", [
  "임금체불 진정서 상세",
  "generatedStatement",
  "generatedTable",
  "generatedChecklist",
]);

assertIncludes("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", [
  "WAGE-CLAIM-REPORT-MVP",
  "임금체불 진정서·체불내역 정리센터",
]);

const failed = checks.filter((check) => !check.passed);

console.log("\nAI법친 임금체불 진정서·체불내역 정리센터 MVP verifier\n");

for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-wage-claim-report-mvp PASS\n");
