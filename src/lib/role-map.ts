import type { UserRole as PrismaUserRole } from "@prisma/client";
import type { UserRole as DefinitionUserRole } from "@/lib/definitions";

/**
 * Prisma `UserRole`(USER·SUPER_ADMIN 등) → 도메인 정의서 `UserRole`(CLIENT·ADMIN 등)
 */
export function prismaRoleToDefinitionRole(role: PrismaUserRole): DefinitionUserRole {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "ADMIN";
    case "LAWYER":
      return "LAWYER";
    case "STAFF":
      return "STAFF";
    case "USER":
    default:
      return "CLIENT";
  }
}

/** UI 컴포넌트(액션 패널 등)용 4분할 역할 */
export function prismaRoleToUiRole(
  role: PrismaUserRole,
): "ADMIN" | "LAWYER" | "STAFF" | "CLIENT" {
  const d = prismaRoleToDefinitionRole(role);
  return d;
}
