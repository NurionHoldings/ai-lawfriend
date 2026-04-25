# P1-A~D 실제 코드 역점검 결과 기록 템플릿

| 항목 | 내용 |
|------|------|
| 기준 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) 실행 후 기록용 |
| 목적 | P1-A~D 4건에 대해 실제 저장소 확인 결과를 **증빙 가능한 형태**로 남기기 위한 템플릿 |
| 본 템플릿 증빙 | [EVIDENCE-20260421-194] |
| P1-A 기입 예시 초안 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md) — [EVIDENCE-20260421-195] |
| P1-A 실기입 점검 순서 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md) — [EVIDENCE-20260421-196] |
| P1-B 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-199] |
| P1-C 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-200] |
| P1-D 역점검 결과 실기입본 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-201] |

---

## 0. 기록 원칙

- 이 문서(복사본)는 **실제 코드 역점검 결과**를 남기는 용도이다.
- **추정·느낌·가정**으로 쓰지 않는다.
- 반드시 **확인한 파일 경로** / **확인 지점** / **판정** / **메모**를 남긴다.
- 상위 판정표의 **미해소**를 **임의로 바꾸지 않는다.**
- 이 템플릿을 채웠다고 해서 **전제 2가 자동 상향되지는 않는다.**

---

## 1. 공통 헤더

**작업명:** P1-A~D 실제 코드 역점검 결과 기록

**기준 증빙**

- 최신 기준: `[EVIDENCE-YYYYMMDD-00n]` *(실행 시 채움)*

**관련 문서**

- [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md)
- [PREMISE2_CONTROL_CONNECTION_AUDIT_CODE_REVIEW_PRIORITY.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_CODE_REVIEW_PRIORITY.md)
- [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md)
- [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §9-1

**검증 명령**

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

**검증 결과** *(실행 시 기록)*

- `npx tsc --noEmit`:
- `npm run lint`:
- `npm run verify:canonical-sources`:

---

## 2. P1-A 결과 기록 템플릿

**P1-A — `CREATED` → `INTAKE_PENDING`**

**상위 판정**

- 고정 판정: **미해소**
- 기존 분류: 구현 공백 유지 + 문서 축 COND / 비전이 후보

**확인 파일**

| 구분 | 경로·이름 |
|------|-----------|
| 서버 | |
| API | |
| UI | |
| 운영·감사 | |

**확인 지점**

| 구분 | 함수·라우트·컴포넌트 등 |
|------|-------------------------|
| 서버 | |
| API | |
| UI | |
| 운영·감사 | |

**4축 결과** *(하나만 선택)*

| 축 | ☐ 근거 미입증 · ☑ 근거 확인 · — 직접 관련 약함 |
|----|------------------------------------------------|
| UI | |
| API | |
| 서버 | |
| 운영·감사 | |

**임시 판정** *(해당 항목에 표시)*

- [ ] 실제 전이
- [ ] 조건 흐름
- [ ] 비전이 처리
- [ ] 구현 공백
- [ ] 추가 확인 필요

**결과 한 줄**

*(한 줄)*

**상세 메모**

- 전이 테이블 존재/부재:
- 생성 후 후속 절차 여부:
- API 직접 호출 여부:
- UI 오해 가능 문구 여부:
- 운영 추적 필요 여부:

---

## 3. P1-B 결과 기록 템플릿

**P1-B — `REVIEW_PENDING` → `DRAFTING`**

**실기입본(전문):** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1B_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-199]

**상위 판정**

- 고정 판정: **미해소**
- 기존 분류: 전이 vs 문서 API 합의 필요

**확인 파일**

| 구분 | 경로·이름 |
|------|-----------|
| 서버 | `src/lib/definitions/case-lifecycle.ts` |
| API | `src/app/api/cases/[caseId]/documents/generate/route.ts` |
| UI | `src/lib/case-action-guard.ts`, `src/components/cases/case-status-actions.tsx`, `src/components/cases/case-detail-client.tsx`, `src/components/cases/document-create-modal.tsx` |
| 운영·감사 | 동일 generate 라우트 `caseTimelineEvent` (`DOCUMENT_DRAFT_CREATED`) |

**확인 지점**

| 구분 | 함수·라우트·컴포넌트 등 |
|------|-------------------------|
| 서버 | `CASE_TRANSITIONS`: `GENERATE_DRAFT` 는 `INTERVIEW_DONE`→`DRAFTING` 만. `REVIEW_PENDING`→`DRAFTING` **규칙 없음**. `REQUEST_REVIEW`: `DRAFTING`→`REVIEW_PENDING`. |
| API | `POST .../documents/generate`: 트랜잭션 내 `case.update({ status: "DRAFTING" })`, `applyCaseStatusTransition` **미사용**. `REVIEW_PENDING` **미차단**(종료·반려·삭제 등만 400). |
| UI | `getAllowedCaseActions.GENERATE_DRAFT`: **`INTERVIEW_DONE`만**. `cannotCreateDocument`: `CLOSED`/`REJECTED`/`DELETED`만 → **`REVIEW_PENDING`에서도** 목록「문서 생성」가능. |
| 운영·감사 | 초안 생성 시 타임라인 기록. |

