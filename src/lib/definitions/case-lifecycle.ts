import { z } from "zod";
import type { CaseStatus } from "./case-status";
import type { UserRole } from "./common";

export const LifecycleActionEnum = z.enum([
  "SUBMIT_INTAKE",
  "START_INTERVIEW",
  "COMPLETE_INTERVIEW",
  "GENERATE_DRAFT",
  "REQUEST_REVIEW",
  "APPROVE_DOCUMENT",
  "DELIVER_DOCUMENT",
  "CLOSE_CASE",
  "PUT_ON_HOLD",
  "RESUME_CASE",
  "REJECT_CASE",
  "REOPEN_CASE",
]);

export type LifecycleAction = z.infer<typeof LifecycleActionEnum>;

export type CaseTransitionRule = {
  from: CaseStatus[];
  to: CaseStatus;
  action: LifecycleAction;
  allowedRoles: UserRole[];
  requires?: {
    interviewCompleted?: boolean;
    hasDraftDocument?: boolean;
    hasApprovedDocument?: boolean;
    reasonRequired?: boolean;
  };
};

export const CASE_TRANSITIONS: CaseTransitionRule[] = [
  {
    from: ["CREATED", "INTAKE_PENDING"],
    to: "IN_INTERVIEW",
    action: "START_INTERVIEW",
    allowedRoles: ["ADMIN", "LAWYER", "STAFF"],
  },
  {
    from: ["IN_INTERVIEW"],
    to: "INTERVIEW_DONE",
    action: "COMPLETE_INTERVIEW",
    allowedRoles: ["ADMIN", "LAWYER", "STAFF"],
    /** 인터뷰 완료 여부는 completeCaseInterviewService(필수 응답 검증)에서 판단한다. */
  },
  {
    from: ["INTERVIEW_DONE"],
    to: "DRAFTING",
    action: "GENERATE_DRAFT",
    allowedRoles: ["ADMIN", "LAWYER", "STAFF"],
    requires: { interviewCompleted: true },
  },
  {
    from: ["DRAFTING"],
    to: "REVIEW_PENDING",
    action: "REQUEST_REVIEW",
    allowedRoles: ["ADMIN", "LAWYER", "STAFF"],
    requires: { hasDraftDocument: true },
  },
  {
    from: ["REVIEW_PENDING"],
    to: "APPROVED",
    action: "APPROVE_DOCUMENT",
    allowedRoles: ["ADMIN", "LAWYER"],
    requires: { hasApprovedDocument: true },
  },
  {
    from: ["APPROVED"],
    to: "DELIVERED",
    action: "DELIVER_DOCUMENT",
    allowedRoles: ["ADMIN", "LAWYER", "STAFF"],
    requires: { hasApprovedDocument: true },
  },
  {
    from: ["DELIVERED"],
    to: "CLOSED",
    action: "CLOSE_CASE",
    allowedRoles: ["ADMIN", "LAWYER"],
  },
  {
    from: [
      "CREATED",
      "INTAKE_PENDING",
      "IN_INTERVIEW",
      "INTERVIEW_DONE",
      "DRAFTING",
      "REVIEW_PENDING",
      "APPROVED",
      "DELIVERED",
    ],
    to: "HOLD",
    action: "PUT_ON_HOLD",
    allowedRoles: ["ADMIN", "LAWYER", "STAFF"],
    requires: { reasonRequired: true },
  },
  {
    from: ["HOLD"],
    to: "IN_INTERVIEW",
    action: "RESUME_CASE",
    allowedRoles: ["ADMIN", "LAWYER", "STAFF"],
  },
  {
    from: [
      "CREATED",
      "INTAKE_PENDING",
      "IN_INTERVIEW",
      "INTERVIEW_DONE",
      "DRAFTING",
      "REVIEW_PENDING",
    ],
    to: "REJECTED",
    action: "REJECT_CASE",
    allowedRoles: ["ADMIN", "LAWYER"],
    requires: { reasonRequired: true },
  },
  {
    from: ["REJECTED", "CLOSED"],
    to: "IN_INTERVIEW",
    action: "REOPEN_CASE",
    allowedRoles: ["ADMIN", "LAWYER"],
    requires: { reasonRequired: true },
  },
];

export type TransitionCheckInput = {
  currentStatus: CaseStatus;
  action: LifecycleAction;
  actorRole: UserRole;
  facts?: {
    interviewCompleted?: boolean;
    hasDraftDocument?: boolean;
    hasApprovedDocument?: boolean;
    reason?: string | null;
  };
};

export function getAvailableTransitions(status: CaseStatus, role: UserRole) {
  return CASE_TRANSITIONS.filter(
    (rule) => rule.from.includes(status) && rule.allowedRoles.includes(role),
  );
}

export function evaluateCaseTransition(input: TransitionCheckInput) {
  const matched = CASE_TRANSITIONS.find(
    (rule) =>
      rule.action === input.action &&
      rule.from.includes(input.currentStatus) &&
      rule.allowedRoles.includes(input.actorRole),
  );

  if (!matched) {
    return { ok: false, reason: "허용되지 않은 상태 전이입니다." } as const;
  }

  if (matched.requires?.interviewCompleted && !input.facts?.interviewCompleted) {
    return { ok: false, reason: "인터뷰 완료 조건이 충족되지 않았습니다." } as const;
  }

  if (matched.requires?.hasDraftDocument && !input.facts?.hasDraftDocument) {
    return { ok: false, reason: "초안 문서가 존재하지 않습니다." } as const;
  }

  if (matched.requires?.hasApprovedDocument && !input.facts?.hasApprovedDocument) {
    return { ok: false, reason: "승인 문서가 존재하지 않습니다." } as const;
  }

  if (matched.requires?.reasonRequired && !input.facts?.reason?.trim()) {
    return { ok: false, reason: "사유 입력이 필요합니다." } as const;
  }

  return { ok: true, nextStatus: matched.to, rule: matched } as const;
}
