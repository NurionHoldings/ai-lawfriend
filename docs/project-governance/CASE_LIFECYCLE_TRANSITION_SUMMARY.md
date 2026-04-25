# 사건 상태 전이 요약표 (LIFECYCLE 연동 초안)

| 항목 | 내용 |
|------|------|
| 기준 문서 | [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) §5~§8, §11 |
| 점검표 | [PRACTICAL_STANDARD_CHECKLIST.md](./PRACTICAL_STANDARD_CHECKLIST.md) **§1-4-5** |
| status_key 순서 | [CASE_STATUS_SSOT_MATRIX.md](./CASE_STATUS_SSOT_MATRIX.md) 와 동일 (`case-status.ts` 선언 순) |
| 점검일 | 2026-04-21 (§8-4 본문·요약 반영 [181]) |

## 행 배치 규칙

1. **희소 엣지:** §5 **허용**·§6 **금지**에서 식별 가능한 `(from → to)` 만 기입. §7·§8은 §5·§6과 중복되면 별도 행을 늘리지 않고 `lifecycle_ref` 에만 병기할 수 있다.
2. **정렬:** `from_status` = SSOT 순 → 그룹 내 `to_status` = SSOT 순.
3. **미기재 엣지:** [§1-4-5](./PRACTICAL_STANDARD_CHECKLIST.md) — 표에 없다고 자동 허용으로 두지 않는다.

## `impl_ref` 기입 원칙 (본 1차)

- **실제 코드 경로가 확인된 경우에만** 기입한다.
- 주 경로는 `src/lib/definitions/case-lifecycle.ts` 의 `CASE_TRANSITIONS` 및 `PATCH /api/cases/[caseId]/status` → `applyCaseStatusTransition` → `checkCaseTransitionOrThrow` 이다.
- **논리 삭제**로 `DELETED` 가 되는 API는 라이프사이클 액션 테이블과 별도이면 해당 서비스·라우트를 적는다.

---

## §5 허용 전이 (초안) — 1차 기입

| from_status | to_status | kind | lifecycle_ref | §11_item | notes | impl_ref |
| ----------- | --------- | ---- | ------------- | -------- | ----- | -------- |
| `CREATED` | `INTAKE_PENDING` | ALLOW | §5 표 `CREATED` 행 | — | LIFECYCLE 초안 허용. 역할·트리거는 권한정의서·구현 별도. | — |
| `CREATED` | `IN_INTERVIEW` | ALLOW | §5·§4 주경로 | — | 초안 허용. | `case-lifecycle.ts` — `START_INTERVIEW` |
| `CREATED` | `HOLD` | ALLOW | §5·§7-1 | — | 초안 허용. 사유 필요 등은 구현 `PUT_ON_HOLD` 요건 참고. | `case-lifecycle.ts` — `PUT_ON_HOLD` |
| `CREATED` | `REJECTED` | ALLOW | §5·§7-2 | — | 초안 허용. | `case-lifecycle.ts` — `REJECT_CASE` |
| `CREATED` | `DELETED` | ALLOW | §5·§7-3 | — | 초안 허용. 일반 흐름에서 제외 목적. | `case.service.ts` `softDeleteCaseService` · `DELETE` `api/cases/[caseId]/route.ts` |
| `INTAKE_PENDING` | `IN_INTERVIEW` | ALLOW | §5 | — | | `case-lifecycle.ts` — `START_INTERVIEW` |
| `INTAKE_PENDING` | `HOLD` | ALLOW | §5·§7-1 | — | | `case-lifecycle.ts` — `PUT_ON_HOLD` |
| `INTAKE_PENDING` | `REJECTED` | ALLOW | §5·§7-2 | — | | `case-lifecycle.ts` — `REJECT_CASE` |
| `INTAKE_PENDING` | `DELETED` | ALLOW | §5·§7-3 | — | | `case.service.ts` `softDeleteCaseService` · `DELETE` `api/cases/[caseId]/route.ts` |
| `IN_INTERVIEW` | `INTERVIEW_DONE` | ALLOW | §5·§4 | — | | `case-lifecycle.ts` — `COMPLETE_INTERVIEW` |
| `IN_INTERVIEW` | `HOLD` | ALLOW | §5 | — | | `case-lifecycle.ts` — `PUT_ON_HOLD` |
| `IN_INTERVIEW` | `REJECTED` | ALLOW | §5 | — | | `case-lifecycle.ts` — `REJECT_CASE` |
| `INTERVIEW_DONE` | `DRAFTING` | ALLOW | §5·§4 | — | 인터뷰 완료 조건 등 구현 요건 있음. | `case-lifecycle.ts` — `GENERATE_DRAFT` |
| `INTERVIEW_DONE` | `HOLD` | ALLOW | §5 | — | | `case-lifecycle.ts` — `PUT_ON_HOLD` |
| `INTERVIEW_DONE` | `REJECTED` | ALLOW | §5 | — | | `case-lifecycle.ts` — `REJECT_CASE` |
| `DRAFTING` | `REVIEW_PENDING` | ALLOW | §5·§4 | — | 초안 존재 시 요건. | `case-lifecycle.ts` — `REQUEST_REVIEW` |
| `DRAFTING` | `HOLD` | ALLOW | §5 | — | | `case-lifecycle.ts` — `PUT_ON_HOLD` |
| `DRAFTING` | `REJECTED` | ALLOW | §5 | — | | `case-lifecycle.ts` — `REJECT_CASE` |
| `REVIEW_PENDING` | `APPROVED` | ALLOW | §5·§4 | — | 승인 문서 존재 등 구현 요건. | `case-lifecycle.ts` — `APPROVE_DOCUMENT` |
| `REVIEW_PENDING` | `DRAFTING` | ALLOW | §5 | — | 초안「수정 재작성」. **구현상 동일 액션 테이블 행 미확인** — 문서·코드 대조 대상. | — |
| `REVIEW_PENDING` | `HOLD` | ALLOW | §5 | — | | `case-lifecycle.ts` — `PUT_ON_HOLD` |
| `REVIEW_PENDING` | `REJECTED` | ALLOW | §5 | — | | `case-lifecycle.ts` — `REJECT_CASE` |
| `APPROVED` | `DELIVERED` | ALLOW | §5·§8-1·§8-2 | — | 승인 문서 요건 등. | `case-lifecycle.ts` — `DELIVER_DOCUMENT` |
| `APPROVED` | `CLOSED` | ALLOW | §5 | — | 초안「운영 정책상 직접 종결 가능성 별도 검토」. **현 `CASE_TRANSITIONS` 에는 없음** — 대조 필요. | — |
| `APPROVED` | `HOLD` | ALLOW | §5 | — | | `case-lifecycle.ts` — `PUT_ON_HOLD` |
| `DELIVERED` | `CLOSED` | ALLOW | §5·§8·§4 | — | | `case-lifecycle.ts` — `CLOSE_CASE` |
| `DELIVERED` | `HOLD` | ALLOW | §5 | — | | `case-lifecycle.ts` — `PUT_ON_HOLD` |
| `HOLD` | `IN_INTERVIEW` | ALLOW | §5·§7-1 | — | 초안은「직전 단계 복귀」총칭. **코드는 현재 `RESUME_CASE` → `IN_INTERVIEW` 고정** — 다른 복귀 목적지는 미정. | `case-lifecycle.ts` — `RESUME_CASE` |
| `HOLD` | `REJECTED` | ALLOW | §5 | — | **동일 액션 테이블에서 미확인** — 별도 API·정책 여부 대조. | — |
| `HOLD` | `DELETED` | ALLOW | §5 | — | soft delete API 존재 여부·상태 제한은 구현 대조. | `case.service.ts` `softDeleteCaseService` (상태 제한은 코드 확인) |
| `REJECTED` | `IN_INTERVIEW` | ALLOW | §5 (`REJECTED` 행) | — | [175] 정합안 A: `REOPEN_CASE` 재개 **`IN_INTERVIEW`** 단일 목적지. | `case-lifecycle.ts` — `REOPEN_CASE` |
| `REJECTED` | `DELETED` | ALLOW | §5·§7-3 | — | | `case.service.ts` `softDeleteCaseService` (권한·상태 제한은 코드 확인) |
| `CLOSED` | `IN_INTERVIEW` | ALLOW | §5 (`CLOSED` 행 예외) | — | **§5 예외 재개:** 감사·사유·권한 요건 하 `REOPEN_CASE` → `IN_INTERVIEW`. | `case-lifecycle.ts` — `REOPEN_CASE` |

**메모:** `CLOSED`→`IN_INTERVIEW`·`REJECTED`→`IN_INTERVIEW` 는 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) **§5** 예외·재개 행과 `lifecycle_ref` 정합.

---

## §6 금지 전이 (초안) — 1차 기입

| from_status | to_status | kind | lifecycle_ref | §11_item | notes | impl_ref |
| ----------- | --------- | ---- | ------------- | -------- | ----- | -------- |
| `CREATED` | `APPROVED` | DENY | §6 표 | — | 절차 누락 방지. 검증은 `evaluateCaseTransition` 부재로 간접. | — |
| `IN_INTERVIEW` | `APPROVED` | DENY | §6 | — | | — |
| `INTERVIEW_DONE` | `DELIVERED` | DENY | §6 | — | | — |
| `DRAFTING` | `DELIVERED` | DENY | §6 | — | | — |
| `REVIEW_PENDING` | `DELIVERED` | DENY | §6 | — | | — |
| `APPROVED` | `IN_INTERVIEW` | DENY | §6 | — | 이력 왜곡 방지(초안). | — |
| `CLOSED` | `DRAFTING` | DENY | §6 | — | | — |
| `DELETED` | `CREATED` | DENY | §6 표 (`DELETED`→일반 흐름) | — | **예시 토큰:** `CREATED` — 실제로는 일반 업무 상태로의 재진입 전반에 해당(초안 문구). 복구 정책은 §11·운영. | — |

