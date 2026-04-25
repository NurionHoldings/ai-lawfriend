import type { ParagraphDiffLine } from "./document-draft.types";

function normalizeLines(text: string) {
  return (text ?? "").replace(/\r\n/g, "\n").split("\n");
}

export function buildParagraphLineDiff(params: {
  beforeText: string;
  afterText: string;
}) {
  const beforeLines = normalizeLines(params.beforeText);
  const afterLines = normalizeLines(params.afterText);

  const max = Math.max(beforeLines.length, afterLines.length);
  const lines: ParagraphDiffLine[] = [];

  for (let i = 0; i < max; i += 1) {
    const left = beforeLines[i];
    const right = afterLines[i];

    if (left === right) {
      lines.push({
        type: "UNCHANGED",
        left,
        right,
      });
      continue;
    }

    if (left !== undefined && right === undefined) {
      lines.push({
        type: "REMOVED",
        left,
      });
      continue;
    }

    if (left === undefined && right !== undefined) {
      lines.push({
        type: "ADDED",
        right,
      });
      continue;
    }

    lines.push({
      type: "REMOVED",
      left,
    });
    lines.push({
      type: "ADDED",
      right,
    });
  }

  return lines;
}

export function filterParagraphDiffLines(
  lines: ParagraphDiffLine[],
  filter: "ALL" | "CHANGED_ONLY" | "ADDED_ONLY" | "REMOVED_ONLY",
) {
  switch (filter) {
    case "CHANGED_ONLY":
      return lines.filter((line) => line.type !== "UNCHANGED");
    case "ADDED_ONLY":
      return lines.filter((line) => line.type === "ADDED");
    case "REMOVED_ONLY":
      return lines.filter((line) => line.type === "REMOVED");
    case "ALL":
    default:
      return lines;
  }
}
