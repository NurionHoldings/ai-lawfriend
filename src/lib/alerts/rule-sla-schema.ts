import { z } from "zod";

export const alertRuleSlaConfigSchema = z.object({
  slaHours: z.number().int().min(1).max(24 * 365).nullable().optional(),
  dueSoonHours: z.number().int().min(1).max(24 * 30).nullable().optional(),
  escalationLevel1Hours: z.number().int().min(1).max(24 * 365).nullable().optional(),
  escalationLevel2Hours: z.number().int().min(1).max(24 * 365).nullable().optional(),
  escalationLevel3Hours: z.number().int().min(1).max(24 * 365).nullable().optional(),
});

export type AlertRuleSlaConfig = z.infer<typeof alertRuleSlaConfigSchema>;
