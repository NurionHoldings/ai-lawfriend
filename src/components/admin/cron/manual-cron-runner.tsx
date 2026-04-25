"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requireOkResponseBody } from "@/lib/client/api-error";

export function ManualCronRunner() {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function run(jobCode: "alerts.sla_scan" | "alerts.escalation_scan") {
    try {
      setLoading(jobCode);

      const res = await fetch("/api/admin/cron/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobCode }),
      });

      const raw = await res.json().catch(() => null);
      try {
        requireOkResponseBody(res, raw, "수동 실행에 실패했습니다.");
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "수동 실행에 실패했습니다.");
        return;
      }

      router.refresh();
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void run("alerts.sla_scan")}
        disabled={!!loading}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading === "alerts.sla_scan" ? "실행 중..." : "SLA Scan 수동 실행"}
      </button>

      <button
        type="button"
        onClick={() => void run("alerts.escalation_scan")}
        disabled={!!loading}
        className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading === "alerts.escalation_scan" ? "실행 중..." : "Escalation Scan 수동 실행"}
      </button>
    </div>
  );
}