### §6-1. DENY 8행 고정 판정표 ( 문서 축 잠금 · [EVIDENCE-20260421-185] )

**기준:** [EVIDENCE-20260421-181] 이후, §9-1(P1)·§11-1(OPEN)과 같은 방식으로 §6 **금지 전이**를 **행 단위 고정**한다. `check-status --scope case` 는 **휴리스틱 참고값**일 뿐 **단독 판정 근거가 아님** ([IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) §공통 규칙 4-1).

**문서 축 분해 목적:** 본 절에서 **금지 `(from→to)` 목록·금지 의미**를 문서상 **더 이상 흔들리지 않게** 잠근다. 이로써 전제 2 잔여 중 **“§6 DENY가 문서에서 불명확하다”** 류는 **해소**에 가깝게 접근한다. 다만 해소 조건표 §2 **항 4**의 **UI·API·서버·운영 통제 연결**은 **역점검 과제**로 **별도 잔여**([EVIDENCE-20260421-182] P3 축).

아래 **DENY-1 ~ DENY-8** 은 위 §6 본표 **위에서부터 1~8행**과 대응한다.

| 행 | §6 본표 (`from` → `to`) | 문서 축 고정 판정 | 역점검(§2 항 4) 고정 판정 | 유지 사유(문서·금지 의미) | 역점검 완료(해제) 조건 | 문서 추가 필요 | 코드·통제 연결 필요 | 전제 2 영향 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DENY-1 | `CREATED` → `APPROVED` | **DENY 유지·잠금** | **미해소** | 절차 누락 방지. 본 행은 요약 **§6**·[CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) **§6** 과 정합. | UI·API·서버·운영 중 **최소 1축**에서 금지 위반 **노출·실행 불가** 입증 | 본 §6-1로 **충분**(추가 문구는 역점검 결과에 따름) | **필요** | 문서 잔여 **해소** / **역점검 잔여** |
| DENY-2 | `IN_INTERVIEW` → `APPROVED` | **DENY 유지·잠금** | **미해소** | 동일 계열(단계 건너뜀 금지). | 동일 | 본 §6-1로 충분 | **필요** | 동일 |
| DENY-3 | `INTERVIEW_DONE` → `DELIVERED` | **DENY 유지·잠금** | **미해소** | 승인·문서 절차 없이 전달 금지. | 동일 | 본 §6-1로 충분 | **필요** | 동일 |
| DENY-4 | `DRAFTING` → `DELIVERED` | **DENY 유지·잠금** | **미해소** | 동일. | 동일 | 본 §6-1로 충분 | **필요** | 동일 |
| DENY-5 | `REVIEW_PENDING` → `DELIVERED` | **DENY 유지·잠금** | **미해소** | 승인 완료 없이 전달 금지. | 동일 | 본 §6-1로 충분 | **필요** | 동일 |
| DENY-6 | `APPROVED` → `IN_INTERVIEW` | **DENY 유지·잠금** | **미해소** | 이력 왜곡 방지(초안 명시). [181] 이후 재개 축은 **§5·`REOPEN_CASE`** 로 별도 정합. | 동일 | 본 §6-1로 충분 | **필요** | 동일 |
| DENY-7 | `CLOSED` → `DRAFTING` | **DENY 유지·잠금** | **미해소** | 종결 후 직접 작성 단계 복귀 금지(정의서 §6). 재개는 **`IN_INTERVIEW`** 예외 축([181])과 **구분**. | 동일 | 본 §6-1로 충분 | **필요** | 동일 |
| DENY-8 | `DELETED` → `CREATED` | **DENY 유지·잠금** | **미해소** | 복구 정책 없이 일반 흐름 재진입 금지. **`CREATED` 는 예시 토큰**이며 재진입 **전반**을 가리킴 — 본문 `notes` 유지. | 동일 + **복구·재진입**은 §11·운영 정책과 **교차 시** 별도 증빙 | 본 §6-1로 표지 고정(세부는 §11·운영과 연동 시 갱신) | **필요** | 동일 |

**항목별 고정 메모 · 공통 판정**

- §6 본표 **8행 모두** 문서상 **`DENY` 유지**로 **고정**한다([CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) §6 상호 대조).
- **`impl_ref` 가 `—`** 인 것은 “통제 없음”이 아니라 **코드 직접 행 부재가 정상일 수 있음**(해소 조건표 **4.4 P3**).
- 전제 2 관점에서 **문서 축 잔여**(금지가 표준 문서에 모호함)는 **본 §6-1로 분해·잠금** — 남는 것은 **§2 항 4 역점검**이다.
- **한 행이라도** 역점검 완료 조건을 **충족하지 못하면** 전제 2 **완충족 선언 금지**(§11·P1과 **동시** 판정).

**실무용 고정 규칙**

- DENY **문서 표현**은 **본 절을 근거 행**으로 삼는다.
- 금지 **위반 노출 방지**는 **코드·API·UI·운영**에서 **별도** 입증한다.
- `check-status --scope case` **경고 수**는 DENY·역점검 판정의 **직접 근거로 쓰지 않음**.

**한 줄 결론**

§6 DENY 8행은 **문서 축에서 금지 규칙·행별 의미를 고정 판정**하였고, 전제 2의 **DENY 관련 문서 불명확성**은 여기서 **거의 완전 분해**한다. 남은 것은 **§2 항 4 통제 연결 역점검**(코드·운영 증빙)뿐이다.

**통제 연결 1차 기입(초안, §6-1과 정합):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-190] · [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) 통합 표 DENY 행. **행별 보강 실작업 형식(8블록 템플릿·뼈대):** [PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_DENY_ROW_ENHANCEMENT_DRAFT.md).

---

## §8 운영 기준 — 교차 참고 (별도 행 생략)

`APPROVED`/`DELIVERED`/`CLOSED` 의 업무 구분은 §8 및 [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md) §2.1 과 정합. 위 §5 행의 `lifecycle_ref` 에 §8 을 병기한 경우가 있다.

---

## §11 미확정 — OPEN 플레이스홀더 (합의 전·확정 문구 아님)

아래는 **문서 초안 §11 불릿을 요약한 자리 표시자**이다. `lifecycle_ref`·`notes` 는 **오해 방지**를 위해 보수적으로 적었다.

**이중 표기 주의:** 일부 행은 위 §5 `ALLOW` 와 동일한 `(from_status, to_status)` 를 가질 수 있다. 이는 **최종 합의가 아니라** §11·구현(`CASE_TRANSITIONS` 등) 간 **갭 추적**을 남기기 위함이다.

| from_status | to_status | kind | lifecycle_ref | §11_item | notes | impl_ref |
| ----------- | --------- | ---- | ------------- | -------- | ----- | -------- |
| `APPROVED` | `CLOSED` | OPEN | §11 (초안·**미확정**) | 문서 엣지 vs 실제 종료 경로 (`APPROVED`→`DELIVERED`→`CLOSED`) | **합의 전:** §5에는 `APPROVED`→`CLOSED` **ALLOW** 행이 있으나, **실제 구현**에서는 `CASE_TRANSITIONS`에 **`APPROVED`→`CLOSED` 직접 규칙이 없고**, 종료는 **`CLOSE_CASE`로 `DELIVERED`→`CLOSED`만** 열린다([P1-C 실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1C_CODE_REVIEW_RESULT_FILLED.md)·[200]). 자연 종료는 **`APPROVED`→`DELIVERED`→`CLOSED`** 단계형으로 읽는 것이 UI·API·서버와 일치. **직행 종결**과 **단계형 종결**을 혼동하지 않도록 문서를 보강함 — **[EVIDENCE-20260421-205]**. 본 행은 §11·정의서(`APPROVED.next` 등)·구현 **갭 추적**용이며 최종 허용·금지를 단정하지 않음. | — |
| `REJECTED` | `CREATED` | OPEN | §11 (초안·**미확정**) | 재접수·재진입 vs 실제 `REOPEN` 축 | **합의 전:** [175] 정합안 A에 따라 §5 **대표 ALLOW**에서 `REJECTED`→`CREATED`/`INTAKE_PENDING` **직접** 재진입은 제외되었다. **`REJECTED`→`CREATED`를 `CASE_TRANSITIONS`의 직접 허용 전이로 단정하지 않는다.** 현 구현에서 반려 후 재개는 **`REOPEN_CASE`→`IN_INTERVIEW`**가 중심 축이다. [P1-A 실기입](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md)·[197] 맥락(`CREATED`→`INTAKE_PENDING` 직접 규칙 부재·비전이 처리 후보)과 함께, 본 행은 **직접 재진입 확정 / 재접수 설명 / 비전이 처리 후보**를 문서상 **분리**해 추적한다 — **[EVIDENCE-20260421-207]**. 최종 허용·금지를 단정하지 않음. | — |
| `HOLD` | `HOLD` | OPEN | §11 (초안·**미확정**) | 보류 유지·복귀 설명 vs 실제 재개 전이 | **합의 전:** `CASE_TRANSITIONS`에는 **`HOLD`→`HOLD` 자기 루프 규칙이 없다.** 보류 **해제(재개)**는 **`RESUME_CASE`로 `HOLD`→`IN_INTERVIEW`만** 열려 있으며([`case-lifecycle.ts`](../../src/lib/definitions/case-lifecycle.ts)·[`case-action-guard.ts`](../../src/lib/case-action-guard.ts) `RESUME_FROM_HOLD`). 「직전 단계로 복귀」와 **단일 목적지 `IN_INTERVIEW`** 정합·보류 사유·운영 추적은 §11·운영과 **교차**해 본 행으로 추적한다 — **[EVIDENCE-20260421-210]**. `from`/`to` 동일 표기는 §11 **갭·설명 축**용 플레이스홀더이며 직접 허용 전이를 뜻하지 않음. | — |
| `DELETED` | `CREATED` | OPEN | §11 (초안·**미확정**) | 복원·재생성·삭제 후 처리 vs **§6-1 DENY-8** | **합의 전:** **§6-1 DENY-8**은 `DELETED`→`CREATED`(예시 토큰) **일반 흐름 재진입 금지**를 문서 축으로 잠근다. **`DELETED`→`CREATED`를 직접 허용 전이로 단정하지 않는다.** 삭제 후 경로는 **복원 / 신규 재생성 / soft delete 후 처리** 등으로 읽힐 수 있어, 본 행은 §11·운영·**DENY-8**과 **교차**해 추적한다 — **[EVIDENCE-20260421-209]**. 최종 허용·금지를 단정하지 않음. | — |
| `—` | `—` | OPEN | §11 (초안·**미확정**) | 재판정 추적선·잔여·문서 연결(메타) | **합의 전:** **OPEN-5**는 **단일 `(from,to)` 전이 설명이 아니라**, §11·해소 조건표 §2·통제 역점검 **잔여·추가 예외**를 한데 묶는 **메타 추적 행**이다. 확정 시 **0~N개** 실제 `(from,to)` 행으로 분해·대체 가능. **재판정 루틴**([PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md](./PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md))·**증빙 누적**([IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md))·**1차 기입 기준·요약**([PREMISE2_CONTROL_CONNECTION_AUDIT_FIRST_PASS_CRITERIA.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_FIRST_PASS_CRITERIA.md)·[PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET_FIRST_PASS_STATUS_SUMMARY.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET_FIRST_PASS_STATUS_SUMMARY.md))·**통합 시트**와 **상호참조**로 OPEN·P1·§6 DENY **잔여 관리**를 추적한다 — **[EVIDENCE-20260421-211]**. **전제 2 상향 근거로 사용하지 않음**(§11-1 공통). | — |

