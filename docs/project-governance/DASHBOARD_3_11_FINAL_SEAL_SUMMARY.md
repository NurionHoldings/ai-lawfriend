# 대시보드 3.11 — 대시보드 3.x 최종 봉인 요약표

> 본 문서는 **배포 전 QA 확정표**가 아니다. 대시보드 **3.0~3.10** 완료 흐름의 **최종 봉인**이다.

## 0. 기준 증빙

- [EVIDENCE-20260426-379](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-379) 대시보드 3.0 — 역할별 대시보드 실데이터 1차 마감 판정
- [EVIDENCE-20260426-380](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-380) 대시보드 3.1 — 데이터 고도화 후보 우선순위표
- [EVIDENCE-20260426-381](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-381) 대시보드 3.2 — 의뢰인 최근 사건 정리도 badge
- [EVIDENCE-20260426-382](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-382) 대시보드 3.3 — 변호사 검토 우선순위 badge
- [EVIDENCE-20260426-383](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-383) 대시보드 3.4 — 관리자 장기 미진행 후보
- [EVIDENCE-20260426-384](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-384) 대시보드 3.4b — 관리자 장기 미진행 보조 count metric 후보
- [EVIDENCE-20260426-385](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-385) 대시보드 3.5 — 관리자 상태별 운영 확인 문구 정리
- [EVIDENCE-20260426-386](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-386) 대시보드 3.6 — 관리자 PreviewCard 빈 상태/로딩 문구 정리
- [EVIDENCE-20260426-387](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-387) 대시보드 3.7 — 관리자 대시보드 마감 점검표 / 회귀 체크리스트 정리
- [EVIDENCE-20260426-388](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-388) 대시보드 3.8 — 역할별 대시보드 최종 문구 스냅샷
- [EVIDENCE-20260426-389](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-389) 대시보드 3.9 — 역할별 대시보드 최종 회귀 체크리스트
- [EVIDENCE-20260426-390](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-390) 대시보드 3.10 — dashboard-demo-metrics 유지 기준 / 데모 경로 안전 점검

## 1. 문서 목적

이 문서는 대시보드 3.x 작업 흐름을 최종 봉인하기 위한 요약표다.

대시보드 3.x는 역할별 실데이터 연결, 역할별 badge 고도화, 관리자 운영 확인 후보 정리, 문구 스냅샷, 회귀 체크리스트, demo metrics 경계 점검까지 완료된 상태로 본다.

