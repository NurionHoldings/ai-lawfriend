import { prisma } from "@/lib/prisma";
import { normalizeFailureKey } from "@/lib/bulk-jobs/failure-action-recommendation";

export async function getFailedItemsByTaxonomy(params: { jobId: string; taxonomy: string }) {
  const items = await prisma.bulkActionJobItem.findMany({
    where: {
      jobId: params.jobId,
      status: "FAILED",
    },
    select: {
      id: true,
      jobId: true,
      targetType: true,
      targetId: true,
      action: true,
      status: true,
      errorCode: true,
      errorMessage: true,
      errorPayload: true,
      failureCategory: true,
      failureTaxonomyCode: true,
      metadata: true,
      sequence: true,
    },
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
  });

  return items.filter(
    (item) =>
      normalizeFailureKey(
        item.failureCategory ?? undefined,
        item.failureTaxonomyCode ?? undefined
      ) === params.taxonomy
  );
}