### §11-1. OPEN 5행 고정 판정표 ( [181] 반영 후 재판정 · [EVIDENCE-20260421-184] )

**기준:** [EVIDENCE-20260421-181] 반영 후 재판정 결과. **OPEN 5행은 아직 전제 2 잔여 이슈**로 유지. `check-status --scope case` 는 **휴리스틱 참고값**일 뿐 **단독 판정 근거가 아님** ([IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) §공통 규칙 4-1).

아래 **OPEN-1 ~ OPEN-5** 는 위 본표 **위에서부터 1~5행**과 대응한다. (제시 원안에서 **OPEN-3** 문구는 [175]·재접수 맥락상 **`REJECTED`→`CREATED`** 행에 대응하므로, 해당 열을 **2행**에 두고 나머지 원안 문장은 행 의미에 맞게 배치하였다 — [EVIDENCE-20260421-184].)

| 행 | §11 본표 (`from` → `to`) | 현재 상태 | 고정 판정 | 유지 사유 | 해제 조건 | 문서 필요 | 코드 필요 | 전제 2 영향 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OPEN-1 | `APPROVED` → `CLOSED` | 유지 | 미해소 | 기존 표현이 **직행**처럼 읽힐 여지가 있어 OPEN으로 유지되던 축; [205]로 **실제는 `APPROVED`→`DELIVERED`→`CLOSED`**임을 §11 본표·시트와 맞춤. **`case-status-definition` `APPROVED.next`·§5 정합** 등 합의 전까지는 OPEN 추적 유지 | 실제 종료 구조가 §5·§8·§11에 **일관** 반영되고 P1-C·정의서 정합이 확보되면 OPEN-1 설명 축 **해소 검토** 가능 | §11·§11-1·통합 시트 OPEN-1 **동일 기준** 유지([205]). `APPROVED.next` 정합은 **별도 합의·증빙** | 본 작업은 **문서 보강**; P1-C([200])에서 코드 축 확인됨. 추가 구현 역점검은 **별도 필요 시** 후속 | 잔여 유지 |
| OPEN-2 | `REJECTED` → `CREATED` | 유지 | 미해소 | 기존 표현이 **직접 허용 전이**처럼 읽힐 여지가 있어 OPEN 유지. [207]로 [175]·P1-A([197])와 정합하게 **직행 단정을 피하고** 재개 축(`REOPEN`→`IN_INTERVIEW`)과 분리 서술 | `REJECTED`→`CREATED`의 **실제 처리 성격**(직접 전이 아님·재접수 설명·비전이 후보)이 문서·코드 기준으로 **일치**하게 정리되면 OPEN-2 설명 축 **해소 검토** 가능 | §11·§11-1·통합 시트 OPEN-2 **동일 기준** 유지([207]). `CREATED` 신규 생성·직접 재진입 **별도 합의**는 별도 증빙 | 본 작업은 **문서 보강**; P1-A·`REOPEN_CASE` 기존 확인에 근거. **`REJECTED`→`CREATED` 실경로** 추가 코드 추적은 **후속** | 잔여 유지 |
| OPEN-3 | `HOLD` → `HOLD` | 유지 | 미해소 | §11 행이 **상태 유지·복귀 정책**을 한데 묶는 플레이스홀더인데, **`HOLD`→`HOLD` 실전이는 없고** 재개는 **`RESUME_CASE` `HOLD`→`IN_INTERVIEW`**로 고정됨([210]). 「직전 단계」서술과 코드 단일 목적지·감사·P1-D(`HOLD`→`REJECTED` 공백)와 **교차**해 OPEN 유지 | **직전 단계 복귀 vs `IN_INTERVIEW` 재개**가 정책·정의서·UI 문구까지 **일치**하고, 보류·재개의 **운영·감사 요건**이 확정되면 OPEN-3 설명 축 **해소 검토** 가능 | §11·§11-1·통합 시트 OPEN-3 **동일 기준** 유지([210]). `CASE_TRANSITIONS`·가드와 **교차 참조** | 본 작업은 **문서·코드 대조**; 보류 사유 저장·감사 로그 등 **추가 역점검**은 후속 | 잔여 유지 |
| OPEN-4 | `DELETED` → `CREATED` | 유지 | 미해소 | 기존 표현이 **직접 허용 전이**처럼 읽힐 여지가 있어 OPEN 유지. [209]로 **§6-1 DENY-8**·삭제/복원 해석과 **충돌 없이** 복원·재생성·soft delete 후 처리 **설명 축**으로 분리 | `DELETED`→`CREATED`의 **실제 처리 성격**(직접 전이 아님·복원·재생성·삭제 후 처리)이 문서·코드 기준으로 **일치**하게 정리되면 OPEN-4 설명 축 **해소 검토** 가능 | §11·§11-1·통합 시트 OPEN-4 **동일 기준** 유지([209]). **§6-1 DENY-8**과 **교차 참조** 명시 | 본 작업은 **문서 보강**; 추가 삭제/복원 코드 역점검은 **후속** | 잔여 유지 |
| OPEN-5 | `—` (메타) | 유지 | 미해소 | **개별 전이가 아닌** §2·§11·역점검표 **재판정 추적선·잔여 목록**을 한 행에 묶는 메타로, OPEN-1~4·P1·§6 DENY가 **각각 해소·이관**되기 전까지 **열린 추적선**으로 둠([211]). “해소 완료”는 **메타 행 단독**으로 판정하지 않음 | **메타로 둘 필요가 없을 만큼** 잔여가 개별 행·증빙·운영 절차로 **전부 이관**되거나, 메타 역할이 **별도 문서 절**로 분리되어 **중복 없이** 닫히면 **해소 검토** 가능 | §11·§11-1·통합 시트 OPEN-5 **동일 기준** 유지([211]). 런북·[187]·[191]·`IMPLEMENTATION_EVIDENCE` 최신 흐름과 **명시적 연결** | **직접 전이 없음** — 코드 축 `—`. 운영·감사는 OPEN-1~4·P1·DENY **개별 증빙**과 중복 서술 금지 | 잔여 유지 |

**항목별 고정 메모 · 공통 판정**

- OPEN 5행은 **모두 유지**, **모두 전제 2 잔여 이슈**이다.
- **[175] 정합안 A**와 **바로 충돌한다고 보지는 않음.**
- **설명 보강만으로 닫힌 수준은 아님.**
- 각 행마다 **유지 사유 / 해제 조건 / 문서 필요 / 코드 필요**가 완전하게 채워져야 **재판정** 가능하다.

**OPEN-1 ~ OPEN-5 공통 해석**

- 현재는 “**보류 메모가 붙은 열린 행**”이지 “**해소 완료 행**”이 아니다.
- `notes`가 존재해도 그것만으로 **구현 정합** 또는 **정책 합의**를 대신하지 않는다.
- 따라서 OPEN 5행은 **전제 2 상향 근거로 사용하지 않음**.

**실무용 고정 규칙**

- OPEN 5행은 **전부 미해소 고정**이다.
- 각 행은 **문서 보강만으로 닫을지**, **구현 역점검까지 갈지** **별도 판정** 필요.
- **한 행이라도** 해제 조건이 비어 있으면 **OPEN 잔여**로 유지한다.
- **한 행이라도** 문서 필요 / 코드 필요 구분이 안 되면 **전제 2 상향 금지**이다.
- `check-status --scope case` **경고 수**는 OPEN 판정의 **직접 근거로 쓰지 않음**.

**한 줄 결론**

§11 OPEN 5행은 모두 **미해소 고정** — [175] 정합안 A와 **직접 충돌은 없으나**, 각 행의 **유지 사유·해제 조건·문서 필요·코드 필요**가 완비되지 않아 **전제 2 잔여 이슈**로 유지한다.

**통제 연결 1차 기입(초안, §11-1과 정합):** [PREMISE2_CONTROL_CONNECTION_AUDIT_OPEN_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_OPEN_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-189] · [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) 통합 표 OPEN 행.

---

## 집계 (1차 기입 후)

| 항목 | 값 |
|------|-----|
| §5 ALLOW 행 | 33 ([175] A 반영: `REJECTED`→`CREATED`/`INTAKE_PENDING` ALLOW 제거·`REJECTED`→`IN_INTERVIEW` 통합) |
| §6 DENY 행 | 8 |
| `kind=OPEN` (§11 플레이스홀더) | **5** |
| 전제 2 충족 | **미달** — §11·문서-구현 대조·`CLOSED` 출발 허용 정리 등 잔여 |

