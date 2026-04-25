import { z } from "zod";
import { alertRuleSlaConfigSchema } from "@/lib/alerts/rule-sla-schema";
import { ALERT_RULE_TYPES, ALERT_SEVERITIES, ALERT_EVENT_STATUSES } from "./types";

export const alertRuleTypeSchema = z.enum(ALERT_RULE_TYPES);
export const alertSeveritySchema = z.enum(ALERT_SEVERITIES);
export const alertEventStatusSchema = z.enum(ALERT_EVENT_STATUSES);

export const roleSpikeRuleConfigSchema = z.object({
  timeWindowHours: z.number().int().min(1).max(168),
  minCount: z.number().int().min(1).max(100000),
  spikeMultiplier: z.number().min(1).max(100),
  roleTargets: z.array(z.string().min(1)).min(1),
});

export const nightActivityRuleConfigSchema = z.object({
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(0).max(23),
  minCount: z.number().int().min(1).max(100000),
  whitelistActionTypes: z.array(z.string().min(1)).default([]),
});

export const actionPolicyRuleConfigSchema = z.object({
  blacklist: z.array(z.string().min(1)).default([]),
  whitelist: z.array(z.string().min(1)).default([]),
  mode: z.enum(["BLACKLIST_ONLY", "WHITELIST_ONLY", "BOTH"]),
});

export const createAlertRuleSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(2).max(100).regex(/^[A-Z0-9_]+$/),
  type: alertRuleTypeSchema,
  enabled: z.boolean().default(true),
  severity: alertSeveritySchema.default("WARNING"),
  description: z.string().max(500).optional().nullable(),
  configJson: z.unknown(),
});

export const alertEscalationTargetGroupSchema = z.enum([
  "ADMINS",
  "LAWYERS",
  "ASSIGNEE",
  "CUSTOM_USERS",
]);

export const updateAlertRuleSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    enabled: z.boolean().optional(),
    severity: alertSeveritySchema.optional(),
    description: z.string().max(500).optional().nullable(),
    configJson: z.unknown().optional(),
    escalationTargetGroups: z.array(alertEscalationTargetGroupSchema).optional(),
    escalationUserIdsJson: z.array(z.string().uuid()).optional(),
  })
  .merge(alertRuleSlaConfigSchema.partial());

export const listAlertEventsQuerySchema = z.object({
  status: alertEventStatusSchema.optional(),
  severity: alertSeveritySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
});

export const updateAlertEventStatusSchema = z.object({
  status: z.enum(["ACKNOWLEDGED", "IGNORED", "RESOLVED"]),
});

export const assignAlertEventSchema = z.object({
  assigneeUserId: z
    .union([z.string().uuid(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  dueAt: z
    .union([z.string(), z.literal(""), z.null()])
    .optional()
    .nullable()
    .transform((v) => (v === "" || v == null || v === undefined ? null : v)),
});

export function validateRuleConfig(type: string, configJson: unknown) {
  if (type === "ROLE_SPIKE") {
    return roleSpikeRuleConfigSchema.parse(configJson);
  }
  if (type === "NIGHT_ACTIVITY") {
    return nightActivityRuleConfigSchema.parse(configJson);
  }
  if (type === "ACTION_POLICY") {
    return actionPolicyRuleConfigSchema.parse(configJson);
  }
  throw new Error("지원하지 않는 규칙 타입입니다.");
}
