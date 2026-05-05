export type GuardrailViolationType =
  | "CASE_LAW_REFERENCE"
  | "LEGAL_ARTICLE_REFERENCE"
  | "OVERCONFIDENT_ASSERTION"
  | "UNCLASSIFIED";

export type GuardrailSuggestion = {
  type: GuardrailViolationType;
  issue: string;
  suggestedQuestions: string[];
};

const CASE_LAW_KEYWORDS = ["판례번호", "대법원 선고일자", "대법원", "선고", "판례"];

const LEGAL_ARTICLE_KEYWORDS = [
  "법령 조문",
  "형법",
  "민법",
  "상법",
  "민사소송법",
  "형사소송법",
  "조문",
];

const OVERCONFIDENT_KEYWORDS = [
  "과도하게 단정",
  "단정적인 표현",
  "확실히",
  "명백히",
  "반드시",
  "무조건",
  "100%",
];

function includesAnyKeyword(issue: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => issue.includes(keyword));
}

export function classifyGuardrailViolationIssue(issue: string): GuardrailViolationType {
  if (includesAnyKeyword(issue, CASE_LAW_KEYWORDS)) {
    return "CASE_LAW_REFERENCE";
  }

  if (includesAnyKeyword(issue, LEGAL_ARTICLE_KEYWORDS)) {
    return "LEGAL_ARTICLE_REFERENCE";
  }

  if (includesAnyKeyword(issue, OVERCONFIDENT_KEYWORDS)) {
    return "OVERCONFIDENT_ASSERTION";
  }

  return "UNCLASSIFIED";
}

export function buildSuggestedQuestionsForGuardrailViolation(
  type: GuardrailViolationType,
): string[] {
  switch (type) {
    case "CASE_LAW_REFERENCE":
      return [
        "해당 판례를 문서에 반드시 기재해야 하나요?",
        "해당 판례번호, 선고일자, 사건번호를 확인할 수 있는 자료가 있나요?",
        "판례 원문, 판결문, 검색 결과 캡처 또는 출처 링크를 첨부할 수 있나요?",
        "판례를 특정하지 않고 일반적인 검토 의견으로 표현해도 될까요?",
      ];

    case "LEGAL_ARTICLE_REFERENCE":
      return [
        "해당 법령 조문을 문서에 반드시 기재해야 하나요?",
        "적용하려는 법령명과 조문 번호를 직접 확인해 입력해 주시겠습니까?",
        "조문 근거가 되는 계약서, 고소장 초안, 판례, 자문자료가 있나요?",
        "조문을 단정하지 않고 ‘관련 법령 검토 필요’로 표시해도 될까요?",
      ];

    case "OVERCONFIDENT_ASSERTION":
      return [
        "해당 판단을 뒷받침하는 구체적 사실관계나 증거가 있나요?",
        "단정 표현 대신 ‘제출 자료 기준’, ‘정황상’, ‘추가 확인 필요’ 표현으로 완화해도 될까요?",
        "승소 가능성, 범죄 성립, 손해액 등 판단 근거를 보강할 자료가 있나요?",
        "문서에 확정적 결론이 아니라 검토 의견 형태로 작성해도 될까요?",
      ];

    case "UNCLASSIFIED":
      return [
        "해당 내용을 뒷받침할 수 있는 원자료가 있나요?",
        "사건 기록, 인터뷰 답변 또는 첨부자료에 근거를 추가해 주시겠습니까?",
        "확인되지 않은 부분은 ‘확인 필요’ 또는 ‘자료 보완 필요’로 표시해도 될까요?",
      ];
  }
}

export function buildGuardrailViolationSuggestions(
  issues: readonly string[],
): GuardrailSuggestion[] {
  return issues.map((issue) => {
    const type = classifyGuardrailViolationIssue(issue);

    return {
      type,
      issue,
      suggestedQuestions: buildSuggestedQuestionsForGuardrailViolation(type),
    };
  });
}