export type KpiPresetKey = "7d" | "14d" | "30d" | "quarter";
export type KpiGranularity = "day" | "week" | "month";

export function resolveKpiPresetRange(preset: KpiPresetKey): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);

  if (preset === "7d") start.setDate(end.getDate() - 6);
  if (preset === "14d") start.setDate(end.getDate() - 13);
  if (preset === "30d") start.setDate(end.getDate() - 29);

  if (preset === "quarter") {
    const month = end.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

export function getSuggestedGranularity(preset: KpiPresetKey): KpiGranularity {
  if (preset === "7d" || preset === "14d") return "day";
  if (preset === "30d") return "week";
  return "month";
}

export function getBucketDate(date: Date, granularity: KpiGranularity): Date {
  const base = new Date(date);

  if (granularity === "day") {
    base.setHours(0, 0, 0, 0);
    return base;
  }

  if (granularity === "month") {
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }

  const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(base.getFullYear(), base.getMonth(), diff);
}

export function formatBucketLabel(date: Date, granularity: KpiGranularity) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  if (granularity === "day") return `${y}-${m}-${d}`;
  if (granularity === "month") return `${y}-${m}`;

  const firstDay = new Date(date);
  const day = firstDay.getDay();
  const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1);
  firstDay.setDate(diff);
  const wm = String(firstDay.getMonth() + 1).padStart(2, "0");
  const wd = String(firstDay.getDate()).padStart(2, "0");
  return `${firstDay.getFullYear()}-${wm}-${wd}`;
}

function addBucketStep(d: Date, granularity: KpiGranularity): Date {
  const n = new Date(d);
  if (granularity === "day") {
    n.setDate(n.getDate() + 1);
    return n;
  }
  if (granularity === "week") {
    n.setDate(n.getDate() + 7);
    return n;
  }
  n.setMonth(n.getMonth() + 1);
  return n;
}

export function eachBucketLabelInRange(
  start: Date,
  end: Date,
  granularity: KpiGranularity
): string[] {
  const labels: string[] = [];
  let cur = getBucketDate(start, granularity);
  const endB = getBucketDate(end, granularity);
  while (cur <= endB) {
    labels.push(formatBucketLabel(cur, granularity));
    cur = addBucketStep(cur, granularity);
  }
  return labels;
}
