import { z } from "zod";
import { DocumentTypeEnum } from "./common";

export const TemplateSectionTypeEnum = z.enum([
  "HEADER",
  "BODY",
  "FOOTER",
  "SIGNATURE",
  "ATTACHMENT_GUIDE",
]);
export type TemplateSectionType = z.infer<typeof TemplateSectionTypeEnum>;

export const ParagraphGenerationModeEnum = z.enum([
  "MANUAL_ONLY",
  "AI_GENERATE",
  "AI_REGENERATE",
  "LOCK_AFTER_APPROVAL",
]);
export type ParagraphGenerationMode = z.infer<typeof ParagraphGenerationModeEnum>;

export const TemplateParagraphDefinitionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean().default(false),
  generationMode: ParagraphGenerationModeEnum.default("AI_GENERATE"),
  aiPromptKey: z.string().optional(),
  fallbackText: z.string().optional(),
  supportsRegeneration: z.boolean().default(true),
  supportsRestore: z.boolean().default(true),
  lockOnApproval: z.boolean().default(true),
});

export type TemplateParagraphDefinition = z.infer<typeof TemplateParagraphDefinitionSchema>;

export const TemplateSectionDefinitionSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  type: TemplateSectionTypeEnum.default("BODY"),
  /** 편집 중 빈 섹션 허용 */
  paragraphs: z.array(TemplateParagraphDefinitionSchema).default([]),
});

export type TemplateSectionDefinition = z.infer<typeof TemplateSectionDefinitionSchema>;

export const DocumentTemplateDefinitionSchema = z.object({
  version: z.string().min(1),
  code: z.string().min(1),
  type: DocumentTypeEnum,
  title: z.string().min(1),
  description: z.string().optional(),
  sections: z.array(TemplateSectionDefinitionSchema).default([]),
});

export type DocumentTemplateDefinition = z.infer<typeof DocumentTemplateDefinitionSchema>;

export type GeneratedParagraphSeed = {
  sectionKey: string;
  paragraphKey: string;
  title: string;
  order: number;
  required: boolean;
  generationMode: ParagraphGenerationMode;
  aiPromptKey?: string;
  fallbackText?: string;
  lockOnApproval: boolean;
  supportsRegeneration: boolean;
  supportsRestore: boolean;
};

export function buildParagraphSeeds(template: DocumentTemplateDefinition): GeneratedParagraphSeed[] {
  return template.sections.flatMap((section) =>
    section.paragraphs.map((paragraph) => ({
      sectionKey: section.key,
      paragraphKey: paragraph.key,
      title: paragraph.title,
      order: paragraph.order,
      required: paragraph.required,
      generationMode: paragraph.generationMode,
      aiPromptKey: paragraph.aiPromptKey,
      fallbackText: paragraph.fallbackText,
      lockOnApproval: paragraph.lockOnApproval,
      supportsRegeneration: paragraph.supportsRegeneration,
      supportsRestore: paragraph.supportsRestore,
    })),
  );
}
