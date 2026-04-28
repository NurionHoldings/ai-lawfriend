# 대시보드 3.8 — 역할별 대시보드 최종 문구 스냅샷

> 본 문서는 **배포 전 QA 확정표**(`deployment-checklist.md` §6 등)와 **별도**이다. 역할별 대시보드 **사용자 노출 문구**를 배포 전 기준으로 고정하는 스냅샷이다.

## 0. 기준 증빙

- [EVIDENCE-20260426-379](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-379) 대시보드 3.0 — 역할별 대시보드 실데이터 1차 마감 판정
- [EVIDENCE-20260426-381](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-381) 대시보드 3.2 — 의뢰인 최근 사건 정리도 badge
- [EVIDENCE-20260426-382](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-382) 대시보드 3.3 — 변호사 검토 우선순위 badge
- [EVIDENCE-20260426-383](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-383) 대시보드 3.4 — 관리자 장기 미진행 후보
- [EVIDENCE-20260426-384](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-384) 대시보드 3.4b — 관리자 장기 미진행 보조 count metric 후보
- [EVIDENCE-20260426-385](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-385) 대시보드 3.5 — 관리자 상태별 운영 확인 문구 정리
- [EVIDENCE-20260426-386](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-386) 대시보드 3.6 — 관리자 PreviewCard 빈 상태/로딩 문구 정리
- [EVIDENCE-20260426-387](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-387) 대시보드 3.7 — 관리자 대시보드 마감 점검표 / 회귀 체크리스트 정리

관리자 운영 확인·장기 미진행·회귀 점검 항목은 [DASHBOARD_ADMIN_3_7_REGRESSION_CHECKLIST.md](./DASHBOARD_ADMIN_3_7_REGRESSION_CHECKLIST.md)와 함께 본다.

## 1. 문서 목적

이 문서는 의뢰인, 변호사, 관리자 대시보드의 사용자 노출 문구를 배포 전 기준으로 고정하기 위한 스냅샷이다.

이번 문서는 기능 명세가 아니라 문구 기준 문서다.

확인 범위:

- 역할별 대시보드 상단 안내 문구
- 주요 카드 제목
- PreviewCard 문구
- badge 문구
- 빈 상태 문구
- 관리자 운영 확인 문구
- 금지 표현 미사용 여부

## 2. 절대 변경 금지 기준

이 문서 작성으로 아래 항목을 변경하지 않는다.

- 신규 API route 생성 없음
- DB schema 변경 없음
- 권한 정책 변경 없음
- middleware 변경 없음
- getSessionUser / requireSessionUser 의미 변경 없음
- CaseStatus canonical 변경 없음
- 사건 / 인터뷰 / 문서 생성 로직 변경 없음
- 문서 승인 / 생성 로직 변경 없음
- 질문셋 [343]~[350] 재오픈 없음
- FILE-1B 변경 없음
- 배포 전 QA 확정표 갱신 없음
- Living Logo V2 구조 변경 없음
- dashboard-demo-metrics.ts 삭제 없음
- 실제 알림·에스컬레이션 로직 추가 없음
- attentionNeeded count 기준 변경 없음
- staleCaseCount count 기준 변경 없음

## 3. 공통 문구 원칙

역할별 대시보드 문구는 아래 원칙을 따른다.

- 법률 판단처럼 보이는 표현을 피한다.
- 승소 가능성, 패소 위험, 법률 위험도 같은 표현을 쓰지 않는다.
- 운영 화면은 운영 확인, 진행 상태 확인, 보조 지표 중심으로 표현한다.
- 의뢰인 화면은 사건 정리 상태, 다음 진행 안내 중심으로 표현한다.
- 변호사 화면은 검토 우선순위, 초안 확인, 인터뷰 검토 중심으로 표현한다.
- 관리자 화면은 장애, 사고, P0, P1 표현 없이 운영 확인 후보 중심으로 표현한다.

## 4. 의뢰인 대시보드 문구 스냅샷

대상 경로 예시:

- /dashboard
- src/components/dashboard/client
- src/lib/dashboard/dashboard-metrics.ts
- src/lib/dashboard/client-readiness-badge.ts

### 4.1 최근 사건 정리도 badge

사용 가능한 badge 문구는 아래 기준을 따른다.

- 정리 필요
- 일부 정리
- 대체로 정리
- 정리 양호

주의:

- 법률 판단 문구로 확장하지 않는다.
- 승소 가능성, 패소 가능성, 법률 위험도 표현을 쓰지 않는다.
- readinessPercent 숫자는 내부 계산용이며 화면 노출은 label 중심으로 유지한다.

### 4.2 의뢰인 빈 상태 문구 기준

권장 문구:

- 아직 등록된 사건이 없습니다.
- 사건을 생성하면 이곳에서 진행 상태를 확인할 수 있습니다.

피해야 할 문구:

- 승소 가능성이 없습니다.
- 법률 위험이 없습니다.
- 사건 위험도가 낮습니다.

## 5. 변호사 대시보드 문구 스냅샷

대상 경로 예시:

- /lawyer
- src/components/dashboard/lawyer
- src/lib/dashboard/lawyer-review-priority.ts
- src/lib/dashboard/dashboard-metrics.ts

### 5.1 검토 우선순위 badge

사용 가능한 badge 문구는 아래 기준을 따른다.

- 우선 검토
- 초안 확인
- 인터뷰 검토
- 보완 확인
- 일반 확인

주의:

