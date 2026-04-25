import { getSessionUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/session";

function isPlatformAdminRole(role: SessionUser["role"]) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * API 라우트용: 미인증 401 / 비관리자 403. (session.requireAdmin은 redirect 사용)
 */
export async function requireAdminApi(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    const err = new Error("로그인이 필요합니다.") as Error & { status?: number };
    err.status = 401;
    throw err;
  }

  if (!isPlatformAdminRole(user.role)) {
    const err = new Error("관리자 권한이 필요합니다.") as Error & { status?: number };
    err.status = 403;
    throw err;
  }

  return user;
}
