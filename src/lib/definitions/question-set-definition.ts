export type QuestionSetCategory = "COMMON" | "CRIMINAL" | "CIVIL" | "FAMILY";

export type QuestionSetItem = {
  id: string;
  order: number;
  key: string;
  text: string;
  helperText?: string;
  required?: boolean;
  category: QuestionSetCategory;
};

const COMMON_QUESTIONS: QuestionSetItem[] = [
  {
    id: "AID-QS-001-01",
    order: 1,
    key: "case_background",
    text: "문제가 처음 시작된 배경을 시간순으로 설명해 주세요.",
    helperText: "언제, 누구와, 어떤 이유로 시작되었는지 적어주세요.",
    required: true,
    category: "COMMON",
  },
  {
    id: "AID-QS-001-02",
    order: 2,
    key: "current_status",
    text: "현재 사건은 어디까지 진행되었나요?",
    helperText: "상대방 대응, 신고, 소송, 합의 시도 여부 등을 적어주세요.",
    required: true,
    category: "COMMON",
  },
  {
    id: "AID-QS-001-03",
    order: 3,
    key: "people_involved",
    text: "관련된 사람들을 정리해 주세요.",
    helperText: "본인, 상대방, 제3자, 목격자 등 역할별로 적어주세요.",
    required: true,
    category: "COMMON",
  },
  {
    id: "AID-QS-001-04",
    order: 4,
    key: "evidence_summary",
    text: "현재 가지고 있는 자료나 증거를 정리해 주세요.",
    helperText: "문자, 카톡, 녹취, 송금내역, 계약서, 사진 등을 적어주세요.",
    required: true,
    category: "COMMON",
  },
  {
    id: "AID-QS-001-05",
    order: 5,
    key: "desired_result",
    text: "변호사 상담을 통해 원하는 결과는 무엇인가요?",
    helperText: "합의, 형사대응, 민사청구, 이혼/양육권 등 목표를 적어주세요.",
    required: true,
    category: "COMMON",
  },
];

const CRIMINAL_QUESTIONS: QuestionSetItem[] = [
  {
    id: "AID-QS-002-01",
    order: 101,
    key: "criminal_allegation",
    text: "문제가 된 행위 또는 혐의 내용을 알고 있는 범위에서 적어주세요.",
    required: true,
    category: "CRIMINAL",
  },
  {
    id: "AID-QS-002-02",
    order: 102,
    key: "investigation_stage",
    text: "수사기관 연락, 조사 일정, 출석요구 등 현재 수사 단계가 있나요?",
    required: true,
    category: "CRIMINAL",
  },
];

const CIVIL_QUESTIONS: QuestionSetItem[] = [
  {
    id: "AID-QS-003-01",
    order: 201,
    key: "civil_contract_or_relationship",
    text: "상대방과의 계약 또는 관계를 설명해 주세요.",
    required: true,
    category: "CIVIL",
  },
  {
    id: "AID-QS-003-02",
    order: 202,
    key: "civil_damage_or_claim",
    text: "금전, 손해, 미이행 내용 등 청구하려는 핵심 내용을 적어주세요.",
    required: true,
    category: "CIVIL",
  },
];

const FAMILY_QUESTIONS: QuestionSetItem[] = [
  {
    id: "AID-QS-004-01",
    order: 301,
    key: "family_relationship",
    text: "가족관계와 현재 분쟁 배경을 설명해 주세요.",
    required: true,
    category: "FAMILY",
  },
  {
    id: "AID-QS-004-02",
    order: 302,
    key: "family_children_property",
    text: "자녀, 재산, 양육, 부양 등 핵심 쟁점을 적어주세요.",
    required: true,
    category: "FAMILY",
  },
];

export const QUESTION_SET_DEFINITIONS: Record<
  QuestionSetCategory,
  QuestionSetItem[]
> = {
  COMMON: COMMON_QUESTIONS,
  CRIMINAL: CRIMINAL_QUESTIONS,
  CIVIL: CIVIL_QUESTIONS,
  FAMILY: FAMILY_QUESTIONS,
};

export function resolveQuestionSetCategory(
  caseCategory?: string | null,
): QuestionSetCategory {
  const normalized = (caseCategory ?? "").trim().toLowerCase();

  if (["형사", "criminal"].includes(normalized)) return "CRIMINAL";
  if (["민사", "civil"].includes(normalized)) return "CIVIL";
  if (["가사", "family"].includes(normalized)) return "FAMILY";
  return "COMMON";
}

export function getQuestionSetByCaseCategory(caseCategory?: string | null) {
  const derived = resolveQuestionSetCategory(caseCategory);
  return [
    ...QUESTION_SET_DEFINITIONS.COMMON,
    ...(derived === "COMMON" ? [] : QUESTION_SET_DEFINITIONS[derived]),
  ].sort((a, b) => a.order - b.order);
}

export function exportQuestionSetDefinitionsSnapshot() {
  return {
    common: QUESTION_SET_DEFINITIONS.COMMON,
    criminal: QUESTION_SET_DEFINITIONS.CRIMINAL,
    civil: QUESTION_SET_DEFINITIONS.CIVIL,
    family: QUESTION_SET_DEFINITIONS.FAMILY,
  };
}
