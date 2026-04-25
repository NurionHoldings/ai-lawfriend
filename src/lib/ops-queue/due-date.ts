export const OPS_QUEUE_DUE_PRESETS = [
  "END_OF_TODAY",
  "TOMORROW_9AM",
  "PLUS_3_DAYS_9AM",
] as const;

export type OpsQueueDuePreset = (typeof OPS_QUEUE_DUE_PRESETS)[number];

export function resolveDuePreset(preset: OpsQueueDuePreset, now = new Date()): Date {
  const d = new Date(now);

  if (preset === "END_OF_TODAY") {
    d.setHours(23, 59, 59, 999);
    return d;
  }

  if (preset === "TOMORROW_9AM") {
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d;
  }

  d.setDate(d.getDate() + 3);
  d.setHours(9, 0, 0, 0);
  return d;
}
