# AI법친 7.1-B — 보완 요청 구현 착수(스키마/레포지토리 1단계) 정의서

## 1. 문서 목적

AI법친 7.1-B 보완 요청 구현 착수(스키마/레포지토리 1단계) 정의서는 실제 구현 시작 시점에서 Prisma schema 초안 반영 범위와 repository 골격 반영 범위를 분리 고정하기 위한 기준문서다.

이 문서는 코드 구현 문서가 아니다.  
이 문서는 구현 1단계 범위 잠금 문서다.

## 2. 현재 전제

- AI법친 6.x 사건 패키지 기능군은 운영 배포 및 Smoke Test 14/14 PASS 이후 최종 잠금 완료 상태다.
- 6.x 기능 로직, API, DB, 권한 정책은 변경하지 않는다.
- 7.1-B는 보완 요청 도메인 신규 추가 방식으로 진행한다.
- 이번 단계는 구현 착수 정의 단계이며 실제 schema/repository 코드는 작성하지 않는다.
- 기존 CaseStatus 변경 없음.
- 기존 CasePackageShareStatus 변경 없음.
- 기존 CasePackageAccessAction 변경 없음.

## 3. 1단계 범위

1단계는 아래 2개 트랙으로만 구성한다.

1. Prisma schema 초안 트랙
2. repository skeleton 트랙

1단계에서 제외:

- route 구현
- service 구현
- validator 구현
- UI 구현
- 상태 전이 실행 코드

## 4. Prisma schema 초안 트랙 정의

### 4.1 후보 모델

- SupplementRequest
- SupplementRequestItem
- SupplementResponse
- SupplementResponseAttachment
- SupplementRequestStatusLog
- SupplementRequestAuditLog

### 4.2 필드 반영 원칙

- 필드명은 데이터 구조 정의서/API 명세 정의서 고정 키를 따른다.
- status는 7.1-B 상태값 canonical 목록과 정합성을 맞춘다.
- revisionRound, dueAt, sentAt, lastRespondedAt, acceptedAt, closedAt, cancelledAt, expiredAt 반영 후보를 포함한다.
- actionPayloadMasked, reasonCode, reasonMemo 등 로그 필드를 포함한다.

### 4.3 relation 반영 원칙

- SupplementRequest.caseId -> Case.id
- requesterUserId/targetUserId/responderUserId/actorUserId -> User.id
- SupplementResponseAttachment.caseAttachmentId -> CaseAttachment.id
- CasePackageShare는 direct FK 강제 대신 권한 검증 참조로 유지한다.

### 4.4 migration 정책

- migration 파일 생성은 schema 초안 리뷰 통과 후 수행한다.
- schema 변경 commit과 migration commit은 분리 가능하도록 계획한다.
- 단일 대형 migration 금지, 단계형 migration을 우선한다.

## 5. repository skeleton 트랙 정의

### 5.1 후보 파일

- src/features/supplement-request/supplement-request.repository.ts

### 5.2 repository 함수 시그니처 골격 후보

- createSupplementRequestRepository
- updateSupplementRequestRepository
- findSupplementRequestByIdRepository
- listSupplementRequestsRepository
- createSupplementResponseRepository
- appendSupplementRequestStatusLogRepository
- appendSupplementRequestAuditLogRepository
- withSupplementRequestTransaction

### 5.3 repository 책임

- DB read/write 캡슐화
- transaction 경계 제공
- model mapping
- soft-delete 대응
- 상태/감사 로그 append 전용 함수 분리

### 5.4 repository 금지사항

- 비즈니스 상태 전이 규칙 판단 금지
- 권한 판단 로직 내장 금지
- 민감정보 원문 직렬화 금지

## 6. 산출물 정의

1단계 산출물은 다음 4개를 기준으로 잠금한다.

1. 구현 착수 정의서(본 문서)
2. 단계 verifier 스크립트
3. package.json verify script 등록
4. IMPLEMENTATION_EVIDENCE 증빙 블록

## 7. 검증 순서

1. verify:aibeopchin-7-1-b-supplement-implementation-phase1-definition
2. verify:aibeopchin-7-1-b-supplement-implementation-definition
3. verify:aibeopchin-7-1-b-supplement-api-spec-definition
4. verify:aibeopchin-7-1-b-supplement-data-structure-definition
5. verify:aibeopchin-7-1-b-supplement-status-definition
6. verify:aibeopchin-7-1-b-supplement-workflow-definition
7. verify:aibeopchin-7-1-candidate-definition
8. verify:aibeopchin-7-operation-dashboard
9. verify:aibeopchin-6x-operation-lock
10. npx tsc --noEmit
11. npm run lint

## 8. 리스크 및 가드레일

- 리스크: schema 필드명 불일치
- 가드레일: 데이터 구조 정의서 필드 목록과 자동 대조 스크립트 고려

- 리스크: 상태 enum 충돌
- 가드레일: 상태값 정의서 canonical 목록 단일 참조

- 리스크: repository가 서비스 책임 침범
- 가드레일: 함수명/주석 기준으로 repository 책임 제한

## 9. 비변경 원칙 재확인

- 6.x 기능 로직 변경 없음
- 기존 CaseStatus 변경 없음
- 기존 CasePackageShareStatus 변경 없음
- 기존 CasePackageAccessAction 변경 없음
- Prisma schema 변경 없음(이번 단계)
- DB migration 없음(이번 단계)
- API 구현 없음(이번 단계)
- 화면 구현 없음(이번 단계)
- 권한 정책 변경 없음(이번 단계)

## 10. 최종 판정

AI법친 7.1-B 보완 요청 구현 착수(스키마/레포지토리 1단계) 정의서 작성 완료.
이번 단계는 코드 구현이 아니라 구현 착수 범위 정의 단계다.
다음 작업은 "AI법친 7.1-B — Prisma schema 초안 반영(실제 코드)"이다.
