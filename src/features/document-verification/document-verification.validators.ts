import { z } from "zod";

export const verifyDocumentCodeInputSchema = z.object({
  verificationCode: z
    .string()
    .trim()
    .min(1, "검증코드를 입력해주세요.")
    .max(200, "검증코드가 너무 깁니다."),
});

export type VerifyDocumentCodeInput = z.infer<typeof verifyDocumentCodeInputSchema>;

/** OK 응답 `data` / `documentVerificationService.verifyByCode`·클라이언트 공통 (wire = JSON, 일부 일시 필드 Date 허용). */
const jsonDateString = z
  .union([z.string(), z.date(), z.null()])
  .transform((value) => {
    if (value == null) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  });

const documentVerifyValidSchema = z.object({
  isValid: z.literal(true),
  verificationCode: z.string(),
  fullHash: z.string(),
  document: z.object({
    id: z.string(),
    title: z.string(),
    caseTitle: z.string(),
    caseNumber: z.string(),
  }),
  approvedVersion: z.object({
    id: z.string(),
    versionNumber: z.number(),
    lockedAt: jsonDateString,
    lockReason: z.string(),
  }),
  approver: z.object({
    name: z.string(),
    role: z.string(),
    approvedAt: jsonDateString,
  }),
  sourceTrace: z
    .object({
      templateCode: z.string(),
      templateVersion: z.string(),
      templateTitle: z.string(),
      sourceProvider: z.string(),
      sourceName: z.string().nullable(),
      sourceUrl: z.string().nullable(),
      sourceHash: z.string().nullable(),
      sourceStatus: z.string().nullable(),
      generatedSnapshotAt: jsonDateString,
      approvedSnapshotAt: jsonDateString,
    })
    .nullable(),
  guardrailTrace: z
    .object({
      generationPolicy: z.string(),
      guardrailCheckStatus: z.enum(["PASSED", "FAILED", "SKIPPED"]),
      guardrailIssues: z.array(z.string()),
      warningMissingFields: z.array(
        z.object({
          fieldKey: z.string(),
          label: z.string(),
          severity: z.literal("WARNING"),
          suggestedQuestions: z.array(z.string()),
        }),
      ),
      checkedAt: z.string(),
    })
    .nullable(),
});

const documentVerifyInvalidSchema = z.object({
  isValid: z.literal(false),
  verificationCode: z.string(),
});

export const documentVerificationResultSchema = z.discriminatedUnion("isValid", [
  documentVerifyInvalidSchema,
  documentVerifyValidSchema,
]);

export type DocumentVerificationResult = z.infer<typeof documentVerificationResultSchema>;
