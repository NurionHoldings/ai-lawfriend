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
  "enum JeonseReporterType",
  "enum JeonseDamageType",
  "enum JeonseReportStatus",
  "model JeonseDamageReport",
  "model JeonseDamageReportStatusHistory",
  "model JeonseDamageReportAccessLog",
  "model JeonseDamageReportAttachment",
  "model JeonseDamageLawyerReviewRequest",
  "enum JeonseDamageAttachmentType",
  "enum JeonseDamageLawyerReviewStatus",
]);

assertIncludes("src/features/jeonse-damage/jeonse-damage.schema.ts", [
  "CreateJeonseDamageReportSchema",
  "JEONSE_DAMAGE_TYPE_LABEL",
  "JEONSE_REPORTER_TYPE_LABEL",
]);

assertIncludes("src/features/jeonse-damage/jeonse-damage-report-generator.ts", [
  "generateJeonseDamageSummaryText",
  "generateJeonseDamageChecklistText",
  "법률대리",
  "피해자 결정 여부",
]);

assertIncludes("src/app/api/public/jeonse-damage-reports/route.ts", [
  "POST",
  "CreateJeonseDamageReportSchema",
  "generateJeonseDamageSummaryText",
  "generateJeonseDamageChecklistText",
  "jeonseDamageReport.create",
]);

assertIncludes("src/app/(public)/jeonse-damage/report/page.tsx", [
  "전세사기·보증금 반환 피해 서류 정리센터",
  "JeonseDamageReportForm",
  "법률판단",
]);

assertIncludes("src/components/jeonse-damage/jeonse-damage-report-form.tsx", [
  "무료 서류 정리 시작하기",
  "consentPrivacy",
  "consentNoLegalAdvice",
  "/api/public/jeonse-damage-reports",
]);

assertIncludes("src/app/(admin)/admin/jeonse-damage-reports/page.tsx", [
  "전세사기·보증금 반환 피해 서류 관리",
  "/admin/jeonse-damage-reports",
]);

assertIncludes("src/app/(admin)/admin/jeonse-damage-reports/[reportId]/page.tsx", [
  "전세사기·보증금 반환 피해 서류 상세",
  "generatedSummary",
  "generatedChecklist",
]);

assertIncludes("src/features/jeonse-damage/jeonse-damage-access-log.ts", [
  "createJeonseDamageAccessLog",
  "getJeonseDamageAdminActor",
  "DETAIL_VIEW",
  "PDF_DOWNLOAD",
  "STATUS_UPDATE",
]);

assertIncludes("src/features/jeonse-damage/jeonse-damage-upload.ts", [
  "saveJeonseDamageAttachmentFile",
  "createJeonseAttachmentKey",
  "getIllegalLendingStorage",
]);

assertIncludes(
  "src/app/api/public/jeonse-damage-reports/[reportId]/attachments/route.ts",
  [
    "POST",
    "uploadToken",
    "saveJeonseDamageAttachmentFile",
    "jeonseDamageReportAttachment.create",
  ],
);

assertIncludes(
  "src/app/api/admin/jeonse-damage-reports/[reportId]/status/route.ts",
  ["PATCH", "jeonseDamageReportStatusHistory.create", "STATUS_UPDATE", "reason"],
);

assertIncludes("src/components/jeonse-damage/jeonse-damage-status-form.tsx", [
  "DOCUMENTS_CHECKED",
  "REFERRED_TO_LAWYER",
  "/api/admin/jeonse-damage-reports/",
]);

assertIncludes("src/features/jeonse-damage/jeonse-damage-pdf.ts", [
  "buildJeonseDamageReportPdfBuffer",
  "PDF_KOREAN_FONT_PATH",
  "피해사실 요약서",
]);

assertIncludes("src/app/api/admin/jeonse-damage-reports/[reportId]/pdf/route.ts", [
  "GET",
  "application/pdf",
  "buildJeonseDamageReportPdfBuffer",
  "PDF_DOWNLOAD",
]);

assertIncludes(
  "src/app/api/admin/jeonse-damage-reports/[reportId]/attachments/[attachmentId]/download/route.ts",
  ["GET", "jeonseDamageReportAttachment.findFirst", "ATTACHMENT_DOWNLOAD"],
);

assertIncludes(
  "src/app/api/admin/jeonse-damage-reports/[reportId]/lawyer-review/route.ts",
  [
    "POST",
    "jeonseDamageLawyerReviewRequest.create",
    "REFERRED_TO_LAWYER",
    "변호사 검토 요청 생성",
  ],
);

assertIncludes(
  "src/components/jeonse-damage/jeonse-damage-attachment-upload-form.tsx",
  ["증거자료 업로드", "uploadToken", "FormData"],
);

assertIncludes(
  "src/components/jeonse-damage/jeonse-damage-lawyer-review-button.tsx",
  ["변호사 검토 요청", "assignedLawyerName", "router.refresh"],
);

assertIncludes("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", [
  "JEONSE-DAMAGE-REPORT-MVP",
  "전세사기·보증금 반환 피해 서류 정리센터",
]);

const failed = checks.filter((check) => !check.passed);

console.log("\nAI법친 전세사기·보증금 반환 피해 서류 정리센터 MVP verifier\n");
for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-jeonse-damage-report-mvp PASS\n");
