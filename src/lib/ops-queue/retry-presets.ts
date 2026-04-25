import type { RetryMovePreset } from "./types";

export function resolveRetryPresetDate(
  preset: RetryMovePreset,
  now = new Date(),
): Date {
  const d = new Date(now);

  if (preset === "30_MIN") {
    d.setMinutes(d.getMinutes() + 30);
    return d;
  }

  if (preset === "1_HOUR") {
    d.setHours(d.getHours() + 1);
    return d;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
}
