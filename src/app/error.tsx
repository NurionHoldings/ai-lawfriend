"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          일시적인 오류가 발생했습니다.
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          화면을 다시 불러오거나 잠시 후 다시 시도해 주세요.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/admin")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            관리자 홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
