# P1-A 실제 코드 역점검 결과 실기입본

| 항목 | 내용 |
|------|------|
| 범위 | **P1-A 한 건만** — 전체 P1-A~D 템플릿의 나머지 칸은 비움 |
| 기준 절차 | [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_FILL_STEPS.md) — [EVIDENCE-20260421-196] |
| 본 실기입 증빙 | [EVIDENCE-20260421-197] |
| `INTAKE_PENDING` 전역 추적 | [EVIDENCE-20260421-198] |

---

## 0. 요지 (상태 고정)

**한 줄:** P1-A는 **직접 전이 부재 가능성이 매우 강해졌고**, 이제 실코드 확인 결과를 템플릿에 **실제로 기입해** 새 증빙으로 고정하면 되는 단계다.

**의미가 큰 세 가지 (이미 [196]·실제 점검과 정합):**

1. **체크리스트 · 결과 템플릿 · 예시 문서 · 실기입용 실행 순서**까지 P1-A는 한 세트로 닫힘.
2. 아래 세 단서는 P1-A를 「직접 허용 전이」보다 **생성 후 조건 흐름 / 비전이 처리 후보**로 읽게 하는 강한 근거다.  
   - `CASE_TRANSITIONS`에 **`CREATED` → `INTAKE_PENDING` 직접 규칙 행 없음**  
   - **`POST /api/cases`** 는 본문 `status` 입력 **거부**  
   - Prisma **`Case.status` 기본값은 `CREATED`**
3. **[196]** 이후 중심 단계는 **문서 정리**가 아니라 **실기입과 새 증빙 누적**이다.

