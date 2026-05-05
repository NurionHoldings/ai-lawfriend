"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import AuthInput from "@/components/auth/auth-input";
import FormError from "@/components/auth/form-error";
import { useAuthForm } from "@/hooks/use-auth-form";
import { getErrorMessage } from "@/lib/error-messages";

type LoginResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
  message: string;
};

type LoginFormSubmitEvent = Parameters<
  NonNullable<React.ComponentProps<"form">["onSubmit"]>
>[0];

type OAuthProviderButton = {
  key: string;
  label: string;
  startPath: string;
};

type LoginPageClientProps = Readonly<{
  oauthProviders: OAuthProviderButton[];
}>;

function getOAuthButtonClassName(providerKey: string) {
  switch (providerKey) {
    case "google":
      return "border border-aibeop-line bg-white text-aibeop-text hover:bg-aibeop-soft";
    case "kakao":
      return "border border-[#F1D54A] bg-[#FEE500] text-[#191600] hover:bg-[#F4DC2D]";
    case "naver":
      return "border border-[#03C75A] bg-[#03C75A] text-white hover:bg-[#02B351]";
    default:
      return "border border-aibeop-line bg-white text-aibeop-text hover:bg-aibeop-soft";
  }
}

export default function LoginPageClient({ oauthProviders }: LoginPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const registered = searchParams.get("registered") === "1";
  const oauthErrorCode = searchParams.get("oauthError");

  const { loading, errorMessage, submit } = useAuthForm();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: LoginFormSubmitEvent) {
    e.preventDefault();

    await submit<typeof form, LoginResponse>({
      endpoint: "/api/auth/login",
      body: form,
      onSuccess: async () => {
        router.push(redirect);
        router.refresh();
      },
    });
  }

  const oauthErrorMessage = oauthErrorCode
    ? getErrorMessage({ code: oauthErrorCode })
    : "";

  const visibleErrorMessage = errorMessage || oauthErrorMessage;

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-[2rem] border border-aibeop-line bg-aibeop-surface p-8 shadow-soft">
        <div className="mb-8">
          <AibeopchinLogo compact />
          <h1 className="text-3xl font-bold text-aibeop-text">로그인</h1>
          <p className="mt-2 text-sm text-aibeop-muted">
            가입한 이메일과 비밀번호로 로그인하세요.
          </p>
          {oauthProviders.length > 0 ? (
            <p className="mt-2 text-xs leading-relaxed text-aibeop-muted">
              Google 간편 로그인은 현재 활성화되어 있으며, Kakao·Naver도 같은 패턴으로 확장 가능합니다.
            </p>
          ) : null}
        {registered ? (
          <p className="mt-3 rounded-xl border border-aibeop-pale bg-aibeop-pale/60 px-3 py-2 text-xs leading-relaxed text-aibeop-deep">
            가입 신청이 접수되었습니다. <strong className="font-semibold">관리자 승인 후</strong>{" "}
            로그인할 수 있습니다.
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-aibeop-muted">
          승인 대기(PENDING)·정지(SUSPENDED) 계정은 로그인할 수 없습니다.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-aibeop-muted">
          승인이 끝났는데도 로그인되지 않으면 이메일·비밀번호를 확인하거나, 플랫폼 관리자에게 계정 상태를 문의하세요.
        </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="이메일"
            value={form.email}
            placeholder="you@example.com"
            autoComplete="username"
            onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          />

          <AuthInput
            label="비밀번호"
            type="password"
            value={form.password}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            onChange={(value) =>
              setForm((prev) => ({ ...prev, password: value }))
            }
          />

          <FormError message={visibleErrorMessage} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-aibeop-green px-4 py-3 text-white transition hover:bg-aibeop-deep disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {oauthProviders.length > 0 ? (
          <div className="mt-6 border-t border-aibeop-line pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-aibeop-muted">
              Social Login
            </p>
            <div className="mt-3 space-y-3">
              {oauthProviders.map((provider) => {
                const params = new URLSearchParams({ redirect });
                return (
                  <Link
                    key={provider.key}
                    href={`${provider.startPath}?${params.toString()}`}
                    className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${getOAuthButtonClassName(provider.key)}`}
                  >
                    {provider.label}로 계속하기
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-6 text-sm text-aibeop-muted">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-aibeop-text underline">
            회원가입
          </Link>
        </div>
      </div>
    </main>
  );
}
