# 대시보드 3.9 — 역할별 대시보드 최종 회귀 체크리스트

> 본 문서는 **배포 전 QA 확정표**가 아니다. 역할별 대시보드 **최종 회귀 점검** 전용이다.

## 0. 기준 증빙

- [EVIDENCE-20260426-379](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-379) 대시보드 3.0 — 역할별 대시보드 실데이터 1차 마감 판정
- [EVIDENCE-20260426-381](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-381) 대시보드 3.2 — 의뢰인 최근 사건 정리도 badge
- [EVIDENCE-20260426-382](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-382) 대시보드 3.3 — 변호사 검토 우선순위 badge
- [EVIDENCE-20260426-383](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-383) 대시보드 3.4 — 관리자 장기 미진행 후보
- [EVIDENCE-20260426-384](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-384) 대시보드 3.4b — 관리자 장기 미진행 보조 count metric 후보
- [EVIDENCE-20260426-385](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-385) 대시보드 3.5 — 관리자 상태별 운영 확인 문구 정리
- [EVIDENCE-20260426-386](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-386) 대시보드 3.6 — 관리자 PreviewCard 빈 상태/로딩 문구 정리
- [EVIDENCE-20260426-387](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-387) 대시보드 3.7 — 관리자 대시보드 마감 점검표 / 회귀 체크리스트 정리
- [EVIDENCE-20260426-388](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-388) 대시보드 3.8 — 역할별 대시보드 최종 문구 스냅샷

문구 기준 대조: [DASHBOARD_3_8_ROLE_COPY_SNAPSHOT.md](./DASHBOARD_3_8_ROLE_COPY_SNAPSHOT.md). 관리자 구현 축 세부: [DASHBOARD_ADMIN_3_7_REGRESSION_CHECKLIST.md](./DASHBOARD_ADMIN_3_7_REGRESSION_CHECKLIST.md).

## 1. 문서 목적

이 문서는 의뢰인, 변호사, 관리자 대시보드의 배포 전 최종 회귀 점검 항목을 고정하기 위한 체크리스트다.

