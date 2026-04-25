export type GuardRole = "ADMIN" | "LAWYER" | "STAFF" | "CLIENT";

type GuardInput = {
  role: GuardRole;
  caseStatus: string;
  facts: {
    interviewCompleted: boolean;
    hasDraftDocument: boolean;
    hasApprovedDocument: boolean;
    hasLockedDocument?: boolean;
  };
};

/**
 * 사건 상단 액션 버튼 노출 — PATCH /api/cases/:id/status 의 LifecycleAction 과 동일한 전제.
 * 문서 승인은 /api/legal-documents/:id/approve 등 별도 API에서 처리한다.
 * `DELETED`·서버 `getAllowedLifecycleActionsForCase`와 같이 **전이 없음(전부 숨김)**.
 */
export function getAllowedCaseActions(input: GuardInput) {
  if (input.caseStatus === "DELETED") {
    return {
      START_INTERVIEW: false,
      RESUME_FROM_HOLD: false,
      COMPLETE_INTERVIEW: false,
      GENERATE_DRAFT: false,
      REQUEST_REVIEW: false,
      DELIVER_DOCUMENT: false,
      CLOSE_CASE: false,
      PUT_ON_HOLD: false,
      REJECT_CASE: false,
      REOPEN_CASE: false,
    };
  }

  const canManage = ["ADMIN", "LAWYER", "STAFF"].includes(input.role);
  const canApprove = ["ADMIN", "LAWYER"].includes(input.role);
  const { caseStatus, facts } = input;

  return {
    START_INTERVIEW:
      canManage && (caseStatus === "CREATED" || caseStatus === "INTAKE_PENDING"),

    /** HOLD → IN_INTERVIEW (RESUME_CASE) */
    RESUME_FROM_HOLD: canManage && caseStatus === "HOLD",

    /** 인터뷰가 아직 완료 처리되지 않은 경우에만 노출 (완료 후에는 POST /interview/complete로 종료) */
    COMPLETE_INTERVIEW:
      canManage && caseStatus === "IN_INTERVIEW" && !facts.interviewCompleted,

    GENERATE_DRAFT:
      canManage && caseStatus === "INTERVIEW_DONE" && facts.interviewCompleted,

    REQUEST_REVIEW:
      canManage && caseStatus === "DRAFTING" && facts.hasDraftDocument,

    DELIVER_DOCUMENT:
      canManage && caseStatus === "APPROVED" && facts.hasApprovedDocument,

    CLOSE_CASE: canApprove && caseStatus === "DELIVERED",

    PUT_ON_HOLD: canManage && !["CLOSED", "REJECTED"].includes(caseStatus),

    REJECT_CASE:
      canApprove &&
      [
        "CREATED",
        "INTAKE_PENDING",
        "IN_INTERVIEW",
        "INTERVIEW_DONE",
        "DRAFTING",
        "REVIEW_PENDING",
      ].includes(caseStatus),

    REOPEN_CASE: canApprove && ["REJECTED", "CLOSED"].includes(caseStatus),
  };
}

export type AllowedCaseActions = ReturnType<typeof getAllowedCaseActions>;
