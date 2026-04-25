import { z } from "zod";

export const bulkJobScheduleBulkUpdateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("cancel"),
    scheduleIds: z.array(z.string().min(1)).min(1).max(200),
  }),
  z.object({
    action: z.literal("reschedule"),
    scheduleIds: z.array(z.string().min(1)).min(1).max(200),
    scheduledFor: z.string().datetime(),
    note: z.string().trim().max(500).optional(),
  }),
]);

export type BulkJobScheduleBulkUpdateInput = z.infer<
  typeof bulkJobScheduleBulkUpdateSchema
>;
