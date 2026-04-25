import { getSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/session";
import { hasRoleAtLeast } from "@/lib/auth/roles";
import type { UserRole } from "@prisma/client";

/**
 * API 라우트용: 미인증 401 / 권한 부족 403.
 */
export async function requireRole(minimumRole: UserRole): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    const err = new Error("로그인이 필요합니다.") as Error & { status?: number };
    err.status = 401;
    throw err;
  }

  if (!hasRoleAtLeast(user.role, minimumRole)) {
    const err = new Error("권한이 필요합니다.") as Error & { status?: number };
    err.status = 403;
    throw err;
  }

  return user;
}
