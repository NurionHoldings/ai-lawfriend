"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AibeopchinLogo } from "@/components/brand/aibeopchin-logo";
import AuthInput from "@/components/auth/auth-input";
import FormError from "@/components/auth/form-error";
import { getErrorMessage } from "@/lib/error-messages";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailFromQuery = searchParams.get("email") || "";
  const sent = searchParams.get("sent") === "1";

  const [email, setEmail] = useState(emailFromQuery);
  const [status, setStatus] = useState<"idle" | "verifying" | "ok" | "error">(
    token ? "verifying" : "idle",
  );
  const [message, setMessage] = useState(
    sent
      ? "인증 메일을 보냈습니다. 받은편지함의 링크를 열어 주세요."
      : "가입 후 이메일 인증을 완료해야 로그인할 수 있습니다.",
  );
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setError(getErrorMessage({ code: json.code, message: json.message }));
          return;
        }
        setStatus("ok");
        setMessage(json.data?.message ?? "이메일 인증이 완료되었습니다.");
        setTimeout(() => {
          router.push("/login?emailVerified=1");
          router.refresh();
        }, 1200);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setError("네트워크 오류가 발생했습니다.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  async function resend() {
    setResending(true);
    setError("");
    setDevLink(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getErrorMessage({ code: json.code, message: json.message }));
        return;
      }
      setMessage(json.data?.message ?? "인증 메일을 다시 보냈습니다.");
      if (typeof json.data?.devVerifyPath === "string") {
        setDevLink(json.data.devVerifyPath);
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-[2rem] border border-aibeop-line bg-aibeop-surface p-8 shadow-soft">
        <AibeopchinLogo compact />
        <h1 className="mt-4 text-3xl font-bold text-aibeop-text">이메일 인증</h1>
        <p className="mt-2 text-sm text-aibeop-subtle">{message}</p>

        {status === "verifying" ? (
          <p className="mt-6 text-sm text-aibeop-muted">인증을 확인하는 중…</p>
        ) : null}
        {status === "ok" ? (
          <p className="mt-6 text-sm font-semibold text-emerald-800">
            인증 완료. 로그인 화면으로 이동합니다.
          </p>
        ) : null}

        <FormError message={error} />

        {status !== "ok" && status !== "verifying" ? (
          <div className="mt-6 space-y-3">
            <AuthInput
              label="가입 이메일"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <button
              type="button"
              disabled={resending || !email}
              onClick={() => void resend()}
              className="w-full rounded-xl bg-aibeop-green py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {resending ? "재발송 중…" : "인증 메일 재발송"}
            </button>
            {devLink ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                개발용 링크:{" "}
                <Link href={devLink} className="font-semibold underline">
                  인증 완료하기
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/tour" className="text-aibeop-deep underline">
            게스트로 계속 둘러보기
          </Link>
          <Link href="/login" className="text-aibeop-subtle underline">
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
}
