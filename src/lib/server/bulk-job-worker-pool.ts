import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

type ClaimNextJobArgs = {
  workerId: string;
  lockTtlSeconds?: number;
};

export async function claimNextBulkJob({
  workerId,
  lockTtlSeconds = 120,
}: ClaimNextJobArgs) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + lockTtlSeconds * 1000);

  const queuedJobs = await prisma.bulkActionJob.findMany({
    where: {
      status: "QUEUED",
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      priority: true,
      queueGroup: true,
      concurrencyKey: true,
      maxConcurrency: true,
      createdAt: true,
    },
    take: 50,
  });

  for (const job of queuedJobs) {
    if (job.concurrencyKey) {
      const activeCount = await prisma.bulkActionJob.count({
        where: {
          concurrencyKey: job.concurrencyKey,
          status: "RUNNING",
          lockExpiresAt: {
            gt: now,
          },
        },
      });

      if (activeCount >= job.maxConcurrency) {
        continue;
      }
    }

    const lockToken = randomUUID();

    const updated = await prisma.bulkActionJob.updateMany({
      where: {
        id: job.id,
        status: "QUEUED",
      },
      data: {
        status: "RUNNING",
        startedAt: now,
        lockId: workerId,
        lockToken,
        lockedAt: now,
        lockExpiresAt: expiresAt,
        lastHeartbeatAt: now,
        heartbeatCount: { increment: 1 },
      },
    });

    if (updated.count === 1) {
      return prisma.bulkActionJob.findUnique({
        where: { id: job.id },
        include: {
          items: {
            orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
          },
        },
      });
    }
  }

  return null;
}

export async function refreshBulkJobHeartbeat(
  jobId: string,
  workerId: string,
  ttlSeconds = 120
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  await prisma.bulkActionJob.updateMany({
    where: {
      id: jobId,
      lockId: workerId,
      status: "RUNNING",
    },
    data: {
      lastHeartbeatAt: now,
      lockExpiresAt: expiresAt,
      heartbeatCount: { increment: 1 },
    },
  });
}