---

## 전제 2 — 열린 이슈 목록 ([EVIDENCE-20260419-171])

**추출 규칙:** 아래 표의 §5·§6·§11 행 중 **`impl_ref` 가 비어 있거나**, `notes` 에 **대조·정합·미확인·후속 개정·코드 확인** 등 **추가 검증이 필요함**이 드러난 행을 묶는다. (§6 `DENY` 는 구현에서 별도 `validate` 가 없을 수 있어 `impl_ref` 가 공백인 것이 정상에 가깝다 — 그러나 **금지 위반 노출 방지** 확인은 전제 2·항 4 교차에서 남는다.)

### A. `impl_ref` 공백인 §5 `ALLOW` 행

| from_status | to_status | 비고(요약) |
| ----------- | --------- | ---------- |
| `CREATED` | `INTAKE_PENDING` | `SUBMIT_INTAKE` 등 액션 미연계(초안만 허용). |
| `REVIEW_PENDING` | `DRAFTING` | 문서「수정 재작성」— `CASE_TRANSITIONS` 해당 행 없음. |
| `APPROVED` | `CLOSED` | 문서 허용·§11·구현(`CLOSE_CASE` 는 `DELIVERED` 출발만) 갭. |
| `HOLD` | `REJECTED` | 문서 허용— 액션 테이블 미확인. |

### B. `impl_ref`는 있으나 `notes`에 추가 대조가 남은 §5 행

| from_status | to_status | 비고(요약) |
| ----------- | --------- | ---------- |
| `HOLD` | `DELETED` | `softDeleteCaseService` — **출발 상태 제한** 코드 확인 필요. |
| `REJECTED` | `DELETED` | 동일(권한·상태 제한). |

### C. `kind=OPEN` (§11 플레이스홀더) — 전부 `impl_ref` 공백

| from_status | to_status | §11_item(요약) |
| ----------- | --------- | ---------------- |
| `APPROVED` | `CLOSED` | 허용 범위·구현 정합 |
| `REJECTED` | `CREATED` | 직접 재진입 필요성 vs `REOPEN` 단일 축 |
| `HOLD` | `HOLD` | 복귀 규칙·`RESUME` 단일 목적지 |
| `DELETED` | `CREATED` | 복구 vs §6 금지 |
| `—` | `—` | 유형별 예외(메타) |

### D. §6 `DENY` 행 — `impl_ref` 전부 공백(간접 검증 과제)

8행 전부: 명시 금지가 UI·API에서 **노출·실행되지 않음**을 역점검할 때 소모된다. (행 목록은 위 §6 표 참조.)

### 열린 이슈 건수(요약)

| 구분 | 건수 |
|------|-----|
| A | 4 |
| B | 2 |
| C | 5 |
| D | 8 (역점검 단위) |
| **합계(중복 제외한 ‘행’ 기준)** | §5 추적 8 + §11 OPEN 5 + §6 역점검 8 — **동일 엣지는 A/C 이중(예: `APPROVED`→`CLOSED`)** |

---

## 충돌·공백 후보 — 문서 / 구현 / 판정 보류 사유

| 엣지(후보) | 문서 기준 (LIFECYCLE 초안) | 구현 기준 (`CASE_TRANSITIONS`·기타) | 판정 보류·보수적 메모 |
| ---------- | -------------------------- | ------------------------------------- | --------------------- |
| `CLOSED` → `IN_INTERVIEW` | §5 **예외 재개**·§10 ([175] A 반영). | `REOPEN_CASE`: `CLOSED`·`REJECTED` → `IN_INTERVIEW`. | P0 **문서 정합 진전** — 잔여(§11·P1 등)로 전제 2는 **미충족 유지**. |
| `REVIEW_PENDING` → `DRAFTING` | §5 **허용**(재작성). | 동일 `(from,to)` 규칙 **없음**. | **문서 허용·구현 공백.** 재작성을 문서 되돌림·별도 액션·문서 API로 할지 합의 전. |
| `APPROVED` → `CLOSED` | §5 **허용**(직접 종결 가능성 언급). | `CLOSE_CASE` 는 **`DELIVERED` → `CLOSED` 만**. | **문서 허용·구현 공백.** §11·§8과 함께 “전달 생략 종결” 정책 확정 전. |
| `HOLD` → `REJECTED` | §5 **허용**. | `REJECT_CASE` 의 `from` 에 **`HOLD` 없음**. | **문서 허용·구현 공백** 가능성. |
| `REJECTED` → `CREATED` / `INTAKE_PENDING` | §5 **대표 허용에서 제외**([175] A)·§11 **OPEN** 추적. | `REOPEN_CASE` → **`IN_INTERVIEW`만**. | 표·§11에서 **직접 재진입** 필요성만 잔여 합의 대상. |
| `REJECTED` → `CREATED` 등 (§11 OPEN) | §5 허용 + §11 재접수 미확정 + §6 `DELETED`→일반 흐름 금지 | 위와 중첩 | **OPEN** 행으로 별도 추적. |

---

## 전제 2 최종 판정 (보수) — [171]

| 판정 | 결과 |
|------|------|
| **완충족(§1-4-5)** | **아니오** — §11 `OPEN` **5건** 잔존, 문서·구현 **불일치·공백** 다건. |
| **조건부 충족 후보** | **본 점검표에서는 인정하지 않음.** “1차 요약표 + 갭·열린 이슈 명세”는 **진행도**로만 기록하고, §1-4-2 행 **2** 는 **미충족** 유지. |
| **이유(한 줄)** | 전제 2 완료 판정은 **`OPEN` 0** 및 본문 동기화인데, 구조적으로 **합의 전 placeholder**·**DOC≠IMPL** 이 남아 있음. |

**후속:** 상표 후보 엣지별로 (1) LIFECYCLE 본문 수정 (2) `CASE_TRANSITIONS`/API 추가 (3) §11 에픽 분리 — 중 하나를 증빙에 묶어야 행 2를 올릴 수 있다.

---

## 전제 2 해소 조건표

**재판정 실행본(checkbox):** [PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md](./PREMISE2_SECTION2_REJUDGEMENT_RUNBOOK.md) — [EVIDENCE-20260421-182].

**통제 연결 역점검(한 장 · UI·API·서버·운영):** [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) — [EVIDENCE-20260421-186]. **1차 기입 기준:** [PREMISE2_CONTROL_CONNECTION_AUDIT_FIRST_PASS_CRITERIA.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_FIRST_PASS_CRITERIA.md) — [EVIDENCE-20260421-187].

> 기준: [EVIDENCE-20260419-171] · 재점검 [EVIDENCE-20260421-173] · P0/P1 초안 [EVIDENCE-20260421-174] · 정합안 채택 [EVIDENCE-20260421-175] · §5 수동 반영 문안 [EVIDENCE-20260421-176] · 반영 체크·재판정 [EVIDENCE-20260421-177] · 실행 계획·C1 [EVIDENCE-20260421-178] · C1 본파일 [EVIDENCE-20260421-179] · 실행본 [EVIDENCE-20260421-180] · §5·요약표 반영 [EVIDENCE-20260421-181] · 전제 2 §2 재판정 [EVIDENCE-20260421-182] · P1 고정 판정 [EVIDENCE-20260421-183] · §11 OPEN 고정 [EVIDENCE-20260421-184] · §6 DENY 고정 [EVIDENCE-20260421-185] · 통제 역점검표 [EVIDENCE-20260421-186] · 1차 기입 기준 [EVIDENCE-20260421-187] · P1 1차 기입 초안 [EVIDENCE-20260421-188] · OPEN 1차 기입 초안 [EVIDENCE-20260421-189] · DENY 1차 기입 초안 [EVIDENCE-20260421-190] · 17행 1차 채움 요약 [EVIDENCE-20260421-191] · 코드 역점검 우선순위 [EVIDENCE-20260421-192] · P1 코드 역점검 체크리스트 [EVIDENCE-20260421-193] · P1 역점검 결과 템플릿 [EVIDENCE-20260421-194] · P1-A 기입 예시 [EVIDENCE-20260421-195] · P1-A 실기입 순서 [EVIDENCE-20260421-196] · P1-A 실기입본 [EVIDENCE-20260421-197] · `INTAKE_PENDING` 전역 추적 [EVIDENCE-20260421-198] · P1-B 실기입본 [EVIDENCE-20260421-199] · P1-C 실기입본 [EVIDENCE-20260421-200] · P1-D 실기입본 [EVIDENCE-20260421-201] · **P1 4건 종합 판정표 [EVIDENCE-20260421-202]** · OPEN-1 문구 보강 [EVIDENCE-20260421-205] · OPEN-2 문구 보강 [EVIDENCE-20260421-207] · OPEN-3 문구 보강 [EVIDENCE-20260421-210] · OPEN-4 문구 보강 [EVIDENCE-20260421-209] · OPEN-5 문구 보강 [EVIDENCE-20260421-211]  
> 현재 판정: **전제 2 미충족 유지** — [181] 이후 P0(§5 표 기준) 정합은 진전했으나 §2 잔여(§11 OPEN·P1·§6 DENY 역점검 등)로 **상향하지 않음**  
> 이유: §11 OPEN·P1 구현 공백·§6 DENY 역점검·soft delete 확인 등이 동시에 남아 있음.

### 1. 목적

본 표는 `CASE_LIFECYCLE_TRANSITION_SUMMARY.md` 상의 전제 2(LIFECYCLE §11) 미충족 상태를 해소하기 위해, 남아 있는 이슈를 **무엇이 해결되어야 해소로 볼 수 있는지** 기준 형태로 정리한 것이다.

본 표는 구현 확대를 승인하는 문서가 아니며, 특히 아래 범위는 합의 전 확장 금지 원칙을 유지한다.