- 점수 숫자는 화면에 노출하지 않는다.
- priorityScore는 정렬·내부 계산 보조값이며 사용자 노출은 label 중심으로 유지한다.
- HOLD는 유틸에 준비되어 있더라도 LAWYER_PREVIEW_STATUS에 포함하지 않았다면 임의로 노출하지 않는다.

### 5.2 변호사 빈 상태 문구 기준

권장 문구:

- 현재 검토할 사건이 없습니다.
- 의뢰인의 인터뷰 또는 문서 초안이 준비되면 이곳에 표시됩니다.

피해야 할 문구:

- 위험 사건 없음
- 법률 사고 없음
- 긴급 위험 없음

## 6. 관리자 대시보드 문구 스냅샷

대상 경로 예시:

- /admin
- src/components/dashboard/admin/admin-risk-board.tsx
- src/lib/dashboard/admin-stale-case.ts
- src/lib/dashboard/dashboard-metrics.ts

### 6.1 운영 확인 후보 안내 문구

기준 문구:

- 보류, 접수 대기, 검토 대기 상태의 사건을 운영 확인 후보로 정리합니다.
- 장기 미진행 후보는 별도 배지와 보조 지표로만 표시됩니다.

### 6.2 상태별 운영 확인 reason

상태별 reason 기준:

- HOLD: 보류 상태로 남아 있어 진행 상태 확인이 필요합니다.
- INTAKE_PENDING: 접수 대기 상태로 남아 있어 초기 확인이 필요합니다.
- REVIEW_PENDING: 검토 대기 상태로 남아 있어 담당자 확인이 필요합니다.
- fallback: 운영 확인이 필요한 사건입니다.

staleReason 우선 기준:

- staleReason이 있으면 상태별 일반 reason보다 우선 표시한다.
- 최근 N일 동안 업데이트가 없어 진행 상태 확인이 필요합니다.

### 6.3 장기 미진행 badge 문구

기준:

- 7일 이상: 확인 후보
- 14일 이상: 우선 확인 후보
- 30일 이상: 장기 미진행 후보

화면 문구:

- 장기 미진행 후보 N건은 운영 확인 보조 지표로만 표시됩니다.
- 장기 미진행 후보도 현재 확인되지 않았습니다.

### 6.4 관리자 빈 상태 문구

운영 확인 후보가 없을 때:

- 현재 운영 확인 후보는 없습니다.
- 보류, 접수 대기, 검토 대기 상태의 사건이 확인되면 이 영역에 표시됩니다.

주의:

- “문제 없음”보다 “현재 확인 후보 없음”으로 표현한다.
- 장애, 사고, P0, P1 표현을 사용하지 않는다.

## 7. 금지 표현

아래 표현은 역할별 대시보드 사용자 노출 문구에 신규 삽입하지 않는다.

- 승소 가능성
- 패소 가능성
- 법률 위험도
- 위험 폭증
- 장애
- 치명
- P0
- P1
- 운영 사고
- 에스컬레이션
- 긴급 위험

단, 기존 주석이나 비사용 경로의 과거 문자열은 이번 문서의 직접 수정 대상이 아니다.

## 8. 확인 명령

```bash
grep -R "승소 가능성" -n src/components/dashboard src/lib/dashboard
grep -R "패소 가능성" -n src/components/dashboard src/lib/dashboard
grep -R "법률 위험도" -n src/components/dashboard src/lib/dashboard
grep -R "위험 폭증" -n src/components/dashboard src/lib/dashboard
grep -R "장애" -n src/components/dashboard src/lib/dashboard
grep -R "치명" -n src/components/dashboard src/lib/dashboard
grep -R "P0" -n src/components/dashboard src/lib/dashboard
grep -R "P1" -n src/components/dashboard src/lib/dashboard
grep -R "운영 사고" -n src/components/dashboard src/lib/dashboard
grep -R "에스컬레이션" -n src/components/dashboard src/lib/dashboard
```

## 9. 검증 명령

문서 스냅샷 작업 후에도 기존 기준선 검증을 유지한다.

```bash
npx tsc --noEmit
npx eslint src/components/dashboard src/lib/dashboard --max-warnings 0
npm run lint
npm run verify:canonical-sources
```

전체 `src/components/dashboard`·`src/lib/dashboard` 경로 `eslint`가 기존 경고로 막히면, 실제 수정·관련 파일 기준으로 범위를 줄인다.

권장 증빙 검증(이번 3.8 문서 전용 작업):

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

## 10. 완료 판정

아래가 모두 충족되면 대시보드 3.8을 완료로 본다.

- 역할별 문구 스냅샷 문서 추가 완료
- 의뢰인 대시보드 문구 기준 정리 완료
- 변호사 대시보드 문구 기준 정리 완료
- 관리자 대시보드 문구 기준 정리 완료
- 금지 표현 기준 정리 완료
- 배포 전 QA 확정표와 별도 문서임을 유지
- 신규 API / DB schema / 권한 / 상태값 변경 없음 확인
- attentionNeeded 기준 변경 없음 확인
- staleCaseCount 기준 변경 없음 확인
- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- `npm run verify:canonical-sources` 통과

## 11. 다음 후보

3.8 이후 다음 후보는 아래 둘 중 하나다.

- 대시보드 3.9 — 역할별 대시보드 최종 회귀 체크리스트
- 배포 전 QA 회신 수신 후 [#evidence-20260428-predeploy-qa-closure](./IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) 확정 기록

팀 회신 전까지 `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표와 회신 원문 줄은 미기입 유지한다.
