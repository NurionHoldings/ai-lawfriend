# AI법친 Phase 4-1 Predeploy Lock

## 1. 목적

본 문서는 AI법친 Phase 4-1의 배포 전 운영 잠금 기준을 정의한다.

Phase 4 착수 기준은 통과했지만, 실제 배포는 별도 잠금이 필요하다.  
따라서 배포 브랜치, 환경변수, DB 백업, 롤백 기준, 배포 후 Smoke Test 기준을 명확히 확인한 후에만 실제 배포로 진행한다.

---

## 2. 현재 공식 상태

| 항목 | 상태 |
|---|---|
| Phase 2 운영 완료 | 완료 |
| Phase 3-1 ~ Phase 3-9 | 완료 |
| Release Candidate 자동 검증 | 완료 |
| Release Candidate 수동 QA | 완료 |
| Phase 4 착수 기준 정의 | 완료 |
| Phase 4 착수 가능 상태 | 완료 |
| 실제 배포 | 보류 |

---

## 3. Phase 4-1 잠금 대상

| 항목 | 필수 여부 | 현재 상태 |
|---|---:|---|
| 배포 브랜치 확정 | 필수 | 미확인 |
| 운영/개발 DB 백업 확인 | 필수 | 미확인 |
| 배포 환경변수 확인 | 필수 | 미확인 |
| 롤백 기준 확정 | 필수 | 미확인 |
| 배포 후 Smoke Test 기준 확정 | 필수 | 미확인 |
| Release Candidate preflight 재실행 | 필수 | 미확인 |
| Phase 4 entry preflight 재실행 | 필수 | 미확인 |

---

## 4. 배포 브랜치 잠금 기준

배포 브랜치는 아래 기준 중 하나로 확정한다.

| 구분 | 기준 |
|---|---|
| 후보 브랜치 | `main`, `release/*`, `deploy/*` 중 하나 |
| 금지 브랜치 | 개인 작업 브랜치, 실험 브랜치, 미검증 feature 브랜치 |
| 필수 조건 | `npm run verify:phase4-entry` PASS |
| 필수 조건 | `npm run verify:predeploy-lock` PASS |

배포 전 기록해야 할 값:

```text
DEPLOY_BRANCH=
DEPLOY_COMMIT_SHA=
DEPLOY_TARGET=
DEPLOY_OPERATOR=
```

## 5. 환경변수 잠금 기준

배포 전 아래 환경변수를 확인한다.

| 환경변수 | 필수 | 공개 금지 | 확인 기준 |
|---|---|---|---|
| DATABASE_URL | 예 | 예 | 실 DB 연결 문자열 |
| DIRECT_URL | 선택 | 예 | Prisma direct URL 사용 시 |
| JWT_SECRET / AUTH_SECRET | 예 | 예 | 인증 서명 secret |
| NEXTAUTH_SECRET | 사용 시 필수 | 예 | NextAuth 사용 시 |
| NEXTAUTH_URL | 사용 시 필수 | 아니오 | 배포 도메인 |
| APP_URL / NEXT_PUBLIC_APP_URL | 권장 | 아니오 | 배포 도메인 |
| STORAGE_* | 사용 시 필수 | 예/부분 | 첨부 저장소 |
| OPENAI_API_KEY | 사용 시 필수 | 예 | AI 호출 |
| NODE_ENV | 예 | 아니오 | production 또는 staging |

원칙:

- secret 값은 문서에 원문으로 기록하지 않는다.
- 존재 여부와 형식만 확인한다.
- .env.local 원문을 증빙에 붙이지 않는다.
- DATABASE_URL은 따옴표 주입 여부를 확인한다.

## 6. DB 백업 잠금 기준

실제 배포 전 아래 중 하나 이상을 충족해야 한다.

| 방식 | 기준 |
|---|---|
| pg_dump | 배포 직전 DB dump 파일 생성 |
| managed backup | Supabase/Neon/RDS 등 관리형 백업 시각 확인 |
| migration rollback 기준 | schema 변경이 있는 경우 롤백 절차 기록 |
| 데이터 복구 기준 | 최소 복구 가능 시점 기록 |

기록해야 할 값:

```text
DB_BACKUP_CONFIRMED=
DB_BACKUP_METHOD=
DB_BACKUP_REFERENCE=
DB_BACKUP_CHECKED_AT=
```

## 7. 롤백 기준

배포 실패 또는 smoke test 실패 시 아래 기준으로 롤백한다.

| 상황 | 조치 |
|---|---|
| 앱 부팅 실패 | 직전 배포 커밋으로 rollback |
| 로그인 실패 | 환경변수 확인 후 rollback |
| 문서 생성 실패 | AI/API/env 확인 후 rollback |
| 승인/검증 실패 | DB migration 및 trace 확인 후 rollback |
| 데이터 손상 의심 | 즉시 배포 중단, DB 백업 기준으로 복구 검토 |

롤백 전 확인:

```text
ROLLBACK_TARGET_COMMIT=
ROLLBACK_OPERATOR=
ROLLBACK_TRIGGER=
ROLLBACK_DECISION_AT=
```

## 8. Smoke Test 기준

배포 후 아래 항목을 실제 화면 기준으로 확인한다.

| 항목 | 기대 결과 | 결과 |
|---|---|---|
| 앱 접속 | 홈/로그인 페이지 접속 가능 | 미확인 |
| 로그인 | 테스트 계정 로그인 가능 | 미확인 |
| 사건 목록 | 사건 목록 진입 가능 | 미확인 |
| 사건 상세 | 사건 상세 진입 가능 | 미확인 |
| 문서 생성 | 정상 조건에서 문서 생성 가능 | 미확인 |
| BLOCKING 누락 | 생성 차단 표시 | 미확인 |
| WARNING 누락 | 생성 허용 + 보강 안내 표시 | 미확인 |
| guardrail violation | 생성 차단 + 보완 질문 표시 | 미확인 |
| 문서 승인 | 정상 trace 문서 승인 가능 | 미확인 |
| 검증코드 조회 | public-safe trace 표시 | 미확인 |
| PDF/출력 | public-safe guardrail 요약만 표시 | 미확인 |
| 금지 원문 노출 | prompt/interview/raw/snapshot 미노출 | 미확인 |

## 9. Phase 4-1 완료 조건

아래 조건을 모두 만족해야 Phase 4-1을 완료로 판정한다.

- 배포 브랜치 확정
- 배포 커밋 SHA 기록
- DB 백업 확인
- 환경변수 확인
- 롤백 기준 확인
- Smoke Test 항목 정의
- npm run verify:predeploy-lock PASS
- npm run verify:phase4-entry PASS
- IMPLEMENTATION_EVIDENCE.md에 증빙 기록

## 10. 현재 판정

| 항목 | 판정 |
|---|---|
| Phase 4-1 predeploy lock | 준비 |
| 실제 배포 | 보류 |
