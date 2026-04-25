import { z } from "zod";

const dateStringSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "유효한 날짜 형식이 아닙니다.");

export const auditLogListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    actorUserId: z.string().trim().optional().default(""),
    action: z.string().trim().optional().default(""),
    entityType: z.string().trim().optional().default(""),
    entityId: z.string().trim().optional().default(""),
    /** URL `q` — 통합 검색(딥링크 등) */
    q: z.string().trim().optional().default(""),
    search: z.string().trim().optional().default(""),
    dateFrom: z.union([dateStringSchema, z.literal("")]).optional().default(""),
    dateTo: z.union([dateStringSchema, z.literal("")]).optional().default(""),
  })
  .transform((data) => ({
    ...data,
    search: (data.q || data.search).trim(),
  }));

export const auditLogSummaryQuerySchema = z.object({
  dateFrom: z.union([dateStringSchema, z.literal("")]).optional().default(""),
  dateTo: z.union([dateStringSchema, z.literal("")]).optional().default(""),
});

export type AuditLogListQueryInput = z.infer<typeof auditLogListQuerySchema>;
export type AuditLogSummaryQueryInput = z.infer<typeof auditLogSummaryQuerySchema>;
