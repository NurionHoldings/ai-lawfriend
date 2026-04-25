import type { AlertEscalationLevel } from "@prisma/client";

const rank: Record<AlertEscalationLevel, number> = {
  NONE: 0,
  LEVEL_1: 1,
  LEVEL_2: 2,
  LEVEL_3: 3,
};

export function maxEscalationLevelFromPending(
  levels: AlertEscalationLevel[]
): AlertEscalationLevel {
  if (levels.length === 0) return "NONE";
  return levels.reduce((best, cur) => (rank[cur] > rank[best] ? cur : best));
}
