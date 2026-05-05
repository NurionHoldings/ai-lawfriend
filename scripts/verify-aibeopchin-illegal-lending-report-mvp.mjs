import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = [];

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function exists(filePath) {
  return fs.existsSync(path.join(root, filePath));
}

function addCheck(name, passed, detail = "") {
  checks.push({
    name,
    passed,
    detail,
  });
}

function assertFile(filePath) {
  const passed = exists(filePath);
  addCheck(`file exists: ${filePath}`, passed);
  return passed;
}

function assertIncludes(filePath, patterns) {
  if (!assertFile(filePath)) return;

  const content = read(filePath);

  for (const pattern of patterns) {
    addCheck(`${filePath} includes ${pattern}`, content.includes(pattern), pattern);
  }
}

assertIncludes("prisma/schema.prisma", [
  "enum IllegalLendingReporterType",
  "enum IllegalLendingDamageType",
  "enum IllegalLendingReportStatus",
  "model IllegalLendingReport",
  "model IllegalLendingReportStatusHistory",
  "model IllegalLendingReportAccessLog",
  "statusHistories      IllegalLendingReportStatusHistory[]",
  "accessLogs           IllegalLendingReportAccessLog[]",
  "enum IllegalLendingAttachmentType",
  "enum IllegalLendingLawyerReviewStatus",
  "model IllegalLendingReportAttachment",
  "model IllegalLendingLawyerReviewRequest",
  "uploadToken          String?                        @unique",
  "attachments          IllegalLendingReportAttachment[]",
  "lawyerReviewRequests IllegalLendingLawyerReviewRequest[]",
  "storageProvider String                        @default(\"local\")",
  "storageKey      String?",
  "downloadCount   Int                           @default(0)",
  "lastDownloadedAt DateTime?",
  "autoAssigned       Boolean                          @default(false)",
  "assignmentReason   String?",
  "model IllegalLendingLawyerAssignmentHistory",
  "lawyerAssignmentHistories IllegalLendingLawyerAssignmentHistory[]",
]);

assertIncludes("src/features/illegal-lending/storage/illegal-lending-storage.types.ts", [
  "IllegalLendingStorageAdapter",
  "IllegalLendingStorageDriver",
  "SaveIllegalLendingObjectInput",
]);

assertIncludes("src/features/illegal-lending/storage/illegal-lending-local-storage.ts", [
  "illegalLendingLocalStorage",
  "safeJoin",
]);

assertIncludes("src/features/illegal-lending/storage/illegal-lending-s3-storage.ts", [
  "S3Client",
  "PutObjectCommand",
  "GetObjectCommand",
  "ILLEGAL_LENDING_S3_BUCKET",
]);

assertIncludes("src/features/illegal-lending/storage/illegal-lending-supabase-storage.ts", [
  "createClient",
  "ILLEGAL_LENDING_SUPABASE_BUCKET",
  "SUPABASE_SERVICE_ROLE_KEY",
]);

assertIncludes("src/features/illegal-lending/storage/illegal-lending-storage.ts", [
  "getIllegalLendingStorage",
  "getIllegalLendingStorageDriver",
  "supabase",
]);

assertIncludes("src/features/illegal-lending/illegal-lending.schema.ts", [
  "CreateIllegalLendingReportSchema",
  "DAMAGE_TYPE_LABEL",
  "REPORTER_TYPE_LABEL",
]);

assertIncludes("src/features/illegal-lending/illegal-lending-report-generator.ts", [
  "generateIllegalLendingReportText",
  "법률대리",
  "신고서 작성 보조",
]);

assertIncludes("src/app/api/public/illegal-lending-reports/route.ts", [
  "POST",
  "CreateIllegalLendingReportSchema",
  "generateIllegalLendingReportText",
  "illegalLendingReport.create",
]);

assertIncludes("src/app/(public)/illegal-lending/report/page.tsx", [
  "불법사금융 피해 신고서 무료 작성센터",
  "IllegalLendingReportForm",
]);

assertIncludes("src/components/illegal-lending/illegal-lending-report-form.tsx", [
  "무료 신고서 초안 생성하기",
  "consentPrivacy",
  "consentNoLegalAdvice",
  "/api/public/illegal-lending-reports",
  "IllegalLendingAttachmentUploadForm",
  "uploadToken",
]);

assertIncludes("src/features/illegal-lending/illegal-lending-upload.ts", [
  "saveIllegalLendingAttachmentFile",
  "MAX_ATTACHMENT_SIZE_BYTES",
  "ALLOWED_ATTACHMENT_MIME_TYPES",
  "getIllegalLendingStorage",
  "createIllegalLendingAttachmentKey",
  "storageProvider",
  "storageKey",
]);

assertIncludes("src/features/illegal-lending/illegal-lending-mask.ts", [
  "maskName",
  "maskPhone",
  "maskEmail",
  "maskAccount",
]);

