import { z } from "zod";
import { CASE_STATUS_FILTER_OPTIONS } from "@/lib/definitions/case-status-definition";

export const caseIdParamSchema = z.object({
  caseId: z.string().cuid("유효한 사건 ID가 아닙니다."),
});

export const caseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).optional().default(""),
  status: z.enum([...CASE_STATUS_FILTER_OPTIONS, "ALL"]).default("ALL"),
});

const incidentDateField = z
  .union([
    z.literal(""),
    z.string().datetime({ offset: true }),
  ])
  .optional();

export const createCaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "사건명은 필수입니다.")
    .max(120, "사건명은 120자 이하여야 합니다."),
  description: z
    .string()
    .trim()
    .max(5000, "사건 설명은 5000자 이하여야 합니다.")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .trim()
    .max(50, "카테고리는 50자 이하여야 합니다.")
    .optional()
    .or(z.literal("")),
  opponentName: z
    .string()
    .trim()
    .max(100, "상대방 이름은 100자 이하여야 합니다.")
    .optional()
    .or(z.literal("")),
  courtName: z
    .string()
    .trim()
    .max(100, "법원명은 100자 이하여야 합니다.")
    .optional()
    .or(z.literal("")),
  incidentDate: incidentDateField,
});

export const updateCaseSchema = z.object({
  title: z.string().trim().min(1, "사건명은 필수입니다.").max(120).optional(),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  category: z.string().trim().max(50).optional().or(z.literal("")),
  opponentName: z.string().trim().max(100).optional().or(z.literal("")),
  courtName: z.string().trim().max(100).optional().or(z.literal("")),
  incidentDate: incidentDateField,
  status: z.enum(CASE_STATUS_FILTER_OPTIONS).optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type CaseListQueryInput = z.infer<typeof caseListQuerySchema>;
