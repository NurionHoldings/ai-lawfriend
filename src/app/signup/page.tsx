"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthInput from "@/components/auth/auth-input";
import FormError from "@/components/auth/form-error";
import { useAuthForm } from "@/hooks/use-auth-form";

type SignupResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: string;
  };
  message: string;
  nextPath?: string;
  verificationRequired?: boolean;
  devVerifyPath?: string;
};

function SignupPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromGuest = searchParams.get("guest") === "1";
  const { loading, errorMessage, submit } = useAuthForm();

  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
  });

  const [localError, setLocalError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");

    if (form.password !== form.passwordConfirm) {
      setLocalError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 8) {
      setLocalError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    await submit<
      { email: string; password: string; name: string; phone: string },
      SignupResponse
    >({
      endpoint: "/api/auth/signup",
      body: {
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
      },
      onSuccess: async (data) => {
        const next =
          data.nextPath ||
          `/verify-email?email=${encodeURIComponent(form.email)}&sent=1`;
        router.push(next);
        router.refresh();
      },
    });
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-[2rem] border border-aibeop-line bg-aibeop-surface p-8 shadow-soft">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-aibeop-text">회원가입</h1>
          <p className="mt-2 text-sm text-aibeop-muted">
            AI법친 계정을 만들고 이메일 인증 후 사건 정리를 시작하세요.
          </p>
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
            {fromGuest
              ? "게스트 프리패스에서 참여 단계로 넘어왔습니다. 가입·이메일 인증 후 사건 등록을 이어갈 수 있습니다."
              : "게스트로 둘러본 뒤 가입해도 됩니다. 가입이 완료되면 이메일 인증이 시작되며, 인증 후에만 로그인할 수 있습니다."}
          </p>
          <p className="mt-2 text-xs text-aibeop-subtle">
            <Link href="/tour" className="underline">
              아직 둘러보기 중이라면 게스트 투어로
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="이름"
            value={form.name}
            placeholder="홍길동"
            autoComplete="name"
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
          />
          <AuthInput
            label="이메일"
            value={form.email}
            placeholder="you@example.com"
            autoComplete="email"
            onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          />
          <AuthInput
            label="휴대폰"
            value={form.phone}
            placeholder="010-0000-0000"
            autoComplete="tel"
            onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
          />
          <AuthInput
            label="비밀번호"
            type="password"
            value={form.password}
            placeholder="8자 이상"
            autoComplete="new-password"
            onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
          />
          <AuthInput
            label="비밀번호 확인"
            type="password"
            value={form.passwordConfirm}
            placeholder="비밀번호 재입력"
            autoComplete="new-password"
            onChange={(value) =>
              setForm((prev) => ({ ...prev, passwordConfirm: value }))
            }
          />

          <FormError message={localError || errorMessage} />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-aibeop-green px-4 py-3 text-sm font-extrabold text-white hover:bg-aibeop-deep disabled:opacity-60"
          >
            {loading ? "가입 중…" : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-aibeop-muted">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-aibeop-deep underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-16 text-center text-sm text-aibeop-muted">로딩...</div>
      }
    >
      <SignupPageClient />
    </Suspense>
  );
}