assertIncludes("src/features/illegal-lending/illegal-lending-access-log.ts", [
  "createIllegalLendingAccessLog",
  "DETAIL_VIEW",
  "PDF_DOWNLOAD",
  "STATUS_UPDATE",
]);

assertIncludes("src/features/illegal-lending/illegal-lending-pdf-html.ts", [
  "buildIllegalLendingReportPrintHtml",
  "PDF로 저장 / 인쇄",
  "신고서 작성 보조 초안",
]);

assertIncludes("src/features/illegal-lending/illegal-lending-pdf.ts", [
  "buildIllegalLendingReportPdfBuffer",
  "PDFDocument",
  "신고서 초안 전문",
  "PDF_KOREAN_FONT_PATH",
  "applyKoreanFont",
]);

assertIncludes("src/features/illegal-lending/illegal-lending-lawyer-assignment.ts", [
  "autoAssignIllegalLendingLawyer",
  "ILLEGAL_LENDING_AUTO_ASSIGN_ENABLED",
  "LAWYER",
]);

assertIncludes("src/app/(admin)/admin/illegal-lending-reports/page.tsx", [
  "불법사금융 피해 신고서 관리",
  "/admin/illegal-lending-reports",
]);

assertIncludes("src/app/(admin)/admin/illegal-lending-reports/[reportId]/page.tsx", [
  "불법사금융 피해 신고서 상세",
  "IllegalLendingReportStatusForm",
  "IllegalLendingReportCopyButton",
  "generatedReport",
]);

assertIncludes("src/components/illegal-lending/illegal-lending-report-status-form.tsx", [
  "DRAFT_SUBMITTED",
  "REVIEW_READY",
  "REFERRED_TO_LAWYER",
  "CLOSED",
  "/api/admin/illegal-lending-reports/",
]);

assertIncludes("src/components/illegal-lending/illegal-lending-report-copy-button.tsx", [
  "navigator.clipboard.writeText",
  "복사 완료",
]);

assertIncludes("src/components/illegal-lending/illegal-lending-attachment-upload-form.tsx", [
  "증거자료 업로드",
  "uploadToken",
  "FormData",
]);

assertIncludes("src/components/illegal-lending/illegal-lending-lawyer-review-button.tsx", [
  "변호사 검토 요청",
  "assignedLawyerName",
  "router.refresh",
]);

assertIncludes("src/app/api/admin/illegal-lending-reports/[reportId]/status/route.ts", [
  "PATCH",
  "requireAdmin",
  "UpdateIllegalLendingReportStatusSchema",
  "illegalLendingReport.update",
  "illegalLendingReportStatusHistory.create",
  "STATUS_UPDATE",
  "reason",
]);

assertIncludes("src/app/api/admin/illegal-lending-reports/[reportId]/print/route.ts", [
  "GET",
  "requireAdminApi",
  "buildIllegalLendingReportPrintHtml",
  "PDF_DOWNLOAD",
]);

assertIncludes("src/app/api/public/illegal-lending-reports/[reportId]/attachments/route.ts", [
  "POST",
  "uploadToken",
  "saveIllegalLendingAttachmentFile",
  "illegalLendingReportAttachment.create",
]);

assertIncludes("src/app/api/admin/illegal-lending-reports/[reportId]/attachments/[attachmentId]/download/route.ts", [
  "GET",
  "requireAdminApi",
  "illegalLendingReportAttachment.findFirst",
  "PERSONAL_INFO_VIEW",
]);

assertIncludes("src/app/api/admin/illegal-lending-reports/[reportId]/pdf/route.ts", [
  "GET",
  "application/pdf",
  "buildIllegalLendingReportPdfBuffer",
  "PDF_DOWNLOAD",
]);

assertIncludes("src/app/api/admin/illegal-lending-reports/[reportId]/lawyer-review/route.ts", [
  "POST",
  "illegalLendingLawyerReviewRequest.create",
  "REFERRED_TO_LAWYER",
  "변호사 검토 요청 생성",
  "autoAssignIllegalLendingLawyer",
  "autoAssigned",
  "assignmentReason",
  "illegalLendingLawyerAssignmentHistory.create",
]);

assertIncludes("src/app/api/admin/illegal-lending-reports/storage-health/route.ts", [
  "getIllegalLendingStorageDriver",
  "PDF_KOREAN_FONT_PATH",
  "autoAssign",
]);

assertIncludes("docs/project-governance/IMPLEMENTATION_EVIDENCE.md", [
  "EVIDENCE-20260503-ILLEGAL-LENDING-REPORT-MVP",
  "불법사금융 피해 신고서",
]);

const failed = checks.filter((check) => !check.passed);

console.log("\nAI법친 불법사금융 피해 신고서 MVP 검증 결과\n");

for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-illegal-lending-report-mvp PASS\n");