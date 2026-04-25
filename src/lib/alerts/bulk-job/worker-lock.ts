import crypto from "crypto";
import { BULK_JOB_LOCK_TTL_MS } from "@/lib/admin/bulk-jobs/constants";
import { prisma } from "@/lib/prisma";

export async function acquireBulkJobLock(jobId: string) {
  const now = new Date();
  const lockExpiresAt = new Date(now.getTime() + BULK_JOB_LOCK_TTL_MS);
  const token = crypto.randomUUID();

  const updated = await prisma.bulkActionJob.updateMany({
    where: {
      id: jobId,
      status: {
        in: ["QUEUED", "FAILED", "PARTIAL_SUCCESS"],
      },
      OR: [{ lockExpiresAt: null }, { lockExpiresAt: { lt: now } }],
    },
    data: {
      lockedAt: now,
      lockToken: token,
      lockExpiresAt,
    },
  });

  if (updated.count === 0) {
    return null;
  }

  return {
    token,
    lockExpiresAt,
  };
}

export async function releaseBulkJobLock(jobId: string, token: string) {
  await prisma.bulkActionJob.updateMany({
    where: {
      id: jobId,
      lockToken: token,
    },
    data: {
      lockedAt: null,
      lockToken: null,
      lockExpiresAt: null,
      lockId: null,
    },
  });
}
