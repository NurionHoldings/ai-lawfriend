import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const EMAIL_VERIFICATION_TTL_HOURS = 24;

export function hashEmailVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createEmailVerificationRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function buildEmailVerifyUrl(rawToken: string): string {
  const url = new URL("/verify-email", env.APP_BASE_URL);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function issueEmailVerificationToken(userId: string): Promise<{
  rawToken: string;
  expiresAt: Date;
}> {
  const rawToken = createEmailVerificationRawToken();
  const tokenHash = hashEmailVerificationToken(rawToken);
  const expiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_TTL_HOURS * 60 * 60 * 1000,
  );

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { rawToken, expiresAt };
}

export type AuthEmailDispatchResult = {
  mode: "dry_run" | "smtp" | "logged";
  delivered: boolean;
};

/**
 * Thin auth mailer — does not use product messaging live-send gate.
 * Default dry_run unless SMTP_* configured and AUTH_EMAIL_VERIFY_DRY_RUN=false.
 */
export async function dispatchEmailVerificationMail(input: {
  to: string;
  verifyUrl: string;
}): Promise<AuthEmailDispatchResult> {
  const dryRunForced =
    String(process.env.AUTH_EMAIL_VERIFY_DRY_RUN ?? "true").toLowerCase() !==
    "false";
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from =
    process.env.AUTH_EMAIL_FROM?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    "noreply@ailawfriend.local";

  console.info("[AUTH_EMAIL_VERIFY_DISPATCH]", {
    toDomain: input.to.includes("@") ? input.to.split("@")[1] : "unknown",
    dryRunForced,
    smtpConfigured: Boolean(host && user && pass),
  });

  if (dryRunForced || !host || !user || !pass) {
    return { mode: "dry_run", delivered: false };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from,
      to: input.to,
      subject: "[AI법친] 이메일 인증을 완료해 주세요",
      text: [
        "AI법친 가입을 환영합니다.",
        "아래 링크로 이메일 인증을 완료한 뒤 로그인해 주세요.",
        "",
        input.verifyUrl,
        "",
        `링크는 ${EMAIL_VERIFICATION_TTL_HOURS}시간 동안 유효합니다.`,
      ].join("\n"),
    });
    return { mode: "smtp", delivered: true };
  } catch (error) {
    console.error("[AUTH_EMAIL_VERIFY_SMTP_ERROR]", error);
    return { mode: "logged", delivered: false };
  }
}

export async function consumeEmailVerificationToken(rawToken: string): Promise<
  | { ok: true; userId: string }
  | { ok: false; code: "INVALID_OR_EXPIRED_TOKEN" }
> {
  const tokenHash = hashEmailVerificationToken(rawToken.trim());
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });
  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
    return { ok: false, code: "INVALID_OR_EXPIRED_TOKEN" };
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);

  return { ok: true, userId: row.userId };
}

export function isPasswordEmailVerificationRequired(user: {
  passwordHash: string | null;
  emailVerifiedAt: Date | null;
}): boolean {
  return Boolean(user.passwordHash) && user.emailVerifiedAt == null;
}
