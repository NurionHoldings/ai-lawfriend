import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const prismaMocks = vi.hoisted(() => {
  const authAccountFindUnique = vi.fn();
  const authAccountCreate = vi.fn();
  const userFindUnique = vi.fn();
  const userCreate = vi.fn();
  return {
    authAccountFindUnique,
    authAccountCreate,
    userFindUnique,
    userCreate,
  };
});

const oauthMocks = vi.hoisted(() => ({
  getOAuthProvider: vi.fn(),
  getOAuthFlowCookieNames: vi.fn(),
  exchangeOAuthCode: vi.fn(),
  fetchOAuthProfile: vi.fn(),
  isOAuthProviderKey: vi.fn(),
  normalizeAuthRedirectPath: vi.fn(),
}));

const loginResponseMocks = vi.hoisted(() => ({
  applyLoginSession: vi.fn(async (response: Response) => response),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    authAccount: {
      findUnique: prismaMocks.authAccountFindUnique,
      create: prismaMocks.authAccountCreate,
    },
    user: {
      findUnique: prismaMocks.userFindUnique,
      create: prismaMocks.userCreate,
    },
  },
}));

vi.mock("@/lib/auth/oauth", () => oauthMocks);
vi.mock("@/lib/auth/login-response", () => loginResponseMocks);

import { GET } from "./route";
import {
  exchangeOAuthCode,
  fetchOAuthProfile,
  getOAuthFlowCookieNames,
  getOAuthProvider,
  isOAuthProviderKey,
  normalizeAuthRedirectPath,
} from "@/lib/auth/oauth";
import { applyLoginSession } from "@/lib/auth/login-response";

describe("GET /api/auth/oauth/:provider/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOAuthProvider).mockReturnValue({
      key: "google",
      label: "Google",
      provider: "GOOGLE",
      clientId: "client-id",
      clientSecret: "client-secret",
    } as never);
    vi.mocked(getOAuthFlowCookieNames).mockReturnValue({
      state: "aibupchin_oauth_state_google",
      redirect: "aibupchin_oauth_redirect_google",
    });
    vi.mocked(isOAuthProviderKey).mockReturnValue(true);
    vi.mocked(normalizeAuthRedirectPath).mockReturnValue("/dashboard");
  });

  it("links an existing verified Google user and redirects with a session", async () => {
    vi.mocked(exchangeOAuthCode).mockResolvedValue("access-token");
    vi.mocked(fetchOAuthProfile).mockResolvedValue({
      provider: "GOOGLE",
      providerKey: "google",
      providerAccountId: "google-sub-1",
      email: "active@example.com",
      emailVerified: true,
      name: "Active User",
    } as never);

    prismaMocks.authAccountFindUnique.mockResolvedValueOnce(null);
    prismaMocks.userFindUnique.mockResolvedValueOnce({
      id: "user-1",
      email: "active@example.com",
      name: "Active User",
      role: "USER",
      status: "ACTIVE",
    });
    prismaMocks.authAccountCreate.mockResolvedValueOnce({ id: "account-1" });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/auth/oauth/google/callback?code=oauth-code&state=state-1",
        {
          headers: {
            cookie:
              "aibupchin_oauth_state_google=state-1; aibupchin_oauth_redirect_google=/dashboard",
          },
        },
      ),
      {
        params: Promise.resolve({ provider: "google" }),
      },
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
    expect(prismaMocks.authAccountCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        provider: "GOOGLE",
        providerAccountId: "google-sub-1",
        email: "active@example.com",
        emailVerified: true,
      },
    });
    expect(applyLoginSession).toHaveBeenCalled();
  });

  it("creates a pending social user and redirects back to login until approved", async () => {
    vi.mocked(exchangeOAuthCode).mockResolvedValue("access-token");
    vi.mocked(fetchOAuthProfile).mockResolvedValue({
      provider: "GOOGLE",
      providerKey: "google",
      providerAccountId: "google-sub-2",
      email: "pending@example.com",
      emailVerified: true,
      name: "Pending User",
    } as never);

    prismaMocks.authAccountFindUnique.mockResolvedValueOnce(null);
    prismaMocks.userFindUnique.mockResolvedValueOnce(null);
    prismaMocks.userCreate.mockResolvedValueOnce({
      id: "user-2",
      email: "pending@example.com",
      name: "Pending User",
      role: "USER",
      status: "PENDING",
    });
    prismaMocks.authAccountCreate.mockResolvedValueOnce({ id: "account-2" });

    const response = await GET(
      new NextRequest(
        "http://localhost/api/auth/oauth/google/callback?code=oauth-code&state=state-2",
        {
          headers: {
            cookie:
              "aibupchin_oauth_state_google=state-2; aibupchin_oauth_redirect_google=/cases",
          },
        },
      ),
      {
        params: Promise.resolve({ provider: "google" }),
      },
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/login?registered=1");
    expect(applyLoginSession).not.toHaveBeenCalled();
  });
});