import { fail, ok } from "@/lib/domain-api-response";
import { consumeEmailVerificationToken } from "@/lib/auth/email-verification";
import { enforceAuthRateLimit } from "@/lib/security/auth-rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z.string().trim().min(16).max(256),
});

export async function POST(req: Request) {
  try {
    const rateLimited = enforceAuthRateLimit(req, "signup");
    if (rateLimited) return rateLimited;

    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return fail("인증 토큰이 올바르지 않습니다.", 422, {
        code: "VALIDATION_ERROR",
      });
    }

    const result = await consumeEmailVerificationToken(parsed.data.token);
    if (!result.ok) {
      return fail("인증 링크가 만료되었거나 올바르지 않습니다.", 400, {
        code: result.code,
      });
    }

    return ok({
      verified: true,
      message: "이메일 인증이 완료되었습니다. 로그인해 주세요.",
      nextPath: "/login?emailVerified=1",
    });
  } catch (error) {
    console.error("[VERIFY_EMAIL_POST_ERROR]", error);
    return fail("이메일 인증 처리 중 오류가 발생했습니다.", 500, {
      code: "INTERNAL_ERROR",
    });
  }
}
