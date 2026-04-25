# P1-B 실제 코드 역점검 결과 실기입본

| 항목 | 내용 |
|------|------|
| 범위 | **P1-B 한 건만** — `REVIEW_PENDING` → `DRAFTING` |
| 기준 절차 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) §4 |
| 본 실기입 증빙 | [EVIDENCE-20260421-199] |

---

## 0. 요지

**한 줄:** `CASE_TRANSITIONS`에는 **`REVIEW_PENDING` → `DRAFTING` 직접 규칙이 없고**, 표준 전이는 **`DRAFTING` → `REVIEW_PENDING`**(`REQUEST_REVIEW`)만 있다. 다만 **`POST /api/cases/[caseId]/documents/generate`** 는 사건 상태를 **`DRAFTING`으로 직접 갱신**하며, **현재 사건이 `REVIEW_PENDING`이어도**(종료·반려·삭제만 제외) 호출 가능해 **문서 API 경로로 `DRAFTING`에 복귀**할 수 있다. UI는 **진행 액션**「문서 초안 생성」은 **`INTERVIEW_DONE`에서만** 노출되고, **문서 목록**「문서 생성」은 **`REVIEW_PENDING`에서도** 열려 **전이 액션과 문서 진입이 분리**된다.

**상위 판정:** [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§9-1** — **미해소 유지** (본 실기입으로 임의 상향 없음).

---

## 1. 공통 헤더

**작업명:** P1-B 실제 코드 역점검 결과 기록 (실기입본)

**기준 증빙**

- 선행: **[EVIDENCE-20260421-198]** · **[EVIDENCE-20260421-194]**

**검증 명령** *(본 증빙 [199] 제출 시)*

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

**검증 결과**

- `npx tsc --noEmit`: exit 0  
- `npm run lint`: exit 0  
- `npm run verify:canonical-sources`: exit 0  

---

## 2. P1-B — `REVIEW_PENDING` → `DRAFTING` (실기입)

**상위 판정**

- 고정 판정: **미해소**
- 기존 분류: 전이 vs 문서 API 합의 필요

**확인 파일**

| 구분 | 경로 |
|------|------|
| 서버 | `src/lib/definitions/case-lifecycle.ts` (`CASE_TRANSITIONS`) |
| API | `src/app/api/cases/[caseId]/documents/generate/route.ts` |
| UI | `src/lib/case-action-guard.ts`, `src/components/cases/case-status-actions.tsx`, `src/components/cases/case-detail-client.tsx`, `src/components/cases/document-create-modal.tsx` |
| 운영·감사 | 동일 라우트 내 `caseTimelineEvent` (`DOCUMENT_DRAFT_CREATED`) |

**확인 지점**

| 구분 | 내용 |
|------|------|
| 서버 | `CASE_TRANSITIONS`에 **`from: ["REVIEW_PENDING"], to: "DRAFTING"` 규칙 없음**. `GENERATE_DRAFT` 규칙은 **`from: ["INTERVIEW_DONE"]`, `to: "DRAFTING"`** 만 존재. `REQUEST_REVIEW`는 **`DRAFTING` → `REVIEW_PENDING`**. |
| API | `POST .../documents/generate` 는 인터뷰 `COMPLETED` 등 검증 후 **`tx.case.update({ status: "DRAFTING" })`** — **`applyCaseStatusTransition` 미사용**. 사건 상태가 `REVIEW_PENDING`인지 **거부하지 않음**(차단은 `DELETED`/`REJECTED`/`CLOSED` 수준). |
| UI | `getAllowedCaseActions`: **`GENERATE_DRAFT`** 는 **`caseStatus === "INTERVIEW_DONE"`** 일 때만 true → 진행 액션「문서 초안 생성」은 검토 대기 단계에서는 **숨김**. `case-detail-client`: **`cannotCreateDocument`** 는 `CLOSED`/`REJECTED`/`DELETED` 만 → **`REVIEW_PENDING`에서도** 문서 목록「문서 생성」**활성**. 모달은 동일 `POST .../generate` 호출. |
| 운영·감사 | 초안 생성 시 타임라인 **`DOCUMENT_DRAFT_CREATED`** 기록. |

**4축 결과**

| 축 | 결과 |
|----|------|
| UI | ☑ `REVIEW_PENDING` 에서 **검토 안내·허브** 및 **문서 생성** 버튼 노출(진행 액션의 초안 생성 버튼은 비노출) |
| API | ☑ 문서 생성 라우트가 **상태를 `DRAFTING`으로 갱신**하며, **`REVIEW_PENDING`에서의 호출을 막지 않음** |
| 서버 | ☑ 전이 테이블에 **해당 직접 전이 없음** + generate **직접 `case.update`** |
| 운영·감사 | ☑ 타임라인 이벤트 존재 · **전이 번호와 1:1은 아님** |

**임시 판정**

- [ ] 실제 상태 전이 *(라이프사이클 액션 테이블로는 **미정의**)*
- [ ] 문서 API 흐름만
- [x] **혼합 구조** *(표는 `DRAFTING`→`REVIEW_PENDING` 단방향, 문서 생성 API는 `DRAFTING` 복귀를 **별 경로**로 수행 가능)*
- [x] **추가 확인 필요** *(「검토 대기에서 추가 초안 생성」이 **제품 의도**인지·API 가드 보강 필요인지 합의)*
- [ ] 구현 공백 *(코드는 **명시적으로** 존재 — 공백이라기보다 **정합·의도 합의** 과제)*

**결과 한 줄**

`REVIEW_PENDING` → `DRAFTING` 은 **`CASE_TRANSITIONS`에 없고**, **`POST .../documents/generate` 의 직접 `case.update`로만** 사건이 다시 `DRAFTING`이 될 수 있으며, UI는 **진행 액션과 문서 목록 버튼이 다른 전제**를 둔다.

**상세 메모**

- 문서 생성 API 존재: **있음** (`documents/generate/route.ts`).
- 상태 변경 동반: **있음** — 문서 생성 트랜잭션 끝에 **항상** `DRAFTING`.
- UI 명칭: 「문서 초안 생성」= 진행 액션(`INTERVIEW_DONE`만) · 「문서 생성」= 목록(종료·반려·삭제만 차단) — **동작 전제가 다름**.
- 작성 진입 vs 전이: **분리됨**(가드 기준 불일치 가능).

---

## 3. 요약표 (P1-B만)

| 행 | UI | API | 서버 | 운영·감사 | 임시 판정 | 결과 한 줄 |
| --- | --- | --- | --- | --- | --- | --- |
| P1-B | ☑ | ☑ | ☑ | ☑ | 혼합 + 추가 확인 | 표 전이 없음·문서 API로 DRAFTING 복귀 가능·UI 이중 경로 |

---

## 4. 증빙 블록용 축약본 (복사용)

**작업 목적:** P1-B 실제 코드 역점검 결과를 4축으로 기록.

**수정 파일:** 본 파일 · `PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md` §3 · `IMPLEMENTATION_EVIDENCE.md` **[EVIDENCE-20260421-199]**

**근거 메모:** §9-1 미해소 유지 · 전제 2 자동 상향 없음.

**다음 작업:** P1-C 역점검 또는 `documents/generate` 의 사건 상태 **사전 조건**(예: `REVIEW_PENDING`에서의 재생성 허용 여부) **합의·가드**.
