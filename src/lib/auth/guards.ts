import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { hasMinRole } from "@/lib/auth/roles";

export type RequireRoleApiMinimum = "STAFF" | "ADMIN" | "SUPER_ADMIN";

export type RequireRoleApiResult =
  | { ok: true; user: SessionUser; response: null }
  | { ok: false; user: null; response: NextResponse }
  | { ok: false; user: SessionUser; response: NextResponse };

/**
 * API 라우트용: 401/403 (세션 쿠키 기준).
 * 운영 플랫폼 역할(STAFF/ADMIN/SUPER_ADMIN) 전용.
 */
export async function requireRoleApi(
  minimumRole: RequireRoleApiMinimum,
): Promise<RequireRoleApiResult> {
  const user = await getSessionUser();

  if (!user) {
    return {
      ok: false,
      user: null,
      response: NextResponse.json(
        { ok: false, error: "UNAUTHORIZED", code: "UNAUTHORIZED" },
        { status: 401 },
      ),
    };
  }

  if (!hasMinRole(user.role, minimumRole)) {
    return {
      ok: false,
      user,
      response: NextResponse.json(
        { ok: false, error: "FORBIDDEN", code: "FORBIDDEN" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, user, response: null };
}

export { requireRolePage } from "@/lib/auth/session";
