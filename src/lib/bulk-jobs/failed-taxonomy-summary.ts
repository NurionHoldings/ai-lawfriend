import { prisma } from "@/lib/prisma";
import { normalizeFailureKey, recommendActionsByTaxonomy } from "@/lib/bulk-jobs/failure-action-recommendation";

export async function getFailedTaxonomySummaryForJob(jobId: string) {
  const items = await prisma.bulkActionJobItem.findMany({
    where: {
      jobId,
      status: "FAILED",
    },
    select: {
      failureCategory: true,
      failureTaxonomyCode: true,
    },
  });

  const countMap = new Map<string, number>();
  for (const item of items) {
    const taxonomy = normalizeFailureKey(
      item.failureCategory ?? undefined,
      item.failureTaxonomyCode ?? undefined
    );
    countMap.set(taxonomy, (countMap.get(taxonomy) ?? 0) + 1);
  }

  const rows = Array.from(countMap.entries())
    .map(([taxonomy, count]) => ({
      taxonomy,
      count,
      recommendations: recommendActionsByTaxonomy(taxonomy),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    rows,
    totalFailed: items.length,
  };
}
