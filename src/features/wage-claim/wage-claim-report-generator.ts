import {
  WAGE_DAMAGE_TYPE_LABEL,
  WAGE_EMPLOYMENT_TYPE_LABEL,
  WAGE_REPORTER_TYPE_LABEL,
  type CreateWageClaimReportInput,
} from "./wage-claim.schema";

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

export function generateWageClaimStatementText(input: CreateWageClaimReportInput) {
  const damageLabels = input.damageTypes
    .map((type) => WAGE_DAMAGE_TYPE_LABEL[type])
    .join(", ");

  return `임금체불 진정서 작성 보조 초안

※ 본 문서는 AI법친이 입력 내용을 바탕으로 생성한 진정서 작성 보조 초안입니다.
※ AI법친은 변호사, 노무사, 고용노동부 또는 수사기관이 아니며 법률대리·수임·최종 법률판단을 제공하지 않습니다.
※ 본 문서는 임금체불 확정 여부, 체불금액 확정, 승소 가능성, 지급 가능성을 판단하지 않습니다.
※ 최종 제출 전 고용노동부 노동포털, 관할 고용노동관서, 노무사, 변호사 또는 대한법률구조공단의 검토를 권장합니다.

1. 작성자 정보
- 작성자 유형: ${WAGE_REPORTER_TYPE_LABEL[input.reporterType]}
- 작성자 성명: ${empty(input.reporterName)}
- 작성자 연락처: ${empty(input.reporterPhone)}
- 작성자 이메일: ${empty(input.reporterEmail)}

2. 근로자 정보
- 근로자 성명: ${empty(input.workerName)}
- 근로자 연락처: ${empty(input.workerPhone)}

3. 사업장 및 사업주 정보
- 사업장명: ${empty(input.companyName)}
- 대표자 또는 사업주: ${empty(input.employerName)}
- 사업장 주소: ${empty(input.companyAddress)}
- 근무지 주소: ${empty(input.workplaceAddress)}
- 사업장 연락처: ${empty(input.companyPhone)}

4. 근로관계 정보
- 고용 형태: ${WAGE_EMPLOYMENT_TYPE_LABEL[input.employmentType]}
- 담당 업무: ${empty(input.jobDescription)}
- 입사일: ${formatDate(input.hireDate)}
- 퇴사 여부: ${input.isResigned ? "퇴사함" : "재직 중 또는 미기재"}
- 퇴사일: ${formatDate(input.resignationDate)}

5. 약정 임금
- 월급: ${formatAmount(input.monthlyWageAmount)}
- 일급: ${formatAmount(input.dailyWageAmount)}
- 시급: ${formatAmount(input.hourlyWageAmount)}
- 임금 약정 관련 설명:
${empty(input.agreedPayMemo)}

6. 체불 유형
- 선택된 체불 유형: ${damageLabels}

7. 체불금액 입력 내역
- 미지급 임금: ${formatAmount(input.unpaidWageAmount)}
- 미지급 퇴직금: ${formatAmount(input.unpaidSeveranceAmount)}
- 미지급 수당: ${formatAmount(input.unpaidAllowanceAmount)}
- 총 미지급액: ${formatAmount(input.unpaidTotalAmount)}
- 체불 기간: ${empty(input.unpaidPeriod)}
- 지급 예정일 또는 약속일: ${formatDate(input.paymentDueDate)}

8. 지급 요구 이력
${empty(input.requestHistory)}

9. 피해 사실 상세
${empty(input.damageSummary)}

10. 요청하거나 희망하는 도움
${empty(input.requestedHelp)}

11. 증거자료 목록
${empty(input.evidenceSummary)}

12. 제출 전 확인사항
- 근로계약서, 임금명세서, 급여 입금내역, 출퇴근 기록, 근무표, 업무지시 문자·카카오톡, 퇴직 관련 자료, 4대보험 자료 등을 가능한 한 확보하십시오.
- 본 문서는 노동청 진정·상담·전문가 검토를 위한 정리 자료이며, 체불임금 확정 판단을 보장하지 않습니다.
`;
}

export function generateWageClaimTableText(input: CreateWageClaimReportInput) {
  return `체불내역 정리표

[근무 및 임금 조건]
- 사업장명: ${empty(input.companyName)}
- 근로자: ${empty(input.workerName || input.reporterName)}
- 고용 형태: ${WAGE_EMPLOYMENT_TYPE_LABEL[input.employmentType]}
- 입사일: ${formatDate(input.hireDate)}
- 퇴사일: ${formatDate(input.resignationDate)}
- 월급: ${formatAmount(input.monthlyWageAmount)}
- 일급: ${formatAmount(input.dailyWageAmount)}
- 시급: ${formatAmount(input.hourlyWageAmount)}

[체불 내역]
- 체불 기간: ${empty(input.unpaidPeriod)}
- 미지급 임금: ${formatAmount(input.unpaidWageAmount)}
- 미지급 퇴직금: ${formatAmount(input.unpaidSeveranceAmount)}
- 미지급 수당: ${formatAmount(input.unpaidAllowanceAmount)}
- 총 미지급액: ${formatAmount(input.unpaidTotalAmount)}

[비고]
${empty(input.damageSummary)}

※ 위 금액은 사용자가 입력한 값을 정리한 것입니다.
※ AI법친은 체불금액을 확정하거나 법적 판단을 제공하지 않습니다.
`;
}

export function generateWageClaimChecklistText(input: CreateWageClaimReportInput) {
  const missing: string[] = [];

  if (!input.companyName) missing.push("사업장명 확인");
  if (!input.employerName) missing.push("사업주 또는 대표자 성명 확인");
  if (!input.hireDate) missing.push("입사일 확인");
  if (!input.unpaidTotalAmount) missing.push("총 미지급액 입력 또는 산정자료 확인");
  if (!input.evidenceSummary) missing.push("증거자료 목록 정리");
  if (!input.requestHistory) missing.push("사업주에게 지급을 요구한 이력 정리");

  return `임금체불 진정 준비 체크리스트

[기본 준비자료]
1. 신분증
2. 근로계약서 또는 채용조건을 확인할 수 있는 자료
3. 임금명세서
4. 급여 입금내역 또는 통장 거래내역
5. 출퇴근 기록, 근무표, 근태기록
6. 업무지시 문자·카카오톡·이메일
7. 퇴직한 경우 퇴직일을 확인할 수 있는 자료
8. 미지급 임금·퇴직금·수당 계산 근거
9. 사업주에게 지급을 요구한 문자·카카오톡·내용증명 등
10. 기타 체불 사실을 확인할 수 있는 자료

[입력 기준 보완 필요 가능성이 있는 항목]
${
  missing.length > 0
    ? missing.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "현재 입력 기준으로 즉시 보완이 필요한 핵심 항목은 표시되지 않았습니다."
}

[주의]
- 실제 제출서류는 관할 고용노동관서, 사건 유형, 조사 과정에 따라 달라질 수 있습니다.
- AI법친은 임금체불 확정 여부 또는 체불금액 확정을 판단하지 않습니다.
`;
}
