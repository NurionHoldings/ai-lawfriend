# AI법친 Deployment Required Tests Lock

## 1. 목적

본 문서는 현재 즉시 배포를 진행하지 않고 다른 작업을 우선 수행하기로 한 상태에서, 향후 실제 배포 또는 운영 전환 시 반드시 재검증해야 할 항목을 사전에 지정·잠금하기 위한 문서다.

Phase 4-1 predeploy lock은 완료되었고 실제 배포 가능 상태까지 확인되었으나, 배포 실행은 보류한다.  
따라서 향후 배포 시점에는 아래 항목을 반드시 다시 테스트하고, 그 결과를 `IMPLEMENTATION_EVIDENCE.md`에 기록한 후 배포한다.

---

## 2. 현재 상태

| 항목 | 상태 |
|---|---|
| Phase 2 운영 완료 | 완료 |
| Phase 3-1 ~ Phase 3-9 | 완료 |
| Release Candidate 자동 검증 | 완료 |
| Release Candidate 수동 QA | 완료 |
| Phase 4 착수 가능 상태 | 완료 |
| Phase 4-1 predeploy lock | 완료 |
| 실제 배포 가능 상태 | 완료 |
| 실제 배포 실행 | 보류 |
| 배포 시 필수 재검증 항목 지정 | 완료 |

---

## 3. 배포/운영 시 반드시 다시 실행할 자동 검증

아래 명령은 실제 배포 직전에 반드시 다시 실행한다.

```bash
npm run verify:predeploy-lock
npm run verify:phase4-entry
npm run verify:release-candidate
npm run verify:official-form-phase3
npm run verify:official-form-phase2:full
npx tsc --noEmit
npm run lint
```

모든 명령이 PASS여야 한다.

## 4. 배포/운영 시 반드시 다시 확인할 환경 항목

| 항목 | 확인 기준 | 결과 |
|---|---|---|
| 배포 브랜치 | 실제 배포 브랜치가 main/release/deploy 계열인지 확인 | 배포 시 확인 |
| 배포 커밋 SHA | 실제 배포 커밋 기록 | 배포 시 확인 |
| 배포 대상 | staging 또는 production 명확히 기록 | 배포 시 확인 |
| DATABASE_URL | 실제 대상 DB 연결 문자열 확인, 원문 기록 금지 | 배포 시 확인 |
| 인증 secret | JWT/AUTH/NEXTAUTH secret 존재 확인, 원문 기록 금지 | 배포 시 확인 |
| APP URL | 배포 도메인과 환경변수 일치 확인 | 배포 시 확인 |
| AI API Key | 존재 여부와 사용 가능성 확인, 원문 기록 금지 | 배포 시 확인 |
| Storage 환경변수 | 첨부 저장소 사용 시 확인 | 배포 시 확인 |

## 5. 배포/운영 시 반드시 다시 확인할 DB 백업 항목

| 항목 | 확인 기준 | 결과 |
|---|---|---|
| DB 백업 방식 | managed-backup 또는 pg_dump 등 명확히 기록 | 배포 시 확인 |
| 백업 기준 시각 | 배포 직전 백업 시각 기록 | 배포 시 확인 |
| 백업 식별자 | 백업 ID 또는 관리 콘솔 reference 기록 | 배포 시 확인 |
| 복구 가능성 | 장애 시 복구 가능한지 확인 | 배포 시 확인 |

## 6. 배포/운영 시 반드시 다시 확인할 롤백 항목

| 항목 | 확인 기준 | 결과 |
|---|---|---|
| 롤백 대상 커밋 | 직전 안정 커밋 SHA 기록 | 배포 시 확인 |
| 롤백 담당자 | 실제 담당자 기록 | 배포 시 확인 |
| 롤백 트리거 | 로그인 실패, 문서 생성 실패, 승인/검증 실패 등 기준 확인 | 배포 시 확인 |
| 롤백 명령 또는 절차 | 플랫폼별 rollback 절차 확인 | 배포 시 확인 |

## 7. 배포 후 Smoke Test 필수 항목

배포 후 아래 항목을 실제 화면 기준으로 반드시 확인한다.

| ID | 항목 | 기대 결과 | 결과 |
|---|---|---|---|
| SMOKE-APP-ACCESS | 앱 접속 | 홈/로그인 페이지 접속 가능 | 배포 시 확인 |
| SMOKE-LOGIN | 로그인 | 테스트 계정 로그인 가능 | 배포 시 확인 |
| SMOKE-CASE-LIST | 사건 목록 | 사건 목록 진입 가능 | 배포 시 확인 |
| SMOKE-CASE-DETAIL | 사건 상세 | 사건 상세 진입 가능 | 배포 시 확인 |
| SMOKE-DOCUMENT-GENERATE | 문서 생성 | 정상 조건에서 문서 생성 가능 | 배포 시 확인 |
| SMOKE-BLOCKING-MISSING | BLOCKING 누락 | 생성 차단 표시 | 배포 시 확인 |
| SMOKE-WARNING-MISSING | WARNING 누락 | 생성 허용 + 보강 안내 표시 | 배포 시 확인 |
| SMOKE-GUARDRAIL-VIOLATION | guardrail violation | 생성 차단 + 보완 질문 표시 | 배포 시 확인 |
| SMOKE-DOCUMENT-APPROVE | 문서 승인 | 정상 trace 문서 승인 가능 | 배포 시 확인 |
| SMOKE-VERIFY-CODE | 검증코드 조회 | public-safe sourceTrace / guardrailTrace 표시 | 배포 시 확인 |
| SMOKE-PDF-PRINT | PDF/출력 | public-safe guardrail 요약만 표시 | 배포 시 확인 |
| SMOKE-FORBIDDEN-RAW | 금지 원문 노출 | prompt/interview/raw/snapshot 원문 미노출 | 배포 시 확인 |

## 8. 출력물 보안 재확인 기준

배포 후 PDF/출력물에서 아래 항목만 표시되어야 한다.

표시 가능:

- 생성 정책
- 안전검사 상태
- 검사 시각
- WARNING 보강 항목 수

표시 금지:

- prompt 원문
- interviewAnswers 원문
- 첨부 원문
- 모델 raw response
- snapshotJson 전체
- guardrailIssues 상세 문구
- suggestedQuestions

## 9. 향후 배포 시 완료 조건

향후 실제 배포 시 아래 조건을 모두 만족해야 한다.

- npm run verify:predeploy-lock PASS
- npm run verify:phase4-entry PASS
- npm run verify:release-candidate PASS
- DB 백업 확인 완료
- 환경변수 확인 완료
- 롤백 기준 확인 완료
- Smoke Test 12개 항목 전부 PASS
- 출력 금지 항목 미노출 확인
- IMPLEMENTATION_EVIDENCE.md에 배포 시점 증빙 추가

## 10. 현재 최종 판정

| 항목 | 판정 |
|---|---|
| 배포 가능 상태 | 완료 |
| 실제 배포 실행 | 보류 |
| 배포 시 필수 재검증 항목 지정 | 완료 |
| 다음 배포 시 재검증 필요 여부 | 필요 |