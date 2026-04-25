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
  .transform((v) => (v == null ? null : v instanceof Date ? v.toISOString() : v));

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
