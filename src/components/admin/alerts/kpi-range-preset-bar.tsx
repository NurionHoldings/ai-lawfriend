"use client";

import type { KpiGranularity, KpiPresetKey } from "@/lib/alerts/kpi-date-range";

type Props = {
  preset: KpiPresetKey;
  granularity: KpiGranularity;
  onChangePreset: (preset: KpiPresetKey) => void;
  onChangeGranularity: (granularity: KpiGranularity) => void;
};

const PRESETS: { key: KpiPresetKey; label: string }[] = [
  { key: "7d", label: "7일" },
  { key: "14d", label: "14일" },
  { key: "30d", label: "30일" },
  { key: "quarter", label: "분기" },
];

export function KpiRangePresetBar({
  preset,
  granularity,
  onChangePreset,
  onChangeGranularity,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((item) => {
          const active = item.key === preset;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChangePreset(item.key)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">집계</span>
        <select
          value={granularity}
          onChange={(e) => onChangeGranularity(e.target.value as KpiGranularity)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="day">일간</option>
          <option value="week">주간</option>
          <option value="month">월간</option>
        </select>
      </div>
    </div>
  );
}
