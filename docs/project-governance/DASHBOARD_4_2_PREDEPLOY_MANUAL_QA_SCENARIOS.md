# 대시보드 4.2 — 배포 전 수동 QA 시나리오표

## 0. 기준 문서

- `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md`
  - §12: 대시보드 3.x 최종 확인 순서
  - §13: 대시보드 3.x 봉인 이후 진행 기준
- `docs/project-governance/DASHBOARD_4_0_PREDEPLOY_OPERATION_CHECK_PHASE.md`
- `docs/project-governance/DASHBOARD_4_1_ROLE_ACCESS_PERMISSION_CHECKLIST.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260426-391`
  - `#evidence-20260426-392`
  - `#evidence-20260426-393`
- `tools/aibeopchin_navigator.py`
  - `dashboard_3_11_final_seal_summary`
  - `dashboard_4_0_predeploy_operation_check_phase`
  - `dashboard_4_1_role_access_permission_checklist`

## 1. 문서 목적

이 문서는 배포 전 수동 QA 담당자가 브라우저에서 직접 따라 할 수 있는 대시보드 점검 시나리오를 고정하기 위한 문서다.

대시보드 4.2는 신규 기능 개발이 아니다.  
대시보드 4.2는 역할별 접근, 권한, 화면 표시, badge, 빈 상태, restricted 안내 흐름을 실제 사용자 관점에서 확인하기 위한 수동 QA 절차표다.

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

## 4. 수동 QA 준비 기준

QA 담당자는 아래 준비 상태를 확인한 뒤 시나리오를 수행한다.

- [ ] 로컬 또는 스테이징 서버 접속 가능
- [ ] 의뢰인 테스트 계정 준비
- [ ] 변호사 테스트 계정 준비
- [ ] 관리자 테스트 계정 준비
- [ ] 비로그인 브라우저 세션 또는 시크릿 창 준비
- [ ] 권한 불일치 접근 테스트가 가능한 계정 준비
- [ ] 테스트 중 실제 운영 데이터가 노출되지 않도록 환경 확인
- [ ] 결과 기록용 PASS / FAIL / 메모 표 준비

## 5. 결과 기록 기준

각 시나리오는 아래 기준으로 기록한다.

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
- 실제 결과
- PASS / FAIL / N/A / BLOCKED
- 메모
- 필요 시 스크린샷 위치

## 6. 공통 수동 QA 시나리오

| ID | 역할 | 선행 조건 | 경로 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-COM-01 | 비로그인 | 로그아웃 상태 | `/dashboard` | 직접 URL 접근 | 로그인 또는 제한 안내 흐름으로 처리된다. 실데이터가 노출되지 않는다. |  |  |
| D-COM-02 | 비로그인 | 로그아웃 상태 | `/lawyer` | 직접 URL 접근 | 로그인 또는 제한 안내 흐름으로 처리된다. 실데이터가 노출되지 않는다. |  |  |
| D-COM-03 | 비로그인 | 로그아웃 상태 | `/admin` | 직접 URL 접근 | 로그인 또는 제한 안내 흐름으로 처리된다. 실데이터가 노출되지 않는다. |  |  |
| D-COM-04 | 로그인 | 권한 불일치 계정 | 역할과 맞지 않는 경로 | 직접 URL 접근 | restricted 안내 흐름으로 처리된다. 실제 데이터가 노출되지 않는다. |  |  |
| D-COM-05 | 로그인 | 각 역할 계정 | 각 역할 대시보드 | 새로고침 | 새로고침 후에도 화면이 정상 렌더링된다. |  |  |
| D-COM-06 | 로그인 | 각 역할 계정 | 각 역할 대시보드 | 모바일 폭 또는 좁은 화면 확인 | 주요 카드가 겹치지 않고 읽을 수 있다. |  |  |

## 7. 의뢰인 대시보드 수동 QA 시나리오

대상 경로:

- `/dashboard`

