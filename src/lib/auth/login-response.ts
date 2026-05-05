import { ok } from "@/lib/domain-api-response";
import { writeAuditLog } from "@/lib/audit-log";
import { signAccessToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { NextResponse } from "next/server";

export type AuthLoginUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

export type AuthLoginMode = "STANDARD" | "OAUTH";

type ApplyLoginSessionOptions = {
  message: string;
  mode: AuthLoginMode;
  metadata?: Record<string, unknown>;
};

export async function applyLoginSession<T extends NextResponse>(
  response: T,
  user: AuthLoginUser,
  options: ApplyLoginSessionOptions,
) {
  const token = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "AUTH_LOGIN_SUCCESS",
    entityType: "AUTH_SESSION",
    entityId: user.id,
    message: options.message,
    metadata: options.metadata
      ? {
          mode: options.mode,
          ...options.metadata,
        }
      : { mode: options.mode },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function buildJsonLoginResponse(
  user: AuthLoginUser,
  options: ApplyLoginSessionOptions,
) {
  const response = ok({
    user,
    mode: options.mode,
    message: options.message,
  });

  return applyLoginSession(response, user, options);
}