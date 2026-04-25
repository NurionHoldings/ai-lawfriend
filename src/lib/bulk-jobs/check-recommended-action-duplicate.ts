import { prisma } from "@/lib/prisma";
import { buildRecommendedActionDedupeKey } from "@/lib/bulk-jobs/recommended-action-dedupe";
import type { RecommendedBulkVariant } from "@/lib/bulk-jobs/recommended-action-dedupe";

export async function checkRecommendedActionDuplicate(params: {
  sourceJobId: string;
  taxonomy: string;
  bulkVariant: RecommendedBulkVariant;
}) {
  const dedupeKey = buildRecommendedActionDedupeKey({
    sourceJobId: params.sourceJobId,
    taxonomy: params.taxonomy,
    bulkVariant: params.bulkVariant,
  });

  const jobs = await prisma.bulkActionJob.findMany({
    where: {
      metadata: {
        path: ["dedupeKey"],
        equals: dedupeKey,
      },
      status: {
        in: ["QUEUED", "RUNNING"],
      },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  if (jobs.length > 0) {
    return {
      duplicated: true as const,
      existingJob: jobs[0],
      dedupeKey,
    };
  }

  return {
    duplicated: false as const,
    dedupeKey,
  };
}
