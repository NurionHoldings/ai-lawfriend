import type { DocumentParagraphEntity } from "./document-paragraphs.types";

export function composeDocumentBodyFromStoredParagraphs(
  paragraphs: DocumentParagraphEntity[],
) {
  const includedParagraphs = paragraphs
    .filter((paragraph) => paragraph.included)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const grouped = new Map<string, DocumentParagraphEntity[]>();

  for (const paragraph of includedParagraphs) {
    const sectionKey = paragraph.sectionTitle?.trim() || "__default__";
    const current = grouped.get(sectionKey) ?? [];
    current.push(paragraph);
    grouped.set(sectionKey, current);
  }

  const blocks: string[] = [];

  if (grouped.has("__default__")) {
    for (const paragraph of grouped.get("__default__") ?? []) {
      blocks.push(paragraph.content);
    }
    if ((grouped.get("__default__") ?? []).length > 0) {
      blocks.push("");
    }
  }

  for (const [sectionKey, items] of grouped.entries()) {
    if (sectionKey === "__default__") continue;

    blocks.push(sectionKey);
    for (const paragraph of items) {
      blocks.push(paragraph.content);
    }
    blocks.push("");
  }

  return blocks.join("\n").trim();
}
