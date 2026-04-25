export type RecommendedBulkVariant =
  | "retry_failed_items"
  | "mark_permission_check"
  | "mark_input_fix_required"
  | "mark_manual_review"
  | "inspect_dependency_only"
  | "wait_and_retry_later";

export function buildRecommendedActionDedupeKey(params: {
  sourceJobId: string;
  taxonomy: string;
  bulkVariant: RecommendedBulkVariant;
}) {
  return [
    "recommended-action",
    params.sourceJobId,
    params.taxonomy,
    params.bulkVariant,
  ].join(":");
}

export function buildOpsQueueDedupeKey(params: {
  sourceJobId: string;
  taxonomy: string;
  bulkVariant: RecommendedBulkVariant;
}) {
  return [
    "ops-queue",
    params.sourceJobId,
    params.taxonomy,
    params.bulkVariant,
  ].join(":");
}

export function buildScheduleDedupeKey(params: {
  sourceJobId: string;
  taxonomy: string;
  bulkVariant: RecommendedBulkVariant;
}) {
  return [
    "schedule",
    params.sourceJobId,
    params.taxonomy,
    params.bulkVariant,
  ].join(":");
}
