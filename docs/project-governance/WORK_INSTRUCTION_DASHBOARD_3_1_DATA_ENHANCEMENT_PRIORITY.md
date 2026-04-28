# WORK_INSTRUCTION_DASHBOARD_3_1_DATA_ENHANCEMENT_PRIORITY.md

## 0. 작업명

대시보드 3.1 — 데이터 고도화 후보 우선순위표

## 1. 현재 기준

기준 증빙:

- [EVIDENCE-20260426-367] Living Logo V2 전체 적용 마감 판정
- [EVIDENCE-20260426-379] 대시보드 3.0 — 역할별 대시보드 실데이터 1차 마감 판정

보류:

- 배포 전 QA 팀 회신 반영
- `#evidence-20260428-predeploy-qa-closure` 확정 기록표 갱신
- 닫힘 / 후속 / 보류 최종 판정

현재 상태:

- 의뢰인 `/dashboard` 실데이터 1차 연결 완료
- 변호사 `/lawyer` 실데이터 1차 연결 완료
- 관리자 `/admin` 실데이터 1차 연결 완료
- 공통 PreviewCard 정리 완료
- 공통 날짜/상태 표시 유틸 정리 완료
- EmptyGuide 조건부 정리 완료
- `dashboard-demo-metrics.ts`는 fallback/demo 용도로 유지

이번 작업 목적:

- 대시보드 3.0 이후 고도화 후보를 우선순위표로 정리한다.
- 바로 코드 구현하지 않는다.
- 각 후보를 별도 PR 단위로 나눈다.
- 실데이터 고도화가 권한·상태·문서 생성 로직을 침범하지 않도록 경계를 잠근다.

## 2. 절대 변경 금지

이번 3.1 작업에서는 아래를 변경하지 않는다.

- 신규 API route 생성 금지
- DB schema 변경 금지
- 권한 정책 변경 금지
- middleware 변경 금지
- `getSessionUser` / `requireSessionUser` 의미 변경 금지
- CaseStatus canonical 변경 금지
- 사건/인터뷰/문서 생성 로직 변경 금지
- 문서 승인/생성 로직 변경 금지
- 질문셋 [343]~[350] 재오픈 금지
- FILE-1B 변경 금지
- 배포 전 QA 확정표 임의 갱신 금지
- Living Logo V2 구조 변경 금지
- `dashboard-demo-metrics.ts` 삭제 금지
- 실제 데이터 조회 조건 변경 금지

## 3. 고도화 후보 우선순위표

| 우선순위 | 후보 | 대상 | 목적 | 착수 권장도 | PR 분리 |
|---|---|---|---|---|---|
| 1 | 의뢰인 최근 사건 정리도 badge | `/dashboard` | 최근 사건 카드에서 사건별 준비 상태를 직관적으로 표시 | 높음 | 별도 PR |
| 2 | 변호사 검토 우선순위 score | `/lawyer` | 변호사가 먼저 봐야 할 사건을 실제 기준으로 정렬 | 높음 | 별도 PR |
| 3 | 관리자 장기 미진행 후보 | `/admin` | 운영자가 오래 멈춘 사건을 확인 | 높음 | 별도 PR |
| 4 | 의뢰인 진행 중 사건 우선 정렬 | `/dashboard` | 최근 사건 preview에서 진행 중 사건을 먼저 표시 | 중간 | 1번과 병합 가능 |
| 5 | 변호사 배정 사건 기준 정교화 | `/lawyer` | 전체 사건이 아닌 담당/배정 기준 큐 정리 | 중간~높음 | 별도 PR |
| 6 | 관리자 승인 대기 장기화 표시 | `/admin` | 오래 승인 대기 중인 사용자/변호사 확인 | 중간 | 별도 PR |
| 7 | demo fallback 축소 여부 판단 | 공통 | 실데이터 연결 후 demo metrics 사용처 점검 | 중간 | 정리 PR |
| 8 | PreviewCard 세부 badge 확장 | 공통 | readiness/status/priority badge 추가 | 낮음~중간 | 각 기능 후 공통화 |