이 문서는 배포 전 QA 확정표가 아니다.  
팀 회신 전까지 `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표와 회신 원문 줄은 미기입 상태를 유지한다.

## 2. 최종 봉인 원칙

대시보드 3.x는 아래 기준으로 봉인한다.

- 새로운 대시보드 기능을 추가하지 않는다.
- 기존 역할별 dashboard metric 기준을 유지한다.
- badge 문구와 계산 기준을 임의로 확장하지 않는다.
- 관리자 운영 확인 후보를 실제 알림·에스컬레이션 로직으로 연결하지 않는다.
- `dashboard-demo-metrics.ts`는 삭제하지 않되 실서비스 metric 기준으로 사용하지 않는다.
- 배포 전 QA 팀 회신 전까지 QA 확정표를 임의로 채우지 않는다.
- 이후 변경이 필요하면 3.x 재오픈이 아니라 별도 Phase 또는 별도 evidence로 분리한다.

## 3. 대시보드 3.x 완료 요약표

| 단계 | 증빙 | 산출물 / 변경 요지 | 봉인 상태 |
| --- | --- | --- | --- |
| 3.0 | [379](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-379) | 역할별 대시보드 실데이터 1차 연결 완료 | 완료 |
| 3.1 | [380](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-380) | 데이터 고도화 후보 우선순위표 작성 | 완료 |
| 3.2 | [381](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-381) | 의뢰인 최근 사건 정리도 badge 추가 | 완료 |
| 3.3 | [382](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-382) | 변호사 검토 우선순위 badge 추가 | 완료 |
| 3.4 | [383](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-383) | 관리자 장기 미진행 후보 preview 병합 | 완료 |
| 3.4b | [384](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-384) | 관리자 장기 미진행 보조 count metric 추가 | 완료 |
| 3.5 | [385](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-385) | 관리자 상태별 운영 확인 문구 정리 | 완료 |
| 3.6 | [386](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-386) | 관리자 PreviewCard 빈 상태 / 로딩 문구 정리 | 완료 |
| 3.7 | [387](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-387) | 관리자 대시보드 회귀 체크리스트 작성 | 완료 |
| 3.8 | [388](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-388) | 역할별 대시보드 최종 문구 스냅샷 작성 | 완료 |
| 3.9 | [389](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-389) | 역할별 대시보드 최종 회귀 체크리스트 작성 | 완료 |
| 3.10 | [390](./IMPLEMENTATION_EVIDENCE.md#evidence-20260426-390) | demo metrics 유지 기준 / 실서비스 경계 점검 | 완료 |

## 4. 역할별 최종 기준

### 4.1 의뢰인 대시보드

최종 기준:

- `/dashboard`는 의뢰인 실데이터 기준으로 렌더링한다.
- 최근 사건 preview는 최대 5건 기준을 유지한다.
- `readinessPercent`는 내부 계산 보조값이다.
- 화면에는 `readinessLabel` 중심으로 표시한다.
- badge 문구는 아래 기준을 유지한다.
  - 정리 필요
  - 일부 정리
  - 대체로 정리
  - 정리 양호
- 승소 가능성, 패소 가능성, 법률 위험도 표현을 사용하지 않는다.

### 4.2 변호사 대시보드

최종 기준:

- `/lawyer`는 변호사 실데이터 기준으로 렌더링한다.
- 검토 queue preview는 기존 최대 5건 기준을 유지한다.
- preview 정렬은 기존 `updatedAt desc` 기준을 유지한다.
- `priorityScore`는 내부 계산 보조값이다.
- 화면에는 `priorityLabel` 중심으로 표시한다.
- badge 문구는 아래 기준을 유지한다.
  - 우선 검토
  - 초안 확인
  - 인터뷰 검토
  - 보완 확인
  - 일반 확인
- `HOLD`는 유틸에 준비되어 있더라도 `LAWYER_PREVIEW_STATUS`에 포함되지 않았다면 화면에 임의 노출하지 않는다.

### 4.3 관리자 대시보드

최종 기준:

- `/admin`은 관리자 실데이터 기준으로 렌더링한다.
- `attentionNeeded` count 기준은 기존 `HOLD + INTAKE_PENDING`으로 유지한다.
- `staleCaseCount`는 `attentionNeeded`에 합산하지 않는다.
- 운영 확인 후보 상태는 `HOLD / INTAKE_PENDING / REVIEW_PENDING` 기준을 유지한다.
- 7일 이상 미변경 사건은 확인 후보로 분류한다.
- 14일 이상 미변경 사건은 우선 확인 후보로 분류한다.
- 30일 이상 미변경 사건은 장기 미진행 후보로 분류한다.
- 최종 preview는 최대 5건 기준을 유지한다.
- 상태별 reason 문구는 아래 기준을 유지한다.
  - HOLD: 보류 상태로 남아 있어 진행 상태 확인이 필요합니다.
  - INTAKE_PENDING: 접수 대기 상태로 남아 있어 초기 확인이 필요합니다.
  - REVIEW_PENDING: 검토 대기 상태로 남아 있어 담당자 확인이 필요합니다.
  - fallback: 운영 확인이 필요한 사건입니다.
- `staleReason`이 있으면 상태별 일반 reason보다 우선 표시한다.
- 실제 알림 또는 에스컬레이션 로직으로 연결하지 않는다.

## 5. demo metrics 최종 기준

`dashboard-demo-metrics.ts`는 삭제하지 않고 유지한다.

단, 역할은 아래로 제한한다.

- 데모 화면용 샘플 데이터
- 개발 중 UI preview 확인
- 비실서비스 경로의 레이아웃 확인
- 향후 시각 테스트용 fixture 후보

금지 기준:

- 실서비스 관리자 집계에 사용하지 않는다.
- 실제 의뢰인 사건 집계에 사용하지 않는다.
- 실제 변호사 검토 queue 산정에 사용하지 않는다.
- 실제 권한 판단에 사용하지 않는다.
- 실제 사건 상태 판단에 사용하지 않는다.
- 실제 운영 확인 후보 산정에 사용하지 않는다.
- 실제 장기 미진행 후보 산정에 사용하지 않는다.
- 실제 알림 또는 에스컬레이션 기준으로 사용하지 않는다.

## 6. 최종 금지 표현 기준

아래 표현은 대시보드 사용자 노출 문구에 신규 삽입하지 않는다.

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

단, 기존 주석, 비사용 경로, 이번 봉인 작업과 무관한 기존 문자열은 별도 메모로 분리하고 무리하게 삭제하지 않는다.

## 7. 최종 확인 문서

대시보드 3.x 확인 시 아래 문서를 우선 확인한다.

- `docs/project-governance/DASHBOARD_ADMIN_3_7_REGRESSION_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_3_8_ROLE_COPY_SNAPSHOT.md`
- `docs/project-governance/DASHBOARD_3_9_ROLE_REGRESSION_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_3_10_DEMO_METRICS_SAFETY_CHECK.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`

## 8. 변경 금지 항목

이 봉인 문서 작성으로 아래 항목을 변경하지 않는다.

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

## 9. 검증 명령

문서 중심 봉인 작업이지만 기존 기준선 검증을 유지한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

내비게이터를 수정한 경우:

```bash
py -3 -m py_compile tools/aibeopchin_navigator.py
```

실서비스 경로의 demo metrics import 확인이 필요하면 아래 명령을 사용한다.

```powershell
Get-ChildItem -Path src\app,src\components,src\lib -Recurse -Include *.ts,*.tsx -File |
  Select-String -Pattern "dashboard-demo-metrics"
