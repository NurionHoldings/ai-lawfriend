# 대시보드 4.7 — QA/운영 실측 결과 AI 자동 반영 설계서

## 0. 기준 문서

- `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md`
  - §12: 대시보드 3.x 최종 확인 순서
  - §13: 대시보드 3.x 봉인 이후 진행 기준
- `docs/project-governance/DASHBOARD_4_0_PREDEPLOY_OPERATION_CHECK_PHASE.md`
- `docs/project-governance/DASHBOARD_4_1_ROLE_ACCESS_PERMISSION_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_4_2_PREDEPLOY_MANUAL_QA_SCENARIOS.md`
- `docs/project-governance/DASHBOARD_4_3_EMPTY_ERROR_STATE_MANUAL_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_4_4_PREDEPLOY_OPERATOR_FINAL_CHECKLIST.md`
- `docs/project-governance/DASHBOARD_4_5_QA_CLOSURE_REFLECTION_PREP.md`
- `docs/project-governance/DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260426-391`
  - `#evidence-20260428-predeploy-qa-closure`
  - `#predeploy-qa-1-4`
  - `#predeploy-qa-message-copy`
  - `#predeploy-qa-official-confirm`
  - `#evidence-20260428-398`
  - `#evidence-20260428-399`
- `tools/aibeopchin_navigator.py`
  - `dashboard_3_11_final_seal_summary`
  - `dashboard_4_0_predeploy_operation_check_phase`
  - `dashboard_4_1_role_access_permission_checklist`
  - `dashboard_4_2_predeploy_manual_qa_scenarios`
  - `dashboard_4_3_empty_error_state_manual_checklist`
  - `dashboard_4_4_predeploy_operator_final_checklist`
  - `dashboard_4_5_qa_closure_reflection_prep`
  - `dashboard_4_6_qa_pending_followup_tracker`
  - `predeploy_qa_closure_procedure`
  - `dashboard_4_7_ai_assisted_qa_evidence_reflection_design` (본 문서)

## 1. 문서 목적

이 문서는 QA팀 또는 운영자가 제출한 실측 결과 원문을 AI가 자동 분석하여 `#evidence-20260428-predeploy-qa-closure`에 들어갈 초안과 후속 보완 항목을 생성하는 기준을 정리하기 위한 설계서다.

대시보드 4.7은 신규 기능 구현 문서가 아니다.  
대시보드 4.7은 추후 AI 연동 기능을 구현할 때 사용할 운영 기준, 입력 형식, 판정 기준, 자동 작성 범위, 사람 승인 절차, 감사로그 기준을 고정하는 설계 문서다.

핵심 원칙은 아래와 같다.

- AI는 최종 판정자가 아니다.
- AI는 실측 원문을 분석해 증빙 초안을 작성하는 보조자다.
- AI는 PASS / FAIL / BLOCKED / N/A / 보완 필요 항목을 분류할 수 있다.
- AI는 `#evidence-20260428-predeploy-qa-closure`의 공식 확정 표 초안을 만들 수 있다.
- AI는 회신 원문 정리본을 만들 수 있다.
- AI는 FAIL / BLOCKED / N/A / 보완 필요 항목을 4.6 follow-up tracker 초안으로 분리할 수 있다.
- 최종 확정, 배포 가능 판정, 공식 증빙 반영은 사람 승인 후에만 가능하다.

## 2. 3.x 봉인 유지 원칙

대시보드 3.x는 아래 기준으로 봉인 상태를 유지한다.

- `DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md` §12~13을 최종 기준으로 본다.
- `#evidence-20260426-391`을 대시보드 3.x 최종 봉인 증빙으로 본다.
- 대시보드 3.x 기능 확장을 하지 않는다.
- 3.x에서 닫은 metric, badge, 문구, demo metrics 경계를 재오픈하지 않는다.
- 이후 기능성 변경은 별도 4.x Phase 또는 별도 evidence로 분리한다.
- AI 자동 분석 기능이 생기더라도 대시보드 3.x 봉인 상태를 임의로 변경하지 않는다.

## 3. QA closure 미기입 유지 원칙

QA 실측 전문을 수신하기 전까지 아래 항목은 작성하지 않는다.

- `#evidence-20260428-predeploy-qa-closure`의 공식 확정 표
- QA 회신 원문
- QA 최종 통과 판정
- 배포 가능 최종 판정

