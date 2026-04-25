import type { FailureActionBulkVariant } from "@/lib/bulk-jobs/failure-action-recommendation";

export function getOpsQueueSeverity(params: {
  taxonomy: string;
  bulkVariant: FailureActionBulkVariant;
}) {
  if (params.bulkVariant === "mark_permission_check") return "HIGH";
  if (params.bulkVariant === "inspect_dependency_only") return "HIGH";
  if (params.bulkVariant === "mark_manual_review") return "MEDIUM";
  if (params.bulkVariant === "mark_input_fix_required") return "MEDIUM";

  switch (params.taxonomy) {
    case "AUTH_PERMISSION":
      return "HIGH";
    case "DEPENDENCY_FAILURE":
      return "HIGH";
    case "RATE_LIMIT":
      return "MEDIUM";
    default:
      return "MEDIUM";
  }
}

export function buildOpsQueueTitle(params: {
  taxonomy: string;
  bulkVariant: FailureActionBulkVariant;
  count: number;
}) {
  if (params.bulkVariant === "mark_permission_check") {
    return `[권한 점검] ${params.taxonomy} 실패 ${params.count}건`;
  }
  if (params.bulkVariant === "inspect_dependency_only") {
    return `[연동 점검] ${params.taxonomy} 실패 ${params.count}건`;
  }
  if (params.bulkVariant === "mark_manual_review") {
    return `[수동 검토] ${params.taxonomy} 실패 ${params.count}건`;
  }
  if (params.bulkVariant === "mark_input_fix_required") {
    return `[입력 수정] ${params.taxonomy} 실패 ${params.count}건`;
  }
  return `[운영 확인] ${params.taxonomy} 실패 ${params.count}건`;
}