**4축 결과**

| 축 | ☐ / ☑ / — |
|----|------------|
| UI | ☑ |
| API | ☑ |
| 서버 | ☑ |
| 운영·감사 | ☑ |

**임시 판정**

- [ ] 실제 상태 전이
- [ ] 문서 API 흐름
- [x] 혼합 구조
- [ ] 구현 공백
- [x] 추가 확인 필요

**결과 한 줄**

`REVIEW_PENDING` → `DRAFTING` 은 **`CASE_TRANSITIONS`에 없고**, **`POST .../documents/generate`의 직접 `case.update`로만** 사건이 다시 `DRAFTING`이 될 수 있으며, UI는 진행 액션「문서 초안 생성」(`INTERVIEW_DONE`만)과 목록「문서 생성」(종료·반려·삭제만 차단)의 **전제가 다르다**.

**상세 메모**

- 문서 생성 API 존재 여부: **있음**
- 상태 변경 호출 동반 여부: **있음** — 생성 시 **항상** `DRAFTING`
- UI 액션 명칭과 실제 동작 일치 여부: **부분** — 같은 API를 두 UI 경로가 호출하나 **노출 조건이 다름**
- 문서 작성 진입과 상태 전이 분리 여부: **분리**(가드 불일치·합의 필요)
- 운영 통제선 필요 여부: 타임라인 있음 · **전이표와 1:1 아님**

---

## 4. P1-C 결과 기록 템플릿

**P1-C — `APPROVED` → `CLOSED`**

**실기입본(전문):** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-200]

**상위 판정**

- 고정 판정: **미해소**
- 기존 분류: 문서 허용 표현 vs 실제 종료 액션 분리 필요

**확인 파일**

| 구분 | 경로·이름 |
|------|-----------|
| 서버 | `src/lib/definitions/case-lifecycle.ts`, `src/lib/case-transition.ts`, `src/lib/cases/apply-case-status-transition.ts` |
| API | `src/app/api/cases/[caseId]/status/route.ts` |
| UI | `src/lib/case-action-guard.ts`, `src/components/cases/case-status-actions.tsx` |
| 운영·감사 | `apply-case-status-transition.ts` — `caseTimelineEvent` (`CASE_STATUS_CHANGED`) |

**확인 지점**

| 구분 | 함수·라우트·컴포넌트 등 |
|------|-------------------------|
| 서버 | `CLOSE_CASE` 는 **`DELIVERED`→`CLOSED`만**. `APPROVED`→`CLOSED` **직접 규칙 없음**. |
| API | `applyCaseStatusTransition` + `evaluateCaseTransition` — **`APPROVED`+`CLOSE_CASE` 불일치** |
| UI | `CLOSE_CASE`: **`caseStatus === "DELIVERED"`** + ADMIN/LAWYER — **`APPROVED`에서는 종결 버튼 없음** |
| 운영·감사 | 타임라인 `CASE_STATUS_CHANGED` · **`writeAuditLog` 본 경로 없음** |

**4축 결과**

| 축 | ☐ / ☑ / — |
|----|------------|
| UI | ☑ |
| API | ☑ |
| 서버 | ☑ |
| 운영·감사 | ☑ |

**임시 판정**

- [x] 명시 종료 액션 존재
- [ ] 자동 종료로 처리
- [ ] 문서 표현만 존재
- [ ] 구현 공백
- [x] 추가 확인 필요

**결과 한 줄**

`APPROVED` → `CLOSED` 는 **전이 테이블에 없고**, 종료는 **`CLOSE_CASE`로 `DELIVERED` → `CLOSED`만** 구현·UI 노출된다.

**상세 메모**

- 종료 route/service 존재 여부: **있음** (`PATCH .../status`, `CLOSE_CASE`)
- 승인 상태 요구 여부: **종료는 `APPROVED`가 아니라 `DELIVERED` 요구**
- 감사 흔적 존재 여부: **타임라인 예** · **별도 감사 로그는 본 경로 미호출**
- 종료 책임 주체 확인 여부: ADMIN/LAWYER (`allowedRoles` + `canApprove`)
- 문서 표현과 실제 동작 일치 여부: **`case-status-definition` `APPROVED.next`에 `CLOSED` 있음 — 라이프사이클과 불일치** ([200] 추가 확인)

---

## 5. P1-D 결과 기록 템플릿

**P1-D — `HOLD` → `REJECTED`**

**실기입본(전문):** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1D_CODE_REVIEW_RESULT_FILLED.md) — [EVIDENCE-20260421-201]

**상위 판정**

- 고정 판정: **미해소**
- 기존 분류: 정책 합의 필요 + `REJECT_CASE` from-state 역점검 필요

