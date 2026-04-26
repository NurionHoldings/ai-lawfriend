import type { CaseStatus, UserRole } from "@prisma/client";

/**
 * 사건 상태 정의서 — Prisma `CaseStatus` (라이프사이클) 기준
 */
export type CaseStatusMeta = {
  status: CaseStatus;
  label: string;
  description: string;
  editableBy: UserRole[];
  next: CaseStatus[];
};

const OWNER_LAWYER_ADMIN: UserRole[] = [
  "USER",
  "LAWYER",
  "ADMIN",
  "SUPER_ADMIN",
];

const STATUS_META: Record<CaseStatus, CaseStatusMeta> = {
  CREATED: {
    status: "CREATED",
    label: "사건 생성",
    description: "사건이 접수되었습니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["INTAKE_PENDING", "IN_INTERVIEW", "CLOSED", "HOLD"],
  },
  INTAKE_PENDING: {
    status: "INTAKE_PENDING",
    label: "접수 보완 필요",
    description: "접수 정보 보완이 필요합니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["CREATED", "IN_INTERVIEW", "CLOSED", "HOLD"],
  },
  IN_INTERVIEW: {
    status: "IN_INTERVIEW",
    label: "인터뷰 진행 중",
    description: "인터뷰가 진행 중입니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["INTERVIEW_DONE", "CREATED", "CLOSED", "HOLD"],
  },
  INTERVIEW_DONE: {
    status: "INTERVIEW_DONE",
    label: "인터뷰 완료",
    description: "인터뷰가 완료되었습니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["DRAFTING", "IN_INTERVIEW", "CLOSED", "HOLD"],
  },
  DRAFTING: {
    status: "DRAFTING",
    label: "문서 작성 중",
    description: "문서 초안이 작성 중입니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["REVIEW_PENDING", "INTERVIEW_DONE", "CLOSED", "HOLD"],
  },
  REVIEW_PENDING: {
    status: "REVIEW_PENDING",
    label: "검토 대기",
    description: "검토 대기 중입니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["APPROVED", "DRAFTING", "CLOSED", "HOLD"],
  },
  APPROVED: {
    status: "APPROVED",
    label: "승인 완료",
    description: "승인이 완료되었습니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["DELIVERED", "REVIEW_PENDING", "CLOSED"],
  },
  DELIVERED: {
    status: "DELIVERED",
    label: "전달 완료",
    description: "의뢰인에게 전달되었습니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["CLOSED", "APPROVED"],
  },
  CLOSED: {
    status: "CLOSED",
    label: "종결",
    description: "사건이 종결되었습니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["IN_INTERVIEW", "CREATED", "APPROVED"],
  },
  HOLD: {
    status: "HOLD",
    label: "보류",
    description: "사건이 보류되었습니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["IN_INTERVIEW", "CREATED", "CLOSED"],
  },
  REJECTED: {
    status: "REJECTED",
    label: "반려",
    description: "수임이 거절되었습니다.",
    editableBy: OWNER_LAWYER_ADMIN,
    next: ["CREATED", "IN_INTERVIEW", "CLOSED"],
  },
  DELETED: {
    status: "DELETED",
    label: "삭제",
    description: "삭제(soft delete) 처리된 사건입니다.",
    editableBy: ["ADMIN", "SUPER_ADMIN"],
    next: [],
  },
};

export function getCaseStatusMeta(status: CaseStatus): CaseStatusMeta {
  return STATUS_META[status];
}

export function getCaseStatusLabel(status: string): string {
  const upper = status.toUpperCase();
  if (upper in STATUS_META) {
    return STATUS_META[upper as CaseStatus].label;
  }
  return status;
}

export function listNextCaseStatuses(from: CaseStatus): CaseStatus[] {
  return [...STATUS_META[from].next];
}

export function canTransitionCaseStatus(from: CaseStatus, to: CaseStatus): boolean {
  if (from === to) return true;
  return STATUS_META[from].next.includes(to);
}

export function canEditCaseStatusByRole(
  role: UserRole,
  from: CaseStatus,
  to: CaseStatus,
): boolean {
  if (!canTransitionCaseStatus(from, to)) return false;

  if (role === "SUPER_ADMIN" || role === "ADMIN") return true;

  if (role === "STAFF") {
    return (
      from !== "DELETED" &&
      to !== "DELETED" &&
      (from === "IN_INTERVIEW" ||
        from === "CREATED" ||
        from === "CLOSED" ||
        from === "DRAFTING" ||
        from === "REVIEW_PENDING")
    );
  }

  if (role === "LAWYER" || role === "USER") {
    return (
      from !== "DELETED" &&
      to !== "DELETED" &&
      STATUS_META[to].editableBy.includes(role)
    );
  }

  return false;
}

export function exportCaseStatusDefinitionsSnapshot() {
  return Object.values(STATUS_META);
}
