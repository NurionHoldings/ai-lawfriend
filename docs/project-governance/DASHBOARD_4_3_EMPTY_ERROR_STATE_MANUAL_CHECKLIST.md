# 대시보드 4.3 — 빈 상태 / 오류 상태 수동 점검표

## 0. 기준 문서

- `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md`
  - §12: 대시보드 3.x 최종 확인 순서
  - §13: 대시보드 3.x 봉인 이후 진행 기준
- `docs/project-governance/DASHBOARD_4_0_PREDEPLOY_OPERATION_CHECK_PHASE.md`
- `docs/project-governance/DASHBOARD_4_1_ROLE_ACCESS_PERMISSION_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_4_2_PREDEPLOY_MANUAL_QA_SCENARIOS.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260426-391`
  - `#evidence-20260426-392`
  - `#evidence-20260426-393`
  - `#evidence-20260426-394`
- `tools/aibeopchin_navigator.py`
  - `dashboard_3_11_final_seal_summary`
  - `dashboard_4_0_predeploy_operation_check_phase`
  - `dashboard_4_1_role_access_permission_checklist`
  - `dashboard_4_2_predeploy_manual_qa_scenarios`

## 1. 문서 목적

이 문서는 배포 전 수동 QA 중 빈 상태, 오류 상태, 권한 제한 상태, 데이터 없음 상태를 별도로 확인하기 위한 점검표다.

대시보드 4.3은 신규 기능 개발이 아니다.  
대시보드 4.3은 실제 브라우저에서 빈 데이터, 제한 안내, 오류 안내, 로딩 실패 상태를 확인하기 위한 수동 점검 기준 문서다.

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

## 4. 점검 대상 상태

이번 문서에서 점검하는 상태는 아래와 같다.

| 구분 | 설명 | 대표 상황 |
| --- | --- | --- |
| 빈 상태 | 데이터가 없지만 정상 화면이 표시되는 상태 | 사건 없음, 검토 queue 없음, 운영 확인 후보 없음 |
| 제한 상태 | 권한 또는 로그인 상태가 맞지 않아 접근이 제한되는 상태 | 비로그인 접근, 권한 불일치 접근 |
| 로딩 상태 | 데이터를 불러오는 중인 상태 | 화면 진입 직후, 새로고침 직후 |
| 오류 상태 | 데이터 조회 또는 렌더링 중 문제가 발생한 상태 | 네트워크 실패, 서버 응답 실패, 예외 발생 |
| 데이터 없음 상태 | 조회는 성공했지만 표시할 데이터가 없는 상태 | 빈 배열, count 0, preview 0건 |

## 5. 결과 기록 기준

각 점검 항목은 아래 기준으로 기록한다.

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
- 계정 역할
- 접근 경로
- 상태 유형
- 실제 결과
- PASS / FAIL / N/A / BLOCKED
- 메모
- 필요 시 스크린샷 위치

## 6. 의뢰인 대시보드 빈 상태 점검표

대상 경로:

- `/dashboard`

| ID | 상태 | 선행 조건 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- |
| E-CLI-01 | 사건 없음 | 의뢰인 계정에 등록 사건 없음 | `/dashboard` 접속 | 빈 상태 문구가 자연스럽게 표시된다. |  |  |
| E-CLI-02 | 최근 사건 없음 | 최근 사건 preview 대상 없음 | 최근 사건 영역 확인 | 빈 영역이 깨지지 않고 안내 문구가 표시된다. |  |  |
| E-CLI-03 | badge 없음 | 정리도 badge 대상 사건 없음 | 최근 사건 영역 확인 | badge가 없어도 카드 레이아웃이 깨지지 않는다. |  |  |
| E-CLI-04 | 데이터 없음 | count 또는 preview가 0 | 화면 전체 확인 | 0건 상태가 오류처럼 보이지 않는다. |  |  |
| E-CLI-05 | 문구 확인 | 의뢰인 빈 상태 표시 | 문구 확인 | 승소 가능성, 패소 가능성, 법률 위험도 표현이 표시되지 않는다. |  |  |

## 7. 변호사 대시보드 빈 상태 점검표

대상 경로:

- `/lawyer`

| ID | 상태 | 선행 조건 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- |
| E-LAW-01 | 검토 queue 없음 | 변호사 계정에 검토 대상 없음 | `/lawyer` 접속 | 검토할 사건이 없다는 빈 상태가 자연스럽게 표시된다. |  |  |
| E-LAW-02 | preview 없음 | queue preview 0건 | 검토 queue 영역 확인 | preview 영역이 깨지지 않고 안내 문구가 표시된다. |  |  |
| E-LAW-03 | badge 없음 | priorityLabel 표시 대상 없음 | 카드 영역 확인 | badge가 없어도 카드 레이아웃이 깨지지 않는다. |  |  |
| E-LAW-04 | 데이터 없음 | count 또는 preview가 0 | 화면 전체 확인 | 0건 상태가 오류처럼 보이지 않는다. |  |  |
| E-LAW-05 | 문구 확인 | 변호사 빈 상태 표시 | 문구 확인 | 위험 사건, 법률 사고, 긴급 위험 표현이 표시되지 않는다. |  |  |