AI 자동 반영 설계가 있더라도, 실측 전문이 없으면 AI는 closure 초안을 생성하지 않는다.  
실측 전문이 없는 상태에서 AI가 임의로 PASS, 최종 통과, 배포 가능을 추정해서는 안 된다.

## 4. AI 자동 반영 가능 범위

AI는 아래 항목을 자동으로 수행할 수 있다.

| 구분 | AI 수행 가능 여부 | 설명 |
| --- | --- | --- |
| QA 회신 원문 구조화 | 가능 | 자유 형식 회신을 정해진 항목으로 정리 |
| QA 수행 일시 추출 | 가능 | 원문에 있는 날짜와 시간 추출 |
| QA 담당자 추출 | 가능 | 원문에 있는 담당자 또는 팀명 추출 |
| 테스트 환경 URL 추출 | 가능 | 스테이징 URL 또는 테스트 환경 정보 추출 |
| 사용 계정 역할 추출 | 가능 | 의뢰인, 변호사, 관리자, 비로그인 등 분류 |
| PASS 항목 분류 | 가능 | 원문에 명시된 통과 항목 추출 |
| FAIL 항목 분류 | 가능 | 원문에 명시된 실패 항목 추출 |
| N/A 항목 분류 | 가능 | 해당 없음 또는 수행 불가 항목 분류 |
| BLOCKED 항목 분류 | 가능 | 선행 조건 미충족 또는 환경 부재 항목 분류 |
| 보완 필요 항목 분류 | 가능 | 추가 수정, 재확인, 문서 보완, 운영 확인 항목 분류 |
| 공식 확정 표 초안 작성 | 가능 | 사람 승인 전 초안으로만 작성 |
| 회신 원문 정리본 작성 | 가능 | 원문 보존 + 구조화 요약 |
| 4.6 tracker 초안 작성 | 가능 | FAIL / BLOCKED / N/A / 보완 항목 분리 |
| QA팀 추가 요청문 작성 | 가능 | 누락 항목이 있을 경우 재요청 메시지 작성 |
| 최종 확정 | 불가 | 사람 승인 필요 |
| 배포 가능 판정 | 불가 | 사람 승인 필요 |
| 공식 증빙 최종 반영 | 불가 | 사람 승인 필요 |

## 5. AI가 절대 자동 확정하면 안 되는 범위

AI는 아래 항목을 자동 확정하지 않는다.

- QA 최종 통과 판정
- 배포 가능 최종 판정
- `#evidence-20260428-predeploy-qa-closure` 공식 확정 표 최종 저장
- QA 회신 원문 최종 저장
- FAIL 항목의 PASS 전환
- BLOCKED 항목의 임의 해소 처리
- N/A 항목의 PASS 간주
- 테스트 URL, 담당자, 수행 일시가 없는 회신의 closure 확정
- 대시보드 3.x 봉인 재오픈
- 대시보드 metric, badge, 문구 기준 변경
- API / DB / 권한 / 상태값 변경 제안의 자동 적용
- 배포 승인 또는 릴리즈 승인

## 6. 입력 데이터 형식

AI 자동 분석에 사용할 수 있는 입력은 아래와 같다.

### 6.1 기본 입력 형식

```text
QA 수행 일시:
QA 담당자:
테스트 환경 URL:
사용 계정 역할:
PASS 항목:
FAIL 항목:
N/A 항목:
BLOCKED 항목:
보완 필요 항목:
최종 의견:
배포 전 closure 반영 가능 여부:
```

### 6.2 자유 형식 입력 허용

QA팀 또는 운영자가 자유 문장으로 회신한 경우에도 AI는 아래 항목을 추출한다.

- 수행 일시
- 담당자
- 테스트 환경
- 사용 계정
- PASS
- FAIL
- N/A
- BLOCKED
- 보완 필요
- 최종 의견
- closure 반영 가능 여부

다만 필수 항목이 없으면 AI는 closure 확정 초안을 만들지 않고 NEEDS FOLLOW-UP으로 분류한다.

### 6.3 첨부 가능 자료

- 스크린샷 경로
- 브라우저 콘솔 로그
- 서버 로그
- 네트워크 오류 캡처
- 테스트 계정 목록
- QA 체크리스트 결과표
- 운영자 메모
- 배포 전 확인표

AI는 첨부 자료의 존재를 근거로 정리할 수 있으나, 첨부 파일의 실제 내용을 확인하지 못한 경우에는 “첨부 확인 필요”로 표시한다.

## 7. 필수 필드 기준

아래 필드는 closure 확정 전 반드시 확인되어야 한다.

