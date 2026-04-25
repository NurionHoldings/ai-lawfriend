type ApiError = {
  code?: string;
  message?: string;
  details?: unknown;
};

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "입력값을 다시 확인해 주세요.",
  EMAIL_EXISTS: "이미 가입된 이메일입니다.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  ACCOUNT_BLOCKED: "현재 로그인할 수 없는 계정입니다.",
  ACCOUNT_PENDING: "관리자 승인 대기 중입니다. 승인 후 다시 로그인해 주세요.",
  UNAUTHORIZED: "로그인이 필요합니다.",
  INTERNAL_ERROR: "서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  NETWORK_ERROR: "네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.",
};

export function getErrorMessage(error?: ApiError | null) {
  if (!error) return "알 수 없는 오류가 발생했습니다.";
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  return error.message || "알 수 없는 오류가 발생했습니다.";
}
