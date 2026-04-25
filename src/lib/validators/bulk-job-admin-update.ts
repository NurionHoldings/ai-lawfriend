import { z } from "zod";

export const bulkJobAdminUpdateSchema = z.object({
  priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).optional(),
  queueGroup: z.string().trim().max(100).nullable().optional(),
  concurrencyKey: z.string().trim().max(150).nullable().optional(),
  maxConcurrency: z.number().int().min(1).max(1000).optional(),
});

export type BulkJobAdminUpdateInput = z.infer<typeof bulkJobAdminUpdateSchema>;
