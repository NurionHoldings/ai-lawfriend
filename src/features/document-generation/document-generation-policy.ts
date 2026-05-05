export const DOCUMENT_GENERATION_POLICIES = {
  NO_UNVERIFIED_FACTS: "NO_UNVERIFIED_FACTS",
} as const;

export type DocumentGenerationPolicy =
  (typeof DOCUMENT_GENERATION_POLICIES)[keyof typeof DOCUMENT_GENERATION_POLICIES];

export type DocumentGenerationGuardrailInput = {
  generationPolicy?: string | null;
  missingWarningFields?: Array<{
    fieldKey: string;
    label: string;
    severity: "WARNING" | "BLOCKING";
    suggestedQuestions?: string[];
  }>;
};

export type DocumentGenerationGuardrail = {
  policy: DocumentGenerationPolicy;
  promptBlock: string;
  warnings: string[];
};

export function resolveDocumentGenerationPolicy(
  generationPolicy?: string | null,
): DocumentGenerationPolicy {
  if (generationPolicy === DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS) {
    return DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS;
  }

  return DOCUMENT_GENERATION_POLICIES.NO_UNVERIFIED_FACTS;
}

export function buildDocumentGenerationGuardrail(
  input: DocumentGenerationGuardrailInput,
): DocumentGenerationGuardrail {
  const policy = resolveDocumentGenerationPolicy(input.generationPolicy);

  const warningLabels =
    input.missingWarningFields
      ?.filter((field) => field.severity === "WARNING")
      .map((field) => `- ${field.label} (${field.fieldKey})`)
      .join("\n") ?? "";

  const warnings =
    input.missingWarningFields
      ?.filter((field) => field.severity === "WARNING")
      .map((field) => field.label) ?? [];

  const warningBlock = warningLabels.length > 0
    ? `
[WARNING 누락 항목]
아래 항목은 문서 생성을 차단하지는 않지만, 본문에 사실처럼 단정하여 삽입하면 안 됩니다.
확인되지 않은 항목은 반드시 "확인 필요" 또는 "자료 보완 필요"로만 표현하십시오.

${warningLabels}
`
    : "";

  return {
    policy,
    warnings,
    promptBlock: `
[문서 생성 정책: ${policy}]

다음 규칙을 반드시 준수하십시오.

1. 사건 기록, 인터뷰 답변, 첨부자료, 공식서식 trace에 존재하지 않는 사실을 새로 만들지 마십시오.
2. 확인되지 않은 증거, 금액, 날짜, 당사자, 주소, 연락처, 행위 내용은 단정하지 마십시오.
3. 확인되지 않은 법령, 조문, 판례, 판례번호, 법률효과를 임의로 생성하지 마십시오.
4. 자료가 부족한 부분은 "확인 필요", "자료 보완 필요", "추가 확인 필요"로 표시하십시오.
5. 추정 가능한 내용이라도 사실처럼 단정하지 말고, "정황상", "추가 확인이 필요하나", "제출 자료 기준으로는"과 같이 구분하십시오.
6. WARNING 누락 항목은 보강 안내로만 사용하고, 문서 본문에 확정 사실처럼 삽입하지 마십시오.
7. 공식서식의 구조와 필드 의미는 유지하되, 비어 있는 필드를 허위로 채우지 마십시오.
8. 사용자에게 유리해 보이는 내용이라도 입력 근거가 없으면 생성하지 마십시오.
9. 법률 판단은 단정하지 말고, 제출 자료 기준의 검토 의견 형태로 작성하십시오.
10. 결과 문서에는 근거가 있는 내용과 보완이 필요한 내용을 명확히 구분하십시오.

${warningBlock}
`.trim(),
  };
}

export type ForbiddenAssertionCheckResult = {
  passed: boolean;
  issues: string[];
};

const FORBIDDEN_ASSERTION_PATTERNS: Array<{
  pattern: RegExp;
  message: string;
}> = [
  {
    pattern: /판례번호\s*[:：]?\s*\d{4}[가-힣A-Za-z]*\d+/,
    message: "검증되지 않은 판례번호로 보이는 표현이 포함되어 있습니다.",
  },
  {
    pattern: /대법원\s+\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*선고/,
    message: "검증되지 않은 대법원 선고일자 표현이 포함되어 있습니다.",
  },
  {
    pattern: /형법\s*제\s*\d+\s*조/,
    message: "법령 조문 표현이 포함되어 있습니다. 입력 근거 확인이 필요합니다.",
  },
  {
    pattern: /민법\s*제\s*\d+\s*조/,
    message: "법령 조문 표현이 포함되어 있습니다. 입력 근거 확인이 필요합니다.",
  },
  {
    pattern: /확실히|명백히|반드시|무조건|100%/,
    message: "과도하게 단정적인 표현이 포함되어 있습니다.",
  },
];

export function checkForbiddenAssertions(
  generatedText: string,
): ForbiddenAssertionCheckResult {
  const normalizedText = generatedText.trim();

  if (normalizedText.length === 0) {
    return {
      passed: true,
      issues: [],
    };
  }

  const issues = FORBIDDEN_ASSERTION_PATTERNS
    .filter(({ pattern }) => pattern.test(normalizedText))
    .map(({ message }) => message);

  return {
    passed: issues.length === 0,
    issues,
  };
}