# 대시보드 4.4 — 배포 전 운영자 최종 체크리스트

## 0. 기준 문서

- `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md`
  - §12: 대시보드 3.x 최종 확인 순서
  - §13: 대시보드 3.x 봉인 이후 진행 기준
- `docs/project-governance/DASHBOARD_4_0_PREDEPLOY_OPERATION_CHECK_PHASE.md`
- `docs/project-governance/DASHBOARD_4_1_ROLE_ACCESS_PERMISSION_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_4_2_PREDEPLOY_MANUAL_QA_SCENARIOS.md`
- `docs/project-governance/DASHBOARD_4_3_EMPTY_ERROR_STATE_MANUAL_CHECKLIST.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260426-391`
  - `#evidence-20260426-392`
  - `#evidence-20260426-393`
  - `#evidence-20260426-394`
  - `#evidence-20260426-395`
  - `#evidence-20260426-396` (본 문서)
- `tools/aibeopchin_navigator.py`
  - `dashboard_3_11_final_seal_summary`
  - `dashboard_4_0_predeploy_operation_check_phase`
  - `dashboard_4_1_role_access_permission_checklist`
  - `dashboard_4_2_predeploy_manual_qa_scenarios`
  - `dashboard_4_3_empty_error_state_manual_checklist`
  - `dashboard_4_4_predeploy_operator_final_checklist` (본 문서)

## 1. 문서 목적

이 문서는 대시보드 배포 전 운영자가 마지막으로 확인할 최종 체크리스트다.

대시보드 4.4는 신규 기능 개발이 아니다.  
대시보드 4.4는 4.0~4.3에서 분리한 운영 점검, 접근 / 권한 점검, 수동 QA 시나리오, 빈 상태 / 오류 상태 점검을 배포 직전 확인 가능한 한 장짜리 운영자 체크리스트로 묶는 문서다.

## 2. 3.x 봉인 유지 원칙

대시보드 3.x는 아래 기준으로 봉인 상태를 유지한다.

- `DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md` §12~13을 최종 기준으로 본다.
- `#evidence-20260426-391`을 대시보드 3.x 최종 봉인 증빙으로 본다.
- 대시보드 3.x 기능 확장을 하지 않는다.
- 3.x에서 닫은 metric, badge, 문구, demo metrics 경계를 재오픈하지 않는다.
- 이후 기능성 변경은 별도 4.x Phase 또는 별도 evidence로 분리한다.

## 3. QA closure 미기입 유지

아래 항목은 QA 팀 회신 전까지 작성하지 않는다.

- `#evidence-20260428-predeploy-qa-closure`의 확정 기록 표
- QA 팀 회신 원문 줄
- QA 최종 통과 판정
- 배포 가능 최종 판정

QA 회신 수신 후에만 실제 회신 내용 기준으로 작성한다.

## 4. 운영자 최종 확인 순서

운영자는 배포 전 아래 순서로 확인한다.

1. 대시보드 3.x 봉인 상태 확인
2. 4.0 배포 전 운영 점검 Phase 문서 확인
3. 4.1 역할별 접근 / 권한 점검표 확인
4. 4.2 배포 전 수동 QA 시나리오표 확인
5. 4.3 빈 상태 / 오류 상태 수동 점검표 확인
6. 증빙 번호와 내비게이터 연결 확인
7. QA closure 미기입 유지 확인
8. 최종 배포 판단은 QA 회신 이후로 보류

## 5. 결과 기록 기준

각 항목은 아래 기준으로 기록한다.

| 결과 | 의미 |
| --- | --- |
| PASS | 기대 결과와 실제 결과가 일치 |
| FAIL | 기대 결과와 실제 결과가 다름 |
| N/A | 해당 환경에서 수행 불가 또는 대상 데이터 없음 |
| BLOCKED | 선행 조건 미충족으로 수행 불가 |

기록 시 아래 항목을 남긴다.

- 수행 일시
- 수행자
- 테스트 환경
- 확인 문서
- 실제 결과
- PASS / FAIL / N/A / BLOCKED
- 메모
- 필요 시 스크린샷 위치

## 6. 최종 체크리스트 — 3.x 봉인 상태

| ID | 점검 항목 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- |
| OP-3X-01 | `DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md` §12~13 확인 | 3.x 최종 확인 순서와 이후 진행 기준이 유지된다. |  |  |
| OP-3X-02 | `#evidence-20260426-391` 확인 | 3.11 최종 봉인 증빙이 유지된다. |  |  |
| OP-3X-03 | `tools/aibeopchin_navigator.py` 확인 | `dashboard_3_11_final_seal_summary`와 show-plan 3.11 절이 유지된다. |  |  |
| OP-3X-04 | 3.x 기능 확장 여부 확인 | 3.x 범위의 신규 기능 확장이 없다. |  |  |
| OP-3X-05 | demo metrics 경계 확인 | `dashboard-demo-metrics.ts`는 삭제되지 않고 실서비스 metric 기준으로 사용되지 않는다. |  |  |

