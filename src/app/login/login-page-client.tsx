"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthInput from "@/components/auth/auth-input";
import FormError from "@/components/auth/form-error";
import { useAuthForm } from "@/hooks/use-auth-form";

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

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const registered = searchParams.get("registered") === "1";

  const { loading, errorMessage, submit } = useAuthForm();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">로그인</h1>
        <p className="mt-2 text-sm text-gray-600">
          가입한 이메일과 비밀번호로 로그인하세요.
        </p>
        {registered ? (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-950">
            가입 신청이 접수되었습니다. <strong className="font-semibold">관리자 승인 후</strong>{" "}
            로그인할 수 있습니다.
          </p>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          승인 대기(PENDING)·정지(SUSPENDED) 계정은 로그인할 수 없습니다.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          승인이 끝났는데도 로그인되지 않으면 이메일·비밀번호를 확인하거나, 플랫폼 관리자에게 계정 상태를
          문의하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="이메일"
          type="email"
          value={form.email}
          placeholder="you@example.com"
          autoComplete="email"
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

        <FormError message={errorMessage} />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-black underline">
          회원가입
        </Link>
      </div>
    </main>
  );
}
