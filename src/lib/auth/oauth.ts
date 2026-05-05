import crypto from "node:crypto";
import { AuthProvider } from "@prisma/client";
import { env } from "@/lib/env";

export type OAuthProviderKey = "google" | "kakao" | "naver";

export type OAuthProviderSummary = {
  key: OAuthProviderKey;
  label: string;
  startPath: string;
};

export type OAuthProfile = {
  provider: AuthProvider;
  providerKey: OAuthProviderKey;
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
};

type OAuthProviderConfig = {
  key: OAuthProviderKey;
  label: string;
  provider: AuthProvider;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  buildAuthorizationParams(args: {
    clientId: string;
    redirectUri: string;
    state: string;
  }): URLSearchParams;
  buildTokenParams(args: {
    clientId: string;
    clientSecret: string;
    code: string;
    redirectUri: string;
    state: string;
  }): URLSearchParams;
  fetchProfile(accessToken: string): Promise<OAuthProfile>;
};

type ProcessEnvLike = NodeJS.ProcessEnv;

const OAUTH_PROVIDER_KEYS: OAuthProviderKey[] = ["google", "kakao", "naver"];

function normalizeDisplayName(input: string | null, fallbackEmail: string | null) {
  const trimmed = input?.trim();
  if (trimmed) return trimmed;
  if (fallbackEmail) {
    return fallbackEmail.split("@")[0];
  }
  return "소셜 회원";
}

export function isOAuthProviderKey(value: string): value is OAuthProviderKey {
  return OAUTH_PROVIDER_KEYS.includes(value as OAuthProviderKey);
}

export function normalizeAuthRedirectPath(redirect?: string | null) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "/dashboard";
  }
  return redirect;
}

export function getOAuthFlowCookieNames(provider: OAuthProviderKey) {
  return {
    state: `aibupchin_oauth_state_${provider}`,
    redirect: `aibupchin_oauth_redirect_${provider}`,
  };
}

export function createOAuthState() {
  return crypto.randomBytes(24).toString("hex");
}

export function getOAuthCallbackPath(provider: OAuthProviderKey) {
  return `/api/auth/oauth/${provider}/callback`;
}

export function getOAuthCallbackUrl(provider: OAuthProviderKey) {
  return new URL(getOAuthCallbackPath(provider), env.APP_BASE_URL).toString();
}

async function fetchJson(url: string, init: RequestInit, errorCode: string) {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(errorCode);
  }

  return (await response.json()) as Record<string, unknown>;
}

async function fetchGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const payload = await fetchJson(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    "OAUTH_PROFILE_FETCH_FAILED",
  );

  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
  const providerAccountId =
    typeof payload.sub === "string" && payload.sub.trim() ? payload.sub : null;

  if (!providerAccountId || !email) {
    throw new Error("OAUTH_EMAIL_REQUIRED");
  }

  return {
    provider: AuthProvider.GOOGLE,
    providerKey: "google",
    providerAccountId,
    email,
    emailVerified: payload.email_verified === true,
    name: normalizeDisplayName(
      typeof payload.name === "string" ? payload.name : null,
      email,
    ),
  };
}

async function fetchKakaoProfile(accessToken: string): Promise<OAuthProfile> {
  const payload = await fetchJson(
    "https://kapi.kakao.com/v2/user/me",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    "OAUTH_PROFILE_FETCH_FAILED",
  );

  const account =
    typeof payload.kakao_account === "object" && payload.kakao_account !== null
      ? (payload.kakao_account as Record<string, unknown>)
      : null;

  const profile =
    account && typeof account.profile === "object" && account.profile !== null
      ? (account.profile as Record<string, unknown>)
      : null;

  const email = typeof account?.email === "string" ? account.email.toLowerCase() : null;
  const providerAccountId =
    payload.id != null && String(payload.id).trim() ? String(payload.id) : null;

  if (!providerAccountId || !email) {
    throw new Error("OAUTH_EMAIL_REQUIRED");
  }

  return {
    provider: AuthProvider.KAKAO,
    providerKey: "kakao",
    providerAccountId,
    email,
    emailVerified: account?.is_email_verified === true,
    name: normalizeDisplayName(
      typeof profile?.nickname === "string" ? profile.nickname : null,
      email,
    ),
  };
}

async function fetchNaverProfile(accessToken: string): Promise<OAuthProfile> {
  const payload = await fetchJson(
    "https://openapi.naver.com/v1/nid/me",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    "OAUTH_PROFILE_FETCH_FAILED",
  );

  const response =
    typeof payload.response === "object" && payload.response !== null
      ? (payload.response as Record<string, unknown>)
      : null;

  const email = typeof response?.email === "string" ? response.email.toLowerCase() : null;
  const providerAccountId =
    typeof response?.id === "string" && response.id.trim() ? response.id : null;

  if (!providerAccountId || !email) {
    throw new Error("OAUTH_EMAIL_REQUIRED");
  }

  return {
    provider: AuthProvider.NAVER,
    providerKey: "naver",
    providerAccountId,
    email,
    emailVerified: true,
    name: normalizeDisplayName(
      typeof response?.name === "string"
        ? response.name
        : typeof response?.nickname === "string"
          ? response.nickname
          : null,
      email,
    ),
  };
}