**상위 판정:** [CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§9-1** — **미해소 유지** (본 실기입으로 임의 변경 없음).

---

## 1. 공통 헤더

**작업명:** P1-A 실제 코드 역점검 결과 기록 (실기입본)

**기준 증빙**

- 선행: **[EVIDENCE-20260421-196]** · **[EVIDENCE-20260421-195]**

**관련 문서**

- [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_CHECKLIST.md) §3  
- [PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1_CODE_REVIEW_RESULT_TEMPLATE.md)  
- [PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_EXAMPLE.md)

**검증 명령** *(본 증빙 [197] 제출 시)*

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

## 2. P1-A — `CREATED` → `INTAKE_PENDING` (실기입)

**상위 판정**

- 고정 판정: **미해소**
- 기존 분류: 구현 공백 유지 + 문서 축 COND / 비전이 후보

**확인 파일**

| 구분 | 경로 |
|------|------|
| 서버 | `src/lib/definitions/case-lifecycle.ts` (`CASE_TRANSITIONS`, `LifecycleActionEnum`) |
| API | `src/app/api/cases/route.ts` (`POST` 생성) |
| UI | `src/components/cases/case-form.tsx` (사건 생성 폼) |
| 운영·감사 | `docs/project-governance/CASE_LIFECYCLE_TRANSITION_SUMMARY.md` §5·§9-1 맥락 |

**확인 지점**

| 구분 | 내용 |
|------|------|
| 서버 | `CASE_TRANSITIONS` 전체 스캔: `(from,to)` 가 `CREATED` → `INTAKE_PENDING` 인 **단독 규칙 행 없음**. `SUBMIT_INTAKE` 는 `LifecycleActionEnum` 에만 있고 동일 테이블에 매칭 규칙 **없음**. |
| API | `POST` 에서 `status` in body 시 `ValidationError` — 클라이언트 직접 상태 지정 **불가**. 생성은 `createCaseService` → 저장소 기본값 경로. |
| UI | `case-form.tsx` 내 `intake`/`INTAKE_PENDING` 문자열 **미사용** (생성 폼은 제목·분류 등만). 전이처럼 보이는 카피 **없음** (별도 화면의 접수 보완 안내는 `case-detail-client` 등). |
| 운영·감사 | intake·접수 보완은 **문서·가이드·상세 UI** 축으로 서술됨. **전이 번호로의 운영 감사 로깅은 본 점검에서 미확인** → **—** |

**4축 결과** *(코드 확인 범위)*

| 축 | 결과 |
|----|------|
| 서버 | ☑ `CASE_TRANSITIONS` 에 `CREATED`→`INTAKE_PENDING` 규칙 **없음** |
| API | ☑ `POST /api/cases` 본문 `status` **거부** |
| UI | ☑ `case-form.tsx` 에 intake 전이 오해 문구 **없음** |
| 운영·감사 | — 직접 축 **약함** |

**임시 판정** *(본 실기입안, [198] 보강 후)*

- [ ] 실제 전이
- [x] **조건 흐름**
- [x] **비전이 처리 후보** *(동시: `CASE_TRANSITIONS` 직접 규칙으로는 연결 안 됨)*
- [x] **구현 공백** *(`SUBMIT_INTAKE`·`to: INTAKE_PENDING` 규칙 미연계·앱 코드에서 `INTAKE_PENDING` 설정 경로 없음 — [198]으로 저장소 내 확인 범위 확정)*
- **코드 경로 추가 확인:** [198]에서 **소진** (운영 DB·수동 SQL은 범위 밖).

**결과 한 줄**

`CREATED` → `INTAKE_PENDING` 은 **`CASE_TRANSITIONS` 직접 규칙으로는 존재하지 않고**, 생성은 **`CREATED` 기본값**·**POST 시 status 금지**로 맞물리며, 접수 보완은 **문서·UI 조건 흐름** 및 (규칙 표 바깥) **비전이 처리 후보**로 읽는 것이 **타당**하다.

**상세 메모**

- **전이 테이블:** `CREATED`→`INTAKE_PENDING` **행 없음** (`src/lib/definitions/case-lifecycle.ts`).
- **생성 후 후속:** 스키마 `@default(CREATED)` (`prisma/schema.prisma` Case 모델).
- **API:** `src/app/api/cases/route.ts` — `status` 직접 입력 거부.
- **UI:** `case-form.tsx` — intake 전이 오해 문구 **없음**.
- **`INTAKE_PENDING` 전용 갱신 위치:** [198] 전역 추적 결과, **앱·시드·`scripts`/`tools`** 범위에서는 **설정 코드 없음**으로 확정 — §2.1 참조.

### 2.1 `INTAKE_PENDING` 전역 추적 보강 ([198])

저장소에서 문자열 `INTAKE_PENDING` 을 기준으로 **`src/`·`prisma/`·`prisma/seed.ts`·`scripts/`** 를 검색하고, 아래 네 갈래로 분류했다. *(실행일: 2026-04-21, 상세·검증은 [EVIDENCE-20260421-198].)*

| 분류 | 해당 여부 | 근거 요약 |
| --- | --- | --- |
| **직접 대입** | **앱 코드에서 해당 없음** | `status: "INTAKE_PENDING"` / Prisma `data: { status: … }` 가 **INTAKE_PENDING** 으로 설정되는 구문을 **`src/**/*.ts(x)` 에서 발견하지 못함**. (`updateCaseById`·`applyCaseStatusTransition` 경로 모두 해당 없음) |
| **전이 테이블·액션 연결** | **목적지 `INTAKE_PENDING` 없음** | `CASE_TRANSITIONS` 에 **`to: "INTAKE_PENDING"` 인 규칙 없음**. `LifecycleActionEnum` 의 `SUBMIT_INTAKE` 는 **`CASE_TRANSITIONS` 어떤 행과도 `action` 으로 연결되지 않음**. `applyCaseStatusTransition` 은 `checkCaseTransitionOrThrow` → 테이블에 없는 액션은 통과 불가. |
| **조건 분기·비교만** | **있음** | 예: `case-detail-client.tsx`·`supplement/page.tsx` 의 `status === "INTAKE_PENDING"`, `case-action-guard.ts`·`case.utils.ts` 의 분기, `case-interview.service.ts` 의 인터뷰 완료 시 `fromInterviewFlow` 배열 (읽기 전제). |
| **표시·도움말·라벨** | **있음** | `CASE_STATUS_LABELS.INTAKE_PENDING`, `dashboard/page.tsx`·`cases/page.tsx` 의 `statusLabel("INTAKE_PENDING")` 안내, 허브 복귀 URL용 문자열 인자 등. |

**보강 판단 (P1-A와의 관계)**

- **`src/app/api/cases/`** 트리: `INTAKE_PENDING` **문자열 자체 미사용**. 생성·상태 변경 라우트도 [197]과 동일하게 **직접 `status` 대입 불가** 또는 **`CASE_TRANSITIONS` 준수**.
- **인터뷰 첫 저장** (`src/features/case-interview/case-interview.service.ts` `saveInterviewAnswer`): 사건이 **`CREATED`** 이면 첫 응답 저장 시 **`IN_INTERVIEW` 로만** 갱신(`updateCaseById`) — **`INTAKE_PENDING` 을 거치지 않음**.
- **시드·스크립트:** `prisma/seed.ts` 에 사건 `INTAKE_PENDING` 생성 **없음**. `tools/` 에 해당 문자열 **없음**.
- **스키마:** `Case.status` **`@default(CREATED)`** · `enum CaseStatus` 에 `INTAKE_PENDING` **값으로 존재**(마이그레이션 enum 나열 포함).

**한 줄:** **애플리케이션 코드상으로 `INTAKE_PENDING` 으로 바꾸는 경로는 없다**고 보는 것이 타당하며, 「`CREATED` → `INTAKE_PENDING`」은 **라이프사이클 액션 테이블로 실현된 직접 전이가 아니다**. (이미 DB에 해당 값이 있는 행은 마이그레이션·수동 SQL·과거 실험 등 **코드 밖** 가능성은 본 추적 범위에서 제외.)

---

## 3. 요약표 (P1-A만)

| 행 | 서버 | API | UI | 운영·감사 | 임시 판정 | 결과 한 줄 |
| --- | --- | --- | --- | --- | --- | --- |
| P1-A | ☑ | ☑ | ☑ | — | 조건 흐름 + 비전이 후보 | 직접 전이 규칙 없음·생성·status 정책상 조건 흐름 해석 우세 |

---

## 4. 증빙 블록용 축약본 (복사용)

**작업 목적:** P1-A 실제 코드 역점검 1차 결과를 서버/API/UI/운영 4축으로 기록.

**수정 파일 (문서):**

- `docs/project-governance/PREMISE2_CONTROL_CONNECTION_AUDIT_P1A_CODE_REVIEW_RESULT_FILLED.md` — 본 파일([197]·[198] 반영)
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md` — **[EVIDENCE-20260421-197]** · **[EVIDENCE-20260421-198]**

**확인 범위:** 위 §2·§2.1 표 참조.

**근거 메모:** §9-1 미해소 유지 · 전제 2 자동 상향 없음 · OPEN·DENY 일부 해석에 간접 영향 가능(접수·보완 단계 정의).

**다음 작업:** P1-B 역점검 실기입 · (선택) 운영 DB에 `INTAKE_PENDING` 행이 있는지는 **런북·SQL**로 별도 확인.
