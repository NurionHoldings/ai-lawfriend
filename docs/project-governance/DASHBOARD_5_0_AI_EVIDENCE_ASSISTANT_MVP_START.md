# 대시보드 5.0 — AI Evidence Assistant MVP 착수 기준서

## 0. 기준 문서

- `docs/project-governance/DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md`
  - §12: 대시보드 3.x 최종 확인 순서
  - §13: 대시보드 3.x 봉인 이후 진행 기준
- `docs/project-governance/DASHBOARD_4_5_QA_CLOSURE_REFLECTION_PREP.md`
- `docs/project-governance/DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md`
- `docs/project-governance/DASHBOARD_4_7_AI_ASSISTED_QA_EVIDENCE_REFLECTION_DESIGN.md`
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md`
  - `#evidence-20260428-predeploy-qa-closure`
  - `#predeploy-qa-1-4`
  - `#predeploy-qa-message-copy`
  - `#predeploy-qa-official-confirm`
  - `#evidence-20260428-398`
  - `#evidence-20260428-399`
  - `#evidence-20260428-400`
- `tools/aibeopchin_navigator.py`
  - `predeploy_qa_closure_procedure`
  - `dashboard_4_6_qa_pending_followup_tracker`
  - `dashboard_4_7_ai_assisted_qa_evidence_reflection_design`

## 1. 문서 목적

이 문서는 `DASHBOARD_4_7_AI_ASSISTED_QA_EVIDENCE_REFLECTION_DESIGN.md`에서 정리한 AI Evidence Assistant 개념을 실제 MVP 구현 착수 기준으로 전환하기 위한 문서다.

대시보드 5.0은 실제 코드 구현이 아니라, 5.1 구현에 들어가기 전 아래 기준을 고정한다.

- 무엇을 만들 것인지
- 무엇을 만들지 않을 것인지
- 어떤 화면을 둘 것인지
- 어떤 API 후보를 사용할 것인지
- 어떤 데이터 구조로 주고받을 것인지
- AI가 어디까지 자동 생성하고 어디서 멈출 것인지
- 사람 승인은 어느 단계에서 필요한지
- 5.1 구현 파일 구조는 어떻게 잡을 것인지

핵심 원칙은 아래와 같다.

- AI는 최종 판정자가 아니다.
- AI는 QA/운영 실측 원문을 읽고 증빙 초안을 작성하는 보조자다.
- AI는 PASS / FAIL / BLOCKED / N/A / 보완 필요 항목을 분류한다.
- AI는 closure 공식 확정 표 초안, 회신 원문 정리본, 4.6 follow-up tracker 초안을 만든다.
- AI는 `IMPLEMENTATION_EVIDENCE.md`를 자동 수정하지 않는다.
- AI는 배포 가능 판정을 자동 확정하지 않는다.
- 최종 확정과 공식 문서 반영은 사람 승인 후에만 가능하다.

## 2. 대시보드 5.0의 위치

대시보드 5.0은 대시보드 4.x 운영 점검 문서화 이후의 첫 구현 준비 단계다.

| 단계 | 성격 | 상태 |
| --- | --- | --- |
| 3.x | 역할별 대시보드 실데이터 / 문구 / 회귀 / demo metrics 봉인 | 완료·봉인 |
| 4.0~4.7 | 배포 전 운영 점검 / QA closure / AI 자동 반영 설계 | 완료·잠김 |
| 5.0 | AI Evidence Assistant MVP 착수 기준 | 이번 문서 |
| 5.1 | MVP 1차 구현 세트 | 다음 후보 |
| 5.2 이후 | Draft 저장, 승인, diff, 감사로그 등 고도화 | 후속 Phase |

## 3. 3.x 봉인 유지 원칙

대시보드 3.x는 계속 봉인 상태를 유지한다.

- `DASHBOARD_3_11_FINAL_SEAL_SUMMARY.md` §12~13을 최종 기준으로 본다.
- `#evidence-20260426-391`을 대시보드 3.x 최종 봉인 증빙으로 본다.
- 대시보드 3.x 기능 확장을 하지 않는다.
- 3.x에서 닫은 metric, badge, 문구, demo metrics 경계를 재오픈하지 않는다.
- AI Evidence Assistant 기능은 3.x를 수정하는 기능이 아니다.
- AI Evidence Assistant 기능은 4.x 이후 운영 보조 Phase로 분리한다.

