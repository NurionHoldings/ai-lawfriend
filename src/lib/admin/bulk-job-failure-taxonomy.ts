export type BulkFailureCategory =
  | "VALIDATION"
  | "PERMISSION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT"
  | "LOCK"
  | "TIMEOUT"
  | "NETWORK"
  | "INTERNAL"
  | "UNKNOWN";

export type BulkFailureGuide = {
  category: BulkFailureCategory;
  taxonomyCode: string;
  retryable: boolean;
  guideCode: string;
  guideLabel: string;
  guideDescription: string;
};

type InferInput = {
  errorCode?: string | null;
  errorMessage?: string | null;
  errorPayload?: unknown;
};

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function inferBulkFailureGuide(input: InferInput): BulkFailureGuide {
  const code = (input.errorCode ?? "").toLowerCase();
  const message = (input.errorMessage ?? "").toLowerCase();
  const raw = `${code} ${message}`;

  if (includesAny(raw, ["zod", "validation", "invalid", "required field"])) {
    return {
      category: "VALIDATION",
      taxonomyCode: "VALIDATION_INVALID_INPUT",
      retryable: false,
      guideCode: "FIX_INPUT",
      guideLabel: "입력값 수정 필요",
      guideDescription:
        "대상 데이터 형식 또는 필수값이 누락되었습니다. 원본 데이터를 수정한 후 다시 실행하세요.",
    };
  }

  if (includesAny(raw, ["permission", "forbidden", "unauthorized", "role"])) {
    return {
      category: "PERMISSION",
      taxonomyCode: "PERMISSION_DENIED",
      retryable: false,
      guideCode: "CHECK_PERMISSION",
      guideLabel: "권한 확인 필요",
      guideDescription:
        "실행자 권한 또는 대상 접근권한이 부족합니다. 관리자 권한과 정책을 점검하세요.",
    };
  }

  if (includesAny(raw, ["not found", "missing", "does not exist"])) {
    return {
      category: "NOT_FOUND",
      taxonomyCode: "TARGET_NOT_FOUND",
      retryable: false,
      guideCode: "VERIFY_TARGET",
      guideLabel: "대상 존재 확인",
      guideDescription:
        "대상이 삭제되었거나 이미 처리되었습니다. targetId와 상태를 확인하세요.",
    };
  }

  if (includesAny(raw, ["conflict", "already", "duplicate", "version mismatch"])) {
    return {
      category: "CONFLICT",
      taxonomyCode: "STATE_CONFLICT",
      retryable: true,
      guideCode: "RELOAD_AND_RETRY",
      guideLabel: "상태 재확인 후 재시도",
      guideDescription:
        "동시 처리 또는 상태 불일치 가능성이 있습니다. 최신 상태를 재조회한 뒤 재시도하세요.",
    };
  }

  if (includesAny(raw, ["rate limit", "too many requests", "429"])) {
    return {
      category: "RATE_LIMIT",
      taxonomyCode: "RATE_LIMITED",
      retryable: true,
      guideCode: "BACKOFF_RETRY",
      guideLabel: "지연 후 재시도 권장",
      guideDescription:
        "요청 한도를 초과했습니다. 배치 크기 축소 또는 백오프 후 재시도하세요.",
    };
  }

  if (includesAny(raw, ["lock", "locked", "busy worker"])) {
    return {
      category: "LOCK",
      taxonomyCode: "LOCK_CONTENTION",
      retryable: true,
      guideCode: "WAIT_FOR_UNLOCK",
      guideLabel: "잠금 해제 대기",
      guideDescription:
        "동일 자원에 대한 선행 작업이 진행 중입니다. lock timeout 이후 재시도하세요.",
    };
  }

  if (includesAny(raw, ["timeout", "timed out", "deadline exceeded"])) {
    return {
      category: "TIMEOUT",
      taxonomyCode: "PROCESS_TIMEOUT",
      retryable: true,
      guideCode: "REDUCE_BATCH_SIZE",
      guideLabel: "배치 축소 권장",
      guideDescription:
        "처리 시간이 초과되었습니다. 동시성 또는 배치 크기를 낮춰 다시 실행하세요.",
    };
  }

  if (includesAny(raw, ["network", "fetch failed", "econnreset", "socket hang up"])) {
    return {
      category: "NETWORK",
      taxonomyCode: "NETWORK_TRANSIENT",
      retryable: true,
      guideCode: "RETRY_NETWORK",
      guideLabel: "일시적 네트워크 오류",
      guideDescription: "일시적 연결 문제일 수 있습니다. 잠시 후 재시도하세요.",
    };
  }

  if (includesAny(raw, ["internal", "unexpected", "null", "undefined"])) {
    return {
      category: "INTERNAL",
      taxonomyCode: "INTERNAL_UNEXPECTED",
      retryable: true,
      guideCode: "CHECK_LOGS",
      guideLabel: "서버 로그 확인",
      guideDescription: "예상치 못한 내부 오류입니다. cron/job 상세 로그를 확인하세요.",
    };
  }

  return {
    category: "UNKNOWN",
    taxonomyCode: "UNKNOWN_ERROR",
    retryable: true,
    guideCode: "INSPECT_PAYLOAD",
    guideLabel: "상세 payload 확인",
    guideDescription:
      "자동 분류되지 않은 오류입니다. 실패 payload와 감사로그를 함께 점검하세요.",
  };
}
