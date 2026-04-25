import { z } from "zod";

/** [FILE-020] 초안·재생성 body — [§5·Batch C] `.strict()` (Batch A/B body 정렬 이어 받음). */

export const documentDraftTypeSchema = z.enum([
  "fact_sheet",
  "statement",
  "consultation_qna",
  "overview",
  "evidence_list",
  "interview_mapped",
]);

export const documentTemplateTypeSchema = z.enum([
  "STATEMENT",
  "LEGAL_OPINION",
  "CONSULTATION_NOTE",
]);

export const createDocumentDraftSchema = z
  .object({
    type: documentDraftTypeSchema,
    title: z.string().trim().min(1).max(200).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.type === "interview_mapped") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "인터뷰 매핑 문서는 미리보기(/api/cases/.../documents/draft/preview) 후 최종 생성을 사용하세요.",
        path: ["type"],
      });
    }
  });

export const draftPreviewBodySchema = z
  .object({
    templateType: documentTemplateTypeSchema,
  })
  .strict();

export const finalizeInterviewDraftSchema = z
  .object({
  templateType: documentTemplateTypeSchema,
  title: z.string().max(500).optional(),
  paragraphs: z.array(
    z.object({
      id: z.string(),
      sectionTitle: z.string().nullable().optional(),
      label: z.string().nullable().optional(),
      content: z.string(),
      format: z.enum(["INLINE", "BLOCK", "BULLET"]),
      order: z.number(),
      sourceQuestionKey: z.string(),
      included: z.boolean(),
      locked: z.boolean().optional(),
      aiHint: z.string().nullable().optional(),
    }),
  ),
})
  .strict();

export const regenerateDraftParagraphsSchema = z
  .object({
    templateType: documentTemplateTypeSchema,
    title: z.string().max(500).optional(),
    paragraphs: finalizeInterviewDraftSchema.shape.paragraphs,
    targetParagraphIds: z.array(z.string()).min(1),
    force: z.boolean().optional(),
    instructionByParagraphId: z
      .record(z.string(), z.string().nullable().optional())
      .optional(),
    documentId: z.string().nullable().optional(),
  })
  .strict();

export type DocumentDraftType = z.infer<typeof documentDraftTypeSchema>;
export type CreateDocumentDraftInput = z.infer<typeof createDocumentDraftSchema>;
export type FinalizeInterviewDraftInput = z.infer<typeof finalizeInterviewDraftSchema>;