```

## 10. 완료 판정

아래가 모두 충족되면 대시보드 3.11을 완료로 본다.

- `DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md` 신규 추가 완료
- 대시보드 3.0~3.10 완료 요약표 작성 완료
- 의뢰인 대시보드 최종 기준 정리 완료
- 변호사 대시보드 최종 기준 정리 완료
- 관리자 대시보드 최종 기준 정리 완료
- demo metrics 최종 유지 기준 정리 완료
- 금지 표현 기준 정리 완료
- 배포 전 QA 확정표와 별도 문서임을 유지
- 신규 API / DB schema / 권한 / 상태값 변경 없음 확인
- DashboardPreviewCard 구조 변경 없음 확인
- attentionNeeded 기준 변경 없음 확인
- staleCaseCount 기준 변경 없음 확인
- dashboard-demo-metrics.ts 삭제 없음 확인
- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- `npm run verify:canonical-sources` 통과
- 내비게이터 수정 시 `py -3 -m py_compile tools/aibeopchin_navigator.py` 통과

## 11. 이후 진행 기준

대시보드 3.x는 이 문서를 기준으로 최종 봉인한다.

이후 가능한 작업은 아래 둘 중 하나다.

- 배포 전 QA 회신 수신 후 [#evidence-20260428-predeploy-qa-closure](./IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) 확정 기록
- 대시보드 4.x 또는 별도 Phase로 분리한 신규 작업

팀 회신 전까지 `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표와 회신 원문 줄은 미기입 유지한다.

## 12. 대시보드 3.x 최종 확인 순서

이 순서가 이제 대시보드 3.x 최종 봉인 확인 순서다.

1. `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md` §12~13
   - 봉인 이후 확인 순서
   - 봉인 이후 진행 기준
   - QA 회신 전 비움 유지 항목
   - 3.x 기능 확장 금지 기준

2. `docs/project-governance/IMPLEMENTATION_EVIDENCE.md` `#evidence-20260426-391`
   - 3.11 최종 봉인 증빙
   - §12~13 보강 기록
   - 검증 및 변경하지 않은 항목 확인

3. `tools/aibeopchin_navigator.py`
   - `dashboard_3_11_final_seal_summary`
   - `show-plan`의 대시보드 3.11 블록
   - 이후 QA 회신 또는 4.x Phase 전환 기준 확인

## 13. 대시보드 3.x 봉인 이후 진행 기준

대시보드 3.x는 최종 봉인 상태로 둔다.

이후 가능한 진행은 아래 둘 중 하나다.

1. QA 회신 수신 후 `#evidence-20260428-predeploy-qa-closure`에 확정 기록
2. 별도 4.x Phase로 분리한 신규 작업

팀 회신 전까지 아래 항목은 비워 둔다.

- `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표
- QA 팀 회신 원문 줄

근거 없는 임의 최종 판정은 금지한다.  
대시보드 3.x 범위에서의 기능 확장은 금지한다.

---

이 3.11까지 닫으면 대시보드 3.x는 최종 봉인이다.
