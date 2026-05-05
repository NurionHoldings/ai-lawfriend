import fs from "node:fs";
import path from "node:path";

export type SmokeTestResult = {
  id: string;
  name: string;
  result: "PASS" | "FAIL" | "PENDING";
};

export type AibeopchinSecurityChecks = {
  databaseUrlRawValueExposed: boolean;
  accessTokenRawValueExposed: boolean;
  optionalPinOrHashExposed: boolean;
  storagePathExposed: boolean;
  attachmentDirectUrlExposed: boolean;
  internalPromptOrRawResponseExposed: boolean;
  publicSafeOutputMaintained: boolean;
};

export type AibeopchinOperationDashboardData = {
  project: string;
  phase: string;
  status: string;
  deploymentStatus: string;
  featureFreeze: boolean;
  smokeTestResultsSummary: string;
  operationMode: string;
  allowedWork: string[];
  blockedWork: string[];
  latestDeployment: {
    branch: string;
    commitSha: string;
    rollbackTargetCommit: string;
    deploymentProvider: string;
    deployedAt: string;
    dbBackupReference: string;
  };
  smokeTests: SmokeTestResult[];
  securityChecks: AibeopchinSecurityChecks;
  next: {
    sixX: string;
    sevenX: string;
  };
  dashboardWarnings: string[];
  dashboardStatus: "HEALTHY" | "WARNING";
};

function readJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`운영 대시보드 데이터 파일을 찾을 수 없습니다: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function resolveOperationFilePath(): string {
  return path.join(
    process.cwd(),
    "data",
    "operations",
    "aibeopchin-6x-operation-stabilization.json"
  );
}

function buildWarnings(
  data: Omit<AibeopchinOperationDashboardData, "dashboardWarnings" | "dashboardStatus">
): string[] {
  const warnings: string[] = [];

  if (data.status !== "PRODUCTION_DEPLOYED_AND_LOCKED") {
    warnings.push("6.x 운영 상태가 최종 잠금 상태가 아닙니다.");
  }

  if (data.deploymentStatus !== "PRODUCTION_DEPLOYED_AND_LOCKED") {
    warnings.push("deploymentStatus가 PRODUCTION_DEPLOYED_AND_LOCKED가 아닙니다.");
  }

  if (data.featureFreeze !== true) {
    warnings.push("featureFreeze가 true가 아닙니다. 6.x 기능 추가 금지 상태를 확인해야 합니다.");
  }

  if (data.smokeTestResultsSummary !== "14/14 PASS") {
    warnings.push("Smoke Test 결과가 14/14 PASS가 아닙니다.");
  }

  const smokeTests = Array.isArray(data.smokeTests) ? data.smokeTests : [];
  const failedSmokeTests = smokeTests.filter((item) => item.result !== "PASS");

  if (smokeTests.length !== 14) {
    warnings.push(`Smoke Test 항목 수가 14개가 아닙니다. 현재 ${smokeTests.length}개입니다.`);
  }

  if (failedSmokeTests.length > 0) {
    warnings.push(
      `PASS가 아닌 Smoke Test가 있습니다: ${failedSmokeTests
        .map((item) => item.id)
        .join(", ")}`
    );
  }

  const security = data.securityChecks;

  if (security.databaseUrlRawValueExposed) {
    warnings.push("DATABASE_URL 원문 노출 위험이 표시되었습니다.");
  }

  if (security.accessTokenRawValueExposed) {
    warnings.push("accessToken 원문 노출 위험이 표시되었습니다.");
  }

  if (security.optionalPinOrHashExposed) {
    warnings.push("optionalPin/hash 노출 위험이 표시되었습니다.");
  }

  if (security.storagePathExposed) {
    warnings.push("storagePath 노출 위험이 표시되었습니다.");
  }

  if (security.attachmentDirectUrlExposed) {
    warnings.push("첨부파일 직접 URL 노출 위험이 표시되었습니다.");
  }

  if (security.internalPromptOrRawResponseExposed) {
    warnings.push("내부 prompt/raw response 노출 위험이 표시되었습니다.");
  }

  if (!security.publicSafeOutputMaintained) {
    warnings.push("public-safe 출력 기준이 유지되지 않았습니다.");
  }

  return warnings;
}

export function getAibeopchinOperationDashboardData(): AibeopchinOperationDashboardData {
  const operationFilePath = resolveOperationFilePath();

  const baseData = readJsonFile<
    Omit<AibeopchinOperationDashboardData, "dashboardWarnings" | "dashboardStatus">
  >(operationFilePath);

  const dashboardWarnings = buildWarnings(baseData);

  return {
    ...baseData,
    dashboardWarnings,
    dashboardStatus: dashboardWarnings.length === 0 ? "HEALTHY" : "WARNING",
  };
}
