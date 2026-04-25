import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/domain-api-response";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return fail("입력값이 올바르지 않습니다.", 422, {
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const email = parsed.data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다.", 401, {
        code: "INVALID_CREDENTIALS",
      });
    }

    if (user.status === "PENDING") {
      return fail(
        "관리자 승인 대기 중입니다. 승인 후 다시 로그인해 주세요.",
        403,
        { code: "ACCOUNT_PENDING" },
      );
    }

    if (user.status !== "ACTIVE") {
      return fail("현재 로그인할 수 없는 계정입니다.", 403, { code: "ACCOUNT_BLOCKED" });
    }

    const token = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const response = ok(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
        message: "로그인되었습니다.",
      },
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("[LOGIN_POST_ERROR]", error);
    return fail("로그인 처리 중 오류가 발생했습니다.", 500, { code: "INTERNAL_ERROR" });
  }
}
