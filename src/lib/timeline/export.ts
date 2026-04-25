type TimelineItem = {
  id: string;
  caseId: string | null;
  type: string;
  message: string;
  actorName: string | null;
  actorEmail: string | null;
  createdAt: Date;
  metaJson?: unknown;
};

function escapeCsv(value: unknown) {
  const s =
    value == null
      ? ""
      : typeof value === "string"
        ? value
        : JSON.stringify(value);
  return `"${String(s).replace(/"/g, '""')}"`;
}

export function buildTimelineCsv(items: TimelineItem[]) {
  const header = [
    "id",
    "caseId",
    "type",
    "message",
    "actorName",
    "actorEmail",
    "createdAt",
    "metaJson",
  ].join(",");

  const rows = items.map((item) =>
    [
      escapeCsv(item.id),
      escapeCsv(item.caseId),
      escapeCsv(item.type),
      escapeCsv(item.message),
      escapeCsv(item.actorName),
      escapeCsv(item.actorEmail),
      escapeCsv(item.createdAt.toISOString()),
      escapeCsv(item.metaJson ?? null),
    ].join(","),
  );

  return [header, ...rows].join("\n");
}

export function buildTimelineJson(items: TimelineItem[]) {
  return JSON.stringify(
    items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    null,
    2,
  );
}