## 4. QA closure 미기입 유지 원칙

QA 실측 전문 수신 전까지 아래 항목은 계속 미기입 상태로 유지한다.

- `#evidence-20260428-predeploy-qa-closure`의 공식 확정 표
- QA 회신 원문
- QA 최종 통과 판정
- 배포 가능 최종 판정

대시보드 5.0 또는 5.1이 존재하더라도, 실측 전문이 없으면 AI는 closure 초안을 만들지 않는다.

## 5. MVP 핵심 목표

대시보드 5.0에서 정의하는 MVP의 목표는 아래와 같다.

```txt
관리자가 QA/운영 실측 결과 원문을 붙여넣으면,
AI가 이를 분석하여
1. PASS / FAIL / BLOCKED / N/A / 보완 필요 항목을 분류하고,
2. #evidence-20260428-predeploy-qa-closure에 들어갈 공식 확정 표 초안을 만들고,
3. 회신 원문 정리본을 만들고,
4. DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md 기준의 후속 보완 항목 초안을 만든다.

단, 사람 승인 전에는 어떤 공식 문서도 자동 수정하지 않는다.
```

## 6. MVP에서 만들 기능

5.1에서 구현할 MVP 기능 후보는 아래로 고정한다.

| 기능 | 포함 여부 | 설명 |
| --- | --- | --- |
| 관리자 QA Evidence Assistant 화면 | 포함 | QA 원문 입력 및 분석 결과 확인 |
| QA 원문 붙여넣기 | 포함 | 자유 형식 원문 입력 |
| 메타 필드 입력 | 포함 | 수행 일시, 담당자, 테스트 URL, 계정 역할 |
| AI 분석 실행 | 포함 | 원문 분석 요청 |
| 필수 필드 누락 경고 | 포함 | 수행 일시, 담당자, URL 등 누락 표시 |
| PASS / FAIL / BLOCKED / N/A 분류 | 포함 | 분석 결과 표시 |
| closure 공식 확정 표 초안 | 포함 | Markdown 표 생성 |
| 회신 원문 정리본 | 포함 | 원문 보존 + 구조화 요약 |
| 4.6 follow-up tracker 초안 | 포함 | FAIL / BLOCKED / N/A 분리 |
| 복사 버튼 | 포함 | 초안 Markdown 복사 |
| 사람 승인 안내 | 포함 | 자동 반영 금지 안내 |
| DB 저장 | 제외 | 5.1 MVP에서는 제외 |
| 문서 자동 수정 | 제외 | 5.1 MVP에서는 제외 |
| Git commit 자동 생성 | 제외 | 제외 |
| 배포 가능 자동 판정 | 제외 | 제외 |

## 7. MVP에서 하지 않을 것

5.0 / 5.1 범위에서는 아래를 하지 않는다.

- DB schema 변경
- Prisma model 추가
- IMPLEMENTATION_EVIDENCE.md 자동 수정
- DASHBOARD_4_6_QA_PENDING_FOLLOWUP_TRACKER.md 자동 수정
- Git commit 자동 생성
- PR 자동 생성
- 배포 가능 자동 판정
- QA 최종 통과 자동 판정
- FAIL 항목의 자동 PASS 전환
- BLOCKED 항목의 자동 해소
- 대시보드 3.x 재오픈
- 기존 dashboard metric 변경
- badge 계산 변경
- 권한 정책 변경
- middleware 변경

## 8. 권장 MVP 동작 흐름

관리자 화면 기준 동작 흐름은 아래와 같다.

