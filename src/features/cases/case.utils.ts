import { CASE_STATUS_LABELS, type CaseStatus } from "@/lib/definitions";

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";

  const value = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

/** 사건 `CaseStatus` → [CASE_STATUS_LABELS](./case-status.ts) 기준 표시명 (대소문자 무시 매칭) */
export function statusLabel(status: string) {
  const key = status.toUpperCase();
  if (key in CASE_STATUS_LABELS) {
    return CASE_STATUS_LABELS[key as CaseStatus];
  }
  return status;
}

/** 접수 보완·검토 대기 전용 `/cases/[id]/supplement` 허브([063])로 안내할 수 있는 상태 */
export function isSupplementHubCaseStatus(status: string): boolean {
  const s = status.toUpperCase();
  return s === "INTAKE_PENDING" || s === "REVIEW_PENDING";
}

/** 보완 허브 링크 툴팁용 역할(표시 전용). */
export type SupplementHubUiRole = "ADMIN" | "LAWYER" | "STAFF" | "CLIENT";

/**
 * 보완 안내 링크용 짧은 설명(툴팁·`title`). 표시 전용이며 `case-status.ts` 정의를 바꾸지 않는다.
 * `role`을 넘기면 의뢰인·담당 안내 톤을 맞춘다.
 */
export function supplementHubLinkTitle(
  status: string,
  role?: SupplementHubUiRole,
): string {
  const s = status.toUpperCase();
  if (s === "INTAKE_PENDING") {
    if (role === "CLIENT") {
      return "접수 보완: 수정 → AI 인터뷰 → 사건 상세 「진행 액션」까지 한 줄로 진행";
    }
    if (role === "ADMIN" || role === "LAWYER" || role === "STAFF") {
      return "접수 보완: 대리 입력·의뢰인 안내 모두 같은 순서(수정 → 인터뷰 → 사건 상세 진행 액션)";
    }
    return "접수 보완: 수정 → AI 인터뷰 → 사건 상세 진행 액션";
  }
  if (s === "REVIEW_PENDING") {
    if (role === "CLIENT") {
      return "검토 대기: 담당 검토 중 — 사건 상세에서 타임라인·문서 확인(이 링크는 단계 설명용)";
    }
    return "검토 대기: 사건 상세에서 문서 선택 후 문단 확인·보완(버튼은 화면에 보이는 것만)";
  }
  return "접수 보완·검토 대기 단계 요약 페이지(/supplement)로 이동";
}

/**
 * 보완 허브 URL + 섹션 앵커([101] 선택). INTAKE/REVIEW_PENDING에서 목록·상세와 왕복 시 스크롤 위치 정합.
 */
export function supplementHubHref(
  caseId: string,
  status: string,
  role?: SupplementHubUiRole,
): string {
  const base = `/cases/${caseId}/supplement`;
  const s = status.toUpperCase();
  if (s === "INTAKE_PENDING") return `${base}#supplement-intake`;
  if (s === "REVIEW_PENDING") {
    if (role === "CLIENT") return `${base}#supplement-review-client`;
    return `${base}#supplement-review-staff`;
  }
  return base;
}

/** 허브에서 사건 상세로 돌아갈 때 강조할 영역(진행 액션 vs 문서 목록). */
export function caseDetailHubReturnHref(caseId: string, status: string): string {
  const base = `/cases/${caseId}`;
  const s = status.toUpperCase();
  if (s === "INTAKE_PENDING") return `${base}#case-detail-actions`;
  if (s === "REVIEW_PENDING") return `${base}#case-detail-document-list`;
  return base;
}
