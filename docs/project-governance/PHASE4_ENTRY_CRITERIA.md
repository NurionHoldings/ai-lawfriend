# AI법친 Phase 4 Entry Criteria

## 1. 목적

본 문서는 AI법친 프로젝트가 Phase 4에 진입하기 전 반드시 충족해야 할 기준을 정의한다.

Phase 2 운영 완료, Phase 3 문서 생성 안전성 파이프라인, Release Candidate 자동 검증 및 수동 QA가 완료된 상태를 전제로 하며, Phase 4에서는 배포 안정화·운영 준비·릴리스 관리·실사용자 검증 흐름을 우선한다.

---

## 2. 현재 공식 기준 상태

| 항목 | 상태 |
|---|---|
| Phase 2 코드/검증 경로 | 완료 |
| Phase 2 운영 완료 | 완료 |
| Phase 3-1 ~ Phase 3-9 | 완료 |
| Release Candidate 자동 검증 | 완료 |
| Release Candidate 수동 QA | 완료 |
| Phase 4 진입 가능 여부 | 가능 |

---

## 3. Phase 4 착수 전 필수 조건

Phase 4 착수 전 아래 조건을 모두 충족해야 한다.

| 조건 | 상태 |
|---|---|
| `npm run verify:release-candidate` PASS | 필수 |
| `npm run verify:release-candidate:manual-qa` PASS | 필수 |
| 운영/개발 DB 백업 여부 확인 | 필수 |
| `.env.local` / 배포 환경변수 확인 | 필수 |
| 배포 대상 브랜치 확인 | 필수 |
| 롤백 기준 문서 확인 | 필수 |
| 배포 후 smoke test 항목 확인 | 필수 |
| Phase 4 작업 범위 문서화 | 필수 |

---

## 4. Phase 4 착수 금지 조건

아래 항목 중 하나라도 해당하면 Phase 4 착수를 보류한다.

| 금지 조건 | 설명 |
|---|---|
| Release Candidate runner FAIL | 자동 검증 실패 |
| Manual QA FAIL/PENDING/BLOCKED | 수동 QA 미완료 |
| 운영 DB 백업 미확인 | 복구 기준 없음 |
| 환경변수 불명확 | DATABASE_URL, auth secret, storage 설정 불명확 |
| 배포 브랜치 불명확 | 어떤 브랜치를 배포할지 확정되지 않음 |
| 롤백 기준 없음 | 장애 발생 시 복구 기준 없음 |
| Phase 4 작업 범위 불명확 | 기능 확장 범위가 정리되지 않음 |

---

## 5. Phase 4 우선 작업 범위

Phase 4에서는 새 기능 확장보다 운영 안정화와 배포 체계를 우선한다.

### 5.1 최우선

1. 배포 브랜치 확정
2. 운영 환경변수 점검
3. 운영 DB 백업 확인
4. 배포 전 predeploy 검증
5. 배포 후 smoke test
6. 장애 발생 시 rollback 절차 확인

### 5.2 이후 작업

1. 실사용자 테스트 계정 정리
2. 관리자/변호사/의뢰인별 핵심 흐름 점검
3. 문서 생성/승인/검증 로그 관찰
4. 오류 로그 수집 기준 정리
5. 운영 대응 매뉴얼 보강

---

## 6. Phase 4 착수 판정

| 항목 | 판정 |
|---|---|
| 자동 검증 | 완료 |
| 수동 QA | 완료 |
| 운영 백업 확인 | 미확인 |
| 환경변수 확인 | 미확인 |
| 배포 브랜치 확인 | 미확인 |
| 롤백 기준 확인 | 미확인 |
| Smoke test 기준 확인 | 미확인 |
| Phase 4 착수 최종 판정 | 조건부 가능 |

---

## 7. 최종 기준

Phase 4 착수는 가능하나, 실제 배포 작업 전에는 아래 5개가 추가로 확인되어야 한다.

- 운영/개발 DB 백업
- 배포 환경변수
- 배포 브랜치
- 롤백 기준
- 배포 후 smoke test
