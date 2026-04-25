import { z } from "zod";

/** route params — `.strict()`: [FILE-022]·[§5·Batch B] */
export const documentIdParamsSchema = z
  .object({
    documentId: z.string().min(1, "documentId is required"),
  })
  .strict();

export const updateDocumentInputSchema = z
  .object({
    title: z.string().trim().min(1, "제목을 입력해주세요.").max(200, "제목이 너무 깁니다."),
    content: z.string().trim().min(1, "본문을 입력해주세요."),
  })
  .strict();

export const reviewDocumentInputSchema = z
  .object({
    action: z.enum(["REQUEST_REVIEW", "APPROVE", "REJECT"]),
    reviewComment: z.string().trim().max(5000).optional().default(""),
  })
  .strict();

/** `PUT` `/api/documents/:id/paragraphs` — [FILE-023] */
export const putDocumentParagraphsBodySchema = z
  .object({
    paragraphs: z.array(z.unknown()).default([]),
  })
  .strict();

/** `PATCH` `/api/documents/:id/approval-review` — [FILE-028] */
export const markApprovalReviewBodySchema = z
  .object({
    reviewChecked: z.boolean().optional(),
    diffReviewed: z.boolean().optional(),
    checklistConfirmed: z.boolean().optional(),
  })
  .strict();

export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;
export type ReviewDocumentInput = z.infer<typeof reviewDocumentInputSchema>;
export type PutDocumentParagraphsBody = z.infer<typeof putDocumentParagraphsBodySchema>;
export type MarkApprovalReviewBody = z.infer<typeof markApprovalReviewBodySchema>;
