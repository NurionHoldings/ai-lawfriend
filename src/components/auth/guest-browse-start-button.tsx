"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = Readonly<{
  label?: string;
  className?: string;
  redirectTo?: string;
}>;

export function GuestBrowseStartButton({
  label = "게스트로 구경하기",
  className,
  redirectTo = "/dashboard",
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function start() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/guest-browse", { method: "POST" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || payload?.success === false) {
          setError(payload?.error?.message || payload?.error || "게스트 프리패스를 시작할 수 없습니다.");
          return;
        }
        router.push(redirectTo);
        router.refresh();
      } catch {
        setError("게스트 프리패스를 시작할 수 없습니다.");
      }
    });
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className={
          className ||
          "rounded-xl bg-aibeop-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-aibeop-deep disabled:opacity-60"
        }
      >
        {pending ? "프리패스 준비 중…" : label}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
