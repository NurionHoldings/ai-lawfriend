/**
 * 도메인 운영 원칙 (1차 고정본)
 * 정의 모듈만으로는 해석이 갈릴 수 있어, 팀 공통 해석을 코드베이스에 고정합니다.
 */

/** 7-1. 권한정의서 원칙 */
export const PERMISSION_PRINCIPLES = [
  "ADMIN은 전체 허용",
  "LAWYER는 승인/잠금 가능",
  "STAFF는 초안/인터뷰/재작성 가능, 최종 승인 불가",
  "CLIENT는 자기 사건 열람/응답/첨부만 가능",
] as const;

/** 7-2. 상태값 원칙 */
export const STATUS_PRINCIPLES = [
  "사건 상태, 인터뷰 상태, 문서 상태는 서로 분리",
  "사건 상태를 문서 상태로 대체하지 않음",
  "문서 승인 완료와 사건 승인 완료는 같은 의미로 쓰지 않음",
  "현재 설계상 사건 APPROVED는 승인 문서 존재 기준 상태",
] as const;

/** 7-3. 라이프사이클 원칙 */
export const LIFECYCLE_PRINCIPLES = [
  "INTERVIEW_DONE 이전에는 초안 생성 불가",
  "DRAFTING 이전에는 검토 요청 불가",
  "REVIEW_PENDING 이전에는 승인 불가",
  "승인 문서는 잠금 가능하며, 잠금 후 일반 재생성 차단",
] as const;

/** 7-4. 질문셋 원칙 */
export const QUESTION_SET_PRINCIPLES = [
  "질문은 key 기준으로 영속 식별",
  "화면 순서와 의미 식별자를 분리",
  "조건 분기는 conditions[]로만 해석",
  "문서 문단 연결은 질문 내부의 paragraphMappings[]가 기준",
] as const;

/** 7-5. 문서 템플릿 원칙 */
export const DOCUMENT_TEMPLATE_PRINCIPLES = [
  "문서 템플릿은 section > paragraph 구조",
  "문단별 재생성 가능 여부를 템플릿에서 선결정",
  "승인 잠금 여부도 템플릿에서 선결정",
  "실제 생성 문단은 템플릿 seed로 생성",
] as const;
