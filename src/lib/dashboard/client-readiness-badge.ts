export function getClientReadinessBadgeLabel(
  percent?: number,
): string | undefined {
  if (typeof percent !== "number") {
    return undefined;
  }

  if (percent >= 80) {
    return `정리도 ${percent}% · 검토 준비`;
  }

  if (percent >= 40) {
    return `정리도 ${percent}% · 보완 중`;
  }

  return `정리도 ${percent}% · 입력 필요`;
}

export function getClientReadinessTone(
  percent?: number,
): "cyan" | "amber" | "slate" {
  if (typeof percent !== "number") {
    return "slate";
  }

  if (percent >= 80) {
    return "cyan";
  }

  if (percent >= 40) {
    return "amber";
  }

  return "slate";
}
