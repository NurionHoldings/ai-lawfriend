import type { AlertRuleSlaConfig } from "./rule-sla-schema";

export function buildDueAtFromRule(input: {
  detectedAt: string | Date;
  slaHours?: number | null;
}) {
  if (!input.slaHours) return null;
  const base = typeof input.detectedAt === "string" ? new Date(input.detectedAt) : input.detectedAt;
  return new Date(base.getTime() + input.slaHours * 60 * 60 * 1000);
}

export function normalizeRuleSlaConfig(config?: AlertRuleSlaConfig | null) {
  return {
    slaHours: config?.slaHours ?? null,
    dueSoonHours: config?.dueSoonHours ?? 24,
    escalationLevel1Hours: config?.escalationLevel1Hours ?? null,
    escalationLevel2Hours: config?.escalationLevel2Hours ?? null,
    escalationLevel3Hours: config?.escalationLevel3Hours ?? null,
  };
}
