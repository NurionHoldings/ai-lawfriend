import type { CaseStatus, UserRole as PrismaUserRole } from "@prisma/client";
import { getAvailableTransitions } from "@/lib/definitions/case-lifecycle";
import type { LifecycleAction } from "@/lib/definitions/case-lifecycle";
import type { CaseStatus as DefinitionCaseStatus } from "@/lib/definitions/case-status";
import { prismaRoleToDefinitionRole } from "@/lib/role-map";

/**
 * 서버 기준 허용 라이프사이클 액션 — `CASE_TRANSITIONS` + 역할과 동일한 규칙.
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
