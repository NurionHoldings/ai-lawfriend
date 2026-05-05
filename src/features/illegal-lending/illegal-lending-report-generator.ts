import {
  DAMAGE_TYPE_LABEL,
  REPORTER_TYPE_LABEL,
  type CreateIllegalLendingReportInput,
} from "./illegal-lending.schema";

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

function emptyToMissing(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "미기재";
}

export function generateIllegalLendingReportText(
  input: CreateIllegalLendingReportInput,
) {
  const damageLabels = input.damageTypes
    .map((type) => DAMAGE_TYPE_LABEL[type])
    .join(", ");

  return `불법사금융 피해 신고서 작성 보조 초안

※ 본 문서는 AI법친이 입력 내용을 바탕으로 생성한 신고서 작성 보조 초안입니다.
※ AI법친은 변호사 또는 수사기관이 아니며, 법률대리·수임·최종 법률판단을 제공하지 않습니다.
※ 최종 제출 전 금융감독원, 경찰, 지방자치단체, 서민금융통합지원센터, 대한법률구조공단 또는 변호사의 검토를 권장합니다.
※ 긴급한 협박, 폭행, 감금, 스토킹, 성적 이미지 유포 협박 등이 있는 경우 즉시 112 등 긴급기관에 신고해야 합니다.

1. 신고인 정보
- 신고인 유형: ${REPORTER_TYPE_LABEL[input.reporterType]}
- 신고인 성명: ${emptyToMissing(input.reporterName)}
- 신고인 연락처: ${emptyToMissing(input.reporterPhone)}
- 신고인 이메일: ${emptyToMissing(input.reporterEmail)}

2. 피해자 정보
- 피해자 성명: ${emptyToMissing(input.victimName)}
- 피해자 연락처: ${emptyToMissing(input.victimPhone)}

3. 불법사금융업자 또는 채권자 관련 정보
- 성명 또는 명칭: ${emptyToMissing(input.creditorName)}
- 연락처: ${emptyToMissing(input.creditorPhone)}
- 상호 또는 업체명: ${emptyToMissing(input.creditorBusinessName)}
- 입금계좌 또는 관련 계좌: ${emptyToMissing(input.creditorAccount)}
- 기타 식별정보: ${emptyToMissing(input.creditorMemo)}

4. 대출 및 금전거래 관련 정보
- 최초 대출일 또는 거래일: ${formatDate(input.loanDate)}
- 약정 원금: ${formatAmount(input.principalAmount)}
- 실제 수령액: ${formatAmount(input.receivedAmount)}
- 이미 변제한 금액: ${formatAmount(input.repaidAmount)}
- 현재 요구받는 금액: ${formatAmount(input.demandedAmount)}
- 이자율 또는 상환조건 관련 설명: ${emptyToMissing(input.interestRateMemo)}

5. 피해 유형
- 선택된 피해 유형: ${damageLabels}

6. 불법추심 또는 피해 발생 방식
${emptyToMissing(input.collectionMethods)}

7. 피해 사실 상세
${emptyToMissing(input.damageSummary)}

8. 요청하거나 희망하는 조치
${emptyToMissing(input.requestedHelp)}

9. 증거자료 목록 또는 보유자료
${emptyToMissing(input.evidenceSummary)}

10. 제출 전 확인사항
- 문자, 카카오톡, 통화녹음, 계좌이체내역, 계약서, 차용증, 신분증 요구 내역, 가족·직장 연락 내역, 협박성 메시지 등은 삭제하지 말고 보관하십시오.
- 원본 파일은 별도로 보관하고, 기관 제출 시 사본 또는 캡처본을 준비하십시오.
- 긴급 위해 우려가 있는 경우 온라인 신고서 작성보다 긴급 신고가 우선입니다.
`;
}