**확인 파일**

| 구분 | 경로·이름 |
|------|-----------|
| 서버 | `src/lib/definitions/case-lifecycle.ts`, `src/lib/case-transition.ts`, `src/lib/cases/apply-case-status-transition.ts` |
| API | `src/app/api/cases/[caseId]/status/route.ts` |
| UI | `src/lib/case-action-guard.ts`, `src/components/cases/case-status-actions.tsx` |
| 운영·감사 | `apply-case-status-transition.ts` — `CASE_STATUS_CHANGED` · `metaJson.reason` |

**확인 지점**

| 구분 | 함수·라우트·컴포넌트 등 |
|------|-------------------------|
| 서버 | `REJECT_CASE` 규칙 `from`에 **`HOLD` 없음** → **`HOLD`→`REJECTED` 행 없음** |
| API | `HOLD` + `REJECT_CASE` → `evaluateCaseTransition` **실패** |
| UI | `REJECT_CASE` 가드 목록에 **`HOLD` 없음** → **반려 버튼 비노출** |
| 운영·감사 | 허용 출발에서만 거절 성공 시 타임라인·사유 · **`HOLD`→`REJECT` 이력 없음** |

**4축 결과**

| 축 | ☐ / ☑ / — |
|----|------------|
| UI | ☑ |
| API | ☑ |
| 서버 | ☑ |
| 운영·감사 | ☑ |

**임시 판정**

- [ ] 정책상 허용 + 구현 있음
- [x] 정책상 금지 + 구현 차단
- [ ] 정책 미합의
- [ ] 구현 공백
- [ ] 추가 확인 필요

**결과 한 줄**

`HOLD` → `REJECTED` 는 **`REJECT_CASE` 출발 상태에 `HOLD`가 없어** 전이·UI·API **일관되게 차단**된다.

**상세 메모**

- `REJECT_CASE` from-state 목록: **6개** (`CREATED`·`INTAKE_PENDING`·`IN_INTERVIEW`·`INTERVIEW_DONE`·`DRAFTING`·`REVIEW_PENDING`) — **`HOLD` 제외**
- `HOLD` 상태 UI 액션 노출 여부: **반려 없음** · `RESUME_FROM_HOLD` 등만
- 거절 이력/사유 감사 가능 여부: **허용 상태에서 성공 시** 타임라인·`reason` · `metaJson`
- 정책 문서와 구현 일치 여부: **case-status-definition `HOLD.next`에 `REJECTED` 없음** — 전이표와 정합
- 운영 절차 충돌 여부: **보류 후 반려** 제품 요구 시 **별도 합의**

---

## 6. P1 4건 결과 요약표

| 행 | 서버 | API | UI | 운영·감사 | 임시 판정 | 결과 한 줄 |
| --- | --- | --- | --- | --- | --- | --- |
| P1-A | | | | | | |
| P1-B | | | | | | |
| P1-C | | | | | | |
| P1-D | | | | | | |

**표기 규칙**

- **☑** 확인됨  
- **☐** 미입증  
- **—** 직접 관련 약함  

---

## 7. 공통 판정 메모

**P1-A:**

**P1-B:**

**P1-C:**

**P1-D:**

**공통 해석**

- [ ] 상위 판정표와 충돌 없음
- [ ] 실제 코드 확인 결과 기준으로만 작성
- [ ] 전제 2 자동 상향 없음
- [ ] OPEN / DENY 후속 해석에 영향 줄 수 있는 항목 표시: *(있으면 기입)*

---

## 8. 증빙 블록용 축약본

*아래는 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)에 넣기 쉽게 줄여 쓸 때 사용한다.*

**작업 목적**

P1-A~D 4건에 대해 실제 코드 역점검을 수행하고 서버/API/UI/운영·감사 4축 기준으로 결과를 기록함.

**수정 파일**

*(없으면 `—`, 확인만 한 경우 확인 범위를 적음)*

**확인 범위**

- 서버:
- API:
- UI:
- 운영·감사:

**결과 요약**

- P1-A:
- P1-B:
- P1-C:
- P1-D:

**근거 메모**

- 상위 판정표 §9-1 유지
- 전제 2 상향 없음 / 또는 조건부 검토 여부:
- OPEN / DENY 연쇄 영향 여부:

**다음 작업**

---

## 9. 가장 짧은 기록 순서

**체크리스트 실행 → 파일/지점 기록 → 4축 표기(☐/☑/—) → 임시 판정 선택 → 한 줄 결과 작성 → 요약표 반영 → 증빙 블록 축약본 작성**

---

## 문서에 붙일 한 줄 결론

P1-A~D 실제 코드 역점검 결과 기록은 각 행의 **서버·API·UI·운영** 근거를 **증빙 가능한 형태**로 남겨, 전제 2 재판정 전에 **판단 근거를 고정**하는 단계다.