| 필드 | 필수 여부 | 누락 시 처리 |
| --- | --- | --- |
| QA 수행 일시 | 필수 | NEEDS FOLLOW-UP |
| QA 담당자 또는 팀 | 필수 | NEEDS FOLLOW-UP |
| 테스트 환경 URL | 필수 | NEEDS FOLLOW-UP |
| 사용 계정 역할 | 필수 | NEEDS FOLLOW-UP |
| PASS 항목 | 조건부 필수 | 전부 PASS 판정 불가 |
| FAIL 항목 | 필수 확인 | 비어 있더라도 “없음” 명시 필요 |
| BLOCKED 항목 | 필수 확인 | 비어 있더라도 “없음” 명시 필요 |
| N/A 항목 | 권장 | 대상 없음 여부 확인 |
| 보완 필요 항목 | 필수 확인 | 비어 있더라도 “없음” 명시 필요 |
| closure 반영 가능 여부 | 필수 | 최종 반영 불가 |

## 8. 판정 분류 기준

AI는 원문을 아래 기준으로 분류한다.

| 판정 | 기준 | AI 처리 |
| --- | --- | --- |
| PASS | 기대 결과와 실제 결과가 일치한다고 명시됨 | closure 표 초안에 PASS로 분류 |
| PASS WITH NOTES | 통과했으나 참고 메모가 있음 | PASS로 분류하되 메모 포함 |
| FAIL | 기대 결과와 실제 결과가 다름 | closure 확정 보류, 4.6 tracker로 분리 |
| BLOCKED | 선행 조건 부족, 계정 없음, URL 없음, 환경 문제 등으로 수행 불가 | closure 확정 보류, 4.6 tracker로 분리 |
| N/A | 해당 환경에서 수행 불가 또는 대상 없음 | closure 확정 가능 여부를 사람 검토로 넘김 |
| NEEDS FOLLOW-UP | 정보 부족, 담당자/일시/URL 누락, 범위 불명확 | 추가 회신 요청문 생성 |
| OUT OF SCOPE | 대시보드 범위 밖 이슈 | 별도 Phase 후보로 분리 |
| REOPEN_REQUIRED | 3.x 봉인 범위를 재오픈해야 하는 요청 | 자동 반영 금지, 별도 검토 필요 |

## 9. closure 공식 확정 표 자동 생성 기준

AI는 실측 전문을 받은 뒤 아래 표의 초안을 생성할 수 있다.

### 공식 확정 표

| 구분 | 결과 | 근거 | 후속 |
| --- | --- | --- | --- |
| 3.x 봉인 상태 |  |  |  |
| 접근 / 권한 |  |  |  |
| 역할별 화면 표시 |  |  |  |
| 빈 상태 / 오류 상태 |  |  |  |
| demo metrics 경계 |  |  |  |
| 금지 표현 |  |  |  |
| 증빙 / 내비게이터 |  |  |  |

### 9.1 결과 칸 작성 기준

- 전부 통과: PASS
- 참고 메모 있음: PASS WITH NOTES
- 실패 있음: FAIL
- 미수행 또는 차단: BLOCKED
- 대상 없음: N/A
- 추가 확인 필요: NEEDS FOLLOW-UP

### 9.2 후속 칸 작성 기준

- 후속 없음: 없음
- 문서 보완 필요: 문서 보완
- 기능 보완 필요: 기능 보완
- 운영 확인 필요: 운영 확인
- 재QA 필요: 재QA
- 별도 Phase 필요: 별도 Phase 분리

### 9.3 closure 확정 가능 조건

AI는 아래 조건이 충족될 때만 “closure 확정 가능 초안”을 제안한다.

- QA 수행 일시가 있다.
- QA 담당자 또는 팀이 있다.
- 테스트 환경 URL이 있다.
- 사용 계정 역할이 명시되어 있다.
- FAIL 항목이 없다.
- 미해소 BLOCKED 항목이 없다.
- 보완 필요 항목이 없거나 closure와 무관한 참고 사항으로 분류된다.
- closure 반영 가능 여부가 명시되어 있다.
- 3.x 봉인 재오픈이 필요하지 않다.

## 10. 회신 원문 정리 기준

AI는 회신 원문을 아래 방식으로 정리한다.

### 회신 원문

- 수신 일시:
- 회신자 / 팀:
- 테스트 환경:
- 원문:
  > 원문을 가능한 그대로 보존한다.

### 구조화 요약

- PASS:
- FAIL:
- N/A:
- BLOCKED:
- 보완 필요:
- 최종 의견:
- closure 반영 가능 여부:

원문은 가능한 그대로 보존하고, AI가 임의로 문장을 바꾸지 않는다.  
오탈자 정정이 필요한 경우에도 “원문 유지 / 정리본 별도” 구조로 분리한다.

## 11. 4.6 follow-up tracker 자동 분리 기준

AI는 아래 항목을 `DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md` 기준의 후속 보완 후보로 분리한다.

| 항목 유형 | 4.6 분리 대상 여부 | 처리 |
| --- | --- | --- |
| FAIL | 대상 | 후속 보완 항목으로 분리 |
| 미해소 BLOCKED | 대상 | 선행 조건 해소 항목으로 분리 |
| N/A | 조건부 대상 | 대상 없음 사유 검토 |
| NEEDS FOLLOW-UP | 대상 | QA팀 추가 회신 요청 |
| OUT OF SCOPE | 대상 | 별도 Phase 후보 |
| REOPEN_REQUIRED | 대상 | 3.x 재오픈 금지 원칙에 따라 별도 검토 |
| PASS WITH NOTES | 조건부 대상 | 운영 메모로 남길지 검토 |

### 11.1 4.6 tracker 자동 초안 형식

| 항목 ID | 유형 | 원문 근거 | 영향 범위 | 권장 후속 | closure 영향 | 담당 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | FAIL / BLOCKED / N/A / NEEDS FOLLOW-UP |  |  |  | closure 보류 / 참고 / 무관 |  | 후보 |

### 11.2 closure 영향 기준

- **FAIL:** closure 보류
- **미해소 BLOCKED:** closure 보류
- **NEEDS FOLLOW-UP:** closure 보류
- **N/A:** 사람 검토
- **OUT OF SCOPE:** 별도 Phase
- **PASS WITH NOTES:** 참고 가능

## 12. 사람 승인 절차

AI가 초안을 생성한 뒤에는 아래 순서로 사람 승인을 거친다.

1. 운영자 또는 QA 담당자가 AI 분석 결과 확인
2. PASS / FAIL / BLOCKED / N/A 분류 검토
3. 공식 확정 표 초안 검토
4. 회신 원문 보존 여부 확인
5. 4.6 tracker 분리 항목 검토
6. closure 확정 가능 여부 판단
7. 승인 또는 반려
8. 승인 시에만 `IMPLEMENTATION_EVIDENCE.md` 반영
9. 반려 시 보완 요청 또는 재분석

### 12.1 승인 전 금지

승인 전에는 아래를 하지 않는다.

- 공식 확정 표 최종 저장
- 회신 원문 최종 저장
- 배포 가능 판정 작성
- 최종 통과 판정 작성
- 3.x 봉인 상태 변경
- 코드 변경

## 13. AI 자동 생성 결과 상태값

AI 자동 분석 결과는 아래 상태값을 가진다.

| 상태 | 의미 |
| --- | --- |
| DRAFT | AI가 초안을 생성한 상태 |
| NEEDS_REVIEW | 사람 검토가 필요한 상태 |
| NEEDS_QA_REPLY | QA 회신 보완이 필요한 상태 |
| READY_FOR_APPROVAL | 사람이 승인하면 반영 가능한 상태 |
| APPROVED | 사람 승인 완료 |
| REJECTED | 사람 반려 |
| APPLIED | 공식 문서에 반영 완료 |

상태 전이는 아래 기준을 따른다.

- **정상 흐름:** DRAFT → NEEDS_REVIEW → READY_FOR_APPROVAL → APPROVED → APPLIED
- **보완이 필요한 경우:** DRAFT → NEEDS_REVIEW → NEEDS_QA_REPLY → DRAFT
- **반려되는 경우:** DRAFT → NEEDS_REVIEW → REJECTED

## 14. 감사로그 / 변경 이력 기준

AI 자동 반영 기능이 구현될 경우 아래 이력을 남긴다.

| 항목 | 기록 내용 |
| --- | --- |
| 입력 원문 | QA 회신 원문 |
| 입력 일시 | 원문 입력 시각 |
| 입력자 | 원문을 등록한 사용자 |
| AI 분석 시각 | AI가 분석한 시각 |
| AI 분석 결과 | PASS / FAIL / BLOCKED / N/A 분류 |
| 생성 문서 | closure 표 초안, 회신 원문 정리본, 4.6 tracker 초안 |
| 승인자 | 최종 승인한 사용자 |
| 승인 시각 | 승인한 시각 |
| 반영 대상 | `IMPLEMENTATION_EVIDENCE.md`, 4.6 tracker 등 |
| 변경 전후 | 반영 전 / 반영 후 diff |
| 반려 사유 | 반려된 경우 사유 |

