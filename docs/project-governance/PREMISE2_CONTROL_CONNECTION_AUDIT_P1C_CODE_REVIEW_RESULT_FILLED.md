# P1-C 실제 코드 역점검 결과 실기입본

| 항목 | 내용 |
|------|------|
| 범위 | **P1-C 한 건만** — `APPROVED` → `CLOSED` (문서 엣지 vs 실제 종료 경로) |
| 기준 절차 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) §5 |
| 본 실기입 증빙 | [EVIDENCE-20260421-200] |

---

## 0. 요지

**한 줄:** `CASE_TRANSITIONS`에는 **`APPROVED` → `CLOSED` 직접 규칙이 없고**, 종료는 **`CLOSE_CASE`로 `DELIVERED` → `CLOSED`만** 정의·구현된다. UI·`case-action-guard`도 **「사건 종결」은 `DELIVERED`에서만** 노출된다. `case-status-definition.ts` 의 **`APPROVED.next`에 `CLOSED` 포함**은 **라이프사이클 테이블·API와 불일치**해 정합 과제로 남는다.

**상위 판정:** [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§9-1** — **미해소 유지**.

---

## 1. 공통 헤더

**검증 명령** *(본 증빙 [200] 제출 시)*

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

**검증 결과**

- 위 3종 **exit 0**

---

## 2. P1-C — `APPROVED` → `CLOSED` (실기입)

**상위 판정**

- 고정 판정: **미해소**
- 기존 분류: 문서 허용 표현 vs 실제 종료 액션 분리 필요

**확인 파일**

| 구분 | 경로 |
|------|------|
| 서버 | `src/lib/definitions/case-lifecycle.ts`, `src/lib/case-transition.ts`, `src/lib/cases/apply-case-status-transition.ts` |
| API | `src/app/api/cases/[caseId]/status/route.ts` → `applyCaseStatusTransition` |
| UI | `src/lib/case-action-guard.ts`, `src/components/cases/case-status-actions.tsx` |
| 운영·감사 | `apply-case-status-transition.ts` 내 `caseTimelineEvent` (`CASE_STATUS_CHANGED`) |

**확인 지점**

| 구분 | 내용 |
|------|------|
| 서버 | **`APPROVED` → `CLOSED` 규칙 행 없음**. `CLOSE_CASE` 는 **`from: ["DELIVERED"]`, `to: "CLOSED"`** 만. 앞선 축은 **`APPROVED` → `DELIVERED`** (`DELIVER_DOCUMENT`). |
| API | `PATCH .../status` 는 **`checkCaseTransitionOrThrow` → `evaluateCaseTransition`** — **`APPROVED` + `CLOSE_CASE`** 는 테이블 불일치로 **실패**. 직접 `status` 본문 **거부** (`src/app/api/cases/[caseId]/status/route.ts`). |
| UI | `CLOSE_CASE`: **`canApprove && caseStatus === "DELIVERED"`** — **승인(`APPROVED`) 단계에서는 종결 버튼 비노출**. 「사건 종결」은 **전달 완료 후**만. |
| 운영·감사 | 상태 변경 시 **`CaseTimelineEvent`** (`CASE_STATUS_CHANGED`, `metaJson` 에 action·from·to). **`writeAuditLog` 는 본 경로에서 호출하지 않음** — 감사는 **타임라인 중심**. |

**4축 결과**

| 축 | 결과 |
|----|------|
| UI | ☑ `DELIVERED` 에서만 종결 액션 노출 · `APPROVED` 에서는 비노출 |
| API | ☑ 전이 검증이 **테이블과 동일** · `APPROVED` 에서 `CLOSE_CASE` **불가** |
| 서버 | ☑ **`APPROVED`→`CLOSED` 직접 전이 없음** · `CLOSE_CASE` 는 **`DELIVERED`→`CLOSED`** |
| 운영·감사 | ☑ 타임라인 기록 / **별도 감사 로그 테이블(`writeAuditLog`)은 본 액션에 없음** |

**임시 판정** *(선택지)*

- [x] **명시 종료 액션 존재** — `CLOSE_CASE`, **`DELIVERED` → `CLOSED`**
- [ ] 자동 종료로 처리
- [ ] 문서 표현만 존재 *(구현은 명시 액션 있음; **정의서** `APPROVED.next` 의 `CLOSED` 는 표현·합의 잔여)*
- [ ] 구현 공백
- [x] **추가 확인 필요** — `case-status-definition.ts` **`APPROVED.next`** 와 **`CASE_TRANSITIONS`** 정합

**결과 한 줄**

`APPROVED` → `CLOSED` 는 **코드 전이로 존재하지 않고**, 종료는 **`DELIVERED` 경유 + `CLOSE_CASE`** 로만 열리며, UI도 **`DELIVERED`에서만**「사건 종결」을 준다.

**상세 메모**

- 종료 route: **`PATCH /api/cases/[caseId]/status`** + `action: "CLOSE_CASE"`.
- `APPROVED` 요구 여부: **종료 API는 `APPROVED`를 요구하지 않음** — 요구하는 것은 **`DELIVERED`** (직전 단계).
- 타임라인: **있음** · 감사 로그 **동일 트랜잭션 내 별도 기록 없음**.

---

## 3. 요약표 (P1-C만)

| 행 | UI | API | 서버 | 운영·감사 | 임시 판정 | 결과 한 줄 |
| --- | --- | --- | --- | --- | --- | --- |
| P1-C | ☑ | ☑ | ☑ | ☑ | 명시 종료 + 추가 확인 | 직접 `APPROVED`→`CLOSED` 없음·`DELIVERED`→`CLOSED`만 |

---

## 4. 증빙 블록용 축약본

**수정 파일:** 본 파일 · `PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md` §4 · `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260421-200]**

**다음 작업:** P1-D 역점검 또는 `case-status-definition` **`APPROVED.next`** 정리 합의.