## 7. 최종 체크리스트 — 접근 / 권한

| ID | 점검 항목 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- |
| OP-ACC-01 | 의뢰인 `/dashboard` 접근 | 의뢰인 대시보드가 정상 표시된다. |  |  |
| OP-ACC-02 | 변호사 `/lawyer` 접근 | 변호사 대시보드가 정상 표시된다. |  |  |
| OP-ACC-03 | 관리자 `/admin` 접근 | 관리자 대시보드가 정상 표시된다. |  |  |
| OP-ACC-04 | 비로그인 보호 경로 접근 | 로그인 또는 제한 안내 흐름으로 처리되고 실데이터가 노출되지 않는다. |  |  |
| OP-ACC-05 | 권한 불일치 경로 접근 | restricted 안내 흐름으로 처리되고 실제 데이터가 노출되지 않는다. |  |  |
| OP-ACC-06 | restricted 안내 문구 확인 | 장애, 치명, P0, P1, 운영 사고 표현이 표시되지 않는다. |  |  |

## 8. 최종 체크리스트 — 역할별 화면 표시

| ID | 점검 항목 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- |
| OP-VIEW-01 | 의뢰인 최근 사건 preview | 최대 5건 기준과 정리도 badge 기준이 유지된다. |  |  |
| OP-VIEW-02 | 변호사 검토 queue preview | 최대 5건 기준과 검토 우선순위 badge 기준이 유지된다. |  |  |
| OP-VIEW-03 | 관리자 운영 확인 후보 preview | 최대 5건 기준과 장기 미진행 후보 기준이 유지된다. |  |  |
| OP-VIEW-04 | 관리자 `attentionNeeded` | 기존 `HOLD + INTAKE_PENDING` 기준이 유지된다. |  |  |
| OP-VIEW-05 | 관리자 `staleCaseCount` | `attentionNeeded`에 합산되지 않고 보조 지표로만 표시된다. |  |  |
| OP-VIEW-06 | `DashboardPreviewCard` | 구조 변경 없이 기존 역할별 표시가 유지된다. |  |  |

## 9. 최종 체크리스트 — 빈 상태 / 오류 상태

| ID | 점검 항목 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- |
| OP-EMPTY-01 | 의뢰인 사건 없음 | 빈 상태 문구가 자연스럽게 표시되고 오류처럼 보이지 않는다. |  |  |
| OP-EMPTY-02 | 변호사 검토 queue 없음 | 빈 상태 문구가 자연스럽게 표시되고 오류처럼 보이지 않는다. |  |  |
| OP-EMPTY-03 | 관리자 운영 확인 후보 없음 | “현재 운영 확인 후보는 없습니다.” 기준 문구가 표시된다. |  |  |
| OP-EMPTY-04 | 관리자 장기 미진행 후보 없음 | “장기 미진행 후보도 현재 확인되지 않았습니다.” 기준 문구가 표시된다. |  |  |
| OP-ERR-01 | 로딩 상태 | 로딩 중 화면이 깨지지 않고 과장된 오류처럼 보이지 않는다. |  |  |
| OP-ERR-02 | 오류 상태 | 실제 데이터가 노출되지 않고 기존 오류 안내 흐름이 유지된다. |  |  |

## 10. 최종 체크리스트 — 문구 / 금지 표현

| ID | 점검 항목 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- |
| OP-COPY-01 | 의뢰인 문구 | 승소 가능성, 패소 가능성, 법률 위험도 표현이 없다. |  |  |
| OP-COPY-02 | 변호사 문구 | 위험 사건, 법률 사고, 긴급 위험 표현이 없다. |  |  |
| OP-COPY-03 | 관리자 문구 | 장애, 치명, P0, P1, 위험 폭증 표현이 없다. |  |  |
| OP-COPY-04 | restricted 문구 | 운영 사고, 장애, 치명 표현이 없다. |  |  |
| OP-COPY-05 | 오류 / 로딩 문구 | 장애, 치명, P0, P1 표현을 사용하지 않는다. |  |  |

## 11. 최종 체크리스트 — 증빙 / 내비게이터

| ID | 점검 항목 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- |
| OP-EVD-01 | `#evidence-20260426-392` | 4.0 착수 문서 증빙이 유지된다. |  |  |
| OP-EVD-02 | `#evidence-20260426-393` | 4.1 접근 / 권한 점검표 증빙이 유지된다. |  |  |
| OP-EVD-03 | `#evidence-20260426-394` | 4.2 수동 QA 시나리오 증빙이 유지된다. |  |  |
| OP-EVD-04 | `#evidence-20260426-395` | 4.3 빈 상태 / 오류 상태 점검표 증빙이 유지된다. |  |  |
| OP-EVD-05 | `tools/aibeopchin_navigator.py` | 4.0~4.4 show-plan 절과 `PROJECT_PLAN` 키가 유지된다. |  |  |
| OP-EVD-06 | `#evidence-20260428-predeploy-qa-closure` | QA 회신 전까지 확정 기록 표와 회신 원문 줄이 비어 있다. |  |  |

