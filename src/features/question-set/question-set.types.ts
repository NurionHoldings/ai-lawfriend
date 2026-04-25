import type { QuestionVisibility } from "@/lib/definitions/question-set";

export type DocumentTemplateType =
  | "STATEMENT"
  | "LEGAL_OPINION"
  | "CONSULTATION_NOTE";

export type QuestionSetQuestionType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "MULTI_SELECT"
  | "BOOLEAN";

export type QuestionConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "INCLUDES"
  | "NOT_INCLUDES"
  | "IS_FILLED"
  | "IS_EMPTY";

export type QuestionCondition = {
  id: string;
  sourceQuestionKey: string;
  operator: QuestionConditionOperator;
  value?: string | number | boolean | Array<string | number | boolean> | null;
};

export type QuestionVisibilityRule = {
  mode: "ALL" | "ANY";
  conditions: QuestionCondition[];
};

export type QuestionOption = {
  label: string;
  value: string;
};

export type QuestionDocumentMappingRule = {
  enabled: boolean;
  sectionTitle?: string | null;
  paragraphLabel?: string | null;
  order?: number | null;
  format?: "INLINE" | "BLOCK" | "BULLET";
  emptyPolicy?: "SKIP" | "BLANK";
  prefix?: string | null;
  suffix?: string | null;
};

export type QuestionDocumentMapping = QuestionDocumentMappingRule & {
  templateOverrides?: Partial<Record<DocumentTemplateType, QuestionDocumentMappingRule | null>>;
};

export type QuestionSetQuestion = {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  type: QuestionSetQuestionType;
  required: boolean;
  order: number;
  placeholder?: string | null;
  helpText?: string | null;
  options?: QuestionOption[];
  /**
   * Zod `QuestionDefinition.visibility` → 게시/투영 `projectDefinitionJsonToQuestions`가 채움.
   * 미기재(레거시 JSON) = `ALL` 취급(`interview-catalog-visibility`).
   */
  audience?: QuestionVisibility;
  visibilityRule?: QuestionVisibilityRule | null;
  active?: boolean;
  documentMapping?: QuestionDocumentMapping | null;
};

export type QuestionSetEntity = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  /** Zod/DB `visibleToRoles` (ADMIN, LAWYER, STAFF, CLIENT). 비어 있으면 런타임에서 전체 허용 */
  visibleToRoles?: string[];
  questions: QuestionSetQuestion[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type InterviewAnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

export type InterviewAnswerMap = Record<string, InterviewAnswerValue>;

export type ResolvedInterviewQuestion = QuestionSetQuestion & {
  isVisible: boolean;
  isAnswered: boolean;
};

export type InterviewFlowPayload = {
  questionSetId: string;
  questionSetName: string;
  questions: ResolvedInterviewQuestion[];
  visibleQuestions: ResolvedInterviewQuestion[];
  answers: InterviewAnswerMap;
  nextQuestionKey: string | null;
  progress: {
    totalVisible: number;
    answeredVisible: number;
    percent: number;
  };
};