## 4. 1순위 후보 — 의뢰인 최근 사건 정리도 badge

### 목적

의뢰인 최근 사건 preview 카드에 사건별 정리도 badge를 붙인다.

예:

- 정리도 20%
- 정리도 60%
- 정리도 100%

### 기대 효과

의뢰인이 로그인 직후 어떤 사건을 더 보완해야 하는지 바로 알 수 있다.

### 사용 가능 기존 자산

- `buildClientCaseReadiness`
- `ClientCaseReadiness`
- `ClientCasePreviewItem`
- `DashboardPreviewCard`
- `dashboard-display` 유틸

### 착수 조건

- 기존 `/dashboard`에서 접근 가능한 사건 목록을 이미 조회 중
- 사건별 readiness 계산이 과도한 쿼리 증가 없이 가능한지 확인
- 우선 최근 5건에 대해서만 계산

### 금지

- 승소 가능성으로 표현 금지
- 법률 판단처럼 표현 금지
- AI 판단 완료처럼 표현 금지

### 권장 문구

- `정리도 60%`
- `입력 기준`
- `보완 필요`
- `검토 준비`

## 5. 2순위 후보 — 변호사 검토 우선순위 score

### 목적

변호사 검토 큐에서 사건을 단순 최신순이 아니라 검토 우선순위 기준으로 정렬하거나 badge를 붙인다.

### 1차 기준 후보

- `REVIEW_PENDING` 우선
- `DRAFTING` 다음
- `INTERVIEW_DONE` 다음
- `INTAKE_PENDING` / `HOLD`는 보완 확인으로 분리

### 기대 효과

변호사가 “무엇을 먼저 볼지” 바로 판단할 수 있다.

### 사용 가능 기존 자산

- `LawyerReviewQueuePreviewItem`
- `reviewQueuePreview`
- `DashboardPreviewCard`
- `statusLabel`
- `updatedAtLabel`

### 금지

- 법률 위험도 점수로 표현 금지
- 사건 승패 가능성 점수화 금지
- 신규 AI 분석 결과로 연결 금지

### 권장 표현

- `우선 검토`
- `초안 확인`
- `보완 확인`
- `최근 업데이트`

## 6. 3순위 후보 — 관리자 장기 미진행 후보

### 목적

관리자가 오래 멈춰 있는 사건을 운영 확인 대상으로 볼 수 있게 한다.

### 1차 기준 후보

- `updatedAt` 기준 N일 이상 미변경
- `HOLD` 상태 장기화
- `INTAKE_PENDING` 상태 장기화
- `REVIEW_PENDING` 장기 대기

### 기대 효과

운영자가 병목 구간을 빠르게 확인할 수 있다.

### 주의

N일 기준은 임의 확정하지 않고 문서에서 먼저 정한다.

추천 초안:

- 7일 이상: 확인 후보
- 14일 이상: 우선 확인 후보
- 30일 이상: 장기 미진행 후보

### 금지

- 장애/위험/치명 표현 남발 금지
- P0/P1 운영 장애처럼 표현 금지
- 실제 알림·에스컬레이션 로직과 혼동 금지

### 권장 표현

- `운영 확인 후보`
- `장기 미진행 후보`
- `업데이트 필요`

## 7. 4순위 후보 — 의뢰인 진행 중 사건 우선 정렬

### 목적

의뢰인 최근 사건 preview에서 `CLOSED` / `REJECTED` 같은 종료성 사건보다 진행 중 사건을 우선 표시한다.

### 방식

현재:

- `updatedAt` desc 기준 최근 5건

개선 후보:

1. 진행 중 사건 우선
2. 그 안에서 `updatedAt` desc
3. 종료 사건은 뒤로

### 주의

CaseStatus canonical 기준으로 종료성 상태를 판단한다.

종료성 후보:

- `CLOSED`
- `REJECTED`

단, canonical 확인 전 임의 확정 금지.

## 8. 5순위 후보 — 변호사 배정 사건 기준 정교화

### 목적

