import type { DocumentTemplateType } from "@/features/question-set/question-set.types";

export type DocumentTemplateConfig = {
  type: DocumentTemplateType;
  titleSuffix: string;
  defaultSections: string[];
};

export const DOCUMENT_TEMPLATE_TYPES: DocumentTemplateType[] = [
  "STATEMENT",
  "LEGAL_OPINION",
  "CONSULTATION_NOTE",
];
