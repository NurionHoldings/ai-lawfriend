import { describe, expect, it } from "vitest";
import {
  getEnabledOAuthProviders,
  getOAuthEnvValidationErrors,
  normalizeAuthRedirectPath,
} from "@/lib/auth/oauth";

describe("oauth helpers", () => {
  it("returns only configured providers", () => {
    const providers = getEnabledOAuthProviders({
      GOOGLE_CLIENT_ID: "google-id",
      GOOGLE_CLIENT_SECRET: "google-secret",
      KAKAO_CLIENT_ID: "",
      KAKAO_CLIENT_SECRET: "",
      NAVER_CLIENT_ID: "naver-id",
      NAVER_CLIENT_SECRET: "naver-secret",
    } as unknown as NodeJS.ProcessEnv);

    expect(providers).toEqual([
      {
        key: "google",
        label: "Google",
        startPath: "/api/auth/oauth/google/start",
      },
      {
        key: "naver",
        label: "Naver",
        startPath: "/api/auth/oauth/naver/start",
      },
    ]);
  });

  it("validates partial oauth env configuration and redirect safety", () => {
    expect(
      getOAuthEnvValidationErrors({
        GOOGLE_CLIENT_ID: "google-id",
      } as unknown as NodeJS.ProcessEnv),
    ).toEqual(["Google OAuth requires both client id and client secret."]);

    expect(normalizeAuthRedirectPath("/admin")).toBe("/admin");
    expect(normalizeAuthRedirectPath("https://evil.example.com")).toBe("/dashboard");
    expect(normalizeAuthRedirectPath("//evil.example.com")).toBe("/dashboard");
  });
});