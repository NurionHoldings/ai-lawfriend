# Supplement Request Migration Runbook (7.1-B Phase1)

## 목적

보완요청 도메인 마이그레이션을 운영 DB에 안전하게 반영하기 위한 실행 순서와 검증 절차를 정의합니다.

대상 마이그레이션:
- `prisma/migrations/20260503193000_add_supplement_request_phase1/migration.sql`

## 사전 조건

- 운영 환경에 `DATABASE_URL`이 설정되어 있어야 합니다.
- 배포 담당자는 DB 백업 참조값(스냅샷 ID 또는 PITR 시각)을 확보해야 합니다.
- 앱 코드와 마이그레이션 파일이 동일 커밋에 고정되어 있어야 합니다.

## 실행 순서

1. 정합성 사전 검증

```bash
npm run verify:canonical-sources
npm run verify:aibeopchin-6x-operation-lock
npm run verify:supplement-migration-predeploy
```

2. 마이그레이션 적용

```bash
npm run db:deploy
npm run db:generate
```

3. 배포 전 전체 게이트

```bash
npm run predeploy:check
npm run verify:predeploy-lock
```

## 적용 후 검증 포인트

- `SupplementRequest`, `SupplementResponse` 테이블이 생성되었는지 확인
- enum(`SupplementRequestStatus`, `SupplementRequestType`)이 반영되었는지 확인
- 애플리케이션에서 `/api/cases/:caseId/supplement-requests` GET/POST가 정상 응답하는지 확인

## 롤백 가이드

- 기본 원칙: Prisma migration은 되돌리기보다 복구 마이그레이션(Forward Fix)을 우선합니다.
- 장애 발생 시:
1. 즉시 배포 중단
2. `OPERATIONS_RECOVERY.md` 절차에 따라 앱 롤백
3. DB는 백업 참조값 기준으로 DBA 승인 하에 복구
4. 원인 분석 후 보정 마이그레이션 작성

## 배포 증빙 기록

배포 티켓/운영 로그에 아래를 남깁니다.
- 실행자
- 실행 시각
- 적용 커밋 SHA
- DB 백업 참조값
- `npm run db:deploy` 결과
- `npm run verify:predeploy-lock` 결과
