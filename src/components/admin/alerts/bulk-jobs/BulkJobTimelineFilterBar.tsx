"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const kinds = [
  { value: "all", label: "전체" },
  { value: "audit", label: "감사" },
  { value: "notification", label: "알림" },
  { value: "schedule", label: "예약" },
  { value: "ops_ticket", label: "운영큐" },
  { value: "retry_job", label: "재시도 Job" },
] as const;

export function BulkJobTimelineFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const kind = searchParams.get("timelineKind") ?? "all";

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("timelineKind");
    } else {
      params.set("timelineKind", next);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {kinds.map((item) => {
        const active = kind === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              "rounded-xl border px-3 py-2 text-sm transition",
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
