# 대시보드 3.10 — dashboard-demo-metrics 유지 기준 / 데모 경로 안전 점검

> 본 문서는 **배포 전 QA 확정표**가 아니다. 실서비스 `dashboard-metrics.ts`와 **`dashboard-demo-metrics.ts`** 의 역할 경계를 고정한다.

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

역할별 문구·회귀: [DASHBOARD_3_8_ROLE_COPY_SNAPSHOT.md](./DASHBOARD_3_8_ROLE_COPY_SNAPSHOT.md), [DASHBOARD_3_9_ROLE_REGRESSION_CHECKLIST.md](./DASHBOARD_3_9_ROLE_REGRESSION_CHECKLIST.md).

## 1. 문서 목적

이 문서는 `dashboard-demo-metrics.ts`의 유지 기준과 데모 경로 안전 점검 기준을 고정하기 위한 문서다.

대시보드 3.0 이후 역할별 대시보드는 실데이터 기준으로 연결되었다.  
다만 데모 화면, 샘플 화면, 비로그인 미리보기, 개발용 preview 경로가 존재할 수 있으므로 `dashboard-demo-metrics.ts`는 삭제하지 않고 역할을 분리해 유지한다.

이 문서는 배포 전 QA 확정표가 아니다.  
팀 회신 전까지 `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표와 회신 원문 줄은 미기입 상태를 유지한다.

## 2. 유지 원칙

`dashboard-demo-metrics.ts`는 아래 목적에 한해 유지한다.

- 데모 화면용 샘플 데이터
- 개발 중 UI preview 확인
- 비실서비스 경로의 레이아웃 확인
- 스토리북 또는 향후 시각 테스트용 fixture 후보
- 실데이터가 없을 때 디자인 시안을 보여주기 위한 샘플

`dashboard-demo-metrics.ts`는 아래 용도로 사용하지 않는다.

- 실서비스 관리자 집계
- 실제 의뢰인 사건 집계
- 실제 변호사 검토 queue 산정
- 실제 권한 판단
- 실제 사건 상태 판단
- 실제 운영 확인 후보 산정
- 실제 장기 미진행 후보 산정
- 실제 알림 또는 에스컬레이션 기준

## 3. 파일 역할 분리

대상 파일:

- `src/lib/dashboard/dashboard-metrics.ts`
- `src/lib/dashboard/dashboard-demo-metrics.ts`

역할 기준:

| 파일 | 역할 | 실서비스 사용 |
| --- | --- | --- |
| `dashboard-metrics.ts` | 역할별 실데이터 dashboard metric 조회 | 가능 |
| `dashboard-demo-metrics.ts` | 데모 / 샘플 / UI preview용 fixture | 실서비스 집계 금지 |

점검 항목:

- [ ] 실서비스 `/dashboard`는 `dashboard-metrics.ts`의 실데이터 흐름을 사용한다.
- [ ] 실서비스 `/lawyer`는 `dashboard-metrics.ts`의 실데이터 흐름을 사용한다.
- [ ] 실서비스 `/admin`은 `dashboard-metrics.ts`의 실데이터 흐름을 사용한다.
- [ ] `dashboard-demo-metrics.ts`는 실서비스 집계 기준으로 사용되지 않는다.
- [ ] `dashboard-demo-metrics.ts`는 삭제하지 않는다.
- [ ] demo metrics는 권한, 상태값, 집계 기준의 canonical source가 아니다.

## 4. 데모 경로 안전 기준

데모 경로 또는 preview 경로가 있다면 아래 기준을 따른다.

- 데모 경로는 실제 DB 조회를 하지 않아도 된다.
- 데모 경로는 실제 사용자의 사건 데이터를 보여주지 않는다.
- 데모 경로는 실제 권한 판단의 기준이 아니다.
- 데모 경로는 실제 운영 확인 후보를 만들지 않는다.
- 데모 경로는 실제 장기 미진행 후보를 만들지 않는다.
- 데모 경로는 실제 알림·에스컬레이션과 연결하지 않는다.
- 데모 경로는 운영자가 실서비스 지표로 오해하지 않도록 문구 또는 파일명으로 분리한다.

권장 표현:

- 데모 데이터
- 샘플 데이터
- 미리보기
- UI preview
- fixture

피해야 할 표현:

- 실제 운영 지표
- 실시간 운영 지표
- 확정 집계
- 운영 사고
- 장애
- P0
- P1

## 5. 역할별 demo metrics 점검

### 5.1 의뢰인 demo metrics

점검 항목:

- [ ] 의뢰인 demo 데이터는 실제 사건 데이터처럼 오해되지 않는다.
- [ ] readinessLabel은 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] readinessPercent 숫자가 실서비스 판단값처럼 강조되지 않는다.
- [ ] 승소 가능성, 패소 가능성, 법률 위험도 표현을 포함하지 않는다.

### 5.2 변호사 demo metrics

점검 항목:

- [ ] 변호사 demo 데이터는 실제 검토 queue처럼 오해되지 않는다.
- [ ] priorityLabel은 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] priorityScore 숫자가 사용자 노출 문구로 강조되지 않는다.
- [ ] 위험 사건, 법률 사고, 긴급 위험 표현을 포함하지 않는다.

### 5.3 관리자 demo metrics

점검 항목:

- [ ] 관리자 demo 데이터는 실제 운영 확인 후보처럼 오해되지 않는다.
- [ ] attentionNeeded는 실제 운영 집계로 사용되지 않는다.
- [ ] staleCaseCount는 실제 장기 미진행 집계로 사용되지 않는다.
- [ ] 장기 미진행 문구는 3.8 스냅샷 기준과 충돌하지 않는다.
- [ ] 장애, 치명, P0, P1, 위험 폭증 표현을 포함하지 않는다.

## 6. 실서비스 경로 import 점검

아래 검색으로 실서비스 경로에서 `dashboard-demo-metrics`가 import되는지 확인한다.

```bash
grep -R "dashboard-demo-metrics" -n src/app src/components src/lib
```

판정 기준:

- `/dashboard`, `/lawyer`, `/admin` 실서비스 route에서 demo metrics를 직접 import하지 않는다.
- demo 또는 preview 전용 경로에서만 import된다.
- 테스트 / fixture / 문서용 import는 별도 메모로 분리한다.
- 실서비스 metric 함수가 demo metrics를 fallback으로 사용하지 않는다.

## 7. 실데이터 metric 기준 유지

대상 파일:

- `src/lib/dashboard/dashboard-metrics.ts`

점검 항목:

- [ ] 의뢰인 dashboard metric은 실데이터 기준을 유지한다.
- [ ] 변호사 dashboard metric은 실데이터 기준을 유지한다.
- [ ] 관리자 dashboard metric은 실데이터 기준을 유지한다.
- [ ] attentionNeeded 기준은 기존 HOLD + INTAKE_PENDING으로 유지된다.
- [ ] staleCaseCount 기준은 HOLD / INTAKE_PENDING / REVIEW_PENDING 중 7일 이상 미변경 사건으로 유지된다.
- [ ] staleCaseCount는 attentionNeeded에 합산되지 않는다.
- [ ] 신규 API route를 만들지 않는다.
- [ ] DB schema를 변경하지 않는다.
- [ ] CaseStatus canonical을 변경하지 않는다.

## 8. 금지 표현 검색

아래 표현은 dashboard demo / 실서비스 사용자 노출 문구에 신규 삽입하지 않는다.

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

실서비스 경로 import 점검:

```bash
grep -R "dashboard-demo-metrics" -n src/app src/components src/lib
```

Windows PowerShell에서는 아래 명령을 사용할 수 있다.

```powershell
Get-ChildItem -Path src\app,src\components,src\lib -Recurse -Include *.ts,*.tsx -File |
  Select-String -Pattern "dashboard-demo-metrics"