변호사 대시보드가 전체 접근 가능 사건이 아니라, 실제 담당/배정 사건 중심으로 더 정확히 보이도록 한다.

### 착수 전 확인 필요

- 사건 배정 relation 존재 여부
- lawyer user와 case 간 연결 필드
- 현재 `buildAccessibleCaseWhere`가 변호사에게 어떤 범위를 허용하는지
- 관리자/변호사 권한 차이

### 주의

이 후보는 권한 정책과 맞닿아 있으므로 바로 구현하지 않는다.  
먼저 현재 schema와 기존 접근 조건을 확인한 뒤 별도 PR로 진행한다.

## 9. 6순위 후보 — 관리자 승인 대기 장기화 표시

### 목적

관리자가 오래 승인 대기 중인 사용자 또는 변호사를 볼 수 있게 한다.

### 기준 후보

- `UserStatus.PENDING`
- `createdAt` 또는 `updatedAt` 기준 N일 이상 대기
- 변호사 승인 대기만 볼지, 전체 사용자 승인 대기를 볼지 정책 확인 필요

### 주의

승인 정책을 새로 만들지 않는다.  
기존 `UserStatus.PENDING` 기준을 유지한다.

## 10. 7순위 후보 — demo fallback 정리 여부 판단

### 목적

`dashboard-demo-metrics.ts` 사용처를 점검하고, 실데이터 연결 후에도 필요한 fallback만 남긴다.

### 선택지

1. **유지** — fallback/demo 용도로 계속 보관
2. **축소** — 실제 사용하지 않는 상수만 제거
3. **삭제** — 모든 실데이터 연결 완료 후 별도 PR

### 현재 권장

삭제하지 않는다.  
대시보드 3.0에서 fallback/demo 용도 유지로 이미 정리했으므로, 당장은 유지가 안전하다.

## 11. 8순위 후보 — PreviewCard 세부 badge 확장

### 목적

`DashboardPreviewCard`에 역할별 보조 badge를 추가할 수 있게 한다.

예:

- 의뢰인: 정리도 60%
- 변호사: 우선 검토
- 관리자: 장기 미진행

### 주의

PreviewCard 자체를 먼저 복잡하게 만들지 않는다.  
각 역할별 데이터 고도화가 완료된 뒤 공통화한다.

## 12. 우선 착수 추천

**1차 착수:**

- 대시보드 3.2 — 의뢰인 최근 사건 정리도 badge

이유:

- 기존 readiness 유틸이 이미 있음
- 의뢰인 체감 가치가 큼
- 권한 정책 변경이 거의 없음
- 신규 API 없이 기존 최근 사건 데이터 기반으로 가능

**2차 착수:**

- 대시보드 3.3 — 변호사 검토 우선순위 score

**3차 착수:**

- 대시보드 3.4 — 관리자 장기 미진행 후보

## 13. 증빙 기록

[IMPLEMENTATION_EVIDENCE.md — EVIDENCE-20260426-380](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-380)

## 14. 검증 명령

문서만 수정하는 경우:

```bash
npm run verify:canonical-sources
```

가능하면 아래도 함께 실행:

```bash
npx tsc --noEmit
npm run lint
```

## 15. 완료 기준

- 본 파일(`WORK_INSTRUCTION_DASHBOARD_3_1_DATA_ENHANCEMENT_PRIORITY.md`) 추가
- `IMPLEMENTATION_EVIDENCE.md`에 [EVIDENCE-20260426-380] 추가
- 대시보드 고도화 후보 8개 정리
- 우선순위 확정
- 1차 착수 후보를 대시보드 3.2로 명시
- 배포 전 QA 회신 반영은 보류 유지
- 신규 API / DB / 권한 / 상태 / 로직 변경 없음
- `verify:canonical-sources` 통과

## 최종 한 줄

대시보드 3.1은 대시보드 3.0 실데이터 1차 마감 이후, 의뢰인·변호사·관리자별 데이터 고도화 후보를 우선순위화하고, PR 분리·착수 순서를 문서로 고정하는 **계획 전용** 작업이다(이 문서만으로 코드 구현을 하지 않는다).
