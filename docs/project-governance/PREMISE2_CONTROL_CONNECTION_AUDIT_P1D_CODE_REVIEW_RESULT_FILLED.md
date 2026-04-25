# P1-D 실제 코드 역점검 결과 실기입본

| 항목 | 내용 |
|------|------|
| 범위 | **P1-D 한 건만** — `HOLD` → `REJECTED` |
| 기준 절차 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) §6 |
| 본 실기입 증빙 | [EVIDENCE-20260421-201] |

---

## 0. 요지

**한 줄:** `CASE_TRANSITIONS`의 **`REJECT_CASE` 출발 상태에 `HOLD`가 없어** `HOLD` → `REJECTED` **직접 전이는 정의되지 않았고**, UI·가드도 **`HOLD`에서「사건 반려」를 노출하지 않으며**, API는 **`evaluateCaseTransition` 불일치로 거부**된다. `case-status-definition` 의 **`HOLD.next`에도 `REJECTED`가 없어** 문서·구현이 **같은 방향으로 막혀 있다**.

**상위 판정:** [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§9-1** — **미해소 유지** (합의·OPEN 잔여와 별도로 본 행은 **코드상 일관 차단**).

---

## 1. 공통 헤더

**검증 명령** *(본 증빙 [201] 제출 시)*

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

**검증 결과**

- 위 3종 **exit 0**

---

## 2. P1-D — `HOLD` → `REJECTED` (실기입)

**상위 판정**

- 고정 판정: **미해소**
- 기존 분류: 정책 합의 필요 + `REJECT_CASE` from-state 역점검 필요

**확인 파일**

| 구분 | 경로 |
|------|------|
| 서버 | `src/lib/definitions/case-lifecycle.ts`, `src/lib/case-transition.ts`, `src/lib/cases/apply-case-status-transition.ts` |
| API | `src/app/api/cases/[caseId]/status/route.ts` |
| UI | `src/lib/case-action-guard.ts`, `src/components/cases/case-status-actions.tsx`, `src/components/cases/case-detail-client.tsx` |
| 운영·감사 | `apply-case-status-transition.ts` — 성공 시 `CASE_STATUS_CHANGED` · `metaJson` 에 `reason` |

**확인 지점**

| 구분 | 내용 |
|------|------|
| 서버 | **`REJECT_CASE` 규칙 `from`:** `CREATED`, `INTAKE_PENDING`, `IN_INTERVIEW`, `INTERVIEW_DONE`, `DRAFTING`, `REVIEW_PENDING` **만** — **`HOLD` 없음** → **`HOLD` → `REJECTED` 행 없음**. |
| API | `PATCH .../status` + `REJECT_CASE` → `checkCaseTransitionOrThrow` → **`HOLD`이면 매칭 규칙 없음** → `evaluateCaseTransition` **실패** (`ValidationError`, 메시지: 허용되지 않은 상태 전이). |
| UI | `getAllowedCaseActions.REJECT_CASE`: **`HOLD` 미포함** → **`HOLD`일 때「사건 반려」비노출**. `RESUME_FROM_HOLD` 만 보류 전용. |
| 운영·감사 | **허용 출발 상태에서 `REJECT_CASE` 성공 시** 타임라인 **`CASE_STATUS_CHANGED`**, `metaJson`에 `action`, `from`, `to`, **`reason`**. **`HOLD`→`REJECT` 경로는 성립하지 않아** 해당 조합의 이력은 **생성되지 않음**. `writeAuditLog`는 본 경로 **미호출**(P1-C와 동일 패턴). |

**4축 결과**

| 축 | 결과 |
|----|------|
| UI | ☑ `HOLD` 에서 거절 액션 **비노출** |
| API | ☑ `HOLD` + `REJECT_CASE` **서버 검증 실패** |
| 서버 | ☑ 전이 테이블에 **`HOLD` 출발 `REJECT_CASE` 없음** |
| 운영·감사 | ☑ (허용 상태 기준) 거절 성공 시 **사유·전이 타임라인** · `HOLD`→`REJECT` **해당 없음** |

**임시 판정** *(선택지)*

- [ ] 정책상 허용 + 구현 있음
- [x] **정책상 금지 + 구현 차단** — 테이블·가드·API **일치**
- [ ] 정책 미합의 *(문서 `HOLD.next`에도 `REJECTED` 없음 — **운영에서 보류 후 반려를 원하면 별도 합의·구현**)*
- [ ] 구현 공백
- [ ] 추가 확인 필요 *(선택: 제품이 **보류 중 반려**를 허용할지 정책 합의)*

**결과 한 줄**

`HOLD` → `REJECTED` 는 **`CASE_TRANSITIONS`·UI 가드·상태 정의서 `HOLD.next` 어디에도 직접 경로가 없고**, 호출 시 **API·UI 모두 차단**된다.

**상세 메모**

- `REJECT_CASE` from-state 목록: **위 6개만** (`case-lifecycle.ts` · `case-action-guard.ts` **동일 집합**).
- `HOLD` 상태 UI: **반려 버튼 없음** · **보류 해제**만 별도 노출.
- 거절 이력: **`REVIEW_PENDING` 등 허용 상태**에서만 타임라인 기록 가능.

---

## 3. 요약표 (P1-D만)

| 행 | UI | API | 서버 | 운영·감사 | 임시 판정 | 결과 한 줄 |
| --- | --- | --- | --- | --- | --- | --- |
| P1-D | ☑ | ☑ | ☑ | ☑ | 정책 금지+구현 차단 | `HOLD` 출발 `REJECT_CASE` 없음·일관 차단 |

---

## 4. 증빙 블록용 축약본

**수정 파일:** 본 파일 · `PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md` §5 · `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260421-201]**

**다음 작업:** OPEN·DENY 역점검 또는 **보류 후 반려** 제품 정책이 필요하면 **전이·UI·문서** 동시 설계.
