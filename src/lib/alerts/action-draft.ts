type AlertDraftInput = {
  alertId: string;
  title: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  status: "OPEN" | "ACKNOWLEDGED" | "IGNORED" | "RESOLVED";
  message: string;
  ruleCode?: string | null;
  detectedAt: string | Date;
  actorLabel?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

function formatDateTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString();
}

export function buildAlertActionDraft(input: AlertDraftInput) {
  return [
    `[경고 조치 메모]`,
    ``,
    `- 경고 ID: ${input.alertId}`,
    `- 경고 제목: ${input.title}`,
    `- 심각도: ${input.severity}`,
    `- 현재 상태: ${input.status}`,
    `- 탐지 시각: ${formatDateTime(input.detectedAt)}`,
    `- 규칙 코드: ${input.ruleCode ?? "-"}`,
    `- 행위자: ${input.actorLabel ?? "-"}`,
    `- 엔티티: ${input.entityType ?? "-"} / ${input.entityId ?? "-"}`,
    ``,
    `[경고 메시지]`,
    `${input.message}`,
    ``,
    `[조치 내용 초안]`,
    `1. 경고 원인 확인: `,
    `2. 영향 범위 검토: `,
    `3. 즉시 조치 내용: `,
    `4. 후속 점검 계획: `,
    `5. 담당자 의견: `,
  ].join("\n");
}

export function buildAlertResolvedAutoNote(input: {
  alertId: string;
  title: string;
  resolvedByLabel?: string | null;
  resolvedAt: string | Date;
}) {
  const resolvedAtText =
    typeof input.resolvedAt === "string"
      ? new Date(input.resolvedAt).toLocaleString()
      : input.resolvedAt.toLocaleString();

  return [
    `[경고 자동 완료 기록]`,
    ``,
    `- 경고 ID: ${input.alertId}`,
    `- 경고 제목: ${input.title}`,
    `- 처리 결과: RESOLVED`,
    `- 처리 시각: ${resolvedAtText}`,
    `- 처리자: ${input.resolvedByLabel ?? "-"}`,
    ``,
    `해당 경고가 해결 처리되어 사건 타임라인에 자동 기록되었습니다.`,
  ].join("\n");
}
