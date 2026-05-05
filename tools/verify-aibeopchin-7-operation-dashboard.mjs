import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  "src/lib/operations/aibeopchin-operation-dashboard.ts",
  "src/app/api/admin/operations/aibeopchin-7-dashboard/route.ts",
  "src/app/(protected)/admin/operations/aibeopchin-7-dashboard/page.tsx",
  "src/components/admin/operations/aibeopchin-operation-dashboard.tsx",
  "docs/project-governance/AIBEOPCHIN_7_0_OPERATION_MONITORING_DASHBOARD_DEFINITION.md",
  "data/operations/aibeopchin-6x-operation-stabilization.json"
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function main() {
  for (const file of requiredFiles) {
    assert(fs.existsSync(path.join(root, file)), `필수 파일이 없습니다: ${file}`);
  }

  const definition = read(
    "docs/project-governance/AIBEOPCHIN_7_0_OPERATION_MONITORING_DASHBOARD_DEFINITION.md"
  );

  assert(
    definition.includes("6.x 기능 수정"),
    "정의서에 6.x 기능 수정 제외 원칙이 필요합니다."
  );

  assert(
    definition.includes("DB schema 변경"),
    "정의서에 DB schema 변경 제외 원칙이 필요합니다."
  );

  const lib = read("src/lib/operations/aibeopchin-operation-dashboard.ts");

  assert(
    lib.includes("getAibeopchinOperationDashboardData"),
    "운영 대시보드 데이터 함수가 없습니다."
  );

  assert(
    lib.includes("PRODUCTION_DEPLOYED_AND_LOCKED"),
    "운영 잠금 상태 검증 기준이 없습니다."
  );

  assert(
    lib.includes("14/14 PASS"),
    "Smoke Test 14/14 PASS 검증 기준이 없습니다."
  );

  const page = read(
    "src/app/(protected)/admin/operations/aibeopchin-7-dashboard/page.tsx"
  );

  assert(
    page.includes("AibeopchinOperationDashboard"),
    "관리자 대시보드 페이지가 컴포넌트를 렌더링하지 않습니다."
  );

  const component = read(
    "src/components/admin/operations/aibeopchin-operation-dashboard.tsx"
  );

  assert(
    component.includes("Smoke Test 14개 항목"),
    "컴포넌트에 Smoke Test 섹션이 없습니다."
  );

  assert(
    component.includes("보안 노출 방지 체크"),
    "컴포넌트에 보안 체크 섹션이 없습니다."
  );

  assert(
    component.includes("buildKpiCards"),
    "컴포넌트에 KPI 카드 빌더가 없습니다."
  );

  assert(
    component.includes("KpiCard"),
    "컴포넌트에 KPI 카드 컴포넌트가 없습니다."
  );

  assert(
    component.includes("운영 잠금 상태"),
    "KPI 카드에 운영 잠금 상태 항목이 없습니다."
  );

  assert(
    component.includes("Smoke Test"),
    "KPI 카드에 Smoke Test 항목이 없습니다."
  );

  assert(
    component.includes("기능 동결"),
    "KPI 카드에 기능 동결 항목이 없습니다."
  );

  assert(
    component.includes("보안 체크"),
    "KPI 카드에 보안 체크 항목이 없습니다."
  );

  assert(
    component.includes("OperationWarningDetailPanel"),
    "컴포넌트에 운영 경고 상세 패널이 없습니다."
  );

  assert(
    component.includes("운영 경고 상세 패널"),
    "운영 경고 상세 패널 제목이 없습니다."
  );

  assert(
    component.includes("경고 상태 요약"),
    "운영 경고 상세 패널에 경고 상태 요약이 없습니다."
  );

  assert(
    component.includes("운영 Runbook 기준으로 원인 확인"),
    "운영 경고 상세 패널에 권장 조치 문구가 없습니다."
  );

  assert(
    component.includes("NO WARNINGS"),
    "운영 경고 상세 패널에 정상 상태 표시가 없습니다."
  );

  assert(
    component.includes("OperationRunbookChecklistPanel"),
    "컴포넌트에 운영 Runbook 체크리스트 패널이 없습니다."
  );

  assert(
    component.includes("운영 Runbook 바로가기 / 장애 대응 체크리스트"),
    "운영 Runbook 패널 제목이 없습니다."
  );

  assert(
    component.includes("AIBEOPCHIN_6X_INCIDENT_RESPONSE_RUNBOOK.md"),
    "운영 Runbook 문서 경로가 표시되지 않습니다."
  );

  assert(
    component.includes("rollbackTargetCommit"),
    "운영 Runbook 패널에 rollbackTargetCommit 표시가 없습니다."
  );

  assert(
    component.includes("IR-01"),
    "운영 Runbook 패널에 장애 대응 체크리스트가 없습니다."
  );

  assert(
    component.includes("P0"),
    "운영 Runbook 패널에 장애 등급 P0 안내가 없습니다."
  );

  assert(
    component.includes("OperationTimelineEvidencePanel"),
    "컴포넌트에 운영 상태 타임라인 / 최근 증빙 이력 패널이 없습니다."
  );

  assert(
    component.includes("운영 상태 타임라인 / 최근 증빙 이력"),
    "운영 상태 타임라인 패널 제목이 없습니다."
  );

  assert(
    component.includes("최근 운영 이력 요약"),
    "운영 상태 타임라인 패널에 최근 운영 이력 요약이 없습니다."
  );

  assert(
    component.includes("EVIDENCE-20260503-AIBEOPCHIN-6-PRODUCTION-DEPLOYMENT-CLOSURE"),
    "운영 상태 타임라인에 6.x 운영 배포 증빙이 없습니다."
  );

  assert(
    component.includes("EVIDENCE-20260503-AIBEOPCHIN-7-0-RUNBOOK-CHECKLIST-PANEL"),
    "운영 상태 타임라인에 Runbook 체크리스트 증빙이 없습니다."
  );

  assert(
    component.includes("EVIDENCE-20260503-AIBEOPCHIN-7-0-OPERATION-TIMELINE-EVIDENCE-PANEL"),
    "운영 상태 타임라인 신규 증빙 ID가 없습니다."
  );

  assert(
    component.includes("OperationFeedbackClassificationPanel"),
    "컴포넌트에 운영 피드백 수집 / 7.1 후보 분류 패널이 없습니다."
  );

  assert(
    component.includes("운영 피드백 수집 패널 / 7.1 후보 분류"),
    "운영 피드백 수집 패널 제목이 없습니다."
  );

  assert(
    component.includes("피드백 수집 항목"),
    "운영 피드백 수집 항목 섹션이 없습니다."
  );

  assert(
    component.includes("7.1 후보 분류"),
    "7.1 후보 분류 섹션이 없습니다."
  );

  assert(
    component.includes("변호사 검토 메모 고도화"),
    "7.1 후보에 변호사 검토 메모 고도화가 없습니다."
  );

  assert(
    component.includes("보완 요청 워크플로우"),
    "7.1 후보에 보완 요청 워크플로우가 없습니다."
  );

  assert(
    component.includes("피드백을 저장하지 않습니다"),
    "피드백 저장 기능 없음 원칙 문구가 없습니다."
  );

  const operationJson = JSON.parse(
    read("data/operations/aibeopchin-6x-operation-stabilization.json")
  );

  assert(
    operationJson.deploymentStatus === "PRODUCTION_DEPLOYED_AND_LOCKED",
    "운영 안정화 JSON의 deploymentStatus가 잠금 상태가 아닙니다."
  );

  assert(
    operationJson.smokeTestResultsSummary === "14/14 PASS",
    "운영 안정화 JSON의 Smoke Test 요약이 14/14 PASS가 아닙니다."
  );

  assert(
    operationJson.featureFreeze === true,
    "운영 안정화 JSON의 featureFreeze가 true가 아닙니다."
  );

  console.log("AI법친 7.0 operation dashboard verification PASS");
}

try {
  main();
} catch (error) {
  console.error("AI법친 7.0 operation dashboard verification FAIL");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
