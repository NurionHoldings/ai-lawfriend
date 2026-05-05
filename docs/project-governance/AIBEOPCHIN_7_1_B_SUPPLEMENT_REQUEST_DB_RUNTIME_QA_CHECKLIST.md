# AI법친 7.1-B — Supplement DB Runtime QA 체크리스트

## 1. 목적

이 문서는 AI법친 7.1-B 보완 요청 도메인의 migration 적용 이후, 실제 DB 기준으로 API/service 동작 검증을 수행하기 위한 QA 체크리스트다.

이번 단계는 화면 구현이 아니다.  
이번 단계는 supplement DB 적용 후 API/service가 정상 동작할 수 있는지 확인하는 검증 단계다.

## 2. 현재 전제

- AI법친 6.x 운영 Lock 유지
- featureFreeze: true
- 7.1-B supplement migration 적용 완료
- predeploy-lock PASS
- TypeScript PASS
- ESLint PASS
- supplement migration predeploy PASS
- 기존 CaseStatus 변경 없음
- 기존 CasePackageShareStatus 변경 없음
- 기존 CasePackageAccessAction 변경 없음

## 3. DB Runtime 확인

| ID | 항목 | 기대 결과 | 상태 |
|---|---|---|---|
| DB-01 | SupplementRequestStatus enum 존재 | PASS | PENDING |
| DB-02 | SupplementRequestType enum 존재 | PASS | PENDING |
| DB-03 | SupplementAttachmentRole enum 존재 | PASS | PENDING |
| DB-04 | SupplementRequestAuditActionType enum 존재 | PASS | PENDING |
| DB-05 | SupplementRequest table 존재 | PASS | PENDING |
| DB-06 | SupplementRequestItem table 존재 | PASS | PENDING |
| DB-07 | SupplementResponse table 존재 | PASS | PENDING |
| DB-08 | SupplementResponseAttachment table 존재 | PASS | PENDING |
| DB-09 | SupplementRequestStatusLog table 존재 | PASS | PENDING |
| DB-10 | SupplementRequestAuditLog table 존재 | PASS | PENDING |
| DB-11 | _prisma_migrations에 supplement migration 기록 존재 | PASS | PENDING |

## 4. API / Service 동작 검증 항목

| ID | 항목 | 기대 결과 | 상태 |
|---|---|---|---|
| API-01 | 보완 요청 목록 조회 | 권한 있는 사용자만 조회 | PENDING |
| API-02 | 보완 요청 생성 | LAWYER/ADMIN/SUPER_ADMIN만 생성 | PENDING |
| API-03 | 보완 요청 상세 조회 | caseId/requestId 일치 시 조회 | PENDING |
| API-04 | 보완 요청 수정 | DRAFT 등 허용 상태에서만 수정 | PENDING |
| API-05 | 상태 전이 | 정의서 허용 전이만 성공 | PENDING |
| API-06 | 금지 전이 | 정의서 금지 전이는 400/403 | PENDING |
| API-07 | 의뢰인 응답 등록 | targetUserId 사용자만 가능 | PENDING |
| API-08 | 빈 응답 차단 | payload 없음 또는 빈 응답 400 | PENDING |
| API-09 | 상태 로그 조회 | 권한 있는 사용자만 조회 | PENDING |
| API-10 | 감사 로그 조회 | 관리자/권한자만 조회 | PENDING |
| API-11 | 권한 없는 접근 차단 | 403 | PENDING |
| API-12 | caseId/requestId 불일치 차단 | 404 또는 403 | PENDING |

## 5. 보안 확인

| ID | 항목 | 기대 결과 | 상태 |
|---|---|---|---|
| SEC-01 | DATABASE_URL 원문 미노출 | PASS | PENDING |
| SEC-02 | accessToken 원문 미노출 | PASS | PENDING |
| SEC-03 | optionalPin/hash 원문 미노출 | PASS | PENDING |
| SEC-04 | 첨부파일 직접 URL 미노출 | PASS | PENDING |
| SEC-05 | 내부 prompt/raw response 전체 미노출 | PASS | PENDING |
| SEC-06 | 민감 사건자료 전문 로그 미기록 | PASS | PENDING |

## 6. 상태 전이 QA

| ID | 전이 | 기대 결과 | 상태 |
|---|---|---|---|
| ST-01 | DRAFT → SENT | PASS | PENDING |
| ST-02 | SENT → CLIENT_VIEWED | PASS | PENDING |
| ST-03 | CLIENT_VIEWED → CLIENT_RESPONDED | PASS | PENDING |
| ST-04 | CLIENT_RESPONDED → UNDER_REVIEW | PASS | PENDING |
| ST-05 | UNDER_REVIEW → ACCEPTED | PASS | PENDING |
| ST-06 | UNDER_REVIEW → NEEDS_MORE_INFO | PASS | PENDING |
| ST-07 | NEEDS_MORE_INFO → SENT | PASS | PENDING |
| ST-08 | ACCEPTED → CLOSED | PASS | PENDING |
| ST-09 | CLOSED → SENT | FAIL 차단 | PENDING |
| ST-10 | CANCELLED → CLIENT_RESPONDED | FAIL 차단 | PENDING |
| ST-11 | EXPIRED → SENT | FAIL 차단 | PENDING |

## 7. 비변경 확인

- 6.x 기능 로직 변경 없음
- 기존 CaseStatus 변경 없음
- 기존 CasePackageShareStatus 변경 없음
- 기존 CasePackageAccessAction 변경 없음
- 기존 사건 패키지 공유 정책 변경 없음
- 기존 첨부파일 다운로드 정책 변경 없음
- 기존 PDF 엔진 변경 없음

## 8. 완료 기준

아래가 모두 충족되면 이 단계는 완료로 본다.

- verify:aibeopchin-7-1-b-supplement-db-runtime PASS
- verify:predeploy-lock PASS
- verify:aibeopchin-6x-operation-lock PASS
- TypeScript PASS
- ESLint PASS
- supplement API route 통합 테스트 PASS
- service unit test PASS

## 9. 최종 판정

AI법친 7.1-B supplement migration 적용 이후 DB Runtime 검증과 API/service QA 기준을 확정한다.

다음 단계는 실제 화면 구현이 아니라, supplement API/service 상태전이/권한 guard 정합성 보정 및 QA 자동화 강화다.