감사로그는 사람이 나중에 왜 closure가 확정 또는 보류됐는지 추적할 수 있어야 한다.

## 15. UI 설계 기준

나중에 서비스 내부에 기능으로 구현할 경우 화면은 아래 구조를 따른다.

### 15.1 화면 이름

AI Evidence Assistant — QA Closure 반영 보조

### 15.2 화면 구성

- QA 원문 입력 영역
- 첨부 자료 입력 영역
- AI 분석 실행 버튼
- 분석 결과 요약
- PASS / FAIL / BLOCKED / N/A 분류표
- 공식 확정 표 초안
- 회신 원문 정리본
- 4.6 follow-up tracker 초안
- 누락 항목 경고
- 사람 승인 / 반려 버튼
- 승인 후 반영 미리보기
- 감사로그 보기

### 15.3 버튼 기준

| 버튼 | 기능 |
| --- | --- |
| AI 분석 실행 | 입력 원문을 분석해 초안 생성 |
| 누락 항목 확인 | 필수 필드 누락 여부 표시 |
| QA팀 재요청 문구 생성 | 부족한 항목을 요청하는 메시지 생성 |
| 4.6 tracker 초안 생성 | FAIL/BLOCKED/N/A 항목 분리 |
| closure 초안 생성 | 공식 확정 표와 회신 원문 초안 생성 |
| 승인 후 반영 | 사람 승인 후 공식 문서 반영 |
| 반려 | 초안 폐기 또는 보완 요청 |

## 16. API 설계 후보

실제 구현 시 후보 API는 아래와 같다.

| Method | Path | 목적 |
| --- | --- | --- |
| POST | `/api/admin/qa-evidence/analyze` | QA 회신 원문 AI 분석 |
| POST | `/api/admin/qa-evidence/draft-closure` | closure 표 초안 생성 |
| POST | `/api/admin/qa-evidence/draft-followups` | 4.6 tracker 초안 생성 |
| POST | `/api/admin/qa-evidence/request-more-info` | QA팀 보완 요청문 생성 |
| POST | `/api/admin/qa-evidence/approve` | 사람 승인 후 반영 |
| POST | `/api/admin/qa-evidence/reject` | 초안 반려 |
| GET | `/api/admin/qa-evidence/[id]` | 분석 결과 조회 |
| GET | `/api/admin/qa-evidence/[id]/diff` | 반영 전후 diff 조회 |

**주의:** 4.7에서는 API를 만들지 않는다. 이 표는 향후 구현 후보일 뿐이다.

## 17. 데이터 모델 후보

실제 구현 시 후보 모델은 아래와 같다.

```prisma
model QaEvidenceDraft {
  id             String   @id @default(cuid())
  sourceText     String
  sourceMeta     Json?
  analysisResult Json
  closureDraft   Json?
  followupDraft  Json?
  status         String
  createdById    String
  reviewedById   String?
  approvedById   String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  approvedAt     DateTime?
}
```

**주의:** 4.7에서는 DB schema를 변경하지 않는다. 이 모델은 향후 구현 후보일 뿐이다.

## 18. 보안 / 권한 기준

AI 자동 반영 기능은 관리자 또는 지정된 운영자만 사용할 수 있다.

**권한 기준**

- 일반 의뢰인은 사용할 수 없다.
- 변호사 사용자는 사용할 수 없다.
- 관리자 또는 운영 권한자만 사용할 수 있다.
- 승인 권한과 초안 생성 권한은 분리할 수 있다.
- 최종 반영 권한은 제한한다.

**보안 기준**

- QA 원문에 개인정보가 포함될 수 있으므로 로그 접근 권한을 제한한다.
- 첨부 자료는 필요 최소한으로 보관한다.
- 원문과 AI 요약을 구분한다.
- AI가 개인정보를 임의로 확장하거나 추론하지 않는다.
- 외부 유출 없이 내부 저장소 기준으로 관리한다.

## 19. 실패 / 예외 처리 기준

AI 분석이 실패하면 아래 기준으로 처리한다.

