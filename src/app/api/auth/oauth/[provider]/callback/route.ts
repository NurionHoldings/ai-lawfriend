import { UserRole, UserStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { applyLoginSession } from "@/lib/auth/login-response";
import {
  exchangeOAuthCode,
  fetchOAuthProfile,
  getOAuthFlowCookieNames,
  getOAuthProvider,
  isOAuthProviderKey,
  normalizeAuthRedirectPath,
} from "@/lib/auth/oauth";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getExpiredCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

function clearOAuthFlowCookies(response: NextResponse, provider: string) {
  if (!isOAuthProviderKey(provider)) {
    return response;
  }

  const cookieNames = getOAuthFlowCookieNames(provider);
  const expiredOptions = getExpiredCookieOptions();
  response.cookies.set(cookieNames.state, "", expiredOptions);
  response.cookies.set(cookieNames.redirect, "", expiredOptions);
  return response;
}

function buildLoginRedirect(provider: string, code: string) {
  const loginUrl = new URL("/login", env.APP_BASE_URL);
  loginUrl.searchParams.set("oauthError", code);
  return clearOAuthFlowCookies(NextResponse.redirect(loginUrl), provider);
}

function buildPendingRedirect(provider: string) {
  const loginUrl = new URL("/login", env.APP_BASE_URL);
  loginUrl.searchParams.set("registered", "1");
  return clearOAuthFlowCookies(NextResponse.redirect(loginUrl), provider);
}

function buildAppRedirect(provider: string, redirectPath: string) {
  const targetUrl = new URL(redirectPath, env.APP_BASE_URL);
  return clearOAuthFlowCookies(NextResponse.redirect(targetUrl), provider);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const oauthProvider = getOAuthProvider(provider);

  if (!oauthProvider) {
    return buildLoginRedirect(provider, "OAUTH_PROVIDER_UNAVAILABLE");
  }

  const error = req.nextUrl.searchParams.get("error");
  if (error) {
    return buildLoginRedirect(provider, "OAUTH_ACCESS_DENIED");
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieNames = getOAuthFlowCookieNames(oauthProvider.key);
  const storedState = req.cookies.get(cookieNames.state)?.value;
  const requestedRedirect = req.cookies.get(cookieNames.redirect)?.value;
  const redirectPath = normalizeAuthRedirectPath(requestedRedirect);

  if (!code || !state || !storedState || state !== storedState) {
    return buildLoginRedirect(provider, "OAUTH_STATE_MISMATCH");
  }

  try {
    const accessToken = await exchangeOAuthCode(oauthProvider, code, state);
    const profile = await fetchOAuthProfile(oauthProvider, accessToken);

    if (!profile.email) {
      return buildLoginRedirect(provider, "OAUTH_EMAIL_REQUIRED");
    }

    if (!profile.emailVerified) {
      return buildLoginRedirect(provider, "OAUTH_EMAIL_NOT_VERIFIED");
    }

    const existingAccount = await prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: oauthProvider.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    let user = existingAccount?.user ?? null;

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            passwordHash: null,
            name: profile.name,
            phone: null,
            role: UserRole.USER,
            status: UserStatus.PENDING,
          },
        });
      }

      await prisma.authAccount.create({
        data: {
          userId: user.id,
          provider: oauthProvider.provider,
          providerAccountId: profile.providerAccountId,
          email: profile.email,
          emailVerified: profile.emailVerified,
        },
      });
    }

    if (user.status === "PENDING") {
      return buildPendingRedirect(provider);
    }

    if (user.status !== "ACTIVE") {
      return buildLoginRedirect(provider, "ACCOUNT_BLOCKED");
    }

    const response = buildAppRedirect(provider, redirectPath);

    await applyLoginSession(
      response,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      {
        message: `${oauthProvider.label} 계정으로 로그인되었습니다.`,
        mode: "OAUTH",
        metadata: {
          provider: oauthProvider.key,
        },
      },
    );

    return response;
  } catch (error) {
    console.error("[OAUTH_CALLBACK_ERROR]", {
      provider,
      error,
    });
    const code =
      error instanceof Error && error.message
        ? error.message
        : "OAUTH_FAILED";
    return buildLoginRedirect(provider, code);
  }
}