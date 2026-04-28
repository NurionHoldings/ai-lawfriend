# 대시보드 4.1 — 역할별 접근 / 권한 점검표 세분화

## 0. 기준 문서

- `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md`
  - §12: 대시보드 3.x 최종 확인 순서
  - §13: 대시보드 3.x 봉인 이후 진행 기준
- `docs/project-governance/DASHBOARD_4_0_PREDEPLOY_OPERATION_CHECK_PHASE.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260426-391`
  - `#evidence-20260426-392`
- `tools/aibeopchin_navigator.py`
  - `dashboard_3_11_final_seal_summary`
  - `dashboard_4_0_predeploy_operation_check_phase`

## 1. 문서 목적

이 문서는 대시보드 4.0의 배포 전 운영 점검 Phase 중, 역할별 접근 / 권한 확인 항목을 세분화하기 위한 점검표다.

대시보드 4.1은 신규 기능 개발이 아니다.  
대시보드 4.1은 배포 전 수동 확인 또는 QA 확인 시 사용할 접근 / 권한 점검 기준을 문서화하는 작업이다.

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

## 4. 역할별 접근 점검 범위

이번 문서의 점검 대상 역할은 아래와 같다.

| 구분 | 설명 | 주요 확인 경로 |
| --- | --- | --- |
| 의뢰인 사용자 | 사건을 생성하고 자신의 사건 상태를 확인하는 사용자 | `/dashboard` |
| 변호사 사용자 | 배정 또는 검토 대상 사건을 확인하는 사용자 | `/lawyer` |
| 관리자 사용자 | 운영 현황과 운영 확인 후보를 확인하는 사용자 | `/admin` |
| 권한 불일치 사용자 | 본인 역할과 맞지 않는 경로에 접근하는 사용자 | restricted 안내 경로 |
| 비로그인 사용자 | 인증 없이 보호 경로에 접근하는 사용자 | 로그인 또는 restricted 흐름 |

## 5. 공통 접근 / 권한 점검표

- [ ] 비로그인 사용자가 보호 경로에 직접 접근할 때 로그인 또는 제한 안내 흐름으로 처리된다.
- [ ] 로그인 사용자의 역할 정보가 기존 session / 권한 정책 기준으로 유지된다.
- [ ] `middleware` 정책을 이번 작업에서 변경하지 않는다.
- [ ] `getSessionUser` / `requireSessionUser` 의미를 이번 작업에서 변경하지 않는다.
- [ ] restricted 안내 화면이 Living Logo V2 restricted 상태와 충돌하지 않는다.
- [ ] 권한 불일치 접근 시 사용자가 빈 화면이나 런타임 오류를 보지 않는다.
- [ ] 권한 불일치 접근 시 실제 데이터가 노출되지 않는다.
- [ ] 접근 실패 상황이 장애, 사고, P0, P1 같은 표현으로 표시되지 않는다.
- [ ] 접근 / 권한 점검은 신규 API 추가 없이 기존 흐름 기준으로 확인한다.

## 6. 의뢰인 사용자 접근 점검표

대상 경로:

- `/dashboard`

점검 항목:

- [ ] 의뢰인 권한 사용자는 `/dashboard`에 접근할 수 있다.
- [ ] 의뢰인 대시보드는 의뢰인 실데이터 기준으로 렌더링된다.
- [ ] 의뢰인 사용자는 관리자 운영 확인 후보 데이터를 볼 수 없다.
- [ ] 의뢰인 사용자는 변호사 검토 queue 데이터를 볼 수 없다.
- [ ] 최근 사건 preview가 기존 기준대로 표시된다.
- [ ] 최근 사건 정리도 badge가 기존 3.2 / 3.8 기준과 충돌하지 않는다.
- [ ] 등록된 사건이 없는 의뢰인에게 빈 상태가 자연스럽게 표시된다.
- [ ] 의뢰인 화면에 승소 가능성, 패소 가능성, 법률 위험도 표현이 표시되지 않는다.
- [ ] 의뢰인 사용자가 `/lawyer` 또는 `/admin`에 접근할 때 권한 불일치 흐름으로 처리된다.