- `prisma/schema.prisma` 의 `CaseStatus`
- `src/lib/definitions/case-status.ts`
- 감사/API 계약
- 템플릿 게이트/스키마
- [108], [109] 합의 전 금지 범위 ([PRACTICAL_STANDARD_CHECKLIST.md](./PRACTICAL_STANDARD_CHECKLIST.md) 상호참조)

### 2. 해소 판정 원칙

전제 2를 충족 후보로 상향하기 위해서는 아래 조건이 모두 충족되어야 한다.

1. DOC≠IMPL 불일치(P0) 항목이 전부 아래 셋 중 하나로 귀속될 것
   - 문서 정정 확정
   - 구현 보강 확정
   - 합의 전 보류로 명시 확정

2. 문서 §5 허용 전이 중 구현 공백(P1) 항목이 전부 아래 셋 중 하나로 정리될 것
   - 실제 구현 근거 추가
   - 문서 허용 범위 축소
   - 정책 합의 전 보류

3. §11 OPEN 항목 5건에 대해 각 항목별로 아래가 명시될 것
   - OPEN 유지 사유
   - 해제 조건
   - 문서 수정 필요 여부
   - 코드 수정 필요 여부

4. §6 DENY 8행은 코드 직접 대응 유무와 별개로 아래 중 최소 1개 이상의 통제 근거가 확인될 것
   - UI 차단
   - API 차단
   - 서버 검증
   - 운영/감사 규칙

5. 위 정리 이후에도 기준선은 계속 유지될 것
   - `npx tsc --noEmit` exit 0
   - `npm run lint` exit 0
   - `npm run verify:canonical-sources` OK

### 3. 해소 대상 분류표

| 분류 | 우선순위 | 대상 | 현재 상태 | 해소 조건 | 해소 후 판정 가능 상태 |
| --- | --- | --- | --- | --- | --- |
| DOC≠IMPL 불일치 | P0 | `CLOSED → IN_INTERVIEW` | **[181] 반영 후** §5 예외 재개·요약 `lifecycle_ref` §5 — **구 `DOC≠IMPL` 축은 문서 정정으로 해소** | — | 문서 정정 완료(§2 조건 1 중 **문서 정정 확정** 축) |
| DOC≠IMPL 불일치 | P0 | `REJECTED → CREATED / INTAKE_PENDING` | **[181]·[175] A 반영 후** §5 **대표 허용**에서 제외, `REOPEN_CASE`→`IN_INTERVIEW` 단일 축 — **표상 불일치 축 해소**. `CREATED`/`INTAKE_PENDING` **직접** 재진입은 §11 OPEN·합의 과제로 **별도** | `CREATED`/`INTAKE_PENDING` 직접 재진입 필요성·§11 해제 조건 | 문서 정정 완료(대표 허용)·직접 재진입은 OPEN 잔여 |
| 구현 공백 | P1 | `CREATED → INTAKE_PENDING` | 문서 허용이나 실제 액션/테이블 연결 불명확 | 실제 액션 근거 추가 또는 문서 허용 근거 축소 | 구현 보강 완료 / 문서 정정 완료 |
| 구현 공백 | P1 | `REVIEW_PENDING → DRAFTING` | 문서 허용이나 `CASE_TRANSITIONS` 대응 규칙 없음 | 상태 전이인지 문서 재작성 API인지 정책 고정 후 반영 | 구현 보강 완료 / 보류 확정 |
| 구현 공백 | P1 | `APPROVED → CLOSED` | 문서 허용이나 `CLOSE_CASE`는 `DELIVERED → CLOSED`만 지원 | 전달 생략 종결 허용 여부를 문서·구현 한 축으로 고정 | 구현 보강 완료 / 문서 정정 완료 / 보류 확정 |
| 구현 공백 | P1 | `HOLD → REJECTED` | 문서 허용이나 `REJECT_CASE` from에 `HOLD` 없음 | 보류 상태에서 거절 허용 정책 확정 후 정렬 | 구현 보강 완료 / 문서 정정 완료 / 보류 확정 |
| OPEN / 메타 | P2 | `HOLD → HOLD` 복귀 규칙 | 정책 플레이스홀더 | 복귀 조건, 권한, 감사 기준 명시 | OPEN 해제 |
| OPEN / 메타 | P2 | `DELETED → CREATED` | 정책 플레이스홀더 | soft delete 복구 허용 여부와 범위 확정 | OPEN 해제 |
| soft delete | P2 | `HOLD/REJECTED → DELETED` | impl_ref는 있으나 상태·권한 확인 미완료 | 상태 제한, 권한, 감사 요건 재확인 | 구현 확인 완료 |
| OPEN / 메타 | P2 | 유형별 예외 | 메타 수준 플레이스홀더 | 예외를 표 본문으로 내릴지, 부록/운영규칙으로 분리할지 결정 | OPEN 해제 |
| DENY 역점검 | P3 | §6 DENY 8행 | 코드 직접 대응 행이 없을 수 있음 | UI/API/server/운영 통제 근거 중 최소 1개 연결 | 역점검 완료 |

### 4. 항목별 해소 조건 상세

#### 4.1 P0 — DOC≠IMPL 불일치

##### A. `CLOSED → IN_INTERVIEW`

- 현재 상태 ( [EVIDENCE-20260421-181] 반영 후 )
  - §5에 `CLOSED` **예외 재개**·`REOPEN_CASE` → `IN_INTERVIEW` 가 명시되었고, 요약표 `lifecycle_ref` 및 `notes` 가 §5와 정합한다.
  - **이전 P0(문서 부재 vs 구현 허용)** 는 문서 정정으로 **해소된 것으로 본다.** (§2 완료 판정은 §11·P1·DENY 등 **다른 항목**과 묶어 판정.)
- 해소 조건 (기록 보존)
  1. 아래 둘 중 하나를 선택한다.
     - 문서 정정: §5 표/본문에 종결 후 재개를 명시 허용한다.
     - 구현 정렬: `REOPEN_CASE`에서 `CLOSED`를 제외하거나 별도 예외 액션으로 분리한다.
  2. 선택 사유를 `notes` 또는 충돌·공백 후보 표에 남긴다.
  3. `impl_ref` 또는 문서 참조 위치를 실제 근거 기준으로 갱신한다.
- 해소 전 판정
  - **보류 유지**
- 해소 후 가능 판정
  - 문서 정정 완료 또는 구현 정렬 완료

##### B. `REJECTED → CREATED / INTAKE_PENDING`

- 현재 상태 ( [EVIDENCE-20260421-181] 반영 후 )
  - §5 **대표 허용**에서는 `REJECTED` → `CREATED`/`INTAKE_PENDING` **직접** 전이를 포함하지 않으며, 재개는 `IN_INTERVIEW` 단일 축으로 정렬되었다([175] 정합안 A).
  - **`CREATED`/`INTAKE_PENDING` 직접 재진입**이 정책상 필요한지는 §11 OPEN·합의 과제로 남긴다 — **P0 “목표 불일치” 표 행은 문서 정정 확정으로 귀속.**
- 해소 조건 (기록 보존·추가 합의용)
  1. 재접수 목표 상태를 하나로 잠근다.
  2. 또는 문서상 `CREATED/INTAKE_PENDING`을 조건부 허용(COND) 또는 운영 예외로 축소한다.
  3. 구현 확장이 필요한 경우에도 [108], [109] 합의 전 금지 원칙과 충돌하지 않는지 먼저 판정한다.
- 해소 전 판정
  - **보류 유지**
- 해소 후 가능 판정
  - 문서 정정 완료 / 구현 보강 후보 확정 / 보류 확정

#### 4.2 P1 — 구현 공백

##### A. `CREATED → INTAKE_PENDING`

- 현재 상태
  - 문서 허용 행은 있으나 실제 액션/테이블 연결 근거가 불명확하다.
- 해소 조건
  1. `SUBMIT_INTAKE` 또는 대응 액션과 실제 전이 테이블을 연결한다.
  2. 연결 근거가 없으면 문서 허용 범위를 재점검한다.
- 해소 후 가능 판정
  - 구현 보강 완료 또는 문서 정정 완료

##### B. `REVIEW_PENDING → DRAFTING`

- 현재 상태
  - 문서상 재작성 허용이나 `CASE_TRANSITIONS` 대응 규칙이 없다.
- 해소 조건
  1. 이것이 진짜 상태 전이인지, 문서 재작성/재생성 API 수준 작업인지 먼저 확정한다.
  2. 상태 전이라면 `(REVIEW_PENDING, DRAFTING)` 규칙과 액션을 연결한다.
  3. 상태 전이가 아니라면 문서에 조건부/운영 예외로 낮춰 적는다.
- 해소 후 가능 판정
  - 구현 보강 완료 / 문서 정정 완료 / 보류 확정

##### C. `APPROVED → CLOSED`

- 현재 상태
  - 문서 §5 허용이나 구현 `CLOSE_CASE`는 `DELIVERED → CLOSED`만 지원한다.
  - §11 OPEN과도 직접 연결된다.
- 해소 조건
  1. 전달 생략 종결 허용 여부를 §5, §8, §11에서 한 축으로 통일한다.
  2. 허용 시 `CLOSE_CASE` 출발 상태·감사 요건·권한 요건을 함께 명시한다.
  3. 비허용 시 문서 허용 표현을 수정한다.
- 해소 후 가능 판정
  - 구현 보강 완료 / 문서 정정 완료 / 보류 확정

##### D. `HOLD → REJECTED`

- 현재 상태
  - 문서 허용이나 구현 `REJECT_CASE` from에 `HOLD`가 없다.
- 해소 조건
  1. 보류 상태에서 거절이 가능한 업무 정책인지 먼저 확정한다.
  2. 허용이면 `REJECT_CASE` from에 `HOLD`를 추가하고 동일 권한/감사 요건을 적용한다.
  3. 비허용이면 문서 허용 표현을 축소 또는 COND 처리한다.
- 해소 후 가능 판정
  - 구현 보강 완료 / 문서 정정 완료 / 보류 확정

