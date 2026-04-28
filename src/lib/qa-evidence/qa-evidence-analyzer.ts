import {
  normalizeAccountRoles,
  type QaEvidenceAnalyzeInput,
  type QaEvidenceAnalyzeOutput,
  type QaEvidenceClassification,
} from "./qa-evidence-schema";
import {
  renderClosureDraftMarkdown,
  renderFollowupTrackerDraftMarkdown,
  renderSourceRecordMarkdown,
} from "./qa-evidence-renderer";

const REQUIRED_FIELD_LABELS: Record<string, string> = {
  qaPerformedAt: "QA 수행 일시",
  qaOwner: "QA 담당자",
  testEnvironmentUrl: "테스트 환경 URL",
  accountRoles: "사용 계정 역할",
  sourceText: "QA 회신 원문",
};

function includesAny(source: string, keywords: string[]): boolean {
  return keywords.some((keyword) => source.includes(keyword));
}

function splitLines(source: string): string[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function detectMissingFields(input: QaEvidenceAnalyzeInput): string[] {
  const missing: string[] = [];

  if (!input.qaPerformedAt.trim()) missing.push(REQUIRED_FIELD_LABELS.qaPerformedAt);
  if (!input.qaOwner.trim()) missing.push(REQUIRED_FIELD_LABELS.qaOwner);
  if (!input.testEnvironmentUrl.trim()) {
    missing.push(REQUIRED_FIELD_LABELS.testEnvironmentUrl);
  }
  if (normalizeAccountRoles(input.accountRoles).length === 0) {
    missing.push(REQUIRED_FIELD_LABELS.accountRoles);
  }
  if (!input.sourceText.trim()) missing.push(REQUIRED_FIELD_LABELS.sourceText);

  return missing;
}

function extractClassifications(sourceText: string): QaEvidenceClassification[] {
  const lines = splitLines(sourceText);
  const joined = sourceText.toLowerCase();

  const classifications: QaEvidenceClassification[] = [];

  const failLines = lines.filter((line) =>
    includesAny(line, ["FAIL", "실패", "불일치", "오류", "표시되지 않음", "안 됨", "깨짐"]),
  );

  const blockedLines = lines.filter((line) =>
    includesAny(line, [
      "BLOCKED",
      "차단",
      "미수행",
      "수행 불가",
      "계정 없음",
      "URL 없음",
      "환경 없음",
      "접근 불가",
    ]),
  );

  const naLines = lines.filter((line) =>
    includesAny(line, ["N/A", "NA", "해당 없음", "대상 없음"]),
  );

  const passLines = lines.filter((line) =>
    includesAny(line, ["PASS", "통과", "정상", "확인 완료", "문제 없음"]),
  );

  const followUpLines = lines.filter((line) =>
    includesAny(line, ["보완", "추가 확인", "재확인", "후속", "재QA", "추가 회신"]),
  );

  for (const line of passLines) {
    classifications.push({
      type: includesAny(line, ["메모", "참고"]) ? "PASS_WITH_NOTES" : "PASS",
      title: "통과 항목",
      evidence: line,
      scope: inferScope(line),
      followUp: "없음",
    });
  }

  for (const line of failLines) {
    classifications.push({
      type: "FAIL",
      title: "실패 항목",
      evidence: line,
      scope: inferScope(line),
      followUp: "기능 보완 또는 재QA 필요",
    });
  }

  for (const line of blockedLines) {
    classifications.push({
      type: "BLOCKED",
      title: "차단 항목",
      evidence: line,
      scope: inferScope(line),
      followUp: "선행 조건 해소 후 재QA 필요",
    });
  }

  for (const line of naLines) {
    classifications.push({
      type: "N_A",
      title: "해당 없음 항목",
      evidence: line,
      scope: inferScope(line),
      followUp: "사람 검토 필요",
    });
  }

  for (const line of followUpLines) {
    classifications.push({
      type: "NEEDS_FOLLOW_UP",
      title: "보완 필요 항목",
      evidence: line,
      scope: inferScope(line),
      followUp: "QA팀 또는 운영자 추가 확인 필요",
    });
  }

  if (classifications.length === 0 && joined.trim().length > 0) {
    classifications.push({
      type: "NEEDS_FOLLOW_UP",
      title: "구조화 필요",
      evidence: "PASS / FAIL / BLOCKED / N/A 항목이 명확히 구분되지 않았습니다.",
      scope: "전체 QA 회신",
      followUp: "QA팀에 항목별 회신 형식으로 재요청 필요",
    });
  }

  return dedupeClassifications(classifications);
}

function inferScope(line: string): string {
  if (includesAny(line, ["의뢰인", "/dashboard", "client"])) return "의뢰인 대시보드";
  if (includesAny(line, ["변호사", "/lawyer", "lawyer"])) return "변호사 대시보드";
  if (includesAny(line, ["관리자", "/admin", "admin"])) return "관리자 대시보드";
  if (includesAny(line, ["권한", "restricted", "비로그인", "로그인"])) return "접근 / 권한";
  if (includesAny(line, ["빈 상태", "오류", "로딩"])) return "빈 상태 / 오류 상태";
  if (includesAny(line, ["demo", "데모"])) return "demo metrics 경계";
  return "공통";
}

function dedupeClassifications(
  items: QaEvidenceClassification[],
): QaEvidenceClassification[] {
  const seen = new Set<string>();
  const result: QaEvidenceClassification[] = [];

  for (const item of items) {
    const key = `${item.type}:${item.evidence}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function buildWarnings(
  input: QaEvidenceAnalyzeInput,
  classifications: QaEvidenceClassification[],
  missingFields: string[],
): string[] {
  const warnings: string[] = [];

  if (missingFields.length > 0) {
    warnings.push(
      `필수 항목 누락: ${missingFields.join(", ")}. closure 확정 초안으로 사용할 수 없습니다.`,
    );
  }

  if (classifications.some((item) => item.type === "FAIL")) {
    warnings.push("FAIL 항목이 있어 closure 확정은 보류되어야 합니다.");
  }

  if (classifications.some((item) => item.type === "BLOCKED")) {
    warnings.push("미해소 BLOCKED 항목이 있어 closure 확정은 보류되어야 합니다.");
  }

  if (
    !input.sourceText.includes("FAIL") &&
    !input.sourceText.includes("실패") &&
    !input.sourceText.includes("없음")
  ) {
    warnings.push("FAIL 항목이 없음으로 명시되어 있는지 사람 검토가 필요합니다.");
  }

  return warnings;
}

function determineStatus(
  missingFields: string[],
  classifications: QaEvidenceClassification[],
): QaEvidenceAnalyzeOutput["status"] {
  if (missingFields.length > 0) return "NEEDS_QA_REPLY";

  if (
    classifications.some(
      (item) => item.type === "FAIL" || item.type === "BLOCKED",
    )
  ) {
    return "BLOCKED";
  }

  if (classifications.some((item) => item.type === "NEEDS_FOLLOW_UP")) {
    return "NEEDS_REVIEW";
  }

  return "READY_FOR_COPY";
}

export function analyzeQaEvidence(
  input: QaEvidenceAnalyzeInput,
): QaEvidenceAnalyzeOutput {
  const normalizedInput: QaEvidenceAnalyzeInput = {
    ...input,
    accountRoles: normalizeAccountRoles(input.accountRoles),
  };

  const missingFields = detectMissingFields(normalizedInput);
  const classifications = extractClassifications(normalizedInput.sourceText);
  const warnings = buildWarnings(
    normalizedInput,
    classifications,
    missingFields,
  );

  const summary = {
    passCount: classifications.filter(
      (item) => item.type === "PASS" || item.type === "PASS_WITH_NOTES",
    ).length,
    failCount: classifications.filter((item) => item.type === "FAIL").length,
    blockedCount: classifications.filter((item) => item.type === "BLOCKED")
      .length,
    naCount: classifications.filter((item) => item.type === "N_A").length,
    needsFollowUpCount: classifications.filter(
      (item) => item.type === "NEEDS_FOLLOW_UP",
    ).length,
  };

  return {
    status: determineStatus(missingFields, classifications),
    missingFields,
    summary,
    classifications,
    closureDraftMarkdown: renderClosureDraftMarkdown(classifications),
    sourceRecordMarkdown: renderSourceRecordMarkdown(normalizedInput),
    followupTrackerDraftMarkdown:
      renderFollowupTrackerDraftMarkdown(classifications),
    warnings,
  };
}
