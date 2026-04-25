import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function createBulkJobNotification(params: {
  userId: string;
  jobId: string;
  type: Extract<
    NotificationType,
    | "BULK_JOB_SUCCESS"
    | "BULK_JOB_PARTIAL_SUCCESS"
    | "BULK_JOB_FAILED"
    | "BULK_JOB_CANCELED"
  >;
  title: string;
  body: string;
}) {
  await prisma.adminNotification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      targetHref: `/admin/alerts/bulk-jobs/${params.jobId}`,
      metaJson: {
        bulkActionJobId: params.jobId,
      },
    },
  });
}
