# AI법친 Release Candidate QA Lock Table

## 1. 목적

본 문서는 Phase 4 진입 전 릴리스 후보 상태를 잠그기 위한 QA 기준표다.  
Phase 2 운영 완료와 Phase 3 문서 생성 안전성 파이프라인 완료 이후, 실제 배포 후보로 간주하기 전에 반드시 아래 항목을 확인한다.

---

## 2. 현재 기준 상태

| 구분 | 상태 |
|---|---|
| Phase 2 코드/검증 경로 | 완료 |
| Phase 2 운영 완료 | 완료 |
| 전체 정적 분석 잔여 정리 | 완료 |
| Workspace Problems 잔여 진단 정리 | 완료 |
| Phase 3-1 필수항목 validator | 완료 |
| Phase 3-2 NO_UNVERIFIED_FACTS guardrail | 완료 |
| Phase 3-3 WARNING 보강 안내 UI 노출 | 완료 |
| Phase 3-4 guardrail violation별 보완 질문 제안 | 완료 |
| Phase 3-5 generationPolicy와 guardrail 결과 trace 저장 | 완료 |
| Phase 3-6 public-safe guardrailTrace UI 표시 | 완료 |
| Phase 3-7 guardrail failure 보완 요청 흐름 연결 | 완료 |
| Phase 3-8 승인본 PDF/출력 템플릿 public-safe guardrail trace 요약 표시 | 완료 |
| Phase 3-9 공식서식/guardrail 회귀 검증 runner 정리 | 완료 |

---

## 3. 자동 검증 잠금표

| 항목 | 명령 | 결과 | 비고 |
|---|---|---|---|
| Phase 2 DB preflight | `npm run verify:phase2-db-preflight` | PASS | 실 DB 기준 |
| Phase 2 full verify | `npm run verify:official-form-phase2:full` | PASS | 공식서식 trace 포함 |
| Phase 3 regression | `npm run verify:official-form-phase3` | PASS | guardrail 파이프라인 |
| Canonical source verify | `npm run verify:canonical-sources` | PASS | 상태값/기준원천 |
| TypeScript | `npx tsc --noEmit` | PASS | 타입 오류 없음 |
| Lint | `npm run lint` | PASS | 전체 lint clean |
| Release candidate preflight | `npm run verify:release-candidate` | PASS | 전체 묶음 |

---

## 4. 수동 QA 잠금표

| 항목 | 기대 결과 | 결과 |
|---|---|---|
| 로그인 | 정상 로그인 가능 | PASS |
| 사건 생성 | 사건 생성 및 상세 진입 가능 | PASS |
| AI 인터뷰 | 질문셋 기반 답변 저장 가능 | PASS |
| 문서 생성 - 정상 | 필수항목 충족 시 생성 성공 | PASS |
| 문서 생성 - BLOCKING 누락 | 생성 차단 및 누락 항목 표시 | PASS |
| 문서 생성 - WARNING 누락 | 생성 허용 및 보강 안내 표시 | PASS |
| NO_UNVERIFIED_FACTS guardrail | 검증되지 않은 판례/조문/단정 표현 차단 | PASS |
| guardrail 보완 요청 | 차단 후 보완 요청 초안 저장 가능 | PASS |
| 문서 승인 | 정상 trace 문서 승인 가능 | PASS |
| trace 없는 문서 승인 | 승인 차단 | PASS |
| 검증코드 조회 | public-safe sourceTrace / guardrailTrace 표시 | PASS |
| 문서 상세 | 승인본 guardrailTrace 표시 | PASS |
| PDF/출력 | public-safe guardrail 요약만 표시 | PASS |
| 출력 금지 항목 | prompt/interview/raw/snapshot 원문 미노출 | PASS |

---

## 5. 출력물 보안 잠금 기준

출력 가능:

- 생성 정책
- 안전검사 상태
- 검사 시각
- WARNING 보강 항목 수

출력 금지:

- prompt 원문
- interviewAnswers 원문
- 첨부 원문
- 모델 raw response
- snapshotJson 전체
- guardrailIssues 상세 문구
- suggestedQuestions

---

## 6. Phase 4 진입 조건

아래 조건을 모두 만족해야 Phase 4 진입 가능 상태로 본다.

- `npm run verify:release-candidate` PASS
- 수동 QA 잠금표 전 항목 PASS
- 출력물 금지 항목 미노출 확인
- Phase 2 운영 완료 상태 유지
- Phase 3-1 ~ Phase 3-9 회귀 검증 연결 유지
- `IMPLEMENTATION_EVIDENCE.md`에 릴리스 후보 증빙 기록 완료

---

## 7. 최종 판정

| 항목 | 판정 |
|---|---|
| Release Candidate 자동 검증 | 완료 |
| Release Candidate 수동 QA | 완료 |
| Phase 4 진입 가능 여부 | 확정 가능 |
