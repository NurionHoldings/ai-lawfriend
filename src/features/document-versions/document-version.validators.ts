import { z } from "zod";

/** [FILE-026] 문서·문단 버전 API params/body — [Batch B]·`.strict()` 축. */

export const documentVersionParamsSchema = z
  .object({
    documentId: z.string().min(1, "documentId is required"),
  })
  .strict();

export const documentVersionIdParamsSchema = z
  .object({
    documentId: z.string().min(1, "documentId is required"),
    versionId: z.string().min(1, "versionId is required"),
  })
  .strict();

export const restoreDocumentVersionInputSchema = z
  .object({
    changeSummary: z
      .string()
      .trim()
      .max(1000, "변경 요약이 너무 깁니다.")
      .optional()
      .default("이전 버전으로 복원"),
  })
  .strict();

/** `POST` …/versions/snapshot */
export const createDocumentSnapshotBodySchema = z
  .object({
    changeSummary: z.string().trim().max(1000, "변경 요약이 너무 깁니다.").optional(),
  })
  .strict();

/** `POST` …/paragraph-versions (문단 버전 스냅샷) */
export const postParagraphVersionSnapshotBodySchema = z
  .object({
    reason: z.string().trim().min(1, "reason이 너무 짧습니다.").max(500).optional(),
  })
  .strict();

export type RestoreDocumentVersionInput = z.infer<
  typeof restoreDocumentVersionInputSchema
>;
export type CreateDocumentSnapshotBody = z.infer<typeof createDocumentSnapshotBodySchema>;
export type PostParagraphVersionSnapshotBody = z.infer<
  typeof postParagraphVersionSnapshotBodySchema
>;
