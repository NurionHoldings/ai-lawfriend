/**
 * Read-only ARKAON guidance for payment / OpenMall AML gap analysis.
 * Propose-only — never approve AML, never execute payout/refund.
 */

export const AML_REVIEW_CHECKLIST = [
  {
    code: "CONTRACT",
    question: "플랫폼 법인 명의의 지급대행 AML 계약·MID·API KEY가 분리되어 있는가?",
  },
  {
    code: "STATUS_CODES",
    question: "amlExmnYn 승인값을 KG이니시스에 서면 확인해 허용목록으로 설정했는가?",
  },
  {
    code: "SUBMALL",
    question: "내부 수취인과 idMall이 서버에서 유일하게 연결되고 등록정보와 일치하는가?",
  },
  {
    code: "LIVE_GATE",
    question: "지급 직전 amlstatus를 실시간 재조회하며 실패·미확인·만료를 차단하는가?",
  },
  {
    code: "VALIDITY",
    question: "인증 만료와 이행 유효기간 시작·종료일(Asia/Seoul)을 모두 검사하는가?",
  },
  {
    code: "IDEMPOTENCY",
    question: "지급 요청은 멱등키와 X-Request-ID로 중복·추적 통제되는가?",
  },
  {
    code: "RECONCILIATION",
    question: "송금결과와 잔액대사를 정기 수행하고 차이를 관리자에게 알리는가?",
  },
  {
    code: "SECRETS_PII",
    question: "API KEY와 계좌·대표자 개인정보가 브라우저·로그·DNA에 노출되지 않는가?",
  },
] as const;

export function buildAmlGuidance() {
  return {
    mode: "read_only_analyze_and_propose" as const,
    scope: "payment_aml" as const,
    phase: "A" as const,
    product: "ai-lawfriend",
    liveGateWired: false,
    checklist: AML_REVIEW_CHECKLIST,
    notification:
      "관리자/GPT는 결제·정산·지급 영역 작업 전 /api/admin/arkaon/aml-guidance 를 확인하고, blocker가 있으면 자동 금융변경 없이 원인·영향·수정제안·검증방법만 보고한다.",
    prohibited: [
      "AML 상태 수동 승인 또는 우회",
      "지급·환불 자동 실행",
      "API KEY·계좌번호·대표자 개인정보 보고",
      "KG이니시스 문서에 없는 상태값 의미 추정",
    ],
    endpoints: {
      guidance: "/api/admin/arkaon/aml-guidance",
      participation: "/api/admin/arkaon/participation",
    },
  };
}

export type AmlGuidance = ReturnType<typeof buildAmlGuidance>;
