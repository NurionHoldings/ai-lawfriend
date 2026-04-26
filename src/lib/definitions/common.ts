import { z } from "zod";

/**
 * 질문셋·카탈로그 `visibleToRoles` 등에 쓰는 역할 문자열(의뢰인 = `CLIENT`).
 * DB·세션은 `@prisma/client` `UserRole`(동일 인물은 `USER`) — 경계 매핑은 `@/lib/role-map`.
 */
export const UserRoleEnum = z.enum(["ADMIN", "LAWYER", "STAFF", "CLIENT"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const DocumentTypeEnum = z.enum(["STATEMENT", "OPINION", "CONSULT_NOTE"]);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

/** 문서 유형(`DocumentType`) UI 표시명 — 템플릿·초안 선택 등과 통일 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  STATEMENT: "진술서",
  OPINION: "의견서",
  CONSULT_NOTE: "상담 노트",
};

export const ParagraphStatusEnum = z.enum([
  "DRAFT",
  "REVIEW_REQUIRED",
  "APPROVED",
  "LOCKED",
]);
export type ParagraphStatus = z.infer<typeof ParagraphStatusEnum>;

export const ConditionOperatorEnum = z.enum([
  "EQ",
  "NEQ",
  "IN",
  "NOT_IN",
  "GT",
  "GTE",
  "LT",
  "LTE",
  "CONTAINS",
  "NOT_CONTAINS",
  "IS_TRUE",
  "IS_FALSE",
  "IS_EMPTY",
  "IS_NOT_EMPTY",
]);
export type ConditionOperator = z.infer<typeof ConditionOperatorEnum>;

export const QuestionInputTypeEnum = z.enum([
  "SHORT_TEXT",
  "LONG_TEXT",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "NUMBER",
  "DATE",
  "DATETIME",
  "BOOLEAN",
  "FILE",
]);
export type QuestionInputType = z.infer<typeof QuestionInputTypeEnum>;

export const AuditActionEnum = z.enum([
  "CASE_CREATED",
  "CASE_UPDATED",
  "CASE_STATUS_CHANGED",
  "CASE_ASSIGNED",
  "INTERVIEW_STARTED",
  "INTERVIEW_COMPLETED",
  "QUESTION_SET_CHANGED",
  "DOCUMENT_DRAFT_CREATED",
  "DOCUMENT_UPDATED",
  "DOCUMENT_APPROVED",
  "DOCUMENT_LOCKED",
  "DOCUMENT_RESTORED",
  "PARAGRAPH_REGENERATED",
  "PARAGRAPH_RESTORED",
  "PARAGRAPH_LOCKED",
  "ATTACHMENT_UPLOADED",
  "ATTACHMENT_REMOVED",
]);
export type AuditAction = z.infer<typeof AuditActionEnum>;

export const IdSchema = z.string().min(1);

export const SortDirectionEnum = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof SortDirectionEnum>;
