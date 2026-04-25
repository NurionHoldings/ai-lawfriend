import { getSessionUser } from "@/lib/auth/session";

/**
 * API 라우트에서 JSON 에러 메시지와 매칭하기 위한 throw용 관리자 검증.
 * (기존 requireAdmin은 redirect 전용)
 */
export async function requireAdminThrow() {
  const user = await getSessionUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}
