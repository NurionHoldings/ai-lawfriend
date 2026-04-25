import type { CaseStatus } from "@prisma/client";

export type CaseLifecycleDefinition = {
  code: string;
  title: string;
  description: string;
  primaryStatus: CaseStatus;
  allowedStatuses: CaseStatus[];
  actors: string[];
  aiInvolvement: "NONE" | "LOW" | "MEDIUM" | "HIGH";
};

export const CASE_LIFECYCLE_DEFINITIONS: CaseLifecycleDefinition[] = [
  {
    code: "CAS-3100",
    title: "사건 생성",
    description: "의뢰인 또는 변호사가 사건 기본정보를 등록하는 시작 단계입니다.",
    primaryStatus: "OPEN",
    allowedStatuses: ["OPEN"],
    actors: ["USER", "LAWYER"],
    aiInvolvement: "LOW",
  },
  {
    code: "CAS-3200",
    title: "AI 인터뷰 및 구조화",
    description: "답변을 구조화하고 누락정보를 확인하며 사건 정보를 정리하는 단계입니다.",
    primaryStatus: "IN_PROGRESS",
    allowedStatuses: ["OPEN", "IN_PROGRESS"],
    actors: ["USER", "AI"],
    aiInvolvement: "HIGH",
  },
  {
    code: "CAS-3300",
    title: "사건 제출",
    description: "의뢰인이 입력을 마치고 변호사 검토 단계로 넘기는 단계입니다.",
    primaryStatus: "IN_PROGRESS",
    allowedStatuses: ["IN_PROGRESS"],
    actors: ["USER"],
    aiInvolvement: "MEDIUM",
  },
  {
    code: "CAS-3400",
    title: "변호사 검토",
    description: "요약, 문서 초안, 첨부자료를 검토하고 필요한 보완을 요청하는 단계입니다.",
    primaryStatus: "IN_PROGRESS",
    allowedStatuses: ["IN_PROGRESS"],
    actors: ["LAWYER", "ADMIN"],
    aiInvolvement: "MEDIUM",
  },
  {
    code: "CAS-3500",
    title: "보완 요청",
    description: "누락 정보 또는 추가 자료를 요청하고 재입력을 유도하는 단계입니다.",
    primaryStatus: "IN_PROGRESS",
    allowedStatuses: ["IN_PROGRESS"],
    actors: ["LAWYER", "USER"],
    aiInvolvement: "MEDIUM",
  },
  {
    code: "CAS-3600",
    title: "상담/수임 준비",
    description: "상담 전 자료를 정리하고 수임 판단 전 최종 검토를 수행하는 단계입니다.",
    primaryStatus: "IN_PROGRESS",
    allowedStatuses: ["IN_PROGRESS"],
    actors: ["LAWYER"],
    aiInvolvement: "LOW",
  },
  {
    code: "CAS-3700",
    title: "종결/보관",
    description: "사건을 마감하고 기록을 보존하는 단계입니다.",
    primaryStatus: "CLOSED",
    allowedStatuses: ["CLOSED", "DELETED"],
    actors: ["LAWYER", "ADMIN"],
    aiInvolvement: "LOW",
  },
];

export function findLifecycleByStatus(status: CaseStatus) {
  return (
    CASE_LIFECYCLE_DEFINITIONS.find((item) => item.allowedStatuses.includes(status)) ??
    null
  );
}