#### 4.3 P2 — OPEN / soft delete / 메타

##### A. §11 OPEN 5건

각 OPEN 항목은 아래 4가지를 모두 가져야 해제 가능하다.

- OPEN 유지 사유
- 해제에 필요한 정책 결정
- 문서 수정 필요 여부
- 코드 수정 필요 여부

##### B. `HOLD/REJECTED → DELETED`

- 현재 상태
  - soft delete 관련 구현 참조는 있으나 상태·권한 확인이 남아 있다.
- 해소 조건
  1. 실제 soft delete 허용 상태를 재확인한다.
  2. 삭제 권한 주체와 감사 로그 요건을 확인한다.
  3. `impl_ref`를 실제 코드 근거로 보강한다.
- 해소 후 가능 판정
  - 구현 확인 완료

#### 4.4 P3 — §6 DENY 8행 역점검

- **문서 축 고정:** 본 문서 **§6-1** ([EVIDENCE-20260421-185]) — 금지 행·의미 **잠금**. 남은 과제는 아래 **역점검**뿐이다.
- 현재 상태
  - 금지 전이는 코드 직접 대응 행이 없을 수 있다.
- 해소 조건
  1. 각 금지 전이에 대해 UI 차단, API 차단, 서버 검증, 운영/감사 규칙 중 최소 1개 이상을 연결한다.
  2. “코드 직접 전이 부재 = 통제 없음”으로 해석하지 않도록 근거를 분리 기록한다.
- 해소 후 가능 판정
  - 역점검 완료

### 5. 완료 판정 기준

아래가 모두 충족되기 전까지 전제 2는 **미충족 유지**한다.

- P0 항목 2건이 전부 문서 정정 / 구현 정렬 / 보류 중 하나로 확정됨
- P1 항목 4건이 전부 실제 구현 근거 또는 문서 수정으로 닫힘
- §11 OPEN 5건이 전부 해제되거나, 최소한 OPEN 유지 사유와 해제 조건이 명시됨
- §6 DENY 8행이 UI/API/server/운영 통제 근거와 연결됨
- 기준선(`tsc`, `lint`, `verify:canonical-sources`) 유지

### 6. 현재 결론

현재 산출물은 “전제 2 해소를 위한 우선순위화와 조건 정리” 단계이며, 아직 전제 2를 완충족 또는 조건부 충족 후보로 상향하지 않는다. 위 §2·§5의 조건을 충족하고 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 및 [PRACTICAL_STANDARD_CHECKLIST.md](./PRACTICAL_STANDARD_CHECKLIST.md) §1-4-5와 함께 재판정한다.

### 7. [172] 기준 재점검 결론 — [EVIDENCE-20260421-173]

[EVIDENCE-20260421-172] 해소 조건표를 전제로 재점검한 결과를 아래에 잠근다. **구현 변경 없이** 판단만 고정한 것이며, LIFECYCLE 본문·요약표에 실제 문구를 넣고 승인하기 전까지는 §5 완료 판정으로 올리지 않는다.

| 구분 | 결론 |
| --- | --- |
| **P0 (2건)** | **문서 정정**을 **1차 잠금 방향**으로 둔다. `CLOSED`→`IN_INTERVIEW`, `REJECTED`→`CREATED`/`INTAKE_PENDING`와 구현(`REOPEN_CASE` 등)의 불일치는 **우선 코드가 아닌 정의서·요약표 정정**으로 맞추는 축을 채택한다(제품·준법이 구현 축소를 요구할 때만 구현 정렬을 재개). |
| **P1 (4건)** | `CASE_TRANSITIONS` 기준 **전이 규칙 공백**으로 **확정**한다. **A** (`CREATED`→`INTAKE_PENDING`), **B** (`REVIEW_PENDING`→`DRAFTING`)는 **비전이 흐름**(예: 문서·별도 API에서 상태를 바꾸지 않는 조정)이 성립할 **가능성을 닫지 않고** 둔다. **C** (`APPROVED`→`CLOSED`), **D** (`HOLD`→`REJECTED`)도 공백 확정이나, §8·§11·업무 정책과 묶여 문서·구현 택일은 합의 후. |
| **전제 2** | **여전히 미충족 유지.** P0/P1 재점검만으로 §2의 나머지(§11 OPEN, §6 DENY 역점검, 완료 판정 기준 전부)가 충족되지 않으며, **문서 반영·승인 전까지** 완충족 또는 조건부 충족 후보로 **상향하지 않는다**. |

### 8. P0 문서 정정 초안 — §5 본문·요약표 ([173] 1차 잠금·**승인 전**)

아래는 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) §5 및 **본 문서** `§5 허용 전이` 표에 반영할 **문구 정정 초안**이다. **[EVIDENCE-20260421-173]** 에 따라 구현을 먼저 바꾸지 않고 문서를 `case-lifecycle.ts` 의 `REOPEN_CASE` 와 정합시키는 것이 목적이다. **본 절이 승인되기 전까지** [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) 본문은 **필요 시 수동 반영**하며, 반영 즉시 전제 2가 충족되는 것은 아니다(§11·§6 등 잔여).

#### 8-1. `CASE_LIFECYCLE_DEFINITION.md` §5 — 제안 표기 (발췌)

**`REJECTED` 행 교체 초안**

| 현재 상태 | 제안 허용 전이(대표) | 제안 설명 |
| --- | --- | --- |
| `REJECTED` | `IN_INTERVIEW`, `DELETED` | **재개(재접수에 상당):** 현 구현은 `REOPEN_CASE` 로 **`IN_INTERVIEW`** 로만 전환한다. `CREATED`·`INTAKE_PENDING` 으로의 직접 재진입이 정책상 필요하면 **별도 합의** 후 표·`CASE_TRANSITIONS`·§11 을 함께 정리한다. |

**`CLOSED` 행 교체 초안**

| 현재 상태 | 제안 허용 전이(대표) | 제안 설명 |
| --- | --- | --- |
| `CLOSED` | (원칙 최종) / 예외: `IN_INTERVIEW`(재개) | **원칙:** 일반 업무 흐름 종결. **예외:** 감사·사유·권한 요건을 갖춘 **사건 재개** 시 `IN_INTERVIEW` 로의 전환을 허용할 수 있다(구현: `REOPEN_CASE`). |

**연동 제안 (같은 파일 내)**

- **§10 구현 대조:** `CLOSED` 이후 재진입 문항을 「**원칙 차단·재개 예외는 `REOPEN_CASE` 와의 정합**」으로 읽도록 문구 보강.
- **§11:** `REJECTED` → `CREATED` 재접수 범위 항목을 「현행 전이 목표는 `IN_INTERVIEW` 재개로 한정 가능」 등과 연계해 후속 합의로 위임 가능하게 조정(초안).

#### 8-2. 본 요약표 §5 — 제안 행 조정 (발췌)

| 대상 | 제안 |
| --- | --- |
| `CLOSED` → `IN_INTERVIEW` | `lifecycle_ref` 를 **§5** 로 올릴 수 있게 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) §5 가 위 초안으로 갱신된 뒤 맞춘다. `notes` 는 **「§5 예외 재개·`REOPEN_CASE`」** 중심으로 단순화. |
| `REJECTED` → `CREATED`, `REJECTED` → `INTAKE_PENDING` | **정합안 A(보수):** 두 **ALLOW** 행을 **표에서 제거**하고, 재접수 목적은 **`REJECTED` → `IN_INTERVIEW`** (`REOPEN_CASE`) **한 줄**에 통합 기술. §11 `OPEN` 행은 문구만 조정해 **「추가 목표 상태는 미합의」** 로 유지 가능. **정합안 B:** 행은 남기되 `kind` 를 **COND** 로 내리고 `notes` 에 **현 구현 없음** 명시(ALLOW 혼동 방지). |

#### 8-3. 정합안 채택 — 문서 기준 잠금 ([EVIDENCE-20260421-175])

| 항목 | 잠금 |
| --- | --- |
| **채택** | **정합안 A(행 통합)** — `REJECTED` → `CREATED` · `REJECTED` → `INTAKE_PENDING` **ALLOW** 는 요약표에서 **제거**하는 방향으로, 재개 목표는 **`REJECTED` → `IN_INTERVIEW`** (`REOPEN_CASE`) **한 축**에 수렴시킨다. |
| **비채택(예비)** | **정합안 B(COND 격하)** — 당 문서·본 정책 세션에서는 **채택하지 않는다.** 다만 운영·감사에서 **`CREATED`/`INTAKE_PENDING` 직접 재진입**을 별도 허용으로 요구할 때는 **B 또는 별도 에픽**으로 재개할 수 있으며, 그때는 `CASE_TRANSITIONS`·§11 과 **합의·증빙**을 새로 묶는다. |
| **본문 반영** | [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) §5 및 본 문서 §5 표의 **실제 수정**은 **[174]가 정한 승인 후 수동 적용** 원칙을 유지한다. 채택만 확정된 것이며 **파일을 이번에 자동 패치하지 않는다.** |
| **전제 2** | 본문 반영·승인 전까지 **계속 미충족** 유지(§11·§6 등 잔여). |

#### 8-4. `CASE_LIFECYCLE_DEFINITION.md` — §5·연동 절 **최종 수동 반영 문안** ([175] 정합안 A · [EVIDENCE-20260421-176])

**적용 방식:** 승인 후 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) 를 연다. **아래 표는 §5 전체 교체용**이며, `REJECTED`·`CLOSED` 행은 `case-lifecycle.ts` 의 **`REOPEN_CASE`** (`REJECTED`·`CLOSED` → **`IN_INTERVIEW`** 만)에 맞춰 **재개 목적지 단일화**했다. **본 턴에서는 정의서 파일을 수정하지 않는다.** 반영 후에도 §11·§6·점검표 조건이 남으면 **전제 2는 계속 미충족**이다.

##### (1) §5 `허용 전이 규칙` 표 — **교체 전문** (마크다운)