export function getOAuthProvider(
  provider: string,
  environment: ProcessEnvLike = process.env,
): OAuthProviderConfig | null {
  if (!isOAuthProviderKey(provider)) {
    return null;
  }

  switch (provider) {
    case "google": {
      const clientId = environment.GOOGLE_CLIENT_ID?.trim();
      const clientSecret = environment.GOOGLE_CLIENT_SECRET?.trim();

      if (!clientId || !clientSecret) {
        return null;
      }

      return {
        key: "google",
        label: "Google",
        provider: AuthProvider.GOOGLE,
        clientId,
        clientSecret,
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: ["openid", "email", "profile"],
        buildAuthorizationParams({ clientId, redirectUri, state }) {
          return new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "openid email profile",
            state,
            prompt: "select_account",
          });
        },
        buildTokenParams({ clientId, clientSecret, code, redirectUri }) {
          return new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          });
        },
        fetchProfile: fetchGoogleProfile,
      };
    }
    case "kakao": {
      const clientId = environment.KAKAO_CLIENT_ID?.trim();
      const clientSecret = environment.KAKAO_CLIENT_SECRET?.trim();

      if (!clientId || !clientSecret) {
        return null;
      }

      return {
        key: "kakao",
        label: "Kakao",
        provider: AuthProvider.KAKAO,
        clientId,
        clientSecret,
        authorizationUrl: "https://kauth.kakao.com/oauth/authorize",
        tokenUrl: "https://kauth.kakao.com/oauth/token",
        scopes: ["account_email", "profile_nickname"],
        buildAuthorizationParams({ clientId, redirectUri, state }) {
          return new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "account_email profile_nickname",
            state,
          });
        },
        buildTokenParams({ clientId, clientSecret, code, redirectUri }) {
          return new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          });
        },
        fetchProfile: fetchKakaoProfile,
      };
    }
    case "naver": {
      const clientId = environment.NAVER_CLIENT_ID?.trim();
      const clientSecret = environment.NAVER_CLIENT_SECRET?.trim();

      if (!clientId || !clientSecret) {
        return null;
      }

      return {
        key: "naver",
        label: "Naver",
        provider: AuthProvider.NAVER,
        clientId,
        clientSecret,
        authorizationUrl: "https://nid.naver.com/oauth2.0/authorize",
        tokenUrl: "https://nid.naver.com/oauth2.0/token",
        scopes: ["name", "email"],
        buildAuthorizationParams({ clientId, redirectUri, state }) {
          return new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            state,
          });
        },
        buildTokenParams({ clientId, clientSecret, code, state }) {
          return new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            state,
          });
        },
        fetchProfile: fetchNaverProfile,
      };
    }
  }
}

export function getEnabledOAuthProviders(
  environment: ProcessEnvLike = process.env,
): OAuthProviderSummary[] {
  return OAUTH_PROVIDER_KEYS.flatMap((provider) => {
    const config = getOAuthProvider(provider, environment);

    if (!config) {
      return [];
    }

    return [
      {
        key: config.key,
        label: config.label,
        startPath: `/api/auth/oauth/${config.key}/start`,
      },
    ];
  });
}

export function getOAuthEnvValidationErrors(
  environment: ProcessEnvLike = process.env,
): string[] {
  const errors: string[] = [];

  const providerEnvChecks = [
    {
      key: "google",
      clientId: environment.GOOGLE_CLIENT_ID,
      clientSecret: environment.GOOGLE_CLIENT_SECRET,
      label: "Google",
    },
    {
      key: "kakao",
      clientId: environment.KAKAO_CLIENT_ID,
      clientSecret: environment.KAKAO_CLIENT_SECRET,
      label: "Kakao",
    },
    {
      key: "naver",
      clientId: environment.NAVER_CLIENT_ID,
      clientSecret: environment.NAVER_CLIENT_SECRET,
      label: "Naver",
    },
  ] as const;

  for (const item of providerEnvChecks) {
    const hasAnyCredential = Boolean(item.clientId?.trim() || item.clientSecret?.trim());
    if (!hasAnyCredential) continue;

    if (!item.clientId?.trim() || !item.clientSecret?.trim()) {
      errors.push(`${item.label} OAuth requires both client id and client secret.`);
    }
  }

  return errors;
}

export function buildOAuthAuthorizationUrl(
  config: OAuthProviderConfig,
  state: string,
) {
  const params = config.buildAuthorizationParams({
    clientId: config.clientId,
    redirectUri: getOAuthCallbackUrl(config.key),
    state,
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

export async function exchangeOAuthCode(
  config: OAuthProviderConfig,
  code: string,
  state: string,
) {
  const params = config.buildTokenParams({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    code,
    redirectUri: getOAuthCallbackUrl(config.key),
    state,
  });

  const payload = await fetchJson(
    config.tokenUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    },
    "OAUTH_CODE_EXCHANGE_FAILED",
  );

  if (typeof payload.access_token !== "string" || !payload.access_token.trim()) {
    throw new Error("OAUTH_CODE_EXCHANGE_FAILED");
  }

  return payload.access_token;
}

export async function fetchOAuthProfile(
  config: OAuthProviderConfig,
  accessToken: string,
) {
  return config.fetchProfile(accessToken);
}