import type {
  AdminDashboardMetrics,
  ClientDashboardMetrics,
  LawyerDashboardMetrics,
} from "@/lib/dashboard/dashboard-metrics";

export function shouldShowClientEmptyGuide(
  metrics: ClientDashboardMetrics,
): boolean {
  return metrics.totalCases === 0;
}

export function shouldShowLawyerEmptyGuide(
  metrics: LawyerDashboardMetrics,
): boolean {
  const queueTotal =
    metrics.interviewCompleted + metrics.draftReady + metrics.needsSupplement;

  return queueTotal === 0 && (metrics.reviewQueuePreview?.length ?? 0) === 0;
}

export function shouldShowAdminEmptyGuide(
  metrics: AdminDashboardMetrics,
): boolean {
  return (
    metrics.attentionNeeded === 0 &&
    metrics.approvalPending === 0 &&
    (metrics.attentionPreview?.length ?? 0) === 0
  );
}
