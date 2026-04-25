"use client";

import { useSearchParams } from "next/navigation";

export function BulkJobCsvDownloadButton() {
  const searchParams = useSearchParams();

  const href = (() => {
    const params = new URLSearchParams(searchParams.toString());
    const keys = ["status", "action", "from", "to"];
    const exportParams = new URLSearchParams();
    for (const k of keys) {
      const v = params.get(k);
      if (v) exportParams.set(k, v);
    }
    const q = exportParams.toString();
    return q
      ? `/api/admin/alerts/bulk-jobs/export?${q}`
      : "/api/admin/alerts/bulk-jobs/export";
  })();

  return (
    <a
      href={href}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      CSV 다운로드
    </a>
  );
}