1. 관리자가 /admin/qa-evidence에 접속한다.
2. QA 수행 일시, QA 담당자, 테스트 환경 URL, 사용 계정 역할을 입력한다.
3. QA 회신 원문을 붙여넣는다.
4. “AI 분석 실행” 버튼을 누른다.
5. API가 입력값을 검증한다.
6. AI 또는 1차 규칙 기반 분석기가 원문을 분석한다.
7. PASS / FAIL / BLOCKED / N/A / 보완 필요 항목을 분류한다.
8. closure 공식 확정 표 초안을 생성한다.
9. 회신 원문 정리본을 생성한다.
10. 4.6 follow-up tracker 초안을 생성한다.
11. 관리자가 결과를 검토한다.
12. 관리자는 필요한 부분을 복사해 수동으로 문서에 반영한다.
13. 공식 반영 여부는 사람 승인으로 별도 처리한다.

## 9. 화면 구조

**화면명:** AI Evidence Assistant — QA Closure 반영 보조

**화면 구성:**

- 상단 안내 영역
- 메타 정보 입력 영역
- QA 원문 입력 영역
- AI 분석 실행 버튼
- 필수 항목 누락 경고 영역
- 분석 결과 요약 영역
- PASS / FAIL / BLOCKED / N/A 분류 영역
- closure 공식 확정 표 초안 영역
- 회신 원문 정리본 영역
- 4.6 follow-up tracker 초안 영역
- 복사 버튼 영역
- 사람 승인 전 자동 반영 금지 안내 영역

## 10. 입력 필드

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| qaPerformedAt | 필수 | QA 수행 일시 |
| qaOwner | 필수 | QA 담당자 또는 팀 |
| testEnvironmentUrl | 필수 | 스테이징 또는 테스트 환경 URL |
| accountRoles | 필수 | 의뢰인, 변호사, 관리자, 비로그인 등 |
| sourceText | 필수 | QA 회신 원문 |
| attachmentNotes | 선택 | 스크린샷, 로그, 첨부 메모 |
| operatorMemo | 선택 | 운영자 내부 메모 |

## 11. 출력 구조

API는 아래 구조를 반환한다.

```json
{
  "status": "NEEDS_REVIEW",
  "missingFields": [],
  "summary": {
    "passCount": 0,
    "failCount": 0,
    "blockedCount": 0,
    "naCount": 0,
    "needsFollowUpCount": 0
  },
  "classifications": [
    {
      "type": "PASS",
      "title": "",
      "evidence": "",
      "scope": "",
      "followUp": "없음"
    }
  ],
  "closureDraftMarkdown": "",
  "sourceRecordMarkdown": "",
  "followupTrackerDraftMarkdown": "",
  "warnings": []
}
```

## 12. 판정 타입

MVP에서 사용하는 판정 타입은 아래로 고정한다.

| 타입 | 의미 |
| --- | --- |
| PASS | 기대 결과와 실제 결과가 일치 |
| PASS_WITH_NOTES | 통과했으나 참고 메모 있음 |
| FAIL | 기대 결과와 실제 결과 불일치 |
| BLOCKED | 환경, 계정, URL 등 선행 조건 부족으로 수행 불가 |
| N_A | 해당 없음 또는 대상 없음 |
| NEEDS_FOLLOW_UP | 추가 회신 필요 |
| OUT_OF_SCOPE | 대시보드 범위 밖 |
| REOPEN_REQUIRED | 봉인 범위 재오픈 필요 가능성 |

## 13. 상태값

MVP의 분석 결과 상태값은 아래로 고정한다.

| 상태 | 의미 |
| --- | --- |
| DRAFT | 분석 전 또는 임시 입력 상태 |
| NEEDS_REVIEW | AI 분석 후 사람 검토 필요 |
| NEEDS_QA_REPLY | QA팀 추가 회신 필요 |
| READY_FOR_COPY | 사람이 복사해 문서 반영 가능 |
| BLOCKED | closure 확정 불가 |
| REJECTED | 사람이 반려 |

주의: 5.1 MVP에서는 DB 저장이 없으므로 상태값은 화면 내부 상태 또는 API 응답 상태로만 사용한다.

## 14. closure 공식 확정 표 초안 생성 기준

AI는 아래 Markdown 표를 초안으로 생성한다.

```markdown
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
```

**결과 칸 작성 기준:**

