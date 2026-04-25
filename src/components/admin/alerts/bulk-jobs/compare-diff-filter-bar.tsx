"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "all", label: "전체" },
  { value: "improved", label: "개선만" },
  { value: "worsened", label: "악화만" },
  { value: "changed", label: "변경만" },
] as const;

export function CompareDiffFilterBar({
  counts,
}: {
  counts: {
    all: number;
    improved: number;
    worsened: number;
    changed: number;
    same: number;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("diffFilter") ?? "all";

  function onClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("diffFilter");
    } else {
      params.set("diffFilter", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = active === option.value;
        const count =
          option.value === "all"
            ? counts.all
            : option.value === "improved"
              ? counts.improved
              : option.value === "worsened"
                ? counts.worsened
                : counts.changed;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onClick(option.value)}
            className={[
              "rounded-xl border px-3 py-2 text-sm transition",
              selected
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            {option.label}
            <span className="ml-2 rounded-md bg-black/10 px-2 py-0.5 text-xs">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
