import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type OpsQueueWipConfig = {
  TRIAGE: number;
  QUEUED: number;
  WORKING: number;
  BLOCKED: number;
  DONE: number;
};

export const DEFAULT_OPS_QUEUE_WIP_LIMITS: OpsQueueWipConfig = {
  TRIAGE: 12,
  QUEUED: 20,
  WORKING: 8,
  BLOCKED: 6,
  DONE: 9999,
};

const OPS_QUEUE_WIP_SETTING_KEY = "OPS_QUEUE_WIP_LIMITS";

export function buildWipWarning(count: number, limit: number) {
  const percent = limit <= 0 ? 0 : Math.round((count / limit) * 100);

  return {
    count,
    limit,
    percent,
    isNearLimit: count >= Math.floor(limit * 0.8),
    isOverLimit: count > limit,
  };
}

export async function getOpsQueueWipLimits(): Promise<OpsQueueWipConfig> {
  const row = await prisma.opsQueueSetting.findUnique({
    where: {
      key: OPS_QUEUE_WIP_SETTING_KEY,
    },
  });

  if (!row?.jsonValue || typeof row.jsonValue !== "object" || row.jsonValue === null) {
    return DEFAULT_OPS_QUEUE_WIP_LIMITS;
  }

  const raw = row.jsonValue as Partial<OpsQueueWipConfig>;

  return {
    TRIAGE: Number(raw.TRIAGE ?? DEFAULT_OPS_QUEUE_WIP_LIMITS.TRIAGE),
    QUEUED: Number(raw.QUEUED ?? DEFAULT_OPS_QUEUE_WIP_LIMITS.QUEUED),
    WORKING: Number(raw.WORKING ?? DEFAULT_OPS_QUEUE_WIP_LIMITS.WORKING),
    BLOCKED: Number(raw.BLOCKED ?? DEFAULT_OPS_QUEUE_WIP_LIMITS.BLOCKED),
    DONE: Number(raw.DONE ?? DEFAULT_OPS_QUEUE_WIP_LIMITS.DONE),
  };
}

export async function upsertOpsQueueWipLimits(config: OpsQueueWipConfig) {
  return prisma.opsQueueSetting.upsert({
    where: {
      key: OPS_QUEUE_WIP_SETTING_KEY,
    },
    update: {
      jsonValue: config as Prisma.InputJsonValue,
    },
    create: {
      key: OPS_QUEUE_WIP_SETTING_KEY,
      jsonValue: config as Prisma.InputJsonValue,
    },
  });
}
