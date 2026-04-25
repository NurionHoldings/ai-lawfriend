export function toCsvValue(value: unknown) {
  if (value == null) return "";
  const str = typeof value === "string" ? value : JSON.stringify(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildCsv(headers: string[], rows: unknown[][]) {
  const headerLine = headers.map((h) => toCsvValue(h)).join(",");
  const rowLines = rows.map((row) => row.map((cell) => toCsvValue(cell)).join(","));
  return [headerLine, ...rowLines].join("\n");
}
