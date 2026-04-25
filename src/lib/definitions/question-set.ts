import { z } from "zod";
import {
  ConditionOperatorEnum,
  DocumentTypeEnum,
  QuestionInputTypeEnum,
  UserRoleEnum,
} from "./common";

export const QuestionSetStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type QuestionSetStatus = z.infer<typeof QuestionSetStatusEnum>;

/** 카탈로그 상태(DB `catalogStatus` / 정의서 `status`) UI 표시명 */
export const QUESTION_SET_CATALOG_STATUS_LABELS: Record<QuestionSetStatus, string> = {
  DRAFT: "초안",
  PUBLISHED: "게시됨",
  ARCHIVED: "보관됨",
};

export const QuestionCategoryEnum = z.enum([
  "BASIC_INFO",
  "CASE_FACT",
  "TIMELINE",
  "EVIDENCE",
  "DAMAGE",
  "REQUEST",
  "DEFENSE",
  "OTHER",
]);
export type QuestionCategory = z.infer<typeof QuestionCategoryEnum>;

export const QuestionVisibilityEnum = z.enum([
  "ALL",
  "ADMIN_ONLY",
  "LAWYER_ONLY",
  "STAFF_ONLY",
  "CLIENT_ONLY",
]);
export type QuestionVisibility = z.infer<typeof QuestionVisibilityEnum>;

export const QuestionOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
});

export const QuestionConditionSchema = z.object({
  sourceQuestionKey: z.string().min(1),
  operator: ConditionOperatorEnum,
  value: z.any().optional(),
});

export type QuestionCondition = z.infer<typeof QuestionConditionSchema>;

export const ParagraphMappingSchema = z.object({
  documentType: DocumentTypeEnum,
  templateSectionKey: z.string().min(1),
  paragraphKey: z.string().min(1),
  weight: z.number().min(0).max(1).default(1),
  required: z.boolean().default(false),
  transform: z
    .enum(["RAW", "JOIN_LINES", "DATE_RANGE_SUMMARY", "TIMELINE_SUMMARY", "BULLET_LIST"])
    .default("RAW"),
});

export type ParagraphMapping = z.infer<typeof ParagraphMappingSchema>;

export const QuestionDefinitionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  inputType: QuestionInputTypeEnum,
  category: QuestionCategoryEnum,
  required: z.boolean().default(false),
  order: z.number().int().nonnegative(),
  visibility: QuestionVisibilityEnum.default("ALL"),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(QuestionOptionSchema).default([]),
  conditions: z.array(QuestionConditionSchema).default([]),
  paragraphMappings: z.array(ParagraphMappingSchema).default([]),
  tags: z.array(z.string()).default([]),
});

export type QuestionDefinition = z.infer<typeof QuestionDefinitionSchema>;

export const QuestionSectionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
  /** 편집 중 빈 섹션·초안 저장을 허용 (게시 전 검증은 별도) */
  questions: z.array(QuestionDefinitionSchema).default([]),
});

export type QuestionSection = z.infer<typeof QuestionSectionSchema>;

export const QuestionSetDefinitionSchema = z.object({
  version: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: QuestionSetStatusEnum.default("DRAFT"),
  supportedDocumentTypes: z.array(DocumentTypeEnum).min(1),
  visibleToRoles: z.array(UserRoleEnum).min(1),
  sections: z.array(QuestionSectionSchema).default([]),
});

export type QuestionSetDefinition = z.infer<typeof QuestionSetDefinitionSchema>;

export type InterviewAnswerMap = Record<string, unknown>;

function compareValue(
  actualValue: unknown,
  operator: z.infer<typeof ConditionOperatorEnum>,
  expectedValue?: unknown,
): boolean {
  switch (operator) {
    case "EQ":
      return actualValue === expectedValue;
    case "NEQ":
      return actualValue !== expectedValue;
    case "IN":
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
    case "NOT_IN":
      return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
    case "GT":
      return Number(actualValue) > Number(expectedValue);
    case "GTE":
      return Number(actualValue) >= Number(expectedValue);
    case "LT":
      return Number(actualValue) < Number(expectedValue);
    case "LTE":
      return Number(actualValue) <= Number(expectedValue);
    case "CONTAINS":
      return String(actualValue ?? "").includes(String(expectedValue ?? ""));
    case "NOT_CONTAINS":
      return !String(actualValue ?? "").includes(String(expectedValue ?? ""));
    case "IS_TRUE":
      return actualValue === true;
    case "IS_FALSE":
      return actualValue === false;
    case "IS_EMPTY":
      return (
        actualValue == null ||
        actualValue === "" ||
        (Array.isArray(actualValue) && actualValue.length === 0)
      );
    case "IS_NOT_EMPTY":
      return !(
        actualValue == null ||
        actualValue === "" ||
        (Array.isArray(actualValue) && actualValue.length === 0)
      );
    default:
      return false;
  }
}

export function isQuestionVisible(question: QuestionDefinition, answers: InterviewAnswerMap): boolean {
  if (!question.conditions.length) return true;

  return question.conditions.every((condition) => {
    const actual = answers[condition.sourceQuestionKey];
    return compareValue(actual, condition.operator, condition.value);
  });
}

export function getVisibleQuestions(
  questionSet: QuestionSetDefinition,
  answers: InterviewAnswerMap,
): QuestionDefinition[] {
  return questionSet.sections
    .flatMap((section) => section.questions)
    .filter((question) => isQuestionVisible(question, answers))
    .sort((a, b) => a.order - b.order);
}