| ID | 역할 | 선행 조건 | 경로 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-CLI-01 | 의뢰인 | 의뢰인 계정 로그인 | `/dashboard` | 대시보드 진입 | 의뢰인 대시보드가 정상 렌더링된다. |  |  |
| D-CLI-02 | 의뢰인 | 최근 사건 있음 | `/dashboard` | 최근 사건 preview 확인 | 최근 사건이 최대 5건 기준으로 표시된다. |  |  |
| D-CLI-03 | 의뢰인 | 최근 사건 있음 | `/dashboard` | 정리도 badge 확인 | 정리도 badge가 정리 필요 / 일부 정리 / 대체로 정리 / 정리 양호 기준 안에서 표시된다. |  |  |
| D-CLI-04 | 의뢰인 | 최근 사건 있음 | `/dashboard` | 사건 상세 링크 클릭 | 의뢰인에게 허용된 사건 상세로 이동한다. |  |  |
| D-CLI-05 | 의뢰인 | 사건 없음 | `/dashboard` | 빈 상태 확인 | 사건이 없을 때 빈 상태 문구가 자연스럽게 표시된다. |  |  |
| D-CLI-06 | 의뢰인 | 의뢰인 계정 로그인 | `/lawyer` | 직접 URL 접근 | restricted 안내 흐름으로 처리된다. 변호사 queue 데이터가 노출되지 않는다. |  |  |
| D-CLI-07 | 의뢰인 | 의뢰인 계정 로그인 | `/admin` | 직접 URL 접근 | restricted 안내 흐름으로 처리된다. 관리자 운영 지표가 노출되지 않는다. |  |  |
| D-CLI-08 | 의뢰인 | 의뢰인 대시보드 표시 | `/dashboard` | 문구 확인 | 승소 가능성, 패소 가능성, 법률 위험도 표현이 표시되지 않는다. |  |  |

## 8. 변호사 대시보드 수동 QA 시나리오

대상 경로:

- `/lawyer`

| ID | 역할 | 선행 조건 | 경로 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-LAW-01 | 변호사 | 변호사 계정 로그인 | `/lawyer` | 대시보드 진입 | 변호사 대시보드가 정상 렌더링된다. |  |  |
| D-LAW-02 | 변호사 | 검토 queue 있음 | `/lawyer` | 검토 queue preview 확인 | preview가 최대 5건 기준으로 표시된다. |  |  |
| D-LAW-03 | 변호사 | 검토 queue 있음 | `/lawyer` | 검토 우선순위 badge 확인 | 우선 검토 / 초안 확인 / 인터뷰 검토 / 보완 확인 / 일반 확인 기준 안에서 표시된다. |  |  |
| D-LAW-04 | 변호사 | 검토 queue 있음 | `/lawyer` | priorityScore 노출 여부 확인 | priorityScore 숫자가 화면에 노출되지 않는다. |  |  |
| D-LAW-05 | 변호사 | 검토 queue 없음 | `/lawyer` | 빈 상태 확인 | 검토할 사건이 없을 때 빈 상태 문구가 자연스럽게 표시된다. |  |  |
| D-LAW-06 | 변호사 | 변호사 계정 로그인 | `/admin` | 직접 URL 접근 | restricted 안내 흐름으로 처리된다. 관리자 운영 지표가 노출되지 않는다. |  |  |
| D-LAW-07 | 변호사 | 변호사 대시보드 표시 | `/lawyer` | 문구 확인 | 위험 사건, 법률 사고, 긴급 위험 표현이 표시되지 않는다. |  |  |

## 9. 관리자 대시보드 수동 QA 시나리오

대상 경로:

- `/admin`

| ID | 역할 | 선행 조건 | 경로 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-ADM-01 | 관리자 | 관리자 계정 로그인 | `/admin` | 대시보드 진입 | 관리자 대시보드가 정상 렌더링된다. |  |  |
| D-ADM-02 | 관리자 | 운영 확인 후보 있음 | `/admin` | 운영 확인 후보 preview 확인 | 후보가 최대 5건 기준으로 표시된다. |  |  |
| D-ADM-03 | 관리자 | 운영 확인 후보 있음 | `/admin` | 상태별 reason 확인 | HOLD / INTAKE_PENDING / REVIEW_PENDING reason 문구가 3.8 기준과 충돌하지 않는다. |  |  |
| D-ADM-04 | 관리자 | 장기 미진행 후보 있음 | `/admin` | 장기 미진행 badge 확인 | 확인 후보 / 우선 확인 후보 / 장기 미진행 후보 기준으로 표시된다. |  |  |
| D-ADM-05 | 관리자 | staleCaseCount 있음 | `/admin` | 보조 지표 확인 | staleCaseCount가 attentionNeeded와 합산된 것처럼 보이지 않는다. |  |  |
| D-ADM-06 | 관리자 | 운영 확인 후보 없음 | `/admin` | 빈 상태 확인 | 현재 운영 확인 후보는 없습니다. 문구가 표시된다. |  |  |
| D-ADM-07 | 관리자 | 장기 미진행 후보 없음 | `/admin` | 보조 문구 확인 | 장기 미진행 후보도 현재 확인되지 않았습니다. 기준으로 표시된다. |  |  |
| D-ADM-08 | 관리자 | 관리자 대시보드 표시 | `/admin` | 문구 확인 | 장애, 치명, P0, P1, 위험 폭증 표현이 표시되지 않는다. |  |  |
| D-ADM-09 | 관리자 | 관리자 대시보드 표시 | `/admin` | 알림 연결 확인 | 실제 알림 또는 에스컬레이션처럼 동작하지 않는다. |  |  |

