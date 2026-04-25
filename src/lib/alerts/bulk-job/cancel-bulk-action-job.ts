import { prisma } from "@/lib/prisma";
import { createBulkJobNotification } from "@/lib/alerts/bulk-job/create-bulk-job-notifications";

export async function cancelBulkActionJob(params: {
  jobId: string;
  actorId: string;
  reason?: string;
}) {
  const job = await prisma.bulkActionJob.findUnique({
    where: { id: params.jobId },
  });

  if (!job) {
    throw new Error("Job을 찾을 수 없습니다.");
  }

  if (job.status === "RUNNING") {
    throw new Error("실행 중인 Job은 지금 구조에서는 취소할 수 없습니다.");
  }

  if (!["QUEUED", "FAILED", "PARTIAL_SUCCESS"].includes(job.status)) {
    throw new Error("현재 상태에서는 취소할 수 없습니다.");
  }

  const updated = await prisma.bulkActionJob.update({
    where: { id: params.jobId },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
      canceledById: params.actorId,
      cancelReason: params.reason?.trim() || null,
      finishedAt: new Date(),
      lockedAt: null,
      lockToken: null,
      lockExpiresAt: null,
    },
  });

  await createBulkJobNotification({
    userId: job.actorId,
    jobId: job.id,
    type: "BULK_JOB_CANCELED",
    title: `[대량 액션 취소] ${job.action}`,
    body: params.reason?.trim() || "운영자에 의해 취소되었습니다.",
  });

  return updated;
}
