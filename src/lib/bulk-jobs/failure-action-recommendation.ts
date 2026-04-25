export type FailureActionType =
  | "retry_now"
  | "check_permission"
  | "fix_input"
  | "inspect_dependency"
  | "wait_and_retry"
  | "manual_review";

export type FailureActionBulkVariant =
  | "retry_failed_items"
  | "mark_permission_check"
  | "mark_input_fix_required"
  | "mark_manual_review"
  | "inspect_dependency_only"
  | "wait_and_retry_later";

export type FailureActionRecommendation = {
  action: FailureActionType;
  label: string;
  description: string;
  severity: "low" | "medium" | "high";
  executable: boolean;
  bulkVariant: FailureActionBulkVariant;
};

export type FailureTaxonomy =
  | "TRANSIENT_NETWORK"
  | "RATE_LIMIT"
  | "AUTH_PERMISSION"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "DEPENDENCY_FAILURE"
  | "TIMEOUT"
  | "UNKNOWN";

export function normalizeFailureKey(
  failureCategory: string | null | undefined,
  failureTaxonomyCode: string | null | undefined
): string {
  if (failureTaxonomyCode && failureTaxonomyCode.trim()) {
    return failureTaxonomyCode.trim();
  }
  if (failureCategory && failureCategory.trim()) {
    return mapCategoryToTaxonomy(failureCategory.trim());
  }
  return "UNKNOWN";
}

function mapCategoryToTaxonomy(category: string): string {
  switch (category) {
    case "VALIDATION":
      return "INVALID_INPUT";
    case "PERMISSION":
      return "AUTH_PERMISSION";
    case "NOT_FOUND":
      return "NOT_FOUND";
    case "CONFLICT":
      return "DEPENDENCY_FAILURE";
    case "RATE_LIMIT":
      return "RATE_LIMIT";
    case "LOCK":
      return "DEPENDENCY_FAILURE";
    case "TIMEOUT":
      return "TIMEOUT";
    case "NETWORK":
      return "TRANSIENT_NETWORK";
    case "INTERNAL":
      return "DEPENDENCY_FAILURE";
    default:
      return "UNKNOWN";
  }
}

export function recommendActionsByTaxonomy(
  taxonomy: FailureTaxonomy | string | null | undefined
): FailureActionRecommendation[] {
  const key = (taxonomy ?? "UNKNOWN").toUpperCase();

  switch (key) {
    case "TRANSIENT_NETWORK":
    case "NETWORK_TRANSIENT":
      return [
        {
          action: "retry_now",
          label: "즉시 재시도",
          description: "일시적 네트워크 오류 가능성이 높습니다.",
          severity: "low",
          executable: true,
          bulkVariant: "retry_failed_items",
        },
        {
          action: "inspect_dependency",
          label: "연동 상태 점검",
          description: "외부 API 또는 내부 네트워크 상태를 확인하세요.",
          severity: "medium",
          executable: true,
          bulkVariant: "inspect_dependency_only",
        },
      ];

    case "RATE_LIMIT":
    case "RATE_LIMITED":
      return [
        {
          action: "wait_and_retry",
          label: "대기 후 재시도",
          description: "호출량 제한 가능성이 높아 backoff 후 재시도가 적합합니다.",
          severity: "medium",
          executable: true,
          bulkVariant: "wait_and_retry_later",
        },
        {
          action: "inspect_dependency",
          label: "호출량 정책 점검",
          description: "queueGroup / concurrencyKey / 배치 크기를 재검토하세요.",
          severity: "medium",
          executable: true,
          bulkVariant: "inspect_dependency_only",
        },
      ];

    case "AUTH_PERMISSION":
    case "PERMISSION_DENIED":
      return [
        {
          action: "check_permission",
          label: "권한 점검",
          description: "토큰 만료, 역할 부족, 접근권한 설정을 확인하세요.",
          severity: "high",
          executable: true,
          bulkVariant: "mark_permission_check",
        },
        {
          action: "manual_review",
          label: "수동 검토",
          description: "계정/조직 단위 권한 문제일 수 있어 운영자 확인이 필요합니다.",
          severity: "high",
          executable: true,
          bulkVariant: "mark_manual_review",
        },
      ];

    case "INVALID_INPUT":
    case "VALIDATION_INVALID_INPUT":
      return [
        {
          action: "fix_input",
          label: "입력 수정",
          description: "필수값 누락, 형식 오류, 유효성 실패 가능성이 높습니다.",
          severity: "high",
          executable: true,
          bulkVariant: "mark_input_fix_required",
        },
        {
          action: "manual_review",
          label: "수동 검토",
          description: "원천 데이터 정합성을 확인한 뒤 재실행하세요.",
          severity: "medium",
          executable: true,
          bulkVariant: "mark_manual_review",
        },
      ];

    case "NOT_FOUND":
    case "TARGET_NOT_FOUND":
      return [
        {
          action: "manual_review",
          label: "대상 존재 여부 확인",
          description: "이미 삭제되었거나 잘못된 targetId일 수 있습니다.",
          severity: "medium",
          executable: true,
          bulkVariant: "mark_manual_review",
        },
        {
          action: "fix_input",
          label: "식별자 수정",
          description: "매핑 키 또는 참조 ID가 올바른지 점검하세요.",
          severity: "medium",
          executable: true,
          bulkVariant: "mark_input_fix_required",
        },
      ];

    case "DEPENDENCY_FAILURE":
    case "STATE_CONFLICT":
    case "LOCK_CONTENTION":
      return [
        {
          action: "inspect_dependency",
          label: "연동 시스템 점검",
          description: "의존 시스템 장애 또는 응답 포맷 문제를 확인하세요.",
          severity: "high",
          executable: true,
          bulkVariant: "inspect_dependency_only",
        },
        {
          action: "retry_now",
          label: "즉시 재시도",
          description: "장애가 해소되었다면 재시도로 복구될 수 있습니다.",
          severity: "medium",
          executable: true,
          bulkVariant: "retry_failed_items",
        },
      ];

    case "TIMEOUT":
    case "PROCESS_TIMEOUT":
      return [
        {
          action: "retry_now",
          label: "즉시 재시도",
          description: "일시적 처리 지연이면 재시도로 성공할 수 있습니다.",
          severity: "medium",
          executable: true,
          bulkVariant: "retry_failed_items",
        },
        {
          action: "inspect_dependency",
          label: "처리시간/병목 점검",
          description: "worker 수, 외부 API 응답시간, payload 크기를 확인하세요.",
          severity: "medium",
          executable: true,
          bulkVariant: "inspect_dependency_only",
        },
      ];

    case "UNKNOWN":
    case "UNKNOWN_ERROR":
    default:
      return [
        {
          action: "manual_review",
          label: "수동 검토",
          description: "분류되지 않은 실패입니다. 상세 payload와 로그 확인이 필요합니다.",
          severity: "medium",
          executable: true,
          bulkVariant: "mark_manual_review",
        },
      ];
  }
}

export function recommendActionsForBulkItem(
  failureCategory: string | null | undefined,
  failureTaxonomyCode: string | null | undefined
): FailureActionRecommendation[] {
  const key = normalizeFailureKey(failureCategory, failureTaxonomyCode);
  return recommendActionsByTaxonomy(key);
}