## 10. restricted 안내 수동 QA 시나리오

| ID | 역할 | 선행 조건 | 경로 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-RES-01 | 의뢰인 | 의뢰인 계정 로그인 | `/lawyer` | 직접 URL 접근 | restricted 안내가 표시된다. 실제 변호사 데이터가 노출되지 않는다. |  |  |
| D-RES-02 | 의뢰인 | 의뢰인 계정 로그인 | `/admin` | 직접 URL 접근 | restricted 안내가 표시된다. 실제 관리자 데이터가 노출되지 않는다. |  |  |
| D-RES-03 | 변호사 | 변호사 계정 로그인 | `/admin` | 직접 URL 접근 | restricted 안내가 표시된다. 실제 관리자 데이터가 노출되지 않는다. |  |  |
| D-RES-04 | 비로그인 | 로그아웃 상태 | `/admin` | 직접 URL 접근 | 로그인 또는 제한 안내 흐름으로 처리된다. 실제 관리자 데이터가 노출되지 않는다. |  |  |
| D-RES-05 | 권한 불일치 | restricted 화면 표시 | restricted 안내 | 문구 확인 | 장애, 치명, P0, P1, 운영 사고 표현이 표시되지 않는다. |  |  |
| D-RES-06 | 권한 불일치 | restricted 화면 표시 | restricted 안내 | 이동 경로 확인 | 사용자가 돌아갈 수 있는 경로가 제공된다. |  |  |

## 11. demo metrics 경계 수동 QA 시나리오

| ID | 역할 | 선행 조건 | 경로 | 수행 절차 | 기대 결과 | 결과 | 메모 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-DEMO-01 | 공통 | 실서비스 경로 | `/dashboard` | 화면 데이터 확인 | demo metrics가 실서비스 의뢰인 데이터처럼 표시되지 않는다. |  |  |
| D-DEMO-02 | 공통 | 실서비스 경로 | `/lawyer` | 화면 데이터 확인 | demo metrics가 실서비스 변호사 queue처럼 표시되지 않는다. |  |  |
| D-DEMO-03 | 공통 | 실서비스 경로 | `/admin` | 화면 데이터 확인 | demo metrics가 실서비스 관리자 운영 지표처럼 표시되지 않는다. |  |  |
| D-DEMO-04 | 공통 | 코드 검색 가능 | repo | `dashboard-demo-metrics` import 검색 | 실서비스 경로에서 운영 metric 기준으로 import되지 않는다. |  |  |

## 12. 금지 표현 수동 확인

아래 표현은 역할별 대시보드 사용자 노출 문구에 표시되지 않아야 한다.

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

## 13. 수동 QA 결과 요약표

| 구분 | 총 시나리오 | PASS | FAIL | N/A | BLOCKED | 메모 |
| --- | ---: | --- | --- | --- | --- | --- |
| 공통 | 6 |  |  |  |  |  |
| 의뢰인 | 8 |  |  |  |  |  |
| 변호사 | 7 |  |  |  |  |  |
| 관리자 | 9 |  |  |  |  |  |
| restricted | 6 |  |  |  |  |  |
| demo metrics | 4 |  |  |  |  |  |

## 14. 검증 명령

문서 중심 작업이므로 기존 기준선 확인을 유지한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

## 15. 완료 판정

아래가 충족되면 대시보드 4.2를 완료로 본다.

- `DASHBOARD_4_2_PREDEPLOY_MANUAL_QA_SCENARIOS.md` 신규 추가
- 공통 수동 QA 시나리오 작성 완료
- 의뢰인 수동 QA 시나리오 작성 완료
- 변호사 수동 QA 시나리오 작성 완료
- 관리자 수동 QA 시나리오 작성 완료
- restricted 안내 수동 QA 시나리오 작성 완료
- demo metrics 경계 수동 QA 시나리오 작성 완료
- 금지 표현 수동 확인 기준 작성 완료
- 수동 QA 결과 요약표 작성 완료
- 3.x 봉인 유지 기준 명시
- QA closure 미기입 유지 기준 명시
- 신규 API / DB / 코드 기능 변경 없음
- `#evidence-20260428-predeploy-qa-closure` 미기입 유지
- 검증 명령 통과

## 16. 다음 후보

4.2 이후 다음 후보는 아래 중 하나다.

- 대시보드 4.3 — 빈 상태 / 오류 상태 수동 점검표
- 대시보드 4.4 — 배포 전 운영자 최종 체크리스트
- QA 팀 회신 수신 후 `#evidence-20260428-predeploy-qa-closure` 확정 기록