이 문서는 배포 전 QA 확정표가 아니다.  
팀 회신 전까지 `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표와 회신 원문 줄은 미기입 상태를 유지한다.

이번 문서의 점검 범위는 아래와 같다.

- 역할별 dashboard route 접근
- 역할별 실데이터 표시
- PreviewCard 표시
- badge 문구 표시
- 빈 상태 문구 표시
- 관리자 장기 미진행 후보 표시
- 금지 표현 미사용
- 기존 집계 기준 유지
- 신규 API / DB schema / 권한 / 상태값 변경 없음

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
- DashboardPreviewCard 구조 변경 없음
- 실제 알림·에스컬레이션 로직 추가 없음
- attentionNeeded count 기준 변경 없음
- staleCaseCount count 기준 변경 없음

## 3. 공통 회귀 체크리스트

역할 공통 점검 항목:

- [ ] `/dashboard` 의뢰인 대시보드가 정상 렌더링된다.
- [ ] `/lawyer` 변호사 대시보드가 정상 렌더링된다.
- [ ] `/admin` 관리자 대시보드가 정상 렌더링된다.
- [ ] 각 역할의 접근 권한이 기존 정책대로 유지된다.
- [ ] restricted 안내 경로가 기존 Living Logo V2 기준과 충돌하지 않는다.
- [ ] DashboardPreviewCard 구조가 변경되지 않았다.
- [ ] dashboard-demo-metrics.ts는 삭제되지 않았다.
- [ ] 로딩 또는 빈 상태에서 화면이 깨지지 않는다.
- [ ] 사용자 노출 문구에 금지 표현이 신규 삽입되지 않았다.
- [ ] `npx tsc --noEmit`이 통과한다.
- [ ] `npm run lint`가 통과한다.
- [ ] `npm run verify:canonical-sources`가 통과한다.

## 4. 의뢰인 대시보드 회귀 체크리스트

대상 예시:

- `/dashboard`
- `src/components/dashboard/client`
- `src/lib/dashboard/client-readiness-badge.ts`
- `src/lib/dashboard/dashboard-metrics.ts`

점검 항목:

- [ ] 의뢰인 대시보드가 실데이터 기준으로 렌더링된다.
- [ ] 최근 사건 preview가 최대 5건 기준을 유지한다.
- [ ] readinessPercent는 내부 계산용으로 유지된다.
- [ ] 화면에는 readinessPercent 숫자 대신 readinessLabel 중심으로 표시된다.
- [ ] 최근 사건 정리도 badge 문구가 아래 기준 안에서 표시된다.
  - 정리 필요
  - 일부 정리
  - 대체로 정리
  - 정리 양호
- [ ] 의뢰인 화면에 승소 가능성, 패소 가능성, 법률 위험도 표현이 표시되지 않는다.
- [ ] 등록된 사건이 없을 때 빈 상태 문구가 자연스럽게 표시된다.
- [ ] 사건 생성 또는 상세 이동 링크가 기존 경로와 충돌하지 않는다.
- [ ] 의뢰인 dashboard metric 조회가 관리자 또는 변호사 권한 로직을 침범하지 않는다.

## 5. 변호사 대시보드 회귀 체크리스트

대상 예시:

- `/lawyer`
- `src/components/dashboard/lawyer`
- `src/lib/dashboard/lawyer-review-priority.ts`
- `src/lib/dashboard/dashboard-metrics.ts`

점검 항목:

- [ ] 변호사 대시보드가 실데이터 기준으로 렌더링된다.
- [ ] 검토 queue preview가 기존 최대 5건 기준을 유지한다.
- [ ] preview 정렬은 기존 `updatedAt desc` 기준을 유지한다.
- [ ] priorityScore는 내부 계산용으로 유지된다.
- [ ] 화면에는 priorityScore 숫자가 노출되지 않는다.
- [ ] priorityLabel badge 문구가 아래 기준 안에서 표시된다.
  - 우선 검토
  - 초안 확인
  - 인터뷰 검토
  - 보완 확인
  - 일반 확인
- [ ] HOLD는 유틸에 준비되어 있더라도 LAWYER_PREVIEW_STATUS에 포함되지 않았다면 화면에 임의 노출하지 않는다.
- [ ] 변호사 화면에 위험 사건, 법률 사고, 긴급 위험 같은 표현이 신규 표시되지 않는다.
- [ ] 검토할 사건이 없을 때 빈 상태 문구가 자연스럽게 표시된다.
- [ ] 변호사 dashboard metric 조회가 의뢰인 또는 관리자 권한 로직을 침범하지 않는다.

## 6. 관리자 대시보드 회귀 체크리스트

대상 예시:

- `/admin`
- `src/components/dashboard/admin/admin-risk-board.tsx`
- `src/lib/dashboard/admin-stale-case.ts`
- `src/lib/dashboard/dashboard-metrics.ts`
- `docs/project-governance/DASHBOARD_ADMIN_3_7_REGRESSION_CHECKLIST.md`

점검 항목:

- [ ] 관리자 대시보드가 실데이터 기준으로 렌더링된다.
- [ ] attentionNeeded count 기준은 기존 `HOLD + INTAKE_PENDING`으로 유지된다.
- [ ] staleCaseCount는 attentionNeeded에 합산되지 않는다.
- [ ] staleCaseCount는 보조 지표로만 표시된다.
- [ ] 운영 확인 후보 상태는 `HOLD / INTAKE_PENDING / REVIEW_PENDING` 기준을 유지한다.
- [ ] 7일 이상 미변경 사건은 확인 후보로 분류된다.
- [ ] 14일 이상 미변경 사건은 우선 확인 후보로 분류된다.
- [ ] 30일 이상 미변경 사건은 장기 미진행 후보로 분류된다.
- [ ] stale preview는 updatedAt asc 기준으로 최대 5건 조회한다.
- [ ] 기존 최신 preview와 stale preview는 Map으로 병합된다.
- [ ] 최종 preview는 최대 5건이다.
- [ ] 정렬은 장기 미진행 우선 → 오래 멈춘 순 → 최신 업데이트 순이다.
- [ ] 상태별 reason 문구가 아래 기준으로 표시된다.
  - HOLD: 보류 상태로 남아 있어 진행 상태 확인이 필요합니다.
  - INTAKE_PENDING: 접수 대기 상태로 남아 있어 초기 확인이 필요합니다.
  - REVIEW_PENDING: 검토 대기 상태로 남아 있어 담당자 확인이 필요합니다.
  - fallback: 운영 확인이 필요한 사건입니다.
- [ ] staleReason이 있으면 상태별 일반 reason보다 우선 표시된다.
- [ ] 운영 확인 후보가 없으면 “현재 운영 확인 후보는 없습니다.”가 표시된다.
- [ ] 운영 확인 후보가 없으면 “보류, 접수 대기, 검토 대기 상태의 사건이 확인되면 이 영역에 표시됩니다.”가 표시된다.
- [ ] 장기 미진행 후보가 0건이면 “장기 미진행 후보도 현재 확인되지 않았습니다.” 기준으로 표시된다.
- [ ] 관리자 화면에 장애, 치명, P0, P1, 위험 폭증 표현이 신규 표시되지 않는다.
- [ ] 실제 알림 또는 에스컬레이션 로직으로 연결되지 않는다.

## 7. 역할별 문구 스냅샷 대조

대상 문서:

- `docs/project-governance/DASHBOARD_3_8_ROLE_COPY_SNAPSHOT.md`

점검 항목:

- [ ] 의뢰인 대시보드 문구가 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] 변호사 대시보드 문구가 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] 관리자 대시보드 문구가 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] badge 문구가 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] reason 문구가 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] 빈 상태 문구가 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] 금지 표현 기준이 3.8 스냅샷 기준과 충돌하지 않는다.

## 8. 금지 표현 검색

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

확인 명령:

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
grep -R "긴급 위험" -n src/components/dashboard src/lib/dashboard
```