## 7. 변호사 사용자 접근 점검표

대상 경로:

- `/lawyer`

점검 항목:

- [ ] 변호사 권한 사용자는 `/lawyer`에 접근할 수 있다.
- [ ] 변호사 대시보드는 변호사 실데이터 기준으로 렌더링된다.
- [ ] 변호사 사용자는 본인에게 허용된 검토 대상 또는 배정 사건만 확인한다.
- [ ] 변호사 사용자는 관리자 운영 집계 데이터를 볼 수 없다.
- [ ] 검토 queue preview가 기존 최대 5건 기준을 유지한다.
- [ ] 검토 우선순위 badge가 기존 3.3 / 3.8 기준과 충돌하지 않는다.
- [ ] priorityScore 숫자는 화면에 노출되지 않는다.
- [ ] 검토할 사건이 없는 경우 빈 상태가 자연스럽게 표시된다.
- [ ] 변호사 화면에 위험 사건, 법률 사고, 긴급 위험 표현이 표시되지 않는다.
- [ ] 변호사 사용자가 `/admin`에 접근할 때 권한 불일치 흐름으로 처리된다.

## 8. 관리자 사용자 접근 점검표

대상 경로:

- `/admin`

점검 항목:

- [ ] 관리자 권한 사용자는 `/admin`에 접근할 수 있다.
- [ ] 관리자 대시보드는 관리자 실데이터 기준으로 렌더링된다.
- [ ] `attentionNeeded` 기준은 기존 `HOLD + INTAKE_PENDING`으로 유지된다.
- [ ] `staleCaseCount`는 `attentionNeeded`에 합산되지 않는다.
- [ ] 운영 확인 후보는 `HOLD / INTAKE_PENDING / REVIEW_PENDING` 기준을 유지한다.
- [ ] 장기 미진행 후보 badge는 기존 3.4 / 3.8 기준과 충돌하지 않는다.
- [ ] 관리자 운영 확인 후보가 없을 때 빈 상태 문구가 자연스럽게 표시된다.
- [ ] 관리자 화면에 장애, 치명, P0, P1, 위험 폭증 표현이 신규 표시되지 않는다.
- [ ] 실제 알림 또는 에스컬레이션 로직으로 연결되지 않는다.
- [ ] 관리자 사용자가 의뢰인 또는 변호사 경로를 확인해야 하는 경우에도 권한 정책은 기존 기준을 따른다.

## 9. 권한 불일치 사용자 점검표

점검 항목:

- [ ] 의뢰인 사용자가 `/lawyer`에 접근하면 제한 안내 흐름으로 처리된다.
- [ ] 의뢰인 사용자가 `/admin`에 접근하면 제한 안내 흐름으로 처리된다.
- [ ] 변호사 사용자가 `/admin`에 접근하면 제한 안내 흐름으로 처리된다.
- [ ] 관리자 외 사용자가 관리자 운영 지표를 볼 수 없다.
- [ ] 권한 불일치 상황에서 실제 사건 데이터가 노출되지 않는다.
- [ ] 권한 불일치 상황에서 빈 화면 또는 예외 화면이 노출되지 않는다.
- [ ] 제한 안내 화면은 사용자가 다음 행동을 이해할 수 있는 문구를 제공한다.
- [ ] 제한 안내 문구에 장애, 치명, P0, P1 표현을 사용하지 않는다.

## 10. 비로그인 사용자 점검표

점검 항목:

- [ ] 비로그인 사용자가 `/dashboard`에 직접 접근하면 로그인 또는 제한 안내 흐름으로 처리된다.
- [ ] 비로그인 사용자가 `/lawyer`에 직접 접근하면 로그인 또는 제한 안내 흐름으로 처리된다.
- [ ] 비로그인 사용자가 `/admin`에 직접 접근하면 로그인 또는 제한 안내 흐름으로 처리된다.
- [ ] 비로그인 상태에서 실데이터가 노출되지 않는다.
- [ ] 비로그인 상태에서 dashboard metric 조회 결과가 노출되지 않는다.
- [ ] 비로그인 접근 처리 중 런타임 오류가 발생하지 않는다.
- [ ] 비로그인 안내 문구에 위험, 장애, P0, P1 표현을 사용하지 않는다.

## 11. restricted 안내 경로 점검표

점검 항목:

- [ ] restricted 안내 경로는 Living Logo V2 restricted mode와 충돌하지 않는다.
- [ ] restricted 안내 화면은 역할 불일치 또는 접근 제한 상황을 과장 없이 설명한다.
- [ ] restricted 안내 화면은 실제 사건 정보 또는 운영 지표를 노출하지 않는다.
- [ ] restricted 안내 화면에서 사용자가 로그인 상태를 이해할 수 있다.
- [ ] restricted 안내 화면에서 사용자가 돌아갈 수 있는 경로가 제공된다.
- [ ] restricted 안내 문구에 장애, 치명, P0, P1, 운영 사고 표현을 사용하지 않는다.

## 12. 점검 시나리오 예시

| 시나리오 | 사용자 상태 | 접근 경로 | 기대 결과 |
| --- | --- | --- | --- |
| C-01 | 의뢰인 로그인 | `/dashboard` | 의뢰인 대시보드 표시 |
| C-02 | 의뢰인 로그인 | `/lawyer` | 제한 안내 흐름 |
| C-03 | 의뢰인 로그인 | `/admin` | 제한 안내 흐름 |
| L-01 | 변호사 로그인 | `/lawyer` | 변호사 대시보드 표시 |
| L-02 | 변호사 로그인 | `/admin` | 제한 안내 흐름 |
| A-01 | 관리자 로그인 | `/admin` | 관리자 대시보드 표시 |
| G-01 | 비로그인 | `/dashboard` | 로그인 또는 제한 안내 흐름 |
| G-02 | 비로그인 | `/lawyer` | 로그인 또는 제한 안내 흐름 |
| G-03 | 비로그인 | `/admin` | 로그인 또는 제한 안내 흐름 |

## 13. 금지 표현 검색

아래 표현은 접근 / 권한 안내 또는 역할별 대시보드 사용자 노출 문구에 신규 삽입하지 않는다.

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

확인 명령 (Git Bash·WSL·macOS/Linux 등):

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

기존 주석, 비사용 경로, 이번 작업과 무관한 기존 문자열은 별도 메모로 분리하고 무리하게 삭제하지 않는다.

## 14. 검증 명령

문서 중심 작업이므로 기존 기준선 확인을 유지한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

## 15. 완료 판정

아래가 충족되면 대시보드 4.1을 완료로 본다.

- `DASHBOARD_4_1_ROLE_ACCESS_PERMISSION_CHECKLIST.md` 신규 추가
- 의뢰인 접근 / 권한 점검표 작성 완료
- 변호사 접근 / 권한 점검표 작성 완료
- 관리자 접근 / 권한 점검표 작성 완료
- 권한 불일치 사용자 점검표 작성 완료
- 비로그인 사용자 점검표 작성 완료
- restricted 안내 경로 점검표 작성 완료
- 점검 시나리오 예시 작성 완료
- 3.x 봉인 유지 기준 명시
- QA closure 미기입 유지 기준 명시
- 신규 API / DB / 코드 기능 변경 없음
- `#evidence-20260428-predeploy-qa-closure` 미기입 유지
- 검증 명령 통과

## 16. 다음 후보

4.1 이후 다음 후보는 아래 중 하나다.

- 대시보드 4.2 — 배포 전 수동 QA 시나리오표
- 대시보드 4.3 — 빈 상태 / 오류 상태 수동 점검표
- QA 팀 회신 수신 후 `#evidence-20260428-predeploy-qa-closure` 확정 기록