## 8. 관리자 대시보드 빈 상태 점검표

대상 경로:

- `/admin`

| ID | 상태 | 선행 조건 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- |
| E-ADM-01 | 운영 확인 후보 없음 | attentionPreview 0건 | `/admin` 접속 | “현재 운영 확인 후보는 없습니다.” 기준 문구가 표시된다. |  |  |
| E-ADM-02 | 보조 문구 확인 | attentionPreview 0건 | 운영 확인 영역 확인 | “보류, 접수 대기, 검토 대기 상태의 사건이 확인되면 이 영역에 표시됩니다.” 기준 문구가 표시된다. |  |  |
| E-ADM-03 | 장기 미진행 후보 없음 | staleCaseCount 0 | 장기 미진행 보조 문구 확인 | “장기 미진행 후보도 현재 확인되지 않았습니다.” 기준 문구가 표시된다. |  |  |
| E-ADM-04 | 운영 count 0 | attentionNeeded 0 | 관리자 지표 영역 확인 | 0건 상태가 오류처럼 보이지 않는다. |  |  |
| E-ADM-05 | stale count 0 | staleCaseCount 0 | 관리자 지표 영역 확인 | 0건 상태가 attentionNeeded와 혼동되지 않는다. |  |  |
| E-ADM-06 | 문구 확인 | 관리자 빈 상태 표시 | 문구 확인 | 장애, 치명, P0, P1, 위험 폭증 표현이 표시되지 않는다. |  |  |

## 9. restricted / 권한 제한 상태 점검표

대상:

- 권한 불일치 접근
- 비로그인 접근
- restricted 안내 화면

| ID | 상태 | 선행 조건 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- |
| E-RES-01 | 비로그인 제한 | 로그아웃 상태 | `/dashboard` 직접 접근 | 로그인 또는 제한 안내 흐름으로 처리된다. 실데이터가 노출되지 않는다. |  |  |
| E-RES-02 | 비로그인 제한 | 로그아웃 상태 | `/lawyer` 직접 접근 | 로그인 또는 제한 안내 흐름으로 처리된다. 실데이터가 노출되지 않는다. |  |  |
| E-RES-03 | 비로그인 제한 | 로그아웃 상태 | `/admin` 직접 접근 | 로그인 또는 제한 안내 흐름으로 처리된다. 실데이터가 노출되지 않는다. |  |  |
| E-RES-04 | 의뢰인 제한 | 의뢰인 로그인 | `/admin` 직접 접근 | restricted 안내가 표시되고 관리자 지표가 노출되지 않는다. |  |  |
| E-RES-05 | 변호사 제한 | 변호사 로그인 | `/admin` 직접 접근 | restricted 안내가 표시되고 관리자 지표가 노출되지 않는다. |  |  |
| E-RES-06 | 제한 문구 | restricted 화면 표시 | 문구 확인 | 장애, 치명, P0, P1, 운영 사고 표현이 표시되지 않는다. |  |  |
| E-RES-07 | 이동 경로 | restricted 화면 표시 | 돌아가기 또는 홈 이동 확인 | 사용자가 다음 행동을 이해할 수 있는 경로가 제공된다. |  |  |

## 10. 로딩 상태 점검표

대상:

- `/dashboard`
- `/lawyer`
- `/admin`

| ID | 상태 | 선행 조건 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- |
| E-LOAD-01 | 초기 로딩 | 정상 네트워크 | `/dashboard` 새로고침 | 로딩 중 화면이 깨지지 않는다. |  |  |
| E-LOAD-02 | 초기 로딩 | 정상 네트워크 | `/lawyer` 새로고침 | 로딩 중 화면이 깨지지 않는다. |  |  |
| E-LOAD-03 | 초기 로딩 | 정상 네트워크 | `/admin` 새로고침 | 로딩 중 화면이 깨지지 않는다. |  |  |
| E-LOAD-04 | 느린 응답 | 브라우저 네트워크 throttling | 각 대시보드 새로고침 | 로딩 상태가 과장된 오류처럼 보이지 않는다. |  |  |
| E-LOAD-05 | 문구 확인 | 로딩 문구 표시 | 문구 확인 | 장애, 치명, P0, P1 표현을 사용하지 않는다. |  |  |

## 11. 오류 상태 점검표

