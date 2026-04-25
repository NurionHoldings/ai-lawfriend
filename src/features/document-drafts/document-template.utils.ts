import type {
  DocumentTemplateType,
  QuestionDocumentMapping,
  QuestionDocumentMappingRule,
} from "@/features/question-set/question-set.types";

export function resolveDocumentMappingForTemplate(params: {
  mapping: QuestionDocumentMapping | null | undefined;
  templateType: DocumentTemplateType;
}): QuestionDocumentMappingRule | null {
  const { mapping, templateType } = params;

  if (!mapping) return null;

  const override = mapping.templateOverrides?.[templateType] ?? null;

  return {
    enabled: override?.enabled ?? mapping.enabled ?? false,
    sectionTitle: override?.sectionTitle ?? mapping.sectionTitle ?? null,
    paragraphLabel: override?.paragraphLabel ?? mapping.paragraphLabel ?? null,
    order: override?.order ?? mapping.order ?? null,
    format: override?.format ?? mapping.format ?? "BLOCK",
    emptyPolicy: override?.emptyPolicy ?? mapping.emptyPolicy ?? "SKIP",
    prefix: override?.prefix ?? mapping.prefix ?? null,
    suffix: override?.suffix ?? mapping.suffix ?? null,
  };
}
