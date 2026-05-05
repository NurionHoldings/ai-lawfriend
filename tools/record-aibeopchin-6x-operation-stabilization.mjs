import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const evidenceFile = path.join(
  root,
  "docs",
  "project-governance",
  "IMPLEMENTATION_EVIDENCE.md"
);

const operationFile = path.join(
  root,
  "data",
  "operations",
  "aibeopchin-6x-operation-stabilization.json"
);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function appendIfMissing(filePath, marker, block) {
  const current = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : "";

  if (current.includes(marker)) {
    console.log(`Evidence block already exists: ${marker}`);
    return;
  }

  const next = `${block.trim()}\n\n${current}`;
  fs.writeFileSync(filePath, next, "utf8");
  console.log(`Evidence block inserted: ${marker}`);
}

function main() {
  const operation = readJson(operationFile);

  const marker =
    "[EVIDENCE-20260503-AIBEOPCHIN-6X-OPERATION-STABILIZATION-RECORD]";

  const smokeRows = operation.smokeTests
    .map((item) => `| ${item.id} | ${item.name} | ${item.result} |`)
    .join("\n");

  const block = `
## ${marker} AI법친 6.x — 운영 안정화 기록

### 상태
AI법친 6.x 사건 패키지 기능군은 운영 배포 및 Smoke Test 14개 항목 PASS 이후 최종 잠금 상태로 전환되었다.

### 운영 기준
- status: ${operation.status}
- deploymentStatus: ${operation.deploymentStatus}
- featureFreeze: ${operation.featureFreeze}
- operationMode: ${operation.operationMode}
- smokeTestResultsSummary: ${operation.smokeTestResultsSummary}

### 배포 기준
- branch: ${operation.latestDeployment.branch}
- commitSha: ${operation.latestDeployment.commitSha}
- rollbackTargetCommit: ${operation.latestDeployment.rollbackTargetCommit}
- deploymentProvider: ${operation.latestDeployment.deploymentProvider}
- deployedAt: ${operation.latestDeployment.deployedAt}
- dbBackupReference: ${operation.latestDeployment.dbBackupReference}

### Smoke Test 결과
| 항목 | 검증 내용 | 결과 |
|---|---|---|
${smokeRows}

### 허용 작업
${operation.allowedWork.map((item) => `- ${item}`).join("\n")}

### 금지 작업
${operation.blockedWork.map((item) => `- ${item}`).join("\n")}

### 보안 확인
- DATABASE_URL 원문 미노출: ${!operation.securityChecks.databaseUrlRawValueExposed}
- accessToken 원문 미노출: ${!operation.securityChecks.accessTokenRawValueExposed}
- optionalPin/hash 미노출: ${!operation.securityChecks.optionalPinOrHashExposed}
- storagePath 미노출: ${!operation.securityChecks.storagePathExposed}
- 첨부파일 직접 URL 미노출: ${!operation.securityChecks.attachmentDirectUrlExposed}
- 내부 prompt/raw response 미노출: ${!operation.securityChecks.internalPromptOrRawResponseExposed}
- public-safe 출력 기준 유지: ${operation.securityChecks.publicSafeOutputMaintained}

### 최종 판정
AI법친 6.x는 최종 잠금 완료 상태다.
이후 6.x 신규 기능 추가는 금지하며, 운영 모니터링과 장애 대응, 7.x 로드맵 분리 기준으로만 진행한다.
`;

  appendIfMissing(evidenceFile, marker, block);
}

try {
  main();
} catch (error) {
  console.error("Failed to record AI법친 6.x operation stabilization");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