주의: 이번 문서는 오류 처리 로직을 새로 만들지 않는다.  
이미 존재하는 오류 안내 또는 실패 상태가 있을 경우, 사용자 노출 문구와 데이터 노출 여부만 확인한다.

| ID | 상태 | 선행 조건 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- |
| E-ERR-01 | 데이터 조회 실패 | 네트워크 실패 또는 API 실패 유도 가능 | `/dashboard` 확인 | 실제 데이터가 노출되지 않고 기존 오류 안내 흐름이 표시된다. |  |  |
| E-ERR-02 | 데이터 조회 실패 | 네트워크 실패 또는 API 실패 유도 가능 | `/lawyer` 확인 | 실제 데이터가 노출되지 않고 기존 오류 안내 흐름이 표시된다. |  |  |
| E-ERR-03 | 데이터 조회 실패 | 네트워크 실패 또는 API 실패 유도 가능 | `/admin` 확인 | 실제 데이터가 노출되지 않고 기존 오류 안내 흐름이 표시된다. |  |  |
| E-ERR-04 | 오류 문구 | 오류 안내 표시 | 문구 확인 | 장애, 치명, P0, P1, 운영 사고 표현을 사용하지 않는다. |  |  |
| E-ERR-05 | 권한 오류 | 권한 불일치 접근 | 오류 또는 제한 안내 확인 | 실제 사건 데이터나 운영 지표가 노출되지 않는다. |  |  |

## 12. demo metrics 경계 상태 점검표

| ID | 상태 | 선행 조건 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- |
| E-DEMO-01 | 빈 상태 | 실서비스 경로 데이터 없음 | `/dashboard` 확인 | demo metrics가 실제 의뢰인 데이터처럼 fallback 표시되지 않는다. |  |  |
| E-DEMO-02 | 빈 상태 | 실서비스 경로 데이터 없음 | `/lawyer` 확인 | demo metrics가 실제 변호사 queue처럼 fallback 표시되지 않는다. |  |  |
| E-DEMO-03 | 빈 상태 | 실서비스 경로 데이터 없음 | `/admin` 확인 | demo metrics가 실제 관리자 운영 지표처럼 fallback 표시되지 않는다. |  |  |
| E-DEMO-04 | import 점검 | 코드 검색 가능 | `dashboard-demo-metrics` 검색 | 실서비스 경로에서 운영 metric 기준으로 import되지 않는다. |  |  |

## 13. 금지 표현 검색

아래 표현은 빈 상태, 오류 상태, 권한 제한 상태, 로딩 상태의 사용자 노출 문구에 신규 삽입하지 않는다.

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

## 14. 수동 점검 결과 요약표

| 구분 | 총 항목 | PASS | FAIL | N/A | BLOCKED | 메모 |
| --- | ---: | --- | --- | --- | --- | --- |
| 의뢰인 빈 상태 | 5 |  |  |  |  |  |
| 변호사 빈 상태 | 5 |  |  |  |  |  |
| 관리자 빈 상태 | 6 |  |  |  |  |  |
| restricted / 권한 제한 | 7 |  |  |  |  |  |
| 로딩 상태 | 5 |  |  |  |  |  |
| 오류 상태 | 5 |  |  |  |  |  |
| demo metrics 경계 | 4 |  |  |  |  |  |

## 15. 검증 명령

문서 중심 작업이므로 기존 기준선 확인을 유지한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

## 16. 완료 판정

아래가 충족되면 대시보드 4.3을 완료로 본다.

- `DASHBOARD_4_3_EMPTY_ERROR_STATE_MANUAL_CHECKLIST.md` 신규 추가
- 의뢰인 빈 상태 점검표 작성 완료
- 변호사 빈 상태 점검표 작성 완료
- 관리자 빈 상태 점검표 작성 완료
- restricted / 권한 제한 상태 점검표 작성 완료
- 로딩 상태 점검표 작성 완료
- 오류 상태 점검표 작성 완료
- demo metrics 경계 상태 점검표 작성 완료
- 금지 표현 검색 기준 작성 완료
- 수동 점검 결과 요약표 작성 완료
- 3.x 봉인 유지 기준 명시
- QA closure 미기입 유지 기준 명시
- 신규 API / DB / 코드 기능 변경 없음
- 오류 처리 로직 변경 없음
- `#evidence-20260428-predeploy-qa-closure` 미기입 유지
- 검증 명령 통과

## 17. 다음 후보

4.3 이후 다음 후보는 아래 중 하나다.

- 대시보드 4.4 — 배포 전 운영자 최종 체크리스트
- 대시보드 4.5 — QA 회신 수신 후 closure 반영 준비표
- QA 팀 회신 수신 후 `#evidence-20260428-predeploy-qa-closure` 확정 기록
