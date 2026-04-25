import { Prisma, type UserRole } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { hasDefinedPermission } from "@/lib/definitions/permission-definition";

export function isPlatformAdmin(role: UserRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * `softDeleteCaseService` / `DELETE /api/cases/:id` — 소유자 또는 플랫폼 관리자(ADMIN·SUPER_ADMIN).
 * `getCaseAccessContext`는 `DELETED` 사건에서 NotFound이므로, UI(직접 `findUnique` 상세)는 이 함수로 동일 기준을 맞춘다.
 */
export function canRequestSoftDelete(
  currentUser: SessionUser,
  caseRow: { ownerUserId: string; status: string }
): boolean {
  if (caseRow.status === "DELETED") return false;
  const isOwner = caseRow.ownerUserId === currentUser.id;
  return isOwner || isPlatformAdmin(currentUser.role);
}

/** `getCaseAccessContext` 성공 이후 — 서비스와 동일 boolean */
export function canSoftDeleteCase(access: CaseAccessContext): boolean {
  return access.isOwner || access.isAdmin;
}

export type CaseAccessContext = {
  caseId: string;
  ownerUserId: string;
  status: string;
  title: string;
  isOwner: boolean;
  isAdmin: boolean;
  isAssignedLawyer: boolean;
  /** 사건에 배정된 STAFF(운영) — `STAFF` 역할 + 활성 `CaseAssignment` */
  isAssignedStaff: boolean;
  canRead: boolean;
  canWriteCase: boolean;
  canManageStaffFeatures: boolean;
};

/**
 * Batch A-1: 인터뷰 **안 A** — OWNER(의뢰인) / ADMIN / LAWYER(담당) / **배정 STAFF** 인터뷰 수행 가능.
 * UI·API `assertCaseInterviewAccess`와 동일 기준으로 맞출 것.
 */
export function canPerformCaseInterview(access: CaseAccessContext): boolean {
  return (
    access.isOwner ||
    access.isAdmin ||
    access.isAssignedLawyer ||
    access.isAssignedStaff
  );
}

export function buildAccessibleCaseWhere(
  currentUser: SessionUser
): Prisma.CaseWhereInput {
  const base: Prisma.CaseWhereInput = {
    status: { not: "DELETED" },
  };

  if (isPlatformAdmin(currentUser.role)) {
    return base;
  }

  if (currentUser.role === "LAWYER") {
    return {
      ...base,
      OR: [
        { ownerUserId: currentUser.id },
        {
          assignments: {
            some: {
              assigneeUserId: currentUser.id,
              isActive: true,
            },
          },
        },
      ],
    };
  }

  if (currentUser.role === "STAFF") {
    return {
      ...base,
      OR: [
        { ownerUserId: currentUser.id },
        {
          assignments: {
            some: {
              assigneeUserId: currentUser.id,
              isActive: true,
            },
          },
        },
      ],
    };
  }

  return {
    ...base,
    ownerUserId: currentUser.id,
  };
}

export async function getCaseAccessContext(
  currentUser: SessionUser,
  caseId: string
): Promise<CaseAccessContext> {
  const found = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      ownerUserId: true,
      status: true,
      title: true,
      assignments: {
        where: { isActive: true },
        select: {
          assigneeUserId: true,
        },
      },
    },
  });

  if (!found || found.status === "DELETED") {
    throw new NotFoundError("사건을 찾을 수 없습니다.");
  }

  const isOwner = found.ownerUserId === currentUser.id;
  const isAdmin = isPlatformAdmin(currentUser.role);
  const isAssignedLawyer =
    currentUser.role === "LAWYER" &&
    found.assignments.some((item) => item.assigneeUserId === currentUser.id);
  const isAssignedStaff =
    currentUser.role === "STAFF" &&
    found.assignments.some((item) => item.assigneeUserId === currentUser.id);

  const canRead = isAdmin || isOwner || isAssignedLawyer || isAssignedStaff;
  const canWriteCase = isAdmin || isOwner || isAssignedLawyer || isAssignedStaff;
  const canManageStaffFeatures =
    isAdmin ||
    isAssignedLawyer ||
    hasDefinedPermission(currentUser.role, "case", "staff_review");

  if (!canRead) {
    throw new ForbiddenError("접근 권한이 없습니다.");
  }

  return {
    caseId: found.id,
    ownerUserId: found.ownerUserId,
    status: found.status,
    title: found.title,
    isOwner,
    isAdmin,
    isAssignedLawyer,
    isAssignedStaff,
    canRead,
    canWriteCase,
    canManageStaffFeatures,
  };
}

export function assertAdminOnly(currentUser: SessionUser) {
  if (!isPlatformAdmin(currentUser.role)) {
    throw new ForbiddenError("관리자만 수행할 수 있습니다.");
  }
}