```markdown
| 현재 상태 | 허용 전이(대표) | 설명 |
|-----------|-----------------|------|
| `CREATED` | `INTAKE_PENDING`, `IN_INTERVIEW`, `HOLD`, `REJECTED`, `DELETED` | 사건 생성 후 접수 보완·인터뷰 시작·보류·반려·삭제 가능 |
| `INTAKE_PENDING` | `IN_INTERVIEW`, `HOLD`, `REJECTED`, `DELETED` | 보완 완료 후 인터뷰 시작, 또는 중단·반려 |
| `IN_INTERVIEW` | `INTERVIEW_DONE`, `HOLD`, `REJECTED` | 인터뷰 종료 또는 보류·중단 |
| `INTERVIEW_DONE` | `DRAFTING`, `HOLD`, `REJECTED` | 문서 작성 시작 전 단계 |
| `DRAFTING` | `REVIEW_PENDING`, `HOLD`, `REJECTED` | 초안 작성 후 검토로 이동 |
| `REVIEW_PENDING` | `APPROVED`, `DRAFTING`, `REJECTED`, `HOLD` | 승인, 수정 재작성, 반려, 보류 가능 |
| `APPROVED` | `DELIVERED`, `CLOSED`, `HOLD` | 전달 후 종결이 일반적이나, 운영 정책상 직접 종결 가능성은 별도 검토 대상 |
| `DELIVERED` | `CLOSED`, `HOLD` | 전달 완료 후 종결 또는 예외 보류 |
| `HOLD` | 이전 실무 단계로 복귀, `REJECTED`, `DELETED` | 보류 해제 시 직전 흐름으로 복귀(구체 상태는 운영·권한정의서) |
| `REJECTED` | `IN_INTERVIEW`, `DELETED` | **재개:** 구현상 `REOPEN_CASE` 로 **`IN_INTERVIEW`** 로만 전환한다(사유·권한은 권한정의서). 반려 후 `CREATED`·`INTAKE_PENDING` 으로의 **직접** 재진입은 본 문서 §5 표의 **대표 허용 전이**에 포함하지 않는다([175] 정합안 A). 필요 시 별도 합의·`CASE_TRANSITIONS`·§11 에서 다룬다. |
| `CLOSED` | (원칙 최종) · 예외: `IN_INTERVIEW`(재개) | **원칙:** 일반 업무 흐름 종결. **예외:** 감사·사유·권한 요건을 갖춘 **사건 재개** 시 `IN_INTERVIEW` 로의 전환을 허용한다(구현: `REOPEN_CASE`). |
| `DELETED` | (일반 흐름 제외) | 복구 정책은 별도 운영·시스템 정책 |
```

##### (2) §10 구현 대조 — **치환할 bullet 한 줄** (기존 `CLOSED` 재진입 문항)

- **삭제(또는 치환) 대상:** 기존 «`CLOSED` 이후 재진입이 막혀 있는가»
- **치환 문안** (그대로 붙여 넣기):

```
- `CLOSED` 이후 **원칙적으로 일반 흐름 재진입은 없다.** 다만 **재개 예외**는 `REOPEN_CASE` 에 따라 **`IN_INTERVIEW`** 로만 허용되는가(감사·사유·권한 요건과 UI/API 정합).
```

##### (3) §11 미확정 — **치환할 bullet 한 줄** (기존 `REJECTED` → `CREATED` 항)

- **삭제(또는 치환) 대상:** 기존 «`REJECTED` → `CREATED` 재접수 흐름 허용 범위»
- **치환 문안** (그대로 붙여 넣기):

```
- `REJECTED` / `CLOSED` → `IN_INTERVIEW` **재개** 외, `CREATED`·`INTAKE_PENDING` 으로의 **직접** 재진입이 정책상 필요한지(현행 구현은 `REOPEN_CASE` → `IN_INTERVIEW` 단일).
```

#### 8-5. 승인 후 수동 반영 체크리스트 · 전제 2 재판정 확인 ([176] 문안 준수 · [EVIDENCE-20260421-177])

**전제:** 아래를 수행해도 **전제 2는 자동으로 완충족이 되지 않는다.** 본문·요약표 **승인 반영 전**까지는 해소 조건표 **§2** 의 나머지(P1·§11·§6·기준선)가 남으면 **계속 미충족**이다.

##### A. [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) (§8-4 붙여넣기)

| 순서 | 작업 | 완료 |
| --- | --- | --- |
| A1 | **§5** `허용 전이 규칙` **표 전체**를 §8-4 **(1) 교체 전문**과 동일한지 대조한 뒤, 기존 표를 삭제하고 교체한다. | ☐ |
| A2 | **§10** 목록에서 기존 «`CLOSED` 이후 재진입이 막혀 있는가» **한 줄을 삭제**하고, §8-4 **(2) 치환 문안** bullet **한 줄**을 같은 위치(또는 의미상 동일 위치)에 넣는다. | ☐ |
| A3 | **§11** 목록에서 기존 «`REJECTED` → `CREATED` 재접수 흐름 허용 범위» **한 줄을 삭제**하고, §8-4 **(3) 치환 문안** bullet **한 줄**을 넣는다. | ☐ |
| A4 | (선택) §5 상·하단 서술(헤딩 직후 문단)과 새 표·`REOPEN_CASE` 언급이 **모순 없이 읽히는지** 한 번 통독한다. | ☐ |

##### B. 본 문서 `CASE_LIFECYCLE_TRANSITION_SUMMARY.md` — **§5 허용 전이 요약표** ([175] 정합안 A)

| 순서 | 작업 | 완료 |
| --- | --- | --- |
| B1 | **`REJECTED` → `CREATED`**, **`REJECTED` → `INTAKE_PENDING`** **ALLOW** 행 **삭제**. | ☐ |
| B2 | **`REJECTED` → `IN_INTERVIEW`** 행 **한 줄**으로 통합: `kind`=`ALLOW`, `lifecycle_ref`=§5, `impl_ref`=`case-lifecycle.ts` — `REOPEN_CASE`, `notes`에 §5·재개 단일 목적지 반영. | ☐ |
| B3 | **`CLOSED` → `IN_INTERVIEW`** 행: `lifecycle_ref`를 **§5**로, `notes`를 §5 예외 재개·`REOPEN_CASE` 중심으로 정리(기존 §8-2 지침과 정합). | ☐ |
| B4 | **§11 OPEN** 표: `REJECTED`→`CREATED` 등 **구 LIFECYCLE와 충돌하는 문구**가 있으면 §8-4 반영에 맞게 **수정 또는 한 줄 메모**로 정렬(플레이스홀더 해제는 별도 합의). | ☐ |

##### C. 증빙·기록

| 순서 | 작업 | 완료 |
| --- | --- | --- |
| C1 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 에 반영 일시·승인(있으면)·변경 파일 목록을 **`[EVIDENCE-YYYYMMDD-00n]`** 블록으로 추가한다. | ☐ |

##### 전제 2 재판정에 필요한 확인 (반영 **이후** 점검)

아래는 **해소 조건표 §2·§5** 와 대응한다. **A~C 수동 반영만으로 전부가 충족되는 것은 아니다.**

| 구분 | 확인 내용 |
| --- | --- |
| **P0 (DOC≠IMPL)** | DEFINITION §5 + 요약표 B1~B3 반영 후, `CLOSED`/`REJECTED` 축이 **`REOPEN_CASE` → `IN_INTERVIEW`** 서술과 **모순 없이** 맞는지 최종 읽기. (잔여 시 문서 보완.) |
| **P1 (구현 공백)** | 아래 **§9** 네 건: **전이 공백**은 그대로일 수 있음 — 해소 조건표 §2 항 2 **미완** 가능. |
| **§11 OPEN** | 5건 각각: 유지 사유·해제 조건·문서/코드 필요 여부 **명시** 여부(해소 조건표 §2 항 3). §8-4 §11 치환만으로 **전부 해소되지 않을 수 있음**. |
| **§6 DENY 역점검** | 8행 × UI/API/서버/운영 통제 **연결** 증빙(해소 조건표 §2 항 4, §4.4). |
| **기준선** | `npx tsc --noEmit` · `npm run lint` · `npm run verify:canonical-sources` (해소 조건표 §2 항 5). |
| **점검표** | [PRACTICAL_STANDARD_CHECKLIST.md](./PRACTICAL_STANDARD_CHECKLIST.md) **§1-4-5** 행·증빙과 상호참조. |

**결론 문구:** 위 표가 **모두** 닫힐 때만 전제 2 **완충족** 재판정을 검토한다. **A~C만 완료한 시점**에서는 최소한 **P0 문서 정합은 진전**으로 기록할 수 있으나, **전제 2 미충족 유지**가 기본 가정이다.

#### 8-6. 승인 반영 실행 순서 점검 · C1 증빙 준비 ([176] 유지 · [EVIDENCE-20260421-178])

**실행본(체크박스):** [LIFECYCLE_APPROVAL_CHECKLIST_RUNBOOK.md](./LIFECYCLE_APPROVAL_CHECKLIST_RUNBOOK.md) — [EVIDENCE-20260421-180].

**전제:** 저장소에 **실제 편집을 넣는 것**은 **승인이 난 뒤**에만 한다. 본 절은 §8-5의 A1~A4·B1~B4·C1을 **어떤 순서로 적용·검증할지** 점검하고, **C1 증빙 블록 초안**을 둔다. **승인 반영 전까지 전제 2는 계속 미충족**이다.

##### 권장 적용 순서 (의존성)

| 단계 | 내용 | 비고 |
| --- | --- | --- |
| **1** | **A1** | DEFINITION §5 표가 B2·B3의 `lifecycle_ref`·설명 **근거**이므로 **최우선**. |
| **2** | **A2**, **A3** | A1과 모순 없음 확인 후 **병렬 가능**(서로 다른 절). |
| **3** | **A4** | A1~A3 후 **통독**. |
| **4** | **B1** → **B2** → **B3** → **B4** | 요약표는 **승인된** DEFINITION §5와 맞출 것. B1 삭제 → B2 통합 → B3 정리 → B4 §11 OPEN 순 권장. |
| **5** | **C1** | 문서 저장(또는 커밋)과 **동일 세션**에서 `IMPLEMENTATION_EVIDENCE.md`에 블록 추가. |

