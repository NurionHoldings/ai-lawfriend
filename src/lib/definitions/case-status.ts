import { z } from "zod";

export const CaseStatusEnum = z.enum([
  "CREATED",
  "INTAKE_PENDING",
  "IN_INTERVIEW",
  "INTERVIEW_DONE",
  "DRAFTING",
  "REVIEW_PENDING",
  "APPROVED",
  "DELIVERED",
  "CLOSED",
  "HOLD",
  "REJECTED",
  "DELETED",
]);
export type CaseStatus = z.infer<typeof CaseStatusEnum>;

export const InterviewStatusEnum = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "REOPENED",
]);
export type InterviewStatus = z.infer<typeof InterviewStatusEnum>;

export const DocumentStatusEnum = z.enum([
  "NOT_CREATED",
  "DRAFT",
  "REVIEW_REQUIRED",
  "APPROVED",
  "LOCKED",
  "ARCHIVED",
]);
export type DocumentStatus = z.infer<typeof DocumentStatusEnum>;

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  CREATED: "사건 생성",
  INTAKE_PENDING: "접수 보완 필요",
  IN_INTERVIEW: "인터뷰 진행 중",
  INTERVIEW_DONE: "인터뷰 완료",
  DRAFTING: "문서 작성 중",
  REVIEW_PENDING: "검토 대기",
  APPROVED: "승인 완료",
  DELIVERED: "전달 완료",
  CLOSED: "종결",
  HOLD: "보류",
  REJECTED: "반려",
  DELETED: "삭제",
};

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  NOT_STARTED: "미시작",
  IN_PROGRESS: "진행 중",
  COMPLETED: "완료",
  REOPENED: "재개",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  NOT_CREATED: "미생성",
  DRAFT: "초안",
  REVIEW_REQUIRED: "검토 필요",
  APPROVED: "승인 완료",
  LOCKED: "잠금",
  ARCHIVED: "보관",
};
