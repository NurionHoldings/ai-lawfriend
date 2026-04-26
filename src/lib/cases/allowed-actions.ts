import type { CaseStatus, UserRole as PrismaUserRole } from "@prisma/client";
import { getAvailableTransitions } from "@/lib/definitions/case-lifecycle";
import type { LifecycleAction } from "@/lib/definitions/case-lifecycle";
import type { CaseStatus as DefinitionCaseStatus } from "@/lib/definitions/case-status";
import { prismaRoleToDefinitionRole } from "@/lib/role-map";

/**
 * API·DTO용 **라이프사이클 액션 목록** — `CASE_TRANSITIONS`에서 **현재 상태·역할**이 맞는 규칙의 `action`만 수집한다.
 *
 * **353+ 이중 축:** 여기서는 `requires`(인터뷰 완료·초안·승인 문서·사유 등)를 **보지 않는다**.
 * 실행 단계에서는 `checkCaseTransitionOrThrow`가 `resolveCaseTransitionFacts`로 사실을 붙여 `evaluateCaseTransition`한다.
 * 사건 상세 **버튼 노출**은 클라 `getAllowedCaseActions`(사실 반영)와 **직교**할 수 있다 — 단일 배열로 합치지 않는다.
 */
export function getAllowedLifecycleActionsForCase(
  status: CaseStatus,
  prismaRole: PrismaUserRole,
): LifecycleAction[] {
  const role = prismaRoleToDefinitionRole(prismaRole);
  return getAvailableTransitions(status as DefinitionCaseStatus, role).map(
    (rule) => rule.action,
  );
}
