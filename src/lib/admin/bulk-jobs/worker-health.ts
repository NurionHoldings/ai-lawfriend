import os from "os";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  BULK_JOB_HEARTBEAT_INTERVAL_MS,
  BULK_JOB_LOCK_TTL_MS,
  WORKER_STALE_MS,
} from "@/lib/admin/bulk-jobs/constants";

export async function extendJobLockHeartbeat(params: {
  jobId: string;
  lockToken: string;
}) {
  const now = new Date();
  const nextExpiry = new Date(now.getTime() + BULK_JOB_LOCK_TTL_MS);

  const updated = await prisma.bulkActionJob.updateMany({
    where: {
      id: params.jobId,
      status: "RUNNING",
      lockToken: params.lockToken,
    },
    data: {
      lockedAt: now,
      lastHeartbeatAt: now,
      lockExpiresAt: nextExpiry,
      heartbeatCount: {
        increment: 1,
      },
    },
  });

  return updated.count > 0;
}

export async function upsertWorkerHeartbeat(params: {
  workerKey: string;
  workerType: string;
  status: "IDLE" | "RUNNING" | "ERROR" | "STOPPED";
  currentJobId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const now = new Date();

  await prisma.workerHeartbeat.upsert({
    where: { workerKey: params.workerKey },
    create: {
      workerKey: params.workerKey,
      workerType: params.workerType,
      hostname: os.hostname(),
      pid: process.pid,
      status: params.status,
      currentJobId: params.currentJobId ?? null,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      lastHeartbeatAt: now,
    },
    update: {
      hostname: os.hostname(),
      pid: process.pid,
      status: params.status,
      currentJobId: params.currentJobId ?? null,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      lastHeartbeatAt: now,
    },
  });
}

export function startHeartbeatTimers(params: {
  jobId: string;
  lockToken: string;
  workerKey: string;
  workerType: string;
  metadata?: Record<string, unknown>;
}) {
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    await Promise.all([
      extendJobLockHeartbeat({
        jobId: params.jobId,
        lockToken: params.lockToken,
      }),
      upsertWorkerHeartbeat({
        workerKey: params.workerKey,
        workerType: params.workerType,
        status: "RUNNING",
        currentJobId: params.jobId,
        metadata: params.metadata,
      }),
    ]);
  };

  const interval = setInterval(() => {
    void tick();
  }, BULK_JOB_HEARTBEAT_INTERVAL_MS);

  return {
    async beatOnce() {
      await tick();
    },
    async stop(finalStatus: "IDLE" | "ERROR" | "STOPPED" = "IDLE") {
      stopped = true;
      clearInterval(interval);
      await upsertWorkerHeartbeat({
        workerKey: params.workerKey,
        workerType: params.workerType,
        status: finalStatus,
        currentJobId: null,
        metadata: params.metadata,
      });
    },
  };
}

export async function getWorkerHealthSummary() {
  const now = Date.now();
  const workers = await prisma.workerHeartbeat.findMany({
    orderBy: [{ workerType: "asc" }, { workerKey: "asc" }],
  });

  const rows = workers.map((worker) => {
    const ageMs = now - worker.lastHeartbeatAt.getTime();
    const isStale = ageMs > WORKER_STALE_MS;
    return {
      ...worker,
      isStale,
      ageMs,
    };
  });

  return {
    total: rows.length,
    running: rows.filter((w) => w.status === "RUNNING" && !w.isStale).length,
    stale: rows.filter((w) => w.isStale).length,
    error: rows.filter((w) => w.status === "ERROR").length,
    items: rows,
  };
}