- PASS
- PASS WITH NOTES
- FAIL
- BLOCKED
- N/A
- NEEDS FOLLOW-UP

**후속 칸 작성 기준:**

- 없음
- 문서 보완
- 기능 보완
- 운영 확인
- 재QA
- 별도 Phase 분리
- closure 보류

## 15. 회신 원문 정리본 생성 기준

AI는 회신 원문 정리본을 아래 형식으로 생성한다.

```markdown
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
```

- 원문은 가능한 그대로 보존한다.
- AI가 원문을 임의로 바꾸지 않는다.
- 요약은 원문과 분리한다.

## 16. 4.6 follow-up tracker 초안 생성 기준

AI는 FAIL / BLOCKED / N/A / NEEDS FOLLOW-UP 항목을 아래 표로 분리한다.

| 항목 ID | 유형 | 원문 근거 | 영향 범위 | 권장 후속 | closure 영향 | 담당 | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | FAIL / BLOCKED / N/A / NEEDS FOLLOW-UP |  |  |  | closure 보류 / 참고 / 무관 |  | 후보 |

**분리 기준:**

- FAIL: closure 보류
- 미해소 BLOCKED: closure 보류
- NEEDS FOLLOW-UP: closure 보류
- N/A: 사람 검토
- OUT_OF_SCOPE: 별도 Phase
- REOPEN_REQUIRED: 별도 Phase 또는 운영자 검토

## 17. 필수 필드 누락 처리

필수 필드가 누락되면 AI는 closure 초안을 확정 가능 상태로 만들지 않는다.

| 누락 항목 | 처리 |
| --- | --- |
| QA 수행 일시 없음 | NEEDS_QA_REPLY |
| QA 담당자 없음 | NEEDS_QA_REPLY |
| 테스트 환경 URL 없음 | NEEDS_QA_REPLY |
| 사용 계정 역할 없음 | NEEDS_QA_REPLY |
| QA 원문 없음 | 분석 중단 |
| FAIL 항목 없음 명시 누락 | NEEDS_REVIEW |
| BLOCKED 항목 없음 명시 누락 | NEEDS_REVIEW |

## 18. 경고 메시지 기준

화면에는 아래 경고를 표시한다.

- AI 분석 결과는 공식 확정이 아닙니다.
- 공식 증빙 반영과 배포 가능 판정은 사람 승인 후에만 가능합니다.

**FAIL 또는 BLOCKED가 있는 경우:**

- FAIL 또는 미해소 BLOCKED 항목이 있어 closure 확정은 보류되어야 합니다.

**필수 필드가 누락된 경우:**

- QA 수행 일시, 담당자, 테스트 환경 URL, 사용 계정 역할 중 누락된 항목이 있습니다.
- 추가 회신을 요청한 뒤 다시 분석해야 합니다.

## 19. 파일 구조 후보

5.1 구현 시 파일 구조는 아래를 1차 후보로 한다.

- `src/app/admin/qa-evidence/page.tsx`
- `src/components/admin/qa-evidence/qa-evidence-assistant-client.tsx`
- `src/app/api/admin/qa-evidence/analyze/route.ts`
- `src/lib/qa-evidence/qa-evidence-schema.ts`
- `src/lib/qa-evidence/qa-evidence-analyzer.ts`
- `src/lib/qa-evidence/qa-evidence-renderer.ts`

| 파일 | 역할 |
| --- | --- |
| page.tsx | 관리자 페이지 진입점 |
| qa-evidence-assistant-client.tsx | 입력 폼, 분석 버튼, 결과 표시, 복사 버튼 |
| route.ts | 입력 검증, 분석 실행, JSON 반환 |
| qa-evidence-schema.ts | 입력 / 출력 Zod schema |
| qa-evidence-analyzer.ts | PASS / FAIL / BLOCKED / N/A 분류 |
| qa-evidence-renderer.ts | Markdown 초안 생성 |

## 20. API 후보

5.1 MVP에서는 아래 API 하나만 우선 검토한다.

| Method | Path | 목적 |
| --- | --- | --- |
| POST | /api/admin/qa-evidence/analyze | QA 원문 분석 및 Markdown 초안 생성 |

