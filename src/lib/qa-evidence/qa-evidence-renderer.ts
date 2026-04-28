import type {
  QaEvidenceAnalyzeInput,
  QaEvidenceClassification,
} from "./qa-evidence-schema";

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "<br />").trim();
}

function listOrNone(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "없음";
}

export function renderClosureDraftMarkdown(
  classifications: QaEvidenceClassification[],
): string {
  const hasFail = classifications.some((item) => item.type === "FAIL");
  const hasBlocked = classifications.some((item) => item.type === "BLOCKED");
  const hasNeedsFollowUp = classifications.some(
    (item) => item.type === "NEEDS_FOLLOW_UP",
  );

  const defaultResult =
    hasFail || hasBlocked || hasNeedsFollowUp ? "BLOCKED" : "PASS";

  const rows = [
    [
      "3.x 봉인 상태",
      defaultResult,
      "QA 회신 원문 기준 확인 필요",
      hasFail || hasBlocked ? "closure 보류" : "없음",
    ],
    [
      "접근 / 권한",
      defaultResult,
      "역할별 접근 QA 결과 기준",
      hasFail || hasBlocked ? "재QA 또는 보완" : "없음",
    ],
    [
      "역할별 화면 표시",
      defaultResult,
      "의뢰인 / 변호사 / 관리자 화면 QA 결과 기준",
      hasFail || hasBlocked ? "재QA 또는 보완" : "없음",
    ],
    [
      "빈 상태 / 오류 상태",
      defaultResult,
      "빈 상태 / 오류 상태 QA 결과 기준",
      hasFail || hasBlocked ? "재QA 또는 보완" : "없음",
    ],
    [
      "demo metrics 경계",
      defaultResult,
      "실서비스 경로와 demo metrics 경계 확인 필요",
      "없음",
    ],
    [
      "금지 표현",
      defaultResult,
      "사용자 노출 문구 QA 결과 기준",
      "없음",
    ],
    [
      "증빙 / 내비게이터",
      defaultResult,
      "기준 문서와 내비게이터 유지 확인 필요",
      "없음",
    ],
  ];

  return [
    "### 공식 확정 표 초안",
    "",
    "> 이 표는 AI가 생성한 초안입니다. 공식 확정은 사람 승인 후에만 가능합니다.",
    "",
    "| 구분 | 결과 | 근거 | 후속 |",
    "| --- | --- | --- | --- |",
    ...rows.map(
      ([label, result, evidence, followUp]) =>
        `| ${escapeTableCell(label)} | ${escapeTableCell(result)} | ${escapeTableCell(evidence)} | ${escapeTableCell(followUp)} |`,
    ),
  ].join("\n");
}

export function renderSourceRecordMarkdown(input: QaEvidenceAnalyzeInput): string {
  return [
    "### 회신 원문 정리본",
    "",
    "- 수신 일시: ",
    `- QA 수행 일시: ${input.qaPerformedAt || "미기입"}`,
    `- 회신자 / 팀: ${input.qaOwner || "미기입"}`,
    `- 테스트 환경: ${input.testEnvironmentUrl || "미기입"}`,
    `- 사용 계정 역할: ${listOrNone(input.accountRoles)}`,
    "",
    "#### 원문",
    "",
    "> 아래 원문은 가능한 그대로 보존한다.",
    "",
    "```text",
    input.sourceText,
    "```",
    "",
    "#### 첨부 / 운영 메모",
    "",
    `- 첨부 메모: ${input.attachmentNotes || "없음"}`,
    `- 운영자 메모: ${input.operatorMemo || "없음"}`,
  ].join("\n");
}

export function renderFollowupTrackerDraftMarkdown(
  classifications: QaEvidenceClassification[],
): string {
  const followups = classifications.filter((item) =>
    ["FAIL", "BLOCKED", "N_A", "NEEDS_FOLLOW_UP", "OUT_OF_SCOPE", "REOPEN_REQUIRED"].includes(
      item.type,
    ),
  );

  const header = [
    "### 4.6 follow-up tracker 초안",
    "",
    "> 이 표는 AI가 생성한 후속 보완 후보 초안입니다. 실제 반영은 사람 검토 후 진행합니다.",
    "",
    "| 항목 ID | 유형 | 원문 근거 | 영향 범위 | 권장 후속 | closure 영향 | 담당 | 상태 |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
  ];

  if (followups.length === 0) {
    return [
      ...header,
      "| - | - | 후속 보완 후보 없음 | - | 없음 | 참고 | 미지정 | 후보 |",
    ].join("\n");
  }

  return [
    ...header,
    ...followups.map((item, index) => {
      const id = `${item.type.replace(/_/g, "-")}-${String(index + 1).padStart(3, "0")}`;
      const closureImpact =
        item.type === "FAIL" ||
        item.type === "BLOCKED" ||
        item.type === "NEEDS_FOLLOW_UP"
          ? "closure 보류"
          : item.type === "REOPEN_REQUIRED"
            ? "별도 Phase 검토"
            : "사람 검토";

      return `| ${id} | ${escapeTableCell(item.type)} | ${escapeTableCell(item.evidence)} | ${escapeTableCell(item.scope)} | ${escapeTableCell(item.followUp)} | ${closureImpact} | 미지정 | 후보 |`;
    }),
  ].join("\n");
}
