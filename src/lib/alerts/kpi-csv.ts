export type KpiSeriesRow = {
  label: string;
  created: number;
  resolved: number;
  escalated: number;
  highSeverity: number;
};

export type KpiSummary = {
  totalCreated: number;
  totalResolved: number;
  totalEscalated: number;
  avgResolutionHours: number;
  resolutionRate: number;
};

export function buildAlertKpiCsv(params: {
  preset: string;
  granularity: string;
  start: string;
  end: string;
  summary: KpiSummary;
  series: KpiSeriesRow[];
}) {
  const lines: string[] = [];

  lines.push(["항목", "값"].map(csvEscape).join(","));
  lines.push(["preset", params.preset].map(csvEscape).join(","));
  lines.push(["granularity", params.granularity].map(csvEscape).join(","));
  lines.push(["start", params.start].map(csvEscape).join(","));
  lines.push(["end", params.end].map(csvEscape).join(","));
  lines.push(["totalCreated", String(params.summary.totalCreated)].map(csvEscape).join(","));
  lines.push(["totalResolved", String(params.summary.totalResolved)].map(csvEscape).join(","));
  lines.push(["totalEscalated", String(params.summary.totalEscalated)].map(csvEscape).join(","));
  lines.push(
    ["avgResolutionHours", String(params.summary.avgResolutionHours)].map(csvEscape).join(",")
  );
  lines.push(["resolutionRate", `${params.summary.resolutionRate}%`].map(csvEscape).join(","));

  lines.push("");
  lines.push(
    ["구간", "생성", "해결", "에스컬레이션", "고위험", "해결률"].map(csvEscape).join(",")
  );

  for (const row of params.series) {
    const resolutionRate =
      row.created > 0 ? Number(((row.resolved / row.created) * 100).toFixed(1)) : 0;

    lines.push(
      [
        row.label,
        String(row.created),
        String(row.resolved),
        String(row.escalated),
        String(row.highSeverity),
        `${resolutionRate}%`,
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  return "\uFEFF" + lines.join("\n");
}

function csvEscape(value: string) {
  const normalized = String(value ?? "");
  if (
    normalized.includes(",") ||
    normalized.includes('"') ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}
