import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/require-session-user";
import type { QuestionVisibility } from "@/lib/definitions/question-set";
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { prismaRoleToDefinitionRole, type UiFourPanelRole } from "@/lib/role-map";

/**
 * Zod/정의 `visibleToRoles`·`UserRoleEnum`(CLIENT 등) — Prisma `UserRole`(USER) 대응.
 * 질문셋 메타 `visibleToRoles` JSON 배열·질문 `visibility(=audience)` 판정에 사용.
 * 구현은 `prismaRoleToDefinitionRole` 단일 경로(RB-01).
 */
export function mapPrismaUserRoleToCatalogUserRole(role: UserRole): UiFourPanelRole {
  return prismaRoleToDefinitionRole(role);
}

/** 활성 `QuestionSet.visibleToRoles` — 비어 있으면 전체 허용(기존 DB 호환) */
export function isCatalogUserRoleAllowedForQuestionSet(
  visibleToRoles: string[] | undefined,
  currentUser: SessionUser,
): boolean {
  if (!visibleToRoles || visibleToRoles.length === 0) {
    return true;
  }
  const catalog = mapPrismaUserRoleToCatalogUserRole(currentUser.role);
  return visibleToRoles.includes(catalog);
}

/**
 * Zod `QuestionDefinition.visibility` → A안 `audience` 와 동일. `getInterviewFlow` / `complete` 단일 경로.
 */
export function isQuestionAudienceVisibleForAccess(
  audience: QuestionVisibility | undefined,
  access: CaseAccessContext,
): boolean {
  if (audience == null || audience === "ALL") {
    return true;
  }
  if (audience === "ADMIN_ONLY") {
    return access.isAdmin;
  }
  if (audience === "LAWYER_ONLY") {
    return access.isAssignedLawyer || access.isAdmin;
  }
  if (audience === "STAFF_ONLY") {
    return access.isAssignedStaff || access.isAdmin;
  }
  if (audience === "CLIENT_ONLY") {
    return access.isOwner || access.isAdmin;
  }
  return true;
}
