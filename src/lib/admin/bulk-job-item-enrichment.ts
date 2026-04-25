import type { BulkActionFailureCategory } from "@prisma/client";
import { inferBulkFailureGuide } from "@/lib/admin/bulk-job-failure-taxonomy";

type UpdateArgs = {
  errorCode?: string | null;
  errorMessage?: string | null;
  errorPayload?: unknown;
};

export function buildBulkJobItemFailureFields(args: UpdateArgs) {
  const guide = inferBulkFailureGuide(args);

  return {
    failureCategory: guide.category as BulkActionFailureCategory,
    failureTaxonomyCode: guide.taxonomyCode,
    autoGuideCode: guide.guideCode,
    autoGuideLabel: guide.guideLabel,
    autoGuideDescription: guide.guideDescription,
    retryable: guide.retryable,
  };
}
