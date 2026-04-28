import { z } from "zod";

export const QaEvidenceClassificationTypeSchema = z.enum([
  "PASS",
  "PASS_WITH_NOTES",
  "FAIL",
  "BLOCKED",
  "N_A",
  "NEEDS_FOLLOW_UP",
  "OUT_OF_SCOPE",
  "REOPEN_REQUIRED",
]);

export type QaEvidenceClassificationType = z.infer<
  typeof QaEvidenceClassificationTypeSchema
>;

export const QaEvidenceAnalysisStatusSchema = z.enum([
  "DRAFT",
  "NEEDS_REVIEW",
  "NEEDS_QA_REPLY",
  "READY_FOR_COPY",
  "BLOCKED",
  "REJECTED",
]);

export type QaEvidenceAnalysisStatus = z.infer<
  typeof QaEvidenceAnalysisStatusSchema
>;

export const QaEvidenceAnalyzeInputSchema = z.object({
  qaPerformedAt: z.string().trim().optional().default(""),
  qaOwner: z.string().trim().optional().default(""),
  testEnvironmentUrl: z.string().trim().optional().default(""),
  accountRoles: z.array(z.string().trim()).optional().default([]),
  sourceText: z.string().trim().min(1, "QA 회신 원문을 입력해야 합니다."),
  attachmentNotes: z.string().trim().optional().default(""),
  operatorMemo: z.string().trim().optional().default(""),
});

export type QaEvidenceAnalyzeInput = z.infer<typeof QaEvidenceAnalyzeInputSchema>;

export const QaEvidenceClassificationSchema = z.object({
  type: QaEvidenceClassificationTypeSchema,
  title: z.string(),
  evidence: z.string(),
  scope: z.string(),
  followUp: z.string(),
});

export type QaEvidenceClassification = z.infer<
  typeof QaEvidenceClassificationSchema
>;

export const QaEvidenceAnalyzeOutputSchema = z.object({
  status: QaEvidenceAnalysisStatusSchema,
  missingFields: z.array(z.string()),
  summary: z.object({
    passCount: z.number(),
    failCount: z.number(),
    blockedCount: z.number(),
    naCount: z.number(),
    needsFollowUpCount: z.number(),
  }),
  classifications: z.array(QaEvidenceClassificationSchema),
  closureDraftMarkdown: z.string(),
  sourceRecordMarkdown: z.string(),
  followupTrackerDraftMarkdown: z.string(),
  warnings: z.array(z.string()),
});

export type QaEvidenceAnalyzeOutput = z.infer<typeof QaEvidenceAnalyzeOutputSchema>;

export function normalizeAccountRoles(roles: string[]): string[] {
  return roles
    .map((role) => role.trim())
    .filter(Boolean)
    .filter((role, index, arr) => arr.indexOf(role) === index);
}
