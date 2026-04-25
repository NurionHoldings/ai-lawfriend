import { Prisma, type UserRole } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/require-session-user";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { hasDefinedPermission } from "@/lib/definitions/permission-definition";
import { prisma } from "@/lib/prisma";

export function isPlatformAdmin(role: UserRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export type CaseAccessContext = {
  caseId: string;
  ownerUserId: string;
  status: string;
  title: string;
  isOwner: boolean;
  isAdmin: boolean;
  isAssignedLawyer: boolean;
  canRead: boolean;
  canWriteCase: boolean;
  canManageStaffFeatures: boolean;
};

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

  const canRead = isAdmin || isOwner || isAssignedLawyer;
  const canWriteCase =
    isAdmin || isOwner || isAssignedLawyer || hasDefinedPermission(currentUser.role, "CASE", "UPDATE");
  const canManageStaffFeatures =
    isAdmin || isAssignedLawyer || hasDefinedPermission(currentUser.role, "CASE", "REVIEW");

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