기존 주석, 비사용 경로, 이번 작업과 무관한 기존 문자열은 별도 메모로 분리하고 무리하게 삭제하지 않는다.

## 9. 검증 명령

권장 검증:

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

내비게이터를 수정한 경우:

```bash
py -3 -m py_compile tools/aibeopchin_navigator.py
```

역할별 dashboard 경로를 지정 eslint로 확인할 경우:

```bash
npx eslint src/components/dashboard src/lib/dashboard --max-warnings 0
```

단, 전체 dashboard 경로 eslint가 기존 경고로 막히면 실제 수정 대상 또는 기존 증빙 기준 명령만 기록한다.

## 10. 완료 판정

아래가 모두 충족되면 대시보드 3.9를 완료로 본다.

- 역할별 대시보드 최종 회귀 체크리스트 문서 추가 완료
- 의뢰인 대시보드 회귀 체크 항목 정리 완료
- 변호사 대시보드 회귀 체크 항목 정리 완료
- 관리자 대시보드 회귀 체크 항목 정리 완료
- 3.8 문구 스냅샷 대조 항목 정리 완료
- 금지 표현 검색 기준 정리 완료
- 배포 전 QA 확정표와 별도 문서임을 유지
- 신규 API / DB schema / 권한 / 상태값 변경 없음 확인
- attentionNeeded 기준 변경 없음 확인
- staleCaseCount 기준 변경 없음 확인
- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- `npm run verify:canonical-sources` 통과
- 내비게이터 수정 시 `py -3 -m py_compile tools/aibeopchin_navigator.py` 통과

## 11. 다음 후보

3.9 이후 다음 후보는 아래 중 하나다.

- 대시보드 3.10 — dashboard-demo-metrics 유지 기준 / 데모 경로 안전 점검 — [DASHBOARD_3_10_DEMO_METRICS_SAFETY_CHECK.md](./DASHBOARD_3_10_DEMO_METRICS_SAFETY_CHECK.md) · [#evidence-20260426-390](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-390)
- 배포 전 QA 회신 수신 후 [#evidence-20260428-predeploy-qa-closure](./IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) 확정 기록

팀 회신 전까지 `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표와 회신 원문 줄은 미기입 유지한다.

---

3.9까지 닫으면 대시보드 3.x는 실데이터 연결 → badge 고도화 → 관리자 운영 문구/빈 상태 → 관리자 회귀 체크리스트 → 역할별 문구 스냅샷 → 역할별 최종 회귀 체크리스트까지 한 덩어리로 안정화된다.
