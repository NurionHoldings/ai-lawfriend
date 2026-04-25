import type { UpsertDocumentParagraphInput } from "./document-paragraphs.types";

export function splitBodyToParagraphSeeds(params: {
  documentId: string;
  caseId: string;
  body: string;
}) {
  const normalized = (params.body ?? "").replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [] as UpsertDocumentParagraphInput[];
  }

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  let currentSectionTitle: string | null = null;
  let orderIndex = 1;

  const paragraphs: UpsertDocumentParagraphInput[] = [];

  for (const block of rawBlocks) {
    const isSectionLike =
      /^\d+\.\s/.test(block) && !block.includes("\n") && block.length <= 120;

    if (isSectionLike) {
      currentSectionTitle = block;
      continue;
    }

    const firstLine = block.split("\n")[0]?.trim() ?? "";
    const label =
      firstLine && !firstLine.includes(":") && block.includes("\n") ? firstLine : null;

    paragraphs.push({
      documentId: params.documentId,
      caseId: params.caseId,
      sectionTitle: currentSectionTitle,
      label,
      content: block,
      format: block.startsWith("- ") ? "BULLET" : "BLOCK",
      orderIndex,
      included: true,
      locked: false,
      aiHint: "BODY_BACKFILL",
      sourceQuestionKey: null,
    });

    orderIndex += 1;
  }

  return paragraphs;
}
