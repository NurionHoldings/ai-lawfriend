export function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsv).join(",");
  const body = rows
    .map((row) => headers.map((key) => escapeCsv(row[key])).join(","))
    .join("\n");

  return `${headerLine}\n${body}`;
}
