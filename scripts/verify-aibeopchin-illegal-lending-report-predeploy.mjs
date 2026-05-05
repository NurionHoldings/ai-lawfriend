import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "src/features/illegal-lending/illegal-lending-predeploy-check.types.ts",
  "src/features/illegal-lending/illegal-lending-storage-predeploy-check.ts",
  "src/features/illegal-lending/illegal-lending-pdf-font-predeploy-check.ts",
  "src/features/illegal-lending/illegal-lending-lawyer-assignment-predeploy-check.ts",
  "src/app/api/admin/illegal-lending-reports/predeploy-check/route.ts",
  "src/app/api/admin/illegal-lending-reports/predeploy/pdf-font-probe/route.ts",
  "src/app/(admin)/admin/illegal-lending-reports/predeploy-check/page.tsx",
];

const requiredPatterns = [
  {
    file: "src/app/api/admin/illegal-lending-reports/predeploy-check/route.ts",
    patterns: [
      "checkIllegalLendingStorageAccess",
      "checkIllegalLendingPdfKoreanFont",
      "checkIllegalLendingLawyerAssignmentData",
    ],
  },
  {
    file: "src/features/illegal-lending/illegal-lending-storage-predeploy-check.ts",
    patterns: ["storage.save", "storage.get", "storage.delete"],
  },
  {
    file: "src/features/illegal-lending/illegal-lending-pdf-font-predeploy-check.ts",
    patterns: [
      "PDF_KOREAN_FONT_PATH",
      "buildKoreanFontProbePdf",
      "가나다라마바사아자차카타파하",
    ],
  },
  {
    file: "src/features/illegal-lending/illegal-lending-lawyer-assignment-predeploy-check.ts",
    patterns: ["autoAssignIllegalLendingLawyer", 'role: "LAWYER"'],
  },
  {
    file: "src/app/(admin)/admin/illegal-lending-reports/predeploy-check/page.tsx",
    patterns: [
      "통합 점검 API 실행",
      "PDF 한글 폰트 점검 파일 다운로드",
      "Storage Health 확인",
    ],
  },
  {
    file: "docs/project-governance/IMPLEMENTATION_EVIDENCE.md",
    patterns: [
      "ILLEGAL-LENDING-REPORT-PREDEPLOY-CHECK",
      "버킷 권한 확인",
      "PDF 폰트 실출력 확인",
      "변호사 자동배정 실데이터 검증",
    ],
  },
];

const checks = [];

function addCheck(name, passed) {
  checks.push({ name, passed });
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

for (const file of requiredFiles) {
  addCheck(`file exists: ${file}`, exists(file));
}

for (const item of requiredPatterns) {
  if (!exists(item.file)) {
    addCheck(`patterns skipped: ${item.file}`, false);
    continue;
  }

  const content = read(item.file);

  for (const pattern of item.patterns) {
    addCheck(`${item.file} includes ${pattern}`, content.includes(pattern));
  }
}

console.log("\nAI법친 불법사금융 피해 신고서 배포 전 운영 점검 verifier\n");

for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
}

const failed = checks.filter((check) => !check.passed);

if (failed.length > 0) {
  console.error(`\n검증 실패: ${failed.length}건`);
  process.exit(1);
}

console.log("\n✅ verify:aibeopchin-illegal-lending-report-predeploy PASS\n");