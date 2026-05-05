# AI법친 7.1-B — 보완 요청 API 명세 정의서

## 1. 문서 목적

AI법친 7.1-B 보완 요청 API 명세 정의서는 보완 요청 도메인에서 사용할 API endpoint 후보, 요청/응답 payload 구조, 상태 전이 규칙, 오류 코드, 권한 기준, 감사 로그 연계를 고정하기 위한 기준문서다.

이 문서는 코드 구현 문서가 아니다.  
이 문서는 API route 구현 전 명세 고정 단계 문서다.

## 2. 현재 전제

- AI법친 6.x 사건 패키지 기능군은 운영 배포 및 Smoke Test 14/14 PASS 이후 최종 잠금 완료 상태다.
- 6.x 기능 로직, API, DB, 권한 정책은 변경하지 않는다.
- 이번 단계는 7.1-B API 명세 정의 단계이며 API 구현, DB migration, 화면 구현은 하지 않는다.
- 기존 CaseStatus 변경 없음.
- 기존 CasePackageShareStatus 변경 없음.
- 기존 CasePackageAccessAction 변경 없음.

## 3. API 설계 원칙

- REST 기반 resource 명명 규칙을 사용한다.
- 상태 전이는 명시 endpoint 또는 action endpoint로 분리한다.
- 상태값 canonical source는 상태값 정의서를 단일 진실원으로 사용한다.
- 필드명은 데이터 구조 정의서에서 고정한 키를 우선 사용한다.
- 민감정보는 response 본문과 로그 본문에서 마스킹한다.
- AI는 보완 요청 초안 제안만 가능하며 상태 확정 API를 호출할 수 없다.

## 4. Endpoint 후보 목록

| 구분 | Method | Path | 설명 |
|---|---|---|---|
| 목록 조회 | GET | /api/cases/{caseId}/supplement-requests | 사건 기준 보완 요청 목록 조회 |
| 상세 조회 | GET | /api/cases/{caseId}/supplement-requests/{requestId} | 보완 요청 상세 조회 |
| 생성 | POST | /api/cases/{caseId}/supplement-requests | 보완 요청 생성(DRAFT) |
| 수정 | PATCH | /api/cases/{caseId}/supplement-requests/{requestId} | DRAFT/NEEDS_MORE_INFO 편집 |
| 발송 | POST | /api/cases/{caseId}/supplement-requests/{requestId}/send | DRAFT -> SENT |
| 취소 | POST | /api/cases/{caseId}/supplement-requests/{requestId}/cancel | DRAFT/SENT -> CANCELLED |
| 만료 처리 | POST | /api/cases/{caseId}/supplement-requests/{requestId}/expire | SENT/CLIENT_VIEWED -> EXPIRED |
| 응답 제출 | POST | /api/cases/{caseId}/supplement-requests/{requestId}/responses | CLIENT_VIEWED/SENT -> CLIENT_RESPONDED |
| 재검토 시작 | POST | /api/cases/{caseId}/supplement-requests/{requestId}/review | CLIENT_RESPONDED -> UNDER_REVIEW |
| 수용 | POST | /api/cases/{caseId}/supplement-requests/{requestId}/accept | UNDER_REVIEW -> ACCEPTED |
| 추가보완판단 | POST | /api/cases/{caseId}/supplement-requests/{requestId}/needs-more-info | UNDER_REVIEW -> NEEDS_MORE_INFO |
| 종료 | POST | /api/cases/{caseId}/supplement-requests/{requestId}/close | ACCEPTED -> CLOSED |
| 상태 이력 조회 | GET | /api/cases/{caseId}/supplement-requests/{requestId}/status-logs | 상태 전이 로그 조회 |
| 감사 이력 조회 | GET | /api/cases/{caseId}/supplement-requests/{requestId}/audit-logs | 감사 로그 조회 |

## 5. 공통 Request / Response 규약

### 5.1 공통 Header

- Authorization: 세션 쿠키/JWT 기반 인증
- Content-Type: application/json
- X-Request-Id: 추적용 요청 식별자

### 5.2 공통 성공 응답

```json
{
  "ok": true,
  "data": {}
}
```

### 5.3 공통 오류 응답

```json
{
  "ok": false,
  "code": "SUPPLEMENT_REQUEST_FORBIDDEN",
  "message": "보완 요청 권한이 없습니다.",
  "details": {}
}
```

## 6. 목록/상세 조회 명세

### 6.1 GET /api/cases/{caseId}/supplement-requests

query 후보:

- status
- requesterUserId
- targetUserId
- revisionRound
- page
- pageSize

response.data 예시 필드:

- items[].id
- items[].caseId
- items[].requesterUserId
- items[].targetUserId
- items[].status
- items[].requestType
- items[].title
- items[].dueAt
- items[].sentAt
- items[].lastRespondedAt
- items[].revisionRound
- items[].createdAt
- pageInfo

### 6.2 GET /api/cases/{caseId}/supplement-requests/{requestId}

response.data 예시 필드:

- request.id
- request.caseId
- request.requesterUserId
- request.targetUserId
- request.status
- request.requestType
- request.title
- request.description
- request.dueAt
- request.sentAt
- request.clientViewedAt
- request.lastRespondedAt
- request.acceptedAt
- request.closedAt
- request.cancelledAt
- request.expiredAt
- request.revisionRound
- request.items[]
- request.responses[]
- request.attachments[]

## 7. 생성/수정 명세

### 7.1 POST /api/cases/{caseId}/supplement-requests

request body 후보:

- targetUserId
- requestType
- title
- description
- dueAt
- items[]

items[] 필드 후보:

- itemType
- itemLabel
- itemPrompt
- isRequired
- sortOrder
- expectedFormat
- maxLength

생성 규칙:

- 최초 상태는 DRAFT
- requesterUserId는 서버에서 세션 사용자로 강제
- revisionRound 기본값 0

### 7.2 PATCH /api/cases/{caseId}/supplement-requests/{requestId}

수정 허용 상태:

- DRAFT
- NEEDS_MORE_INFO

수정 가능 필드 후보:

- title
- description
- dueAt
- items[]

## 8. 상태 전이 API 명세

### 8.1 POST /send

- 허용 전이: DRAFT -> SENT
- 수행 주체: LAWYER, ADMIN, SUPER_ADMIN(정책 제한)
- 기록: SupplementRequestStatusLog, SupplementRequestAuditLog

### 8.2 POST /cancel

- 허용 전이: DRAFT/SENT -> CANCELLED
- request body 후보: reasonCode, reasonMemo
- 취소 사유 기록 필수

### 8.3 POST /expire

- 허용 전이: SENT/CLIENT_VIEWED -> EXPIRED
- 수행 주체: SYSTEM 또는 권한 있는 ADMIN

### 8.4 POST /review

- 허용 전이: CLIENT_RESPONDED -> UNDER_REVIEW

### 8.5 POST /accept

- 허용 전이: UNDER_REVIEW -> ACCEPTED

### 8.6 POST /needs-more-info

- 허용 전이: UNDER_REVIEW -> NEEDS_MORE_INFO
- request body 후보: reasonCode, reasonMemo, nextDueAt

### 8.7 POST /close

- 허용 전이: ACCEPTED -> CLOSED

## 9. 응답 제출 API 명세

### 9.1 POST /responses

request body 후보:

- requestItemId
- responseText
- responseJson
- attachments[]

attachments[] 필드 후보:

- caseAttachmentId
- attachmentRole
- note

규칙:

- CLIENT_VIEWED 또는 SENT 상태에서 제출 가능
- 제출 완료 시 CLIENT_RESPONDED로 전이
- revisionRound는 현재 요청 회차와 일치해야 함
- 첨부파일 권한은 기존 CaseAttachment 정책 준수

## 10. 로그 API 명세

### 10.1 GET /status-logs

response.data.items[] 후보:

- id
- requestId
- fromStatus
- toStatus
- actorUserId
- actorRole
- reasonCode
- reasonMemo
- createdAt

### 10.2 GET /audit-logs

response.data.items[] 후보:

- id
- requestId
- actionType
- actorUserId
- actorRole
- actionSummary
- actionPayloadMasked
- createdAt

## 11. 오류 코드 표준안

| code | 설명 |
|---|---|
| SUPPLEMENT_REQUEST_NOT_FOUND | 요청을 찾을 수 없음 |
| SUPPLEMENT_REQUEST_FORBIDDEN | 권한 없음 |
| SUPPLEMENT_REQUEST_INVALID_STATE | 현재 상태에서 불가한 동작 |
| SUPPLEMENT_REQUEST_VALIDATION_FAILED | 입력 검증 실패 |
| SUPPLEMENT_REQUEST_ALREADY_FINAL | 최종 상태로 변경 불가 |
| SUPPLEMENT_REQUEST_DUE_AT_REQUIRED | 기한 필수 |
| SUPPLEMENT_REQUEST_RESPONSE_FORBIDDEN | 응답 제출 권한 없음 |
| SUPPLEMENT_REQUEST_ATTACHMENT_FORBIDDEN | 첨부 연결 권한 없음 |
| SUPPLEMENT_REQUEST_MASKING_VIOLATION | 민감정보 마스킹 규칙 위반 |

## 12. 권한 기준

- USER: 본인 대상 요청 조회/응답 제출 가능
- LAWYER: 담당 사건 요청 생성/발송/재검토/수용/재요청/종료 가능
- STAFF: 정책 허용 범위 내 조회/운영 처리 가능
- ADMIN/SUPER_ADMIN: 운영 목적 강제 전이/감사 조회 가능
- SYSTEM: 만료 배치 처리만 수행

권한 검증은 요청 시점마다 Case/CasePackageShare 참조 기반으로 수행한다.

## 13. 민감정보 및 마스킹 기준

금지:

- accessToken 원문 반환
- optionalPin 원문 반환
- hash 원문 반환
- 첨부파일 직접 URL 반환
- 내부 prompt/raw AI response 반환

허용:

- 마스킹된 actor 식별자
- 마스킹된 ip/userAgent
- actionPayloadMasked

## 14. 데이터 구조 정의서와 필드 정합성

API 명세는 아래 모델 필드 고정값을 그대로 참조한다.

- SupplementRequest
- SupplementRequestItem
- SupplementResponse
- SupplementResponseAttachment
- SupplementRequestStatusLog
- SupplementRequestAuditLog

필드명 변경이 필요하면 데이터 구조 정의서와 동시 개정이 필요하다.

## 15. Prisma schema / migration 원칙

- 이번 단계에서 Prisma schema 변경 없음
- 이번 단계에서 DB migration 없음
- API route 구현 없음
- 화면 구현 없음

구현 단계 진입 전, 본 명세와 데이터 구조 정의서 간 필드 정합성 검증을 먼저 수행한다.

## 16. 비변경 원칙 재확인

- 6.x 기능 로직 변경 없음
- 기존 CaseStatus 변경 없음
- 기존 CasePackageShareStatus 변경 없음
- 기존 CasePackageAccessAction 변경 없음
- Prisma schema 변경 없음
- DB migration 없음
- API 구현 없음
- 화면 구현 없음
- 권한 정책 변경 없음

## 17. 최종 판정

AI법친 7.1-B 보완 요청 API 명세 정의서 작성 완료.
이번 단계는 코드 구현이 아니라 API 명세 정의 단계다.
다음 작업은 "AI법친 7.1-B — 보완 요청 구현 정의서" 작성이다.
