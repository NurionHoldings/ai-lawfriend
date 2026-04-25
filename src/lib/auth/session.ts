import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole, UserStatus } from "@prisma/client";
import { verifyAccessToken } from "./jwt";
import { prisma } from "@/lib/prisma";
import { hasRoleAtLeast } from "@/lib/auth/roles";

export const AUTH_COOKIE_NAME = "aibupchin_access_token";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
};

export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    const userId = typeof payload.sub === "string" ? payload.sub : undefined;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!user) return null;
    if (user.status !== "ACTIVE") return null;

    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireLawyer() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "LAWYER") {
    redirect("/dashboard");
  }

  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return user;
}

/** 페이지용: 최소 역할 미만이면 `/dashboard`로 이동 */
export async function requireRolePage(minimumRole: UserRole) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasRoleAtLeast(user.role, minimumRole)) {
    redirect("/dashboard");
  }

  return user;
}
