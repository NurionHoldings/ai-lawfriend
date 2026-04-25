"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { requireOkData } from "@/lib/client/api-error";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const raw = await res.json().catch(() => null);
      try {
        requireOkData(res, raw, "로그아웃에 실패했습니다.");
      } catch (e) {
        alert(
          e instanceof Error ? e.message : "로그아웃에 실패했습니다.",
        );
        return;
      }

      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
