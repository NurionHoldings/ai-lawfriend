export type CompareDiffFilter = "all" | "improved" | "worsened" | "changed";

export type JobCompareItemRow = {
  targetId: string;
  targetType?: string;
  action?: string;
  sourceStatus: string | null;
  retryStatus: string | null;
  sourceFailureCode: string | null;
  retryFailureCode: string | null;
  sourceFailureMessage: string | null;
  retryFailureMessage: string | null;
};

function normalizeStatus(status: string | null | undefined) {
  return (status ?? "").toUpperCase();
}

function isSuccessStatus(s: string) {
  return s === "SUCCESS" || s === "SUCCEEDED" || s === "COMPLETED";
}

export function isImproved(row: JobCompareItemRow) {
  const from = normalizeStatus(row.sourceStatus);
  const to = normalizeStatus(row.retryStatus);

  if (!from && !to) return false;
  if (from === to) return false;

  return (
    (from === "FAILED" && isSuccessStatus(to)) ||
    (from === "SKIPPED" && isSuccessStatus(to)) ||
    (from === "RUNNING" && isSuccessStatus(to))
  );
}

export function isWorsened(row: JobCompareItemRow) {
  const from = normalizeStatus(row.sourceStatus);
  const to = normalizeStatus(row.retryStatus);

  if (!from && !to) return false;
  if (from === to) return false;

  return (
    (isSuccessStatus(from) && (to === "FAILED" || to === "SKIPPED")) ||
    (from === "SKIPPED" && to === "FAILED")
  );
}

export function isChanged(row: JobCompareItemRow) {
  return (
    normalizeStatus(row.sourceStatus) !== normalizeStatus(row.retryStatus) ||
    (row.sourceFailureCode ?? "") !== (row.retryFailureCode ?? "") ||
    (row.sourceFailureMessage ?? "") !== (row.retryFailureMessage ?? "")
  );
}

export type DiffLabel = "improved" | "worsened" | "changed" | "same";

export function getDiffLabel(row: JobCompareItemRow): DiffLabel {
  if (isImproved(row)) return "improved";
  if (isWorsened(row)) return "worsened";
  if (isChanged(row)) return "changed";
  return "same";
}

export function applyCompareDiffFilter(
  rows: JobCompareItemRow[],
  filter: CompareDiffFilter
): JobCompareItemRow[] {
  switch (filter) {
    case "improved":
      return rows.filter(isImproved);
    case "worsened":
      return rows.filter(isWorsened);
    case "changed":
      return rows.filter((row) => getDiffLabel(row) === "changed");
    case "all":
    default:
      return rows;
  }
}