```

## 10. 완료 판정

아래가 모두 충족되면 대시보드 3.10을 완료로 본다.

- `DASHBOARD_3_10_DEMO_METRICS_SAFETY_CHECK.md` 신규 추가 완료
- `dashboard-demo-metrics.ts` 유지 기준 정리 완료
- demo metrics와 실서비스 metrics의 역할 분리 기준 정리 완료
- 데모 경로 안전 기준 정리 완료
- 실서비스 경로 import 점검 기준 정리 완료
- 금지 표현 검색 기준 정리 완료
- 배포 전 QA 확정표와 별도 문서임을 유지
- 신규 API / DB schema / 권한 / 상태값 변경 없음 확인
- `DashboardPreviewCard` 구조 변경 없음 확인
- attentionNeeded 기준 변경 없음 확인
- staleCaseCount 기준 변경 없음 확인
- `dashboard-demo-metrics.ts` 삭제 없음 확인
- `npx tsc --noEmit` 통과
- `npm run lint` 통과
- `npm run verify:canonical-sources` 통과
- 내비게이터 수정 시 `py -3 -m py_compile tools/aibeopchin_navigator.py` 통과

## 11. 다음 후보

3.10 이후 다음 후보는 아래 중 하나다.

- 대시보드 3.11 — 대시보드 3.x 최종 봉인 요약표
- 배포 전 QA 회신 수신 후 [#evidence-20260428-predeploy-qa-closure](./IMPLEMENTATION_EVIDENCE.md#evidence-20260428-predeploy-qa-closure) 확정 기록

팀 회신 전까지 `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표와 회신 원문 줄은 미기입 유지한다.

---

3.10까지 닫으면 대시보드 3.x는 실데이터 연결, 역할별 badge, 관리자 운영 문구, 회귀 체크리스트, 역할별 문구 스냅샷, demo metrics 안전 경계까지 정리된다.
