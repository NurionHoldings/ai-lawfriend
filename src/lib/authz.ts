import {
  canAccessCase,
  hasPermission,
  type PermissionContext,
  type PermissionKey,
} from "@/lib/definitions";
import { prismaRoleToDefinitionRole } from "@/lib/role-map";
import type { UserRole as PrismaUserRole } from "@prisma/client";

export function assertPermission(permission: PermissionKey, ctx: PermissionContext) {
  if (!hasPermission(ctx.actorRole, permission)) {
    const error = new Error("권한이 없습니다.");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
}

export function assertCaseAccess(permission: PermissionKey, ctx: PermissionContext) {
  if (!canAccessCase(permission, ctx)) {
    const error = new Error("사건 접근 권한이 없습니다.");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
}

export function permissionContextFromSession(
  sessionUser: { id: string; role: PrismaUserRole },
  rest: Omit<PermissionContext, "actorRole" | "actorUserId">,
): PermissionContext {
  return {
    actorRole: prismaRoleToDefinitionRole(sessionUser.role),
    actorUserId: sessionUser.id,
    ...rest,
  };
}