**요청 예시:**

```json
{
  "qaPerformedAt": "2026-04-29 14:00",
  "qaOwner": "운영 QA팀",
  "testEnvironmentUrl": "https://staging.example.com",
  "accountRoles": ["CLIENT", "LAWYER", "ADMIN"],
  "sourceText": "QA 회신 원문...",
  "attachmentNotes": "",
  "operatorMemo": ""
}
```

**응답 예시:**

```json
{
  "status": "NEEDS_REVIEW",
  "missingFields": [],
  "summary": {
    "passCount": 3,
    "failCount": 0,
    "blockedCount": 0,
    "naCount": 0,
    "needsFollowUpCount": 0
  },
  "classifications": [],
  "closureDraftMarkdown": "",
  "sourceRecordMarkdown": "",
  "followupTrackerDraftMarkdown": "",
  "warnings": []
}
```

## 21. 권한 기준

5.1 MVP의 접근 권한은 관리자 전용으로 한다.

- 의뢰인 접근 불가
- 변호사 접근 불가
- 비로그인 접근 불가
- 관리자 또는 운영 권한자만 접근 가능

기존 권한 정책이 정해져 있다면 그 기준을 따른다.  
5.0에서는 권한 정책을 변경하지 않는다.

## 22. 보안 기준

- QA 원문에 개인정보가 포함될 수 있으므로 화면 노출 범위를 제한한다.
- 원문과 AI 요약을 구분한다.
- AI가 개인정보를 임의로 확장하거나 추론하지 않는다.
- 첨부 메모는 필요 최소한만 입력한다.
- MVP에서는 서버 저장을 하지 않는 방향을 우선한다.
- 저장이 필요해지면 5.2 이후 별도 Phase로 분리한다.

## 23. MVP 성공 기준

5.1 구현이 성공했다고 볼 기준은 아래와 같다.

- 관리자 화면에 접속할 수 있다.
- QA 원문과 메타 정보를 입력할 수 있다.
- 분석 API를 호출할 수 있다.
- PASS / FAIL / BLOCKED / N/A 분류 결과를 볼 수 있다.
- closure 공식 확정 표 초안을 볼 수 있다.
- 회신 원문 정리본을 볼 수 있다.
- 4.6 follow-up tracker 초안을 볼 수 있다.
- 각 Markdown 초안을 복사할 수 있다.
- 공식 반영은 사람 승인 전 자동으로 이루어지지 않는다.

## 24. 검증 명령

문서 중심 작업이므로 기존 기준선 확인을 유지한다.

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

## 25. 완료 판정

아래가 충족되면 대시보드 5.0을 완료로 본다.

- DASHBOARD_5_0_AI_EVIDENCE_ASSISTANT_MVP_START.md 신규 추가
- MVP 목적 정리 완료
- MVP 포함 기능 정리 완료
- MVP 제외 기능 정리 완료
- 관리자 화면 동작 흐름 정리 완료
- 입력 필드 정리 완료
- 출력 구조 정리 완료
- 판정 타입 정리 완료
- 상태값 정리 완료
- closure 공식 확정 표 초안 생성 기준 정리 완료
- 회신 원문 정리본 생성 기준 정리 완료
- 4.6 follow-up tracker 초안 생성 기준 정리 완료
- 필수 필드 누락 처리 기준 정리 완료
- 경고 메시지 기준 정리 완료
- 파일 구조 후보 정리 완료
- API 후보 정리 완료
- 권한 / 보안 기준 정리 완료
- MVP 성공 기준 정리 완료
- 3.x 봉인 유지
- QA closure 미기입 유지
- 신규 API / DB / 코드 기능 변경 없음
- 검증 명령 통과

## 26. 다음 후보

5.0 이후 다음 후보는 아래와 같다.

1. 대시보드 5.1 — AI Evidence Assistant MVP 1차 구현 세트
2. 대시보드 5.1a — Zod schema / renderer / analyzer 유틸 선행 구현
3. 대시보드 5.2 — 분석 결과 Draft 저장 구조 설계
