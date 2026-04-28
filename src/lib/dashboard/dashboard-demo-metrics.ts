/**
 * 대시보드 3.0(역할별 실데이터 1차 마감): 역할별 라우트는 Prisma 기반 metrics를 우선 사용한다.
 * 본 파일은 스토리보드·데모·레거시 fallback용 상수로 유지하며, 삭제·축소는 사용처 점검 후 별도 PR로 한다.
 */
/** 일부 대시보드가 실제 `metrics` props를 받기 전까지 fallback·demo 용도로 유지한다. */
export const CLIENT_READINESS_ITEMS = [
  { label: "기본 정보", done: true },
  { label: "사건 경위", done: true },
  { label: "상대방 정보", done: false },
  { label: "첨부자료", done: false },
  { label: "검토 요청", done: false },
];

export const LAWYER_QUEUE_ITEMS = [
  {
    title: "인터뷰 완료 사건",
    count: 4,
    description: "검토 가능한 사건",
  },
  {
    title: "문서 초안 대기",
    count: 2,
    description: "초안 생성 또는 검토 필요",
  },
  {
    title: "보완 요청 필요",
    count: 3,
    description: "자료 또는 진술 보완 필요",
  },
];

export const ADMIN_OPERATION_ITEMS = [
  {
    title: "전체 사건",
    value: "128",
    description: "등록된 사건",
  },
  {
    title: "검토 대기",
    value: "17",
    description: "담당자 확인 필요",
  },
  {
    title: "승인 대기",
    value: "6",
    description: "관리자 승인 필요",
  },
  {
    title: "주의",
    value: "3",
    description: "운영 확인 필요",
  },
];
