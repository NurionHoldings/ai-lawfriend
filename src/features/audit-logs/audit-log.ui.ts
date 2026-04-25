export function getActionBadgeClass(action: string) {
  if (action.startsWith("USER_APPROVAL_")) {
    return action.includes("REJECT")
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (action.startsWith("CASE_ATTACHMENT_")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (action.startsWith("CASE_TIMELINE_")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (action.startsWith("CASE_ASSIGNMENT_")) {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  if (action === "CASE_CREATE") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (action === "CASE_UPDATE") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (action === "CASE_SOFT_DELETE") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

/** [079]·[082] 가입 승인·반려 감사 — 목록·모달 공통 */
export function isUserApprovalAuditAction(action: string): boolean {
  return action.startsWith("USER_APPROVAL_");
}

export function readUserApprovalNote(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const v = (metadata as Record<string, unknown>).userApprovalNote;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

/** 목록 행 배경·왼쪽 강조(highlight 링과 겹쳐도 어긋나지 않게 얇게) */
export function userApprovalRowSurfaceClass(action: string): string {
  if (!isUserApprovalAuditAction(action)) return "";
  return action.includes("REJECT")
    ? "border-l-4 border-l-rose-400 bg-rose-50/40"
    : "border-l-4 border-l-emerald-500 bg-emerald-50/35";
}

export function truncateUserApprovalNotePreview(note: string, maxLen = 96): string {
  const t = note.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

export function getEntityTypeBadgeClass(entityType: string) {
  switch (entityType) {
    case "CASE":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "CASE_ATTACHMENT":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CASE_TIMELINE_MEMO":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "CASE_ASSIGNMENT":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export function resolveRelatedCaseId(params: {
  entityType: string;
  entityId: string;
  metadata: unknown;
}) {
  if (params.entityType === "CASE") {
    return params.entityId;
  }

  if (
    params.metadata &&
    typeof params.metadata === "object" &&
    "caseId" in params.metadata
  ) {
    const caseId = (params.metadata as { caseId?: unknown }).caseId;
    if (typeof caseId === "string" && caseId.length > 0) {
      return caseId;
    }
  }

  return null;
}
