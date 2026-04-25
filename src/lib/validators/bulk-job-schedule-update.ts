import { z } from "zod";

export const bulkJobScheduleCancelSchema = z.object({
  action: z.literal("cancel"),
});

export const bulkJobScheduleRescheduleSchema = z.object({
  action: z.literal("reschedule"),
  scheduledFor: z.string().datetime(),
  note: z.string().trim().max(500).optional(),
});

export const bulkJobScheduleUpdateSchema = z.discriminatedUnion("action", [
  bulkJobScheduleCancelSchema,
  bulkJobScheduleRescheduleSchema,
]);

export type BulkJobScheduleUpdateInput = z.infer<typeof bulkJobScheduleUpdateSchema>;
