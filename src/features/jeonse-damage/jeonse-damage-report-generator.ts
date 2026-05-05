import {
  JEONSE_DAMAGE_TYPE_LABEL,
  JEONSE_REPORTER_TYPE_LABEL,
  type CreateJeonseDamageReportInput,
} from "./jeonse-damage.schema";

function formatAmount(value: number | null | undefined) {
  if (value === null || value === undefined) return "미기재";
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "미기재";
  return value.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function empty(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "미기재";
}

function yesNo(value: boolean) {
  return value ? "예" : "아니오";
}

export function generateJeonseDamageSummaryText(
  input: CreateJeonseDamageReportInput,
) {
  const damageLabels = input.damageTypes
    .map((type) => JEONSE_DAMAGE_TYPE_LABEL[type])
    .join(", ");

  return `전세사기·보증금 반환 피해 서류 정리 요약서

※ 본 문서는 AI법친이 입력 내용을 바탕으로 생성한 서류 정리 보조 초안입니다.
※ AI법친은 변호사, 공공기관 또는 수사기관이 아니며, 법률대리·수임·최종 법률판단을 제공하지 않습니다.
※ 본 문서는 전세사기피해자 결정 여부, 승소 가능성, 보증금 회수 가능성을 판단하지 않습니다.
※ 최종 제출 전 국토교통부 전세사기피해자 지원관리시스템, 관할 지자체, 전세피해지원센터, 주택도시보증공사, 법률구조공단 또는 변호사의 검토를 권장합니다.
※ 퇴거 압박, 협박, 폭행, 주거침입 등 긴급 위해가 있는 경우 즉시 112 등 긴급기관 신고가 우선입니다.

1. 작성자 정보
- 작성자 유형: ${JEONSE_REPORTER_TYPE_LABEL[input.reporterType]}
- 작성자 성명: ${empty(input.reporterName)}
- 작성자 연락처: ${empty(input.reporterPhone)}
- 작성자 이메일: ${empty(input.reporterEmail)}

2. 임차인 정보
- 임차인 성명: ${empty(input.tenantName)}
- 임차인 연락처: ${empty(input.tenantPhone)}

3. 임차주택 및 대항력 관련 정보
- 임차주택 주소: ${empty(input.propertyAddress)}
- 주택 유형: ${empty(input.propertyType)}
- 전입신고 여부: ${yesNo(input.hasMoveInReport)}
- 전입신고일: ${formatDate(input.moveInDate)}
- 확정일자 여부: ${yesNo(input.hasFixedDate)}
- 확정일자: ${formatDate(input.fixedDate)}
- 실제 점유 여부: ${yesNo(input.hasPossession)}
- 임차권등기 여부: ${yesNo(input.hasLeaseRegistration)}
- 전세권 설정 여부: ${yesNo(input.hasJeonseRight)}

4. 임대차계약 정보
- 계약 시작일: ${formatDate(input.leaseStartDate)}
- 계약 종료일: ${formatDate(input.leaseEndDate)}
- 임대차보증금: ${formatAmount(input.depositAmount)}
- 월 차임: ${formatAmount(input.monthlyRentAmount)}
- 계약 관련 특이사항:
${empty(input.contractMemo)}

5. 임대인 정보
- 임대인 성명 또는 명칭: ${empty(input.landlordName)}
- 임대인 연락처: ${empty(input.landlordPhone)}
- 임대인 주소: ${empty(input.landlordAddress)}
- 임대인 관련 특이사항:
${empty(input.landlordMemo)}

6. 공인중개사 또는 중개 관련 정보
- 중개사 성명: ${empty(input.brokerName)}
- 중개사무소명: ${empty(input.brokerOfficeName)}
- 중개사 연락처: ${empty(input.brokerPhone)}
- 중개 관련 특이사항:
${empty(input.brokerMemo)}

7. 피해 유형
- 선택된 피해 유형: ${damageLabels}

8. 보증금 반환 요구 이력
${empty(input.returnRequestHistory)}

9. 경매·공매·압류·수사 관련 진행 상황
- 경매·공매·압류 등:
${empty(input.auctionOrSaleStatus)}
- 수사 또는 고소·고발 관련:
${empty(input.investigationStatus)}

10. 피해 사실 상세
${empty(input.damageSummary)}

11. 요청하거나 희망하는 도움
${empty(input.requestedHelp)}

12. 증거자료 목록
${empty(input.evidenceSummary)}

13. 제출 전 확인사항
- 임대차계약서, 재계약서, 확정일자 자료, 주민등록표 초본, 등기사항전부증명서, 보증금 이체내역, 반환 요구 문자·카카오톡·내용증명, 경매·공매 통지서, 수사 관련 자료, 임대인 파산·회생 자료 등을 가능한 한 원본 또는 사본으로 보관하십시오.
- 본 문서는 신청·상담·검토를 위한 정리 자료이며, 피해자 결정 여부를 보장하지 않습니다.`;
}

export function generateJeonseDamageChecklistText(
  input: CreateJeonseDamageReportInput,
) {
  const missing: string[] = [];

  if (!input.hasMoveInReport) missing.push("전입신고 여부 및 일자 확인");
  if (!input.hasFixedDate) missing.push("확정일자 여부 및 일자 확인");
  if (!input.hasPossession) missing.push("임차주택 실제 점유 여부 확인");
  if (!input.depositAmount) missing.push("임대차보증금 금액 확인");
  if (!input.landlordName) missing.push("임대인 성명 또는 명칭 확인");
  if (!input.evidenceSummary) missing.push("증거자료 목록 정리");

  return `전세사기·보증금 반환 피해 제출자료 체크리스트

※ 아래 체크리스트는 입력 내용을 바탕으로 한 서류 준비 보조 자료입니다.
※ 실제 제출서류는 신청기관, 사건 유형, 신청 시점에 따라 달라질 수 있습니다.

[기본 확인]
- 임차주택 주소: ${empty(input.propertyAddress)}
- 임대차보증금: ${formatAmount(input.depositAmount)}
- 전입신고: ${yesNo(input.hasMoveInReport)}
- 확정일자: ${yesNo(input.hasFixedDate)}
- 실제 점유: ${yesNo(input.hasPossession)}
- 임차권등기: ${yesNo(input.hasLeaseRegistration)}
- 전세권 설정: ${yesNo(input.hasJeonseRight)}

[우선 준비 권장 자료]
1. 신분증
2. 임대차계약서 사본 및 재계약서 사본
3. 주민등록표 초본 또는 전입 사실 확인 자료
4. 확정일자 확인 자료
5. 등기사항전부증명서
6. 보증금 지급 또는 이체내역
7. 보증금 반환 요구 문자·카카오톡·통화녹취·내용증명
8. 임대인 연락두절 또는 반환 거부 관련 자료
9. 경매·공매·압류·파산·회생 관련 통지서 또는 결정문
10. 공인중개사 설명자료, 중개대상물 확인설명서, 중개 관련 대화내역
11. 고소장, 진정서, 수사기관 접수증 등 수사 관련 자료가 있는 경우 해당 자료

[입력 기준 보완 필요 가능성이 있는 항목]
${
  missing.length > 0
    ? missing.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "현재 입력 기준으로 즉시 보완이 필요한 핵심 항목은 표시되지 않았습니다."
}

[주의]
- AI법친은 전세사기피해자 결정 여부, 보증금 회수 가능성, 승소 가능성을 판단하지 않습니다.
- 최종 제출 전 공식기관 또는 전문가 검토를 권장합니다.`;
}
