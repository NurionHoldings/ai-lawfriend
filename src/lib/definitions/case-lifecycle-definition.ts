import type { CaseStatus } from "@prisma/client";

/**
 * 사건 라이프사이클 정의서 1차본 — CAS-3xxx 단계 코드.
 * Prisma `CaseStatus`와 N:1 매핑으로 둡니다.
 */
export type LifecyclePhaseCode =
  | "CAS-3100"
  | "CAS-3200"
  | "CAS-3300"
  | "CAS-3400"
  | "CAS-3500"
  | "CAS-3600"
  | "CAS-3700";

export type CaseLifecycleDefinition = {
  code: LifecyclePhaseCode;
  title: string;
  description: string;
  primaryStatuses: CaseStatus[];
};

const LIFECYCLES: CaseLifecycleDefinition[] = [
  {
    code: "CAS-3100",
    title: "사건 생성",
    description: "의뢰인 등록·초기 접수",
    primaryStatuses: ["CREATED", "INTAKE_PENDING"],
  },
  {
    code: "CAS-3200",
    title: "AI 인터뷰 및 구조화",
    description: "자료 수집·구조화",
    primaryStatuses: ["IN_INTERVIEW", "INTERVIEW_DONE"],
  },
  {
    code: "CAS-3300",
    title: "사건 제출",
    description: "형식 제출·내부 큐 진입",
    primaryStatuses: ["DRAFTING", "REVIEW_PENDING"],
  },
  {
    code: "CAS-3400",
    title: "변호사 검토",
    description: "담당 변호사 검토·피드백",
    primaryStatuses: ["REVIEW_PENDING", "APPROVED"],
  },
  {
    code: "CAS-3500",
    title: "보완 요청",
    description: "보완·재제출 루프",
    primaryStatuses: ["INTAKE_PENDING", "INTERVIEW_DONE", "DRAFTING"],
  },
  {
    code: "CAS-3600",
    title: "상담/수임 준비",
    description: "상담·수임 전 단계",
    primaryStatuses: ["IN_INTERVIEW", "DELIVERED", "HOLD"],
  },
  {
    code: "CAS-3700",
    title: "종결/보관",
    description: "사건 종결·보관",
    primaryStatuses: ["CLOSED", "DELETED", "REJECTED"],
  },
];

export function findLifecycleByStatus(
  status: CaseStatus,
): CaseLifecycleDefinition[] {
  return LIFECYCLES.filter((l) => l.primaryStatuses.includes(status));
}

export function exportCaseLifecycleDefinitionsSnapshot() {
  return LIFECYCLES;
}
