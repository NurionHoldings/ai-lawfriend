import type {
  DraftDocumentParagraph,
  DraftPreviewParagraph,
} from "./document-draft.types";
import { DOCUMENT_TEMPLATE_CONFIG } from "./document-template.config";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";

export function sortParagraphs<T extends { order: number }>(paragraphs: T[]) {
  return [...paragraphs].sort((a, b) => a.order - b.order);
}

export function composeBodyFromParagraphs(params: {
  templateType: DocumentTemplateType;
  paragraphs: Array<DraftDocumentParagraph | DraftPreviewParagraph>;
}) {
  const { templateType, paragraphs } = params;
  const templateConfig = DOCUMENT_TEMPLATE_CONFIG[templateType];
  const grouped = new Map<
    string,
    Array<DraftDocumentParagraph | DraftPreviewParagraph>
  >();

  for (const paragraph of sortParagraphs(paragraphs)) {
    const sectionKey = paragraph.sectionTitle?.trim() || "__default__";
    const current = grouped.get(sectionKey) ?? [];
    current.push(paragraph);
    grouped.set(sectionKey, current);
  }

  const blocks: string[] = [];

  if (grouped.has("__default__")) {
    for (const item of sortParagraphs(grouped.get("__default__") ?? [])) {
      blocks.push(item.content);
    }
    if ((grouped.get("__default__") ?? []).length > 0) {
      blocks.push("");
    }
  }

  const orderedSectionKeys = [
    ...templateConfig.defaultSections.filter((section) => grouped.has(section)),
    ...Array.from(grouped.keys()).filter(
      (section) =>
        section !== "__default__" && !templateConfig.defaultSections.includes(section),
    ),
  ];

  for (const sectionKey of orderedSectionKeys) {
    blocks.push(sectionKey);

    for (const item of sortParagraphs(grouped.get(sectionKey) ?? [])) {
      blocks.push(item.content);
    }

    blocks.push("");
  }

  return blocks.join("\n").trim();
}

export function buildPreviewBody(params: {
  templateType: DocumentTemplateType;
  paragraphs: DraftPreviewParagraph[];
}) {
  const includedParagraphs = params.paragraphs.filter((paragraph) => paragraph.included);

  return composeBodyFromParagraphs({
    templateType: params.templateType,
    paragraphs: includedParagraphs,
  });
}