##### 단계별 최소 확인 (다음 단계로 넘기기 전)

| 단계 | 최소 확인 |
| --- | --- |
| A1 | 표가 §8-4 **(1) 교체 전문**과 일치(행 **`REJECTED`·`CLOSED`** 문구 중심). |
| A2 | 구 «재진입이 막혀» bullet **삭제**, 새 bullet **한 줄**만 존재하는지. |
| A3 | 구 «`REJECTED` → `CREATED` 재접수…» bullet **삭제**, §8-4 **(3)** 문안 **한 줄** 삽입 여부. |
| A4 | §4~§5 해설·§8과 **어휘 충돌** 없는지 1회 읽기. |
| B1 | 요약 §5에서 `REJECTED`→`CREATED`, `INTAKE_PENDING` **두 ALLOW 행 없음**. |
| B2 | `REJECTED`→`IN_INTERVIEW` **단일** ALLOW·`REOPEN_CASE`·`lifecycle_ref` §5. |
| B3 | `CLOSED`→`IN_INTERVIEW` 행 `lifecycle_ref`=§5, `notes` 정리. |
| B4 | §11 OPEN 표 **충돌** 시 `notes` 보강 또는 “미합의 유지” 한 줄. |
| C1 | 아래 템플릿 필드(목적·승인·파일·검증·근거) **빈칸 없이** 기재 가능할 것. |

##### C1 — `IMPLEMENTATION_EVIDENCE.md`에 붙여 넣을 블록 **초안** (승인 반영 **후** 사용)

아래를 복사해 새 `[EVIDENCE-YYYYMMDD-00n]` 로 쓴다. **날짜·승인·검증 로그**는 실제 수행 값으로 바꾼다.

```
### [EVIDENCE-YYYYMMDD-00n] LIFECYCLE §5·§10·§11·요약표 수동 반영([176][177] 후속)

#### 작업 목적

- [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) §8-4·§8-5에 따라 승인된 본문·요약표 반영을 기록한다.

#### 승인

- 일시: YYYY-MM-DD
- 근거: (내부 리뷰·메일·회의 등 — 운영 규칙에 맞게 기재)

#### 수정 파일

- docs/project-governance/CASE_LIFECYCLE_DEFINITION.md — §5 표, §10 bullet 1건 교체, §11 bullet 1건 교체
- docs/project-governance/CASE_LIFECYCLE_TRANSITION_SUMMARY.md — §5 요약표(B1~B3), §11 OPEN(B4 해당 시)

#### 검증 명령

- npx tsc --noEmit
- npm run lint
- npm run verify:canonical-sources

#### 검증 결과

- 실행 일시:
- 결과: (예: 모두 exit 0)

#### 근거 메모

- [175] 정합안 A: 요약에서 `REJECTED`→`CREATED`/`INTAKE_PENDING` ALLOW 제거, `REOPEN_CASE` → `IN_INTERVIEW` 단일 재개 축 정렬.
- 전제 2: P1·§6 DENY·§11 OPEN 잔여 시 **완충족 아님** — 본 블록만으로 상향하지 않음.

#### 다음 작업

- 해소 조건표 §2 잔여(§11 OPEN·§6 DENY·P1 등) 및 점검표 §1-4-5 재판정.
```

**C1 상시 복사본:** 승인 반영 직후 붙여 넣을 블록의 **동일 본문**은 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-179]** 부록에 둔다.

### 9. P1 네 건 — 문서 정정 대상 vs 구현 공백 유지 (보수·[173] 후속)

`CASE_TRANSITIONS` 기준 **전이 공백은 확정**(위 **§7 [172] 기준 재점검 결론**)이나, 문서에서 무엇을 먼저 고칠지와 코드를 남겨 둘지를 나눈다.

| P1 | 내용 | **문서 정정 대상** (초안·승인 전) | **구현 공백 유지** (전이/API 규칙 없음—착수 전) |
| --- | --- | --- | --- |
| **A** | `CREATED` → `INTAKE_PENDING` | §5·요약 **ALLOW** 문구를 **COND** 또는 **「전이 아님·별도 생성/운영 경로」** 로 내리는 초안 검토( [173] 비전이 가능성 ). | `SUBMIT_INTAKE` 와 `CASE_TRANSITIONS` 미연계·입증되지 않은 진입 **그대로 공백**. |
| **B** | `REVIEW_PENDING` → `DRAFTING` | 「수정 재작성」을 **상태 전이가 아닌** 문서·스코프로만 처리한다는 **해설**을 §5 또는 각주에 두는 초안 검토. | `(REVIEW_PENDING, DRAFTING)` 규칙 **없음 유지**. |
| **C** | `APPROVED` → `CLOSED` | §5 허용·§8·§11 **직접 종결** 서술을 한 축으로 맞추거나 허용 문구 **축소**하는 초안(전제 2 해소 조건표 §4.2 C 와 동일 계열). | `CLOSE_CASE` 는 **`DELIVERED` → `CLOSED`만**인 상태 **유지**. |
| **D** | `HOLD` → `REJECTED` | §5 에서 `HOLD` 출발 **거절** 허용을 **COND/비허용** 후보로 재서술하는 초안 검토(업무 정책 합의 선행). | `REJECT_CASE` `from` **에 `HOLD` 없음 유지**. |

#### 9-1. P1 4건 고정 판정표 ( [181] 반영 후 재판정 · [182] 정합 · [EVIDENCE-20260421-183] )

**기준:** [181] 반영 완료 후 재판정 결과. **전제 2 상향 검토 불가** 유지.

| 항목 | 전이/주제 | 현재 고정 판정 | 분류 | 미해소 이유 | 다음 확인 축 | 전제 2 영향 |
| --- | --- | --- | --- | --- | --- | --- |
| **A** | `CREATED` → `INTAKE_PENDING` | 미해소 | 구현 공백 유지 + 문서 축 COND/비전이 후보 | 현재는 「허용 전이」로 확정하기 어렵고, 문서상 조건 흐름인지 실제 상태 전이인지 분리가 안 끝남 | `CASE_TRANSITIONS` 실코드, 문서 조건문, 비전이 처리 여부 재확인 | 잔여 유지 |
| **B** | `REVIEW_PENDING` → `DRAFTING` | 미해소 | 전이 vs 문서 API 합의 필요 | 실제 상태 전이인지, 문서 생성/초안 API 흐름인지 합의 전 | 문서 생성 API/서비스, 상태 변경 호출 여부, 정의서 표현 정리 | 잔여 유지 |
| **C** | `APPROVED` → `CLOSED` | 미해소 | 문서 허용 표현 vs 실제 종료 액션 분리 필요 | 문서상 자연 종료처럼 읽히지만, 실제로는 `CLOSE_CASE` 같은 명시 액션과 연결되는지 확정 필요 | 종료 액션 기준, 상태 종료 책임 주체, 문서 서술과 구현 연결 재점검 | 잔여 유지 |
| **D** | `HOLD` → `REJECTED` | 미해소 | 정책 합의 필요 + `REJECT_CASE` `from` 역점검 필요 | 정책상 가능한지와 구현상 출발 상태 허용 범위가 아직 잠기지 않음 | `REJECT_CASE` 허용 출발점, 정책 정의서, 서버/API 실제 제한 확인 | 잔여 유지 |

**항목별 판정 메모**

- **A.** `CREATED` → `INTAKE_PENDING` — 현재는 **구현 공백 유지**. 문서상 **COND** 또는 **비전이** 흐름 후보. **즉시 허용 전이로 올리지 않음.** 전제 2 해소 항목으로 남김.
- **B.** `REVIEW_PENDING` → `DRAFTING` — 전이인지 문서 API 흐름인지 **아직 확정 아님.** 문서 생성/초안 생성 흐름과 상태 전이 축을 분리해서 봐야 함. **합의 전까지 미해소 유지.**
- **C.** `APPROVED` → `CLOSED` — 문서상 허용처럼 읽히더라도 **자동 종료로 단정하지 않음.** 실제 종료는 별도 액션 기반인지 확인 필요. `CLOSE_CASE` 기준과 연결 확인 전까지 **미해소.**
- **D.** `HOLD` → `REJECTED` — 정책 정의와 구현 허용 범위가 **아직 잠기지 않음.** `REJECT_CASE`의 from-state 검증 필요. **정책·구현 둘 다 확인 전까지 미해소.**

**공통 판정 규칙**

- P1 4건은 **모두 해소 완료 아님.**
- 4건 모두 **전제 2 잔여 이슈**로 유지.
- **문서 정정만으로 닫히는 항목**으로 보지 않음.
- **구현 역점검** 또는 **정책 합의**가 필요함.
- 따라서 **전제 2 상향 검토 근거로 사용하지 않음.**

**실무용 한 줄 결론**

P1 4건 전부 미해소 고정 — **A**는 구현 공백/비전이 후보, **B**는 전이 vs 문서 API 합의 전, **C**는 종료 액션 연결 전, **D**는 정책·`REJECT_CASE` from-state 역점검 전.

**통제 연결 1차 기입(초안, §9-1과 정합):** [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_FIRST_PASS_DRAFT.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_FIRST_PASS_DRAFT.md) — [EVIDENCE-20260421-188] · [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) 통합 표 P1 행.

**전제 2:** 위 P1 구분·§9-1 고정 판정은 **기록용**이다. [181] 반영 후에도 **P1 네 건(§9-1 미해소)·§11 OPEN·§6 DENY 역점검**이 남아 있으면 점검표 상 전제 2는 **미충족** 유지([EVIDENCE-20260421-182] · [EVIDENCE-20260421-183]).