| 상황 | 처리 |
| --- | --- |
| 원문이 비어 있음 | 분석 중단, 원문 입력 요청 |
| 필수 필드 누락 | NEEDS_QA_REPLY |
| PASS/FAIL 구분 불가 | NEEDS_REVIEW |
| 담당자 없음 | NEEDS_QA_REPLY |
| 테스트 환경 URL 없음 | NEEDS_QA_REPLY |
| FAIL 항목 존재 | closure 보류 |
| BLOCKED 항목 존재 | closure 보류 |
| 3.x 재오픈 필요 | 별도 Phase 검토 |
| AI 응답 불완전 | 재분석 또는 사람 수동 검토 |

## 20. 금지 기준

아래 행위는 금지한다.

- AI가 실측 원문 없이 closure를 작성
- AI가 임의로 QA 수행 일시를 생성
- AI가 임의로 QA 담당자를 생성
- AI가 FAIL 항목을 PASS로 바꿈
- AI가 BLOCKED 항목을 무시
- AI가 N/A를 PASS로 간주
- AI가 배포 가능 판정을 단독으로 작성
- AI가 사람 승인 없이 문서를 반영
- AI가 대시보드 3.x 봉인을 재오픈
- AI가 API / DB / 권한 변경을 자동 적용
- AI가 회신 원문을 왜곡

## 21. 검증 명령

문서 중심 작업이므로 기존 기준선 확인을 유지한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

## 22. 완료 판정

아래가 충족되면 대시보드 4.7을 완료로 본다.

- `DASHBOARD_4_7_AI_ASSISTED_QA_EVIDENCE_REFLECTION_DESIGN.md` 신규 추가
- AI 자동 반영 가능 범위 정리 완료
- AI 자동 확정 금지 범위 정리 완료
- 입력 데이터 형식 정리 완료
- PASS / FAIL / BLOCKED / N/A 분류 기준 정리 완료
- closure 공식 확정 표 자동 생성 기준 정리 완료
- 회신 원문 정리 기준 작성 완료
- 4.6 follow-up tracker 자동 분리 기준 작성 완료
- 사람 승인 절차 작성 완료
- 감사로그 / 변경 이력 기준 작성 완료
- UI / API / 데이터 모델 후보 작성 완료
- 보안 / 권한 기준 작성 완료
- 금지 기준 작성 완료
- 3.x 봉인 유지 기준 명시
- QA closure 미기입 유지 기준 명시
- 신규 API / DB / 코드 기능 변경 없음
- `#evidence-20260428-predeploy-qa-closure` 미기입 유지
- 검증 명령 통과

## 23. 다음 후보

4.7 이후 다음 후보는 아래 중 하나다.

1. QA 실측 전문 수신 후 `#evidence-20260428-predeploy-qa-closure` **공식 확정 표**와 **회신 원문** 갱신
2. AI Evidence Assistant 실제 구현 Phase를 **별도 5.x**로 분리
3. 4.7 설계 기준을 바탕으로 API / DB / UI **구현 지시서** 작성

## 24. 완료·잠금 · 다음 (고정)

- **4.7** 본 문서(`§0~§24`)·**[EVIDENCE-20260428-400]**는 **완료·잠김**으로 본다. **운영** **잠금**·**확인** **순서**·**다음** **분기**는 `IMPLEMENTATION_EVIDENCE.md` — [`#evidence-20260428-400-snap`](IMPLEMENTATION_EVIDENCE.md#evidence-20260428-400-snap) · [`#evidence-20260428-400-next`](IMPLEMENTATION_EVIDENCE.md#evidence-20260428-400-next) · [`#evidence-20260428-400-now`](IMPLEMENTATION_EVIDENCE.md#evidence-20260428-400-now) 를 본다.

**확인 순서 (고정):**

1. `IMPLEMENTATION_EVIDENCE.md` — `#evidence-20260428-400` · `#evidence-20260428-400-now` · `#evidence-20260428-400-snap` · `#evidence-20260428-400-next`
2. 본 파일 `DASHBOARD_4_7_AI_ASSISTED_QA_EVIDENCE_REFLECTION_DESIGN.md`
3. `tools/aibeopchin_navigator.py` — `dashboard_4_7_ai_assisted_qa_evidence_reflection_design` · `show-plan` 대시보드 4.7 절

**다음 실제 작업 (둘 중 하나):** (1) QA **실측 전문** 수신 시 — **closure** **공식** **확정** **표**·**회신** **원문** 갱신; 필요 시 **4.6** **tracker** 기준 **분리**. (2) **AI** **구현** 시 — **5.x** **Phase**·**구현** **지시서** **별도** **문서**.
