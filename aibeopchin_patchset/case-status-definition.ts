import type { CaseStatus, UserRole } from "@prisma/client";

export type CaseLifecycleStage =
  | "INTAKE"
  | "STRUCTURING"
  | "REVIEW"
  | "CLOSED"
  | "ARCHIVED";

export type CaseStatusMeta = {
  code: string;
  label: string;
  description: string;
  stage: CaseLifecycleStage;
  sortOrder: number;
  visible: boolean;
  editableBy: UserRole[];
  next: CaseStatus[];
};

export const CASE_STATUS_META: Record<CaseStatus, CaseStatusMeta> = {
  OPEN: {
    code: "AID-ST-003-OPEN",
    label: "접수",
    description: "사건이 생성되어 기본정보와 초기 자료를 수집하는 단계입니다.",
    stage: "INTAKE",
    sortOrder: 10,
    visible: true,
    editableBy: ["USER", "LAWYER", "ADMIN", "SUPER_ADMIN"],
    next: ["IN_PROGRESS", "CLOSED", "DELETED"],
  },
  IN_PROGRESS: {
    code: "AID-ST-003-IN_PROGRESS",
    label: "진행중",
    description: "AI 인터뷰, 요약, 문서 초안, 변호사 검토와 보완이 진행되는 단계입니다.",
    stage: "REVIEW",
    sortOrder: 20,
    visible: true,
    editableBy: ["USER", "LAWYER", "ADMIN", "SUPER_ADMIN"],
    next: ["CLOSED", "DELETED"],
  },
  CLOSED: {
    code: "AID-ST-003-CLOSED",
    label: "종결",
    description: "상담 또는 사건 정리가 완료되어 추가 편집이 제한되는 단계입니다.",
    stage: "CLOSED",
    sortOrder: 30,
    visible: true,
    editableBy: ["LAWYER", "ADMIN", "SUPER_ADMIN"],
    next: ["DELETED"],
  },
  DELETED: {
    code: "AID-ST-003-DELETED",
    label: "삭제",
    description: "운영상 숨김 처리된 상태입니다.",
    stage: "ARCHIVED",
    sortOrder: 99,
    visible: false,
    editableBy: ["ADMIN", "SUPER_ADMIN"],
    next: [],
  },
};

export const CASE_STATUS_FILTER_OPTIONS = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;
export type CaseStatusFilterOption = (typeof CASE_STATUS_FILTER_OPTIONS)[number];

export function getCaseStatusMeta(status: CaseStatus | string | null | undefined) {
  if (!status) return null;
  return CASE_STATUS_META[status as CaseStatus] ?? null;
}

export function getCaseStatusLabel(status: CaseStatus | string | null | undefined) {
  return getCaseStatusMeta(status)?.label ?? status ?? "-";
}

export function listNextCaseStatuses(status: CaseStatus) {
  return CASE_STATUS_META[status].next;
}

export function canTransitionCaseStatus(from: CaseStatus, to: CaseStatus) {
  if (from === to) return true;
  return CASE_STATUS_META[from].next.includes(to);
}

export function canEditCaseStatusByRole(status: CaseStatus, role: UserRole) {
  return CASE_STATUS_META[status].editableBy.includes(role);
}