## 12. 최종 체크리스트 — 배포 판단 보류

| ID | 점검 항목 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- |
| OP-HOLD-01 | QA 회신 수신 여부 | 팀 회신 전이면 최종 배포 가능 판정을 하지 않는다. |  |  |
| OP-HOLD-02 | QA closure 작성 여부 | 팀 회신 전이면 `#evidence-20260428-predeploy-qa-closure`를 작성하지 않는다. |  |  |
| OP-HOLD-03 | 신규 Phase 필요 여부 | 신규 기능성 작업은 3.x 재오픈이 아니라 별도 4.x 또는 별도 Phase로 분리한다. |  |  |
| OP-HOLD-04 | 운영자 메모 | 미확정 항목은 FAIL이 아니라 BLOCKED 또는 N/A로 분리한다. |  |  |

## 13. 금지 표현 검색

아래 표현은 배포 전 운영자 최종 확인 대상 사용자 노출 문구에 신규 삽입하지 않는다.

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

검색 명령 (Git Bash·WSL·macOS/Linux 등):

```bash
grep -R "승소 가능성" -n src/components/dashboard src/lib/dashboard src/app
grep -R "패소 가능성" -n src/components/dashboard src/lib/dashboard src/app
grep -R "법률 위험도" -n src/components/dashboard src/lib/dashboard src/app
grep -R "위험 폭증" -n src/components/dashboard src/lib/dashboard src/app
grep -R "장애" -n src/components/dashboard src/lib/dashboard src/app
grep -R "치명" -n src/components/dashboard src/lib/dashboard src/app
grep -R "P0" -n src/components/dashboard src/lib/dashboard src/app
grep -R "P1" -n src/components/dashboard src/lib/dashboard src/app
grep -R "운영 사고" -n src/components/dashboard src/lib/dashboard src/app
grep -R "에스컬레이션" -n src/components/dashboard src/lib/dashboard src/app
grep -R "긴급 위험" -n src/components/dashboard src/lib/dashboard src/app
```

Windows PowerShell 예시:

```powershell
Get-ChildItem -Path src\app,src\components,src\lib -Recurse -Include *.ts,*.tsx -File |
  Select-String -Pattern "승소 가능성|패소 가능성|법률 위험도|위험 폭증|장애|치명|P0|P1|운영 사고|에스컬레이션|긴급 위험"
```

## 14. 운영자 최종 결과 요약표

| 구분 | 총 항목 | PASS | FAIL | N/A | BLOCKED | 메모 |
| --- | ---: | --- | --- | --- | --- | --- |
| 3.x 봉인 상태 | 5 |  |  |  |  |  |
| 접근 / 권한 | 6 |  |  |  |  |  |
| 역할별 화면 표시 | 6 |  |  |  |  |  |
| 빈 상태 / 오류 상태 | 6 |  |  |  |  |  |
| 문구 / 금지 표현 | 5 |  |  |  |  |  |
| 증빙 / 내비게이터 | 6 |  |  |  |  |  |
| 배포 판단 보류 | 4 |  |  |  |  |  |

## 15. 검증 명령

문서 중심 작업이므로 기존 기준선 확인을 유지한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

## 16. 완료 판정

아래가 충족되면 대시보드 4.4를 완료로 본다.

- `DASHBOARD_4_4_PREDEPLOY_OPERATOR_FINAL_CHECKLIST.md` 신규 추가
- 3.x 봉인 상태 최종 체크리스트 작성 완료
- 접근 / 권한 최종 체크리스트 작성 완료
- 역할별 화면 표시 최종 체크리스트 작성 완료
- 빈 상태 / 오류 상태 최종 체크리스트 작성 완료
- 문구 / 금지 표현 최종 체크리스트 작성 완료
- 증빙 / 내비게이터 최종 체크리스트 작성 완료
- 배포 판단 보류 기준 작성 완료
- 운영자 최종 결과 요약표 작성 완료
- 3.x 봉인 유지 기준 명시
- QA closure 미기입 유지 기준 명시
- 신규 API / DB / 코드 기능 변경 없음
- 오류 처리 로직 변경 없음
- `#evidence-20260428-predeploy-qa-closure` 미기입 유지
- 검증 명령 통과

## 17. 다음 후보

4.4 이후 다음 후보는 아래 중 하나다.

- 대시보드 4.5 — QA 회신 수신 후 closure 반영 준비표
- QA 팀 회신 수신 후 `#evidence-20260428-predeploy-qa-closure` 확정 기록
- 별도 4.x 또는 별도 Phase로 분리한 신규 작업
