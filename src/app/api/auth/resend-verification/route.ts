import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/domain-api-response";
import {
  buildEmailVerifyUrl,
  dispatchEmailVerificationMail,
  isPasswordEmailVerificationRequired,
  issueEmailVerificationToken,
} from "@/lib/auth/email-verification";
import { enforceAuthRateLimit } from "@/lib/security/auth-rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const rateLimited = enforceAuthRateLimit(req, "signup");
    if (rateLimited) return rateLimited;

    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return fail("이메일이 올바르지 않습니다.", 422, {
        code: "VALIDATION_ERROR",
      });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        emailVerifiedAt: true,
      },
    });

    // Avoid email enumeration — always return generic success.
    if (!user || !isPasswordEmailVerificationRequired(user)) {
      return ok({
        resent: true,
        message: "인증 메일을 보낼 수 있으면 발송했습니다. 받은편지함을 확인해 주세요.",
      });
    }

    const issued = await issueEmailVerificationToken(user.id);
    const verifyUrl = buildEmailVerifyUrl(issued.rawToken);
    const mail = await dispatchEmailVerificationMail({
      to: user.email,
      verifyUrl,
    });

    const allowDevLink =
      process.env.NODE_ENV !== "production" ||
      String(process.env.AUTH_EMAIL_VERIFY_RETURN_LINK || "").toLowerCase() ===
        "true";

    return ok({
      resent: true,
      emailDispatch: { mode: mail.mode, delivered: mail.delivered },
      ...(allowDevLink
        ? { devVerifyPath: `/verify-email?token=${issued.rawToken}` }
        : {}),
      message: "인증 메일을 다시 보냈습니다. 받은편지함을 확인해 주세요.",
    });
  } catch (error) {
    console.error("[RESEND_VERIFICATION_POST_ERROR]", error);
    return fail("인증 메일 재발송 중 오류가 발생했습니다.", 500, {
      code: "INTERNAL_ERROR",
    });
  }
}
