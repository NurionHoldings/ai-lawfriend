import type { DocumentTemplateDefinition } from "@/lib/definitions";
import {
  CONSULT_NOTE_TEMPLATE_V1,
  OPINION_TEMPLATE_V1,
  STATEMENT_TEMPLATE_V1,
} from "@/lib/definitions/document-template.sample";

const REGISTRY: Record<string, DocumentTemplateDefinition> = {
  [`${STATEMENT_TEMPLATE_V1.code}@${STATEMENT_TEMPLATE_V1.version}`]: STATEMENT_TEMPLATE_V1,
  [`${OPINION_TEMPLATE_V1.code}@${OPINION_TEMPLATE_V1.version}`]: OPINION_TEMPLATE_V1,
  [`${CONSULT_NOTE_TEMPLATE_V1.code}@${CONSULT_NOTE_TEMPLATE_V1.version}`]:
    CONSULT_NOTE_TEMPLATE_V1,
};

export function getTemplateDefinitionByCodeVersion(code: string, version: string) {
  return REGISTRY[`${code}@${version}`] ?? null;
}
