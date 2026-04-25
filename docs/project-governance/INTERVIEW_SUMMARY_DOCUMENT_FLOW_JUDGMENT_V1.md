# AI 인터뷰 → 사건 요약 → 문서 생성 연결 — 실무 판정 (V1)

**용도:** `CORE_USER_FLOW_CLOSURE_CHECKLIST.md` **§6·§7·§8**이 가리키는 **연결 흐름**을 한 축으로 레포·실사 기준으로 확정할 때 쓰는 판정서.

**바로 다음 시작 (고정):** Top 3의 2번인 **AI 인터뷰 → 사건 요약 → 문서 생성** 연결의 실제 확정 판정을 시작한다. **Step 1**은 인터뷰 축이며, 인터뷰 진입·질문셋 로딩·답변 저장·완료 처리·상태 반영을 먼저 닫는다.

**관련:** `CASE_DETAIL_ACTUAL_JUDGMENT_V1.md` (사건 상세·문서 UI·`documents/generate` 증빙 **[243]**) — 동일 사건 맥락에서 읽는다.

**Step 1 사실상 최종 확정 (2026-04-23):** 전용 4파일 + **`src/features/case-interview/case-interview.service.ts`** 실사로 질문셋·저장·완료·상태·요약 **원천**까지 **§3**·**[§9](#step-1-interview-2026-04-23)** 갱신. **Step 1은 확정 완료로 봐도 된다** 수준. (증빙 **[254]**, 4파일만 **[252]**, 부분 **[251]**)

**Step 2 실제 확정 (2026-04-23):** 3근거 `case-summary-panel` · `summary/generate` · `listCaseInterviewAnswers`/`buildInterviewSummary` — **[§10](#step-2-summary-closure-2026-04-23)**. (증빙 **[255]**, 용어 **[253]**·service **[254]** 선행)

**Step 3 실제 확정 (2026-04-23):** 3근거 `document-create-modal` · `documents/generate` · `case-detail-client` — **[§11](#step-3-documents-closure-2026-04-23)**. (증빙 **[256]**)

**현재 판정 확인 (운용):**

| 축 | 문서 | 증빙 |
|----|------|------|
| **Step 1** 인터뷰 ( **[254]** 로 사실상 최종 잠김) | **§3** 표 · **[§9](#step-1-interview-2026-04-23)** | **[EVIDENCE-20260423-254]** |
| **Step 2** 사건 요약 | **[§10](#step-2-summary-closure-2026-04-23)** (`case-summary-panel.tsx`) | **[EVIDENCE-20260423-255]** |
| **Step 3** 문서 생성 연결 | **[§11](#step-3-documents-closure-2026-04-23)** (모달·상세·`generate` API) | **[EVIDENCE-20260423-256]** |

**Step 1 ([254]) 핵심 세 가지:** (1) 질문셋 로딩·분기·완료·상태 반영까지 **service 내부** 근거 확보. (2) 인터뷰 완료 후 **INTERVIEW_DONE** + interview **COMPLETED** + **감사**까지 흐름이 닫힘. (3) 요약 원천 **`listCaseInterviewAnswersService` + `buildInterviewSummary`** 로 고정(Step 2·**[255]**).

**Top 3의 2번 축 (Step 1~3) 전체:** AI 인터뷰 → 사건 요약 → 문서 생성 연결은 **실제 코드 기준**으로 **인터뷰 완료**·**요약 생성/표시**·**문서 생성 진입과 상태 차단**·**생성 후 검토·문단 구조 연결**까지 **닫혀 있으며**, **남은 과제**는 핵심 기능 **결손**이 아니라 **사용자 안내**와 **실패 처리 UX**의 **미세 마감**(alert·문구 고도화 등)에 **가깝다** (종합: **§3** · Step **§9~§11** · 증빙 **254~256**).

---

## 0. 점검 기준

### 점검 원칙

- **새 기능 추가**보다 **기존 연결 흐름 마감** 우선.
- 질문셋 / 상태값 / 문서 생성 규칙은 **잠근 정의서**와 **실제 코드** 일치가 기준.
- “생성된다”만으로 완료 처리하지 않고, 아래까지 닫혀야 완료로 본다.  
  **진입** · **저장** · **완료 처리** · **요약 반영** · **문서 생성 가능 여부** · **예외 상태 차단**

### 판정 상태

| 판정 | 의미 |
|------|------|
| **확정 완료** | 연결 흐름과 예외 처리까지 닫힘 |
| **보정 필요** | 흐름은 되나 문구·버튼·상태 연결 보강 필요 |
| **구조 리스크** | 기능은 되나 라우트/상태/권한/예외 처리 불균일 가능성 |
| **미완료** | 핵심 연결이 실제로 끊김 |

---

## 1. 확정 대상 3축

### A. AI 인터뷰

확인할 것: 인터뷰 진입 가능 조건 · 질문셋 로딩 · 답변 저장 · 조건 분기 · 인터뷰 완료 처리 · 완료 후 사건 상태 반영

### B. 사건 요약

확인할 것: 인터뷰 완료 후 요약 생성/표시 · 요약의 표시 위치 · 빈 상태/갱신 규칙 · 사건 상세와 연결

### C. 문서 생성 연결

확인할 것: 인터뷰 완료 전/후 문서 생성 가능 여부 · 문서 생성 버튼/모달 진입 · 생성 라우트의 상태 차단 규칙 · 생성 후 문서 목록/검토/문단 구조로 이어지는지

---

## 2. 먼저 볼 파일 순서

| # | 경로 | 비고 |
|---|------|------|
| 1 | `src/app/(protected)/cases/[caseId]/interview/page.tsx` | 인터뷰 페이지 |
| 2 | `src/components/cases/case-interview-client.tsx` | 인터뷰 클라이언트 |
| 3 | `src/app/api/cases/[caseId]/interview/route.ts` | 인터뷰 API |
| 4 | `src/app/api/cases/[caseId]/interview/complete/route.ts` | 인터뷰 완료 API |
| 5 | `src/components/cases/case-detail-client.tsx` | 상세·문서 생성 진입(허브) |
| 6 | `src/components/cases/case-summary-panel.tsx` | 사건 요약 UI — `POST` `/summary/generate` 호출, `interviewCompleted` 분기(버튼·설명) |
| 7 | `summary/generate/route.ts` + `case-interview.service.ts` | `listCaseInterviewAnswersService`로 요약 재료·조합( **[§10](#step-2-summary-terminology-2026-04-23)** ) · **DB `CaseSummary` 없이 응답만** — summary **전용** repository **없음** |
| 8 | `src/components/cases/document-create-modal.tsx` | 문서 생성 모달 — Step 3 핵심 ( **[§11](#step-3-documents-closure-2026-04-23)** ) |
| 9 | `src/app/api/cases/[caseId]/documents/generate/route.ts` | 문서 생성 라우트 — Step 3 ( **[§11](#step-3-documents-closure-2026-04-23)** ) |
| 10 | 문서 생성 후 연결 review / paragraph / document 화면·API | 실사 시 구체 경로 기입 |

**핵심 service (Step 1·요약 공통):** `src/features/case-interview/case-interview.service.ts` — `getInterviewFlowInternal`·`getActiveQuestionSet`·`saveInterviewAnswer`·`clearHiddenInterviewAnswers`·`completeCaseInterviewService`·`listCaseInterviewAnswersService`·`buildInterviewSummary` 등 ( **[§9](#step-1-interview-2026-04-23)**·**[§10](#step-2-summary-terminology-2026-04-23)** ).

**권장 순서:** **Step 1** 인터뷰 → **Step 2** 사건 요약 → **Step 3** 문서 생성 연결.

---

## 3. 실무 판정표 (확정 시 기입)

**갱신:** Step 1~3 (2026-04-23) — Step 1: 4파일+`case-interview.service` (**[254]**·**§9**). Step 2: **§10**·**[255]**. Step 3: `document-create-modal`·`documents/generate`·`case-detail-client`·**§11**·**[256]**. (4파일만 **[252]**, 부분 **[251]**)

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 인터뷰 진입 조건 | **확정 완료** | `interview/page.tsx`, `page.tsx`, `case-detail-client.tsx` | 낮음 | 유지 — `requireSessionUser` + `getCaseAccessContext` (L16~20) |
| 질문셋 로딩/분기 | **확정 완료** | `case-interview-client`, `interview/route`, `case-interview.service` | 낮음 | `getInterviewFlowInternal`·`getActiveQuestionSet`·`resolveInterviewQuestions`·`buildInterviewProgress`·`getNextQuestionKey` ( **[§9](#step-1-interview-2026-04-23)** ) |
| 답변 저장 안정성 | **완료에 가까운 확정 완료** | `case-interview-client`, `interview/route`, `case-interview.service` | 매우 낮음 | `upsertInterviewAnswerMemo`·저장 직후 `getInterviewFlowInternal`·`clearHiddenInterviewAnswers` ( **[§9](#step-1-interview-2026-04-23)** ) |
| 인터뷰 완료 처리 | **확정 완료** | `case-detail-client`, `interview/complete`, `case-interview.service` | 낮음 | 가시 `required` + `resolveActiveQuestionSetDefinition` 이중 검증·`ValidationError` ( **[§9](#step-1-interview-2026-04-23)** ) |
| 완료 후 사건 상태 반영 | **확정 완료** | `case-detail-client`, `documents/generate`, `case-interview.service` | 낮음 | `INTERVIEW_DONE`·interview `COMPLETED`·완료 memo·`CASE_INTERVIEW_COMPLETE` 감사 ( **[§9](#step-1-interview-2026-04-23)** ) + `refreshCase` / 문서 API |
| 사건 요약 생성/표시 | **확정 완료** | `case-detail-client`, `case-summary-panel`, `summary/generate`, `case-interview.service` | 낮음 | **[§10](#step-2-summary-closure-2026-04-23)** 3근거 (증빙 **[255]**) |
| 사건 요약 위치/가독성 | **완료에 가까운 확정 완료** | `case-detail-client`, `case-summary-panel` | 낮음 | **§10** 위치/블록 구조 (증빙 **[255]**) |
| 인터뷰 완료 전 문서 생성 차단 | **확정 완료** | `document-create-modal`, `documents/generate` | 낮음 | 클라+서버 이중 ( **[§11](#step-3-documents-closure-2026-04-23)** · **[256]** ) |
| 문서 생성 진입 UX | **완료에 가까운 확정 완료** | `document-create-modal`, `case-detail-client` | “왜 지금 가능” 강조 여지 | **§11** · 문구 미세( **[256]** ) |
| 문서 생성 라우트 상태 차단 | **확정 완료** | `documents/generate/route.ts` | 낮음 | `DELETED` 등 + 인터뷰 + 정의 불일치 ( **[§11](#step-3-documents-closure-2026-04-23)** ) |
| 생성 후 문서 목록 연결 | **확정 완료** | `document-create-modal`, `case-detail-client` | 낮음 | `onCreated`·`refreshCase` ( **[§11](#step-3-documents-closure-2026-04-23)** ) |
| 생성 후 검토/문단 구조 연결 | **완료에 가까운 확정 완료** | `case-detail-client`, `documents/generate` | 낮음 | 본문·문단·`DRAFTING`·타임라인 ( **[§11](#step-3-documents-closure-2026-04-23)** ) |

> 판정 상세: Step 1 **[§9](#step-1-interview-2026-04-23)** · Step 2 **[§10](#step-2-summary-closure-2026-04-23)** · Step 3 **[§11](#step-3-documents-closure-2026-04-23)**. 1차 예상은 **§5**.

---

## 4. 항목별 확인 질문

### 인터뷰 진입 조건

- 사건 상세에서 인터뷰로 자연스럽게 이동 가능한가
- 인터뷰 진입 전 상태/권한 차단이 있는가
- 잘못된 진입 시 사용자에게 이해되는 문구가 있는가

### 질문셋 로딩/분기

- 질문셋이 실제 사건에 맞게 로딩되는가
- 조건 분기가 정의서와 맞는가
- 분기 실패 시 빈 화면/오류가 없는가

### 답변 저장

- 각 답변이 실제 저장되는가
- 새로고침/재진입 시 복원되는가
- 중간 저장이 끊기지 않는가

### 인터뷰 완료 처리

- 완료 버튼이 실제로 동작하는가
- 완료 시 상태 전이 또는 완료 표시가 분명한가
- 완료 실패 시 오류 문구가 적절한가

### 사건 요약

- 인터뷰 완료 후 요약이 생성되거나 표시되는가
- 사건 상세에서 사용자가 바로 볼 수 있는가
- 비어 있으면 이유가 분명한가

### 문서 생성 연결

- 인터뷰 완료 전에는 차단되는가
- 완료 후 생성 버튼이 자연스럽게 보이는가
- 생성 후 문서 목록/검토 패널/문단 구조로 이어지는가

---

## 5. 1차 예상 판정 (에테르니언, 기억 기준)

**전제:** 실사 전·기억·세션 맥락 기준 **예상**이며 **확정이 아님** (보수적).

| 항목 | 1차 예상 |
|------|----------|
| 인터뷰 진입 조건 | 보정 필요 |
| 질문셋 로딩/분기 | 보정 필요 |
| 답변 저장 안정성 | 보정 필요 |
| 인터뷰 완료 처리 | 완료에 가까운 보정 필요 |
| 완료 후 사건 상태 반영 | 완료에 가까운 보정 필요 |
| 사건 요약 생성/표시 | 보정 필요 |
| 사건 요약 위치/가독성 | 완료에 가까운 보정 필요 |
| 인터뷰 완료 전 문서 생성 차단 | 완료에 가까운 보정 필요 |
| 문서 생성 진입 UX | 보정 필요 |
| 문서 생성 라우트 상태 차단 | 완료에 가까운 보정 필요 |
| 생성 후 문서 목록 연결 | 완료에 가까운 보정 필요 |
| 생성 후 검토/문단 구조 연결 | 보정 필요 |

---

## 6. 1차 예상의 핵심 이유

- **인터뷰** 축은 질문셋 기반·조건 분기·완료 처리까지 구현이 꽤 앞서간 것으로 잠겨 있다.
- **사건 요약**은 상세 화면에 연결된 기억이 있고, 표시 위치도 어느 정도 잡혀 있다.
- **문서 생성** 라우트는 이미 상태 차단 규칙이 비교적 선명하게 확인된 축이다 (참고: `documents/generate` 실사·**[243]**).
- 다만 **공표** 기준에서는 사용자 입장에서 *「인터뷰를 끝내면 무엇이 보이고, 그다음 무엇을 누르면 문서가 생성되는지」* **연결감**이 더 중요하므로, **UX** 마감은 아직 보정 필요로 보는 것이 안전하다.

---

## 7. 최우선 질문 3개

1. 인터뷰 완료가 실제로 사건 요약과 문서 생성 가능 상태로 연결되는가
2. 사용자가 사건 상세에서 다음 행동을 자연스럽게 이해할 수 있는가
3. 문서 생성 차단/허용 규칙이 화면과 라우트에서 일관되게 보이는가

---

## 8. Step 1 ~ Step 3

### Step 1. 인터뷰 축

**먼저 볼 것:** 인터뷰 페이지, 인터뷰 클라이언트, 인터뷰 API, 인터뷰 완료 API (**§2** 표 1~4)

**확정할 것:** 진입, 저장, 완료, 상태 반영

### Step 2. 사건 요약 축

**먼저 볼 것:** 사건 상세의 요약 패널, 요약 생성 API·요약 데이터 연결부 (**§2** 표 5~7)

**확정할 것:** 인터뷰 완료 후 요약이 보이는가, 비어 있을 때 사용자가 이해 가능한가

### Step 3. 문서 생성 연결 축

**먼저 볼 것:** 상세 화면 문서 생성 진입, 문서 생성 모달, 문서 생성 API, 생성 후 연결 화면 (**§2** 표 5, 8~10)

**확정할 것:** 인터뷰 완료 전 차단, 완료 후 생성 가능, 생성 후 검토/문단 구조 연결

**Step 1 상세 (전용 4파일 + 상세·generate 연동):** **[§9](#step-1-interview-2026-04-23)**

**Step 2 (사건 요약 축·실제 확정):** **[§10](#step-2-summary-closure-2026-04-23)**

**Step 3 (문서 생성 연결·실제 확정):** **[§11](#step-3-documents-closure-2026-04-23)**

---

<a id="step-1-interview-2026-04-23"></a>

## 9. Step 1 — AI 인터뷰 축 (2026-04-23, 4파일 + `case-interview.service` 실사·사실상 최종)

**대상 (전용 4):** `interview/page.tsx` · `case-interview-client.tsx` · `interview/route.ts` · `interview/complete/route.ts`  
**핵심 service:** `src/features/case-interview/case-interview.service.ts`  
**연동 (§3과 함께 갱신):** `[caseId]/page` · `case-detail-client` · `documents/generate` · `summary/generate`(요약 원천)

**이전 [251]·[252]:** 4파일·연결만 보면 service 내부가 추정이었으나, **[254]** 로 flow·저장·완료·상태·요약 **원천**까지 맞췄다.

### 항목별 판정 문장

1. **인터뷰 진입 조건 — 확정 완료**  
`interview/page.tsx`는 `requireSessionUser()`로 로그인 사용자를 강제하고, `getCaseAccessContext(currentUser, caseId)`를 먼저 호출해 service+permission 경유 차단을 탑니다. 이후 사건 제목·카테고리·사건·인터뷰 상태를 보여준 뒤 `CaseInterviewClient`를 렌더링합니다. 사건 상세 상단과 `INTAKE_PENDING` 배너에서도 인터뷰 링크가 제공되므로 진입 경로도 충분히 확보돼 있습니다.

2. **질문셋 로딩/분기 — 확정 완료**  
`getInterviewFlowInternal(caseId)`가 `getActiveQuestionSet()`로 활성 질문셋을 불러오고, 저장된 답변 memo를 읽어 `resolveInterviewQuestions`·`buildInterviewProgress`·`getNextQuestionKey`로 **보이는 질문·진행률·다음 질문**을 계산합니다. 클라이언트 `GET` `/interview`·`visibleQuestions`·`nextQuestionKey`는 이 계산 결과를 그대로 반영합니다.

3. **답변 저장 안정성 — 완료에 가까운 확정 완료**  
`saveInterviewAnswer`는 권한 확인 후 기존 답변 memo를 읽고 `nextAnswers`를 만든 뒤 `upsertInterviewAnswerMemo`로 저장하고, **저장 직후** `getInterviewFlowInternal`을 다시 호출해 최신 flow를 돌려줍니다. `clearHiddenInterviewAnswers`는 현재 `visibleQuestions` 기준으로 숨겨진 질문 답을 정리한 뒤 flow를 반환하므로, 분기 변경 후 **불필요 답 정리**까지 포함됩니다.

4. **인터뷰 완료 처리 — 확정 완료**  
`completeCaseInterviewService`는 접근 권한 확인·`getInterviewFlowInternal` 후, `required && !isAnswered`인 visible 질문을 검사해 부족 시 `ValidationError`를 던집니다. `resolveActiveQuestionSetDefinition`으로 **질문셋 정의 기준** 필수 질문을 한 번 더 검사하는 **이중 검증**입니다. 라우트는 `POST` `/interview/complete` → `requireSessionUser` + 위 service 한 줄.

5. **완료 후 사건 상태 반영 — 확정 완료**  
기존 완료 기록이 없으면 `markInterviewCompleted`·감사로그 `CASE_INTERVIEW_COMPLETE`를 남기고, 사건 상태가 `CREATED`·`INTAKE_PENDING`·`IN_INTERVIEW` 중 하나면 `updateCaseById(…, { status: "INTERVIEW_DONE" })`로 바꿉니다. interview row도 `status: "COMPLETED"`·`completedAt`·`answersJson`으로 갱신/생성합니다. 상세 `refreshCase`·`documents/generate`의 `COMPLETED` 검사와 맞물립니다.

6. **사건 요약 원천(데이터) — 확정 (Step 2 전체·§10 [255]와 정합)**  
`listCaseInterviewAnswersService`·`buildInterviewSummary` + `summary/generate` + `CaseSummaryPanel`로 **생성·표시**까지 **Step 2 실제 확정**([§10](#step-2-summary-closure-2026-04-23))으로 닫힘.

7. **사건 요약 위치/가독성 — 완료에 가까운 확정 완료 (§3·[255])**  
상태 카드/진행 액션 아래·문서 목록 이전·블록(개요·타임라인·쟁점·누락·체크·고지) — **[§10](#step-2-summary-closure-2026-04-23)**.

8. **인터뷰 완료 전 문서 생성 차단 — 확정 완료**  
`documents/generate` 400 + **`DocumentCreateModal`** 경고·버튼 비활성·`handleSubmit` 재차단 — **서버+클라 이중** ( **[§11](#step-3-documents-closure-2026-04-23)**·**[256]** ).

9. **문서 생성 진입·매핑·생성 후 연결 — Step 3에서 확정 ([256])**  
진입 UX·문서 타입↔질문셋↔템플릿·파라미터 정합·라우트 차단·목록·검토/문단·`DRAFTING`/타임라인 — **`document-create-modal` · `documents/generate` · `case-detail-client`** 상세는 **§11**로 옮겼다(§9는 Step 1 맥락상 요지만 유지).

### Step 1 실제 확정 판정표 (§3 정본과 동일 요지)

12행 판정·근거·리스크·조치는 **§3 표**를 정본으로 본다. 본 절은 서술형 근거를 제공한다.

### Step 1 최종 한 줄 판정

AI 인터뷰 축은 **활성 질문셋 로딩**, **가시성 분기**, **답변 저장·정리**, **필수 질문 이중 검증**, **완료 처리**, **사건 `INTERVIEW_DONE`·interview `COMPLETED`·감사**까지 `case-interview.service` 내부에서 실제로 닫혀 있으며, **Step 1은 사실상 확정 완료**로 본다. **Step 2**는 **[§10](#step-2-summary-closure-2026-04-23)**·**[255]**, **Step 3** 문서 축은 **[§11](#step-3-documents-closure-2026-04-23)**·**[256]** 로 **확정**되었다. **Top 2번 축** 잔여는 **안내·실패 UX 미세** (머리말·**§11**).

### 체크리스트 (압축) — Step 1 (실값, service 포함)

- **질문셋/분기:** `getInterviewFlowInternal`·`getActiveQuestionSet`·`resolveInterviewQuestions`·`buildInterviewProgress`·`getNextQuestionKey`
- **답변:** `upsertInterviewAnswerMemo`·저장 직후 `getInterviewFlowInternal`·`clearHiddenInterviewAnswers`
- **완료:** `completeCaseInterviewService` — 가시 required + 질문셋 정의 필수, `ValidationError`
- **상태:** `INTERVIEW_DONE`·`markInterviewCompleted`·interview `COMPLETED`·감사
- **요약:** `listCaseInterviewAnswersService` + `buildInterviewSummary` + 패널/API — **[§10](#step-2-summary-closure-2026-04-23)** **[255]**

### 시트용 (1줄)

- **인터뷰 Step 1(최종):** 질문셋·분기·저장·필수 검증·완료·사건/인터뷰 상태·요약 **원천**이 service에서 확정. **요약·문서 축** = Step 2 **[255]** · Step 3 **[256]** · **§11**.

---

<a id="step-2-summary-terminology-2026-04-23"></a>
<a id="step-2-summary-closure-2026-04-23"></a>

## 10. Step 2 — 사건 요약 축 (2026-04-23, 3근거·실제 확정)

**근거(3):** `src/components/cases/case-summary-panel.tsx` · `src/app/api/cases/[caseId]/summary/generate/route.ts` · `src/features/case-interview/case-interview.service.ts`의 `listCaseInterviewAnswersService` / `buildInterviewSummary` (증빙 **[255]**, 용어 **[253]**, service 본문 **[254]**)

### “summary … service / repository” — **완결 정리**

| 역할 | 경로/심볼 |
|------|-----------|
| summary 패널(화면) | `src/components/cases/case-summary-panel.tsx` |
| summary generate API | `src/app/api/cases/[caseId]/summary/generate/route.ts` |
| summary **실제 원천** service | `listCaseInterviewAnswersService(...)`, `buildInterviewSummary(...)` in `case-interview.service.ts` |
| summary **전용 repository** | **없음** — 별도 `CaseSummary` 저장 테이블 없이 **응답형·온디맨드** 생성 |

**“repository”**는 인터뷰·사건을 읽는 **기존 service/DB 조회 체인**을 뜻한 말( **[253]** ).

### Step 2 실제 확정 판정표

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 사건 요약 생성/표시 | **확정 완료** | `case-summary-panel`, `summary/generate`, `case-interview.service` | 낮음 | 유지 |
| 사건 요약 위치/가독성 | **완료에 가까운 확정 완료** | `case-detail-client`, `case-summary-panel` | 낮음 | 유지 |
| 인터뷰 완료 전 요약 미리보기 | **확정 완료** | `case-summary-panel` | 낮음 | 유지 |
| 요약 생성 방식(저장형/응답형) | **확정 완료** | `summary/generate` | 낮음 | 유지 (비저장) |
| 과장 완화·고지문 적용 | **확정 완료** | `summary/generate` | 낮음 | `sanitizeLegalOverclaim` + `SUMMARY_DISCLAIMER` |
| 요약 원천 데이터 정합성 | **완료에 가까운 확정 완료** | `case-interview.service` | 요약 **품질**은 질문셋/답변 품질에 좌우 | 유지(구조 리스크 아님) |
| 생성 시점 사건 상태 반영 | **확정 완료** | `summary/generate`, `case-summary-panel` | 낮음 | 응답 `caseStatus` + `CASE_STATUS_LABELS` 표시 |

### 항목별 판정 문장

1. **사건 요약 생성/표시**  
`CaseSummaryPanel`은 사건 상세에서 실제로 렌더되고, 버튼 클릭 시 `POST /api/cases/${caseId}/summary/generate`로 요약을 불러온다. 서버는 `listCaseInterviewAnswersService`로 인터뷰 답변·사건 상태를 읽고, `buildInterviewSummary`로 개요·타임라인·쟁점·누락·체크리스트를 만들어 응답한다. **생성·표시 흐름이 코드 기준으로 닫힌다.**

2. **사건 요약 위치/가독성**  
요약은 상태 카드·진행 액션 아래, 문서 목록 **이전**의 독립 섹션이다. 내부는 **사건 개요, 타임라인·경위, 쟁점·이슈, 누락·주의, 체크리스트, 고지문**으로 나뉘어 읽기 구조가 명확하다. **완료에 가까운 확정 완료**로 본다.

3. **인터뷰 완료 전 요약 미리보기**  
`interviewCompleted`에 따라 문구·버튼이 갈린다(미완료: **요약 미리보기** / 완료: **1차 요약 불러오기**). 완료 **전**에도 형식 확인·미리보기, **후**에는 정식 1차 요약으로 안내된다. **UX가 코드로 분명하다.**

4. **요약 생성 방식(저장형/응답형)**  
`summary/generate` 주석: **DB `CaseSummary` 없이 응답만**. 요청 시점에 조합해 반환하는 **온디맨드·비저장** 구조로 **확정**한다.

5. **과장 완화·고지문**  
`sanitizeLegalOverclaim`(예: “반드시 승소”→“유리할 가능성”, “100% 확실”→“추가 검토 필요”)과 `SUMMARY_DISCLAIMER`를 응답에 포함한다. **서버 강제**로 **확정 완료**.

6. **요약 원천 데이터 정합성**  
`listCaseInterviewAnswersService`는 `getCaseAccessContext` 후 사건·답변 memo를 읽어 `buildInterviewSummary`에 넘긴다. `buildInterviewSummary`는 사건 제목·카테고리·답변 맵 기반으로 필드를 구성한다. **인터뷰 답변 기반 조합형**이며, 품질은 **입력(질문셋/답변)**에 영향을 받는다(구조적 미결 아님).

7. **생성 시점 사건 상태 반영**  
응답 `caseStatus: data.case.status`를 패널이 `CASE_STATUS_LABELS`로 표시(“생성 시점 사건 상태”). **확정 완료**.

### Step 2 최종 한 줄 판정

사건 요약 축은 **인터뷰 답변 기반**의 **온디맨드·비저장형** 1차 요약을 **실제로 생성·표시**하고, 완료 **전**에는 **미리보기**, **후**에는 **정식 1차 요약**으로 UX를 분기하며, **과장 완화**와 **고지문**까지 **서버에서 강제**하는 구조로 **실제 확정**할 수 있다.

### 체크리스트 (압축) — Step 2 (실값)

- **패널:** 사건 상세에 `CaseSummaryPanel` 연결
- **생성:** `POST` `/api/cases/:id/summary/generate`
- **원천:** `listCaseInterviewAnswersService` + `buildInterviewSummary`
- **완료 전 UX:** 요약 미리보기
- **완료 후 UX:** 1차 요약 불러오기
- **저장:** 비저장(온디맨드 응답)
- **서버:** 과장 완화 + 고지 + `caseStatus` 포함
- **판정:** 사건 요약 축은 **코드 기준 확정** — 남는 것은 **콘텐츠 품질 미세**이지 **구조 리스크**가 아님

### 시트용 (1줄)

- **요약 Step 2(실값):** 사건 요약은 인터뷰 답변 기반 **온디맨드·비저장형**으로 **실제 생성·표시**되며, 완료 전 **미리보기**/완료 후 **1차 요약** UX와 **과장 완화·고지문·`caseStatus` 표시**까지 **코드로 확정**된다.

---

<a id="step-3-documents-closure-2026-04-23"></a>

## 11. Step 3 — 문서 생성 연결 축 (2026-04-23, 3근거·실제 확정)

**근거(3):** `src/components/cases/document-create-modal.tsx` · `src/app/api/cases/[caseId]/documents/generate/route.ts` · `src/components/cases/case-detail-client.tsx` (증빙 **[256]**)

### Step 3 실제 확정 판정표

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 문서 생성 진입 UX | **완료에 가까운 확정 완료** | `document-create-modal`, `case-detail-client` | “왜 지금 가능” **더 강조** 여지 | 유지, 문구 미세 |
| 인터뷰 완료 전 생성 차단 | **확정 완료** | `document-create-modal`, `documents/generate` | 낮음 | 클라 경고·비활성·`handleSubmit` + 서버 400 |
| 문서 타입/질문셋/템플릿 연결 | **확정 완료** | `document-create-modal`, `documents/generate` | 낮음 | `DOCUMENT_OPTIONS` + 정의 조회·불일치 400 |
| 생성 요청 파라미터 정합성 | **확정 완료** | `document-create-modal`, `documents/generate` | 낮음 | BodySchema ↔ POST body |
| 라우트 상태 차단 | **확정 완료** | `documents/generate` | 낮음 | `DELETED` 등·인터뷰·정의 |
| 생성 실패/예외 메시지 | **완료에 가까운 확정 완료** | `document-create-modal`, `documents/generate` | **alert** 기반, 토스트 등 고도화 여지 | 메시지는 실무적 |
| 생성 후 문서 목록 반영 | **확정 완료** | `document-create-modal`, `case-detail-client` | 낮음 | `onCreated` + `refreshCase` |
| 생성 후 검토/문단 구조 연결 | **완료에 가까운 확정 완료** | `case-detail-client`, `documents/generate` | 낮음 | 본문·문단·`DRAFTING`·`DOCUMENT_DRAFT_CREATED` |

### 항목별 판정 문장

1. **문서 생성 진입 UX**  
`case-detail-client`는 문서 목록 카드·`CaseStatusActions`의 생성 진입을 모두 `DocumentCreateModal`로 연결한다. 모달은 문서 종류·제목·질문셋·템플릿 코드/버전을 **생성 전에** 보여 준다.

2. **인터뷰 완료 전 생성 차단**  
`!interviewCompleted` 이면 경고·버튼 비활성·`handleSubmit`에서 `alert`로 재차단. 서버는 `!interview || interview.status !== "COMPLETED"` 시 400. **이중 차단**.

3. **문서 타입/질문셋/템플릿**  
`DOCUMENT_OPTIONS`(STATEMENT / OPINION / CONSULT_NOTE 등)에 질문셋·템플릿 매핑. 라우트는 정의를 DB에서 조회하고 **템플릿 타입↔문서 타입** 불일치 시 400.

4. **생성 요청 파라미터**  
`documentType`, `title`, `questionSetCode`/`Version`, `templateCode`/`Version` — 클라·서버 스키마 **정합**.

5. **라우트 상태 차단**  
`DELETED`·`REJECTED`·`CLOSED`, 인터뷰 미완료, 질문셋/템플릿 **불일치** 차단.

6. **생성 실패/예외**  
클라 `json.message`·`alert`. 서버는 인터뷰·질문셋·템플릿 관련 **구체적** 메시지. **UX 고급화**는 잔여(토스트 등).

7. **생성 후 문서 목록**  
`onCreated` → 모달 닫힘 + `refreshCase()` → `GET` …`/detail`로 목록 **갱신**.

8. **검토/문단·상태**  
라우트: `legalDocumentParagraph.createMany`·`legalDocumentVersion`·사건 `DRAFTING`·`DOCUMENT_DRAFT_CREATED` 타임라인. 상세: 선택 시 `DocumentReviewPanel`·본문·`ParagraphStructurePanel`. **흐름이 닫힘**.

### Step 3 최종 한 줄 판정

문서 생성 축은 **인터뷰 완료 전** **클라·서버 이중 차단**, **문서 종류↔질문셋↔템플릿** 매핑, **생성 후** 문서 목록·검토·문단·**타임라인**·**DRAFTING** 반영까지 **실제 코드**로 닫혀 있으며, **남은 것**은 **alert** 기반 UX **고급화** 정도다.

### 체크리스트 (압축) — Step 3 (실값)

- **진입:** 상세 → 모달
- **차단:** 모달(경고·비활성·`handleSubmit`) + 서버 400
- **매핑:** 문서 종류 ↔ 질문셋 코드/버전 ↔ 템플릿 코드/버전
- **라우트:** 사건·인터뷰·정의 **차단** 선명
- **생성 후:** `refresh`·문단·버전·`DRAFTING`·타임라인
- **판정:** **확정** — 잔여 = **성공/실패 UX 미세** (alert→토스트 등)

### 시트용 (1줄)

- **문서 Step 3(실값):** 인터뷰 완료 **전** 클라·서버 **이중 차단**, 문서-질문셋-템플릿 **매핑**, 생성 **후** 목록·검토·문단·**DRAFTING**·**타임라인**까지 **코드로 닫힌다**.

---

## 12. 공표 전 운용 한 줄

**AI 인터뷰 → 사건 요약 → 문서 생성** 연결 축은 AI법친의 **핵심 가치**가 가장 직접 드러나는 흐름이므로, **기능 존재** 여부보다 *「완료 후 다음 행동이 자연스럽게 이어지는지」*를 기준으로 실제 확정 판정해야 한다.

**종합(Step 1~3·254~256):** 머리말 **「Top 3의 2번 축 (Step 1~3) 전체」** 문단 참고.

---

## 13. 문서 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | V1 신설 — §0~8, §3 빈 표, §5 1차 예상, Step 1~3, 시작 문장·공표 한 줄 — 증빙 **[250]** |
| 2026-04-23 | **Step 1 (부분)** `§3`·`§9`·증빙 **[251]** — 상세+`documents/generate` 중심 |
| 2026-04-23 | **Step 1 (확정)** 전용 4파일 실사 `§3`·`§9`·증빙 **[252]** — [251] 대비 질문셋/답변/완료 라우트 본문 반영 |
| 2026-04-23 | **Step 2 용어·범위** — `§2` 7행, `§3` 요약 행, **`§10`**(앵커 `step-2-summary-terminology-2026-04-23`)·증빙 **[253]** — service/repository 뜻·`CaseSummary` 비저장·`listCaseInterviewAnswersService` |
| 2026-04-23 | **Step 1 (service 포함 사실상 최종)** `§2` service 줄, `§3` 인터뷰·요약(데이터) 행, **`§9`·`§10`**·증빙 **[254]** — `case-interview.service.ts` 전면 |
| 2026-04-23 | **Step 2 (3근거 실제 확정)** `§3` 요약 2행, **`§10`**(앵커 `step-2-summary-closure-2026-04-23`, 구 `terminology`와 **병치**)·증빙 **[255]** — 패널·`summary/generate`·`list`/`buildInterviewSummary` |
| 2026-04-23 | **운용 포인터** — 머리말 **「현재 판정 확인」** 표: Step 1~3, 증빙 **254~256**, Top 2번 축 **전체** 문단 |
| 2026-04-23 | **Step 3 (3근거 실제 확정)** `§3` 문서·차단·생성 후 행, **`§11`**(앵커 `step-3-documents-closure-2026-04-23`)·**§12** 공표 종합, 증빙 **[256]** — 모달·`documents/generate`·`case-detail-client` |

---

## 상호참조

- `docs/project-governance/CORE_USER_FLOW_CLOSURE_CHECKLIST.md` — **§6**·**§7**·**§8** (본 문서 링크는 `§6` 직전 blockquote)
- `docs/project-governance/CASE_DETAIL_ACTUAL_JUDGMENT_V1.md` — 사건 상세·문서 UI 동선
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md` — **[243]**·**[250]**·**[251]**·**[252]**·**[253]**·**[254]**·**[255]**·**[256]**
