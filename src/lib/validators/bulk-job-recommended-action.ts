import { z } from "zod";

export const bulkJobRecommendedActionSchema = z.object({
  taxonomy: z.string().min(1),
  bulkVariant: z.enum([
    "retry_failed_items",
    "mark_permission_check",
    "mark_input_fix_required",
    "mark_manual_review",
    "inspect_dependency_only",
    "wait_and_retry_later",
  ]),
  note: z.string().trim().max(500).optional(),
});

export type BulkJobRecommendedActionInput = z.infer<typeof bulkJobRecommendedActionSchema>;
