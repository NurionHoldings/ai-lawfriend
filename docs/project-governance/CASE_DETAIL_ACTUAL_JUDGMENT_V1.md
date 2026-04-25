# 사건 상세 — 실제 확정 판정 (V1)

**용도:** `CORE_USER_FLOW_CLOSURE_CHECKLIST.md` **§9 사건 상세**를 **레포·실사 기준으로 확정**할 때 쓰는 실무 판정서.  
**시작 한 줄:** 사건 상세 실제 확정 판정은 화면(상단/상세 클라이언트/액션/문서/배너)과 service·permission·API 축을 함께 대조해, 삭제 사건 차단·버튼 노출·업무 허브 적합성을 최종 확정하는 작업으로 시작한다.

**관련:** 증빙 **[243]** (`IMPLEMENTATION_EVIDENCE.md`) — `detail` API·raw vs service·DELETED 경로.

**Step 1~3 잠금 (한 줄·운용):** 사건 상세 축은 Step 1~3 기준으로 **실제 확정 판정**이 가능해졌고, 핵심 결론은 **「UI는 잘 연결되어 있으나 DELETED 차단은 service+permission(`getCaseAccessContext`) 축에서 걸리고, raw 단건 상세 축과의 불균일이 구조 리스크」**라는 점이다. (세부·실사: **[248]**)

---

## 1. 확정 대상 (6축)

사건 상세는 아래 **6축**으로 확정 판정한다.

| # | 축 | 포함 내용 |
|---|----|-----------|
| A | **상세 진입** | 로그인 / 권한 / 존재하지 않는 사건 / **삭제 사건** 처리 |
| B | **상태 표시** | 사건 상태 / 인터뷰 상태 / 문서 상태 / **요약 정보** 표시 |
| C | **진행 액션** | **역할별** 버튼 노출 · **상태별** 버튼 노출 · **금지 상태** 차단 |
| D | **문서 영역** | 문서 목록 · 문서 **생성** 버튼 · 문서 선택 후 **리뷰** / **문단 구조** / **본문 미리보기** |
| E | **보완/안내 흐름** | `INTAKE_PENDING` / `REVIEW_PENDING` **배너** · 의뢰인/담당자 **안내 분기** |
| F | **삭제/예외 처리** | 삭제 **버튼** 노출 · **DELETED** 차단 경로 · **raw 상세 / API** 차이로 인한 **혼선** 여부 |

---

## 2. 이번 확정 판정에서 먼저 볼 파일 (권장 순서)

| 순서 | 경로 | 확정 측면 |
|------|------|------------|
| 1 | `src/app/(protected)/cases/[caseId]/page.tsx` | 상세 **진입**·상단·**삭제 버튼** 노출 |
| 2 | `src/components/cases/case-detail-client.tsx` | 상세 **핵심 UX** (액션·문서·배너·생성 차단) |
| 3 | `src/components/cases/case-status-card.tsx` | **상태 카드** |
| 4 | `src/components/cases/case-status-actions.tsx` | **진행 액션** |
| 5 | `src/components/cases/delete-case-button.tsx` | **삭제** UI |
| 6 | `src/features/cases/case.service.ts` | service 경유 **정합** |
| 7 | `src/features/cases/case.permissions.ts` | **권한**·금지 |
| 8 | `src/features/cases/case.repository.ts` | **조회**·저장소 |
| 9 | `src/app/api/cases/[caseId]/route.ts` | **API** (리소스) |
| 10 | `src/app/api/cases/[caseId]/detail/route.ts` | **raw 상세** 축 |

- **1~5:** 화면 / **UX** 확정  
- **6~10:** **권한** / 조회 / **API** 확정

---

## 3. 사건 상세 확정 판정 기준 (4상태)

| 판정 | 의미 |
|------|------|
| **확정 완료** | 화면·권한·상태·**예외**가 **모두** 정합 |
| **보정 필요** | **동작은** 되나 문구·노출·**연결** 보강 필요 |
| **구조 리스크** | 동작은 하지만 **라우트/권한/API 불균일**로 **오해** 가능 |
| **미완료** | 핵심 흐름이 **실제로** 끊김 |

---

## 4. 사건 상세용 실무 판정표 (확정 시 기입)

**갱신:** **Step 1~3** 실사 반영 (2026-04-23). **Step 3** = `case.permissions.ts` + `case.service.ts` — **DELETED** 실제 차단 계층 **확정**. (`detail/route.ts` 등 raw 단건 미세 실사는 **[243]**·필요 시 별도 행으로 보강)

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 상세 진입 권한 | 보정 필요 | `case.permissions.ts`, `case.service.ts` (종합) `page.tsx` | service 경유 상세는 **DELETED** 차단, raw 상세 **축**과 **불균일** | service 경유 = 확정, raw 축 = **구조 리스크** 별도 고정 |
| 삭제 사건 차단(종합) | 구조 리스크 | `case.permissions.ts`, `case.service.ts`, `[caseId]/page.tsx`, `detail/route.ts` | `getCaseAccessContext` **경로** = NotFound 차단, raw **경로** = **미차단** 후보 | 「**service** 차단 / **raw** 미차단 후보」이중 구조로 최종 문장 고정 |
| 상태 카드 표시 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | 상태 표시는 안정, **상위 불균일** 잔여 | 유지 |
| 진행 액션 노출 | 보정 필요 | `case-detail-client.tsx` | UX 층위 분리(상단 / 우측) | 상단·우측 역할 문구 보강 |
| 문서 생성 차단 규칙 | 완료에 가까운 보정 필요 | `case-detail-client.tsx`, `documents/generate/route.ts` | 화면·라우트 모두 차단하나 **축**이 나뉨 | 유지 |
| 문서 목록/선택 | **완료** | `case-detail-client.tsx` | 낮음 | 유지 |
| 문단 구조/본문 미리보기 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | 낮음 | 유지 |
| 보완 안내 배너 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | 허브 **동선** 최종 점검 | 유지 |
| 삭제 버튼 노출 | 구조 리스크 | `[caseId]/page.tsx` | 상단 `DeleteCaseButton` **무조건** | 구조 리스크 고정 |
| raw 상세/API 불균일 | 구조 리스크 | `[caseId]/page.tsx`, `detail/route.ts`, `case.permissions.ts`, `case.service.ts` | service 차단 vs raw 미차단 후보 | 사건 상세 **최종 문장** 핵심 리스크로 고정 |
| 사건 요약 표시 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | 빈 상태 / 설명 미세 | 유지 |

> 긴 판정·**한 줄**·**체크리스트**·**닫는 문장(Step 1+2+3):** [§8.1](#page-tsx-2026-04-23) · [§8.2](#case-detail-client-2026-04-23) · [§8.3](#step3-permissions-service-2026-04-23). `§5` 참고, 이력 `§10`.

---

## 5. 현재 기억 기준 1차 예상 판정 (에테르니언, 실사 전)

**전제:** **실레포 실사 이전** · **기억·이전 잠금** 기준. **확정 아님.**

| 항목 | 1차 예상 |
|------|----------|
| 상세 진입 권한 | 보정 필요 |
| 삭제 사건 차단 | **구조 리스크** |
| 상태 카드 표시 | 완료에 가까운 보정 필요 |
| 진행 액션 노출 | 보정 필요 |
| 문서 생성 차단 규칙 | 완료에 가까운 보정 필요 |
| 문서 목록/선택 | 완료에 가까운 보정 필요 |
| 문단 구조/본문 미리보기 | 보정 필요 |
| 보완 안내 배너 | 보정 필요 |
| 삭제 버튼 노출 | **구조 리스크** |
| raw 상세/API 불균일 | **구조 리스크** |

**핵심 이유 (잠긴 맥락):**

- `case-detail-client.tsx` 자체는 **꽤 잘** 짜여 있음.  
- 다만 `[caseId]/page.tsx` **상단 삭제 버튼** 노출, `detail/route.ts` **raw 상세** 축, **service + permission** 경유 축이 **서로 달라** 사건 상세는 **기능**보다 **구조 불균일 관리**가 **핵심 리스크**다.

---

## 6. 이번 확정 판정의 최우선 질문 3개

1. **삭제 사건**은 사용자가 **실제로 어디서** 차단되는가.  
2. **상세 화면 버튼** 노출은 **권한/상태**와 **정말 일치**하는가.  
3. **사용자** 입장에서 사건 상세가 **‘업무 허브’**로 **충분히 자연스러운**가.

> 위 3가지만 먼저 닫으면 **절반 이상** 끝난다.

---

## 7. 바로 다음 실무 순서 (Step 1~3)

| Step | 대상 | 볼 것 |
|------|------|--------|
| **1** | `src/app/(protected)/cases/[caseId]/page.tsx` | 상세 **진입** · 상단 버튼 · **삭제 버튼 노출 책임** |
| **2** | `src/components/cases/case-detail-client.tsx` | 상세 **핵심 UX** — 액션 / 문서 / 배너 / **생성 차단** |
| **3** | `src/features/cases/case.permissions.ts` + `case.service.ts` | **실제 DELETED 차단**과 **service** 경유 **정합성** |

이후 `case-status-card`·`case-status-actions`·`delete-case-button`·`route.ts`·`detail/route.ts`·`case.repository.ts`로 **나머지 표 행**을 채운다.

---

## 8. 파일별 확정 판정 (누적)

<a id="page-tsx-2026-04-23"></a>

### 8.1. `(protected)/cases/[caseId]/page.tsx` — 2026-04-23 (실사)

**근거 파일:** `src/app/(protected)/cases/[caseId]/page.tsx` (대략 L1~L105).

**코드 앵커 (요지):** `getSessionUser` → 비로그인 `redirect("/login")` → `prisma.case.findUnique` → 없으면 `notFound` → `assertCaseAccess("case.read", permissionContextFromSession(…))` → `serializeCaseDetail` → 상단 `Link`(인터뷰/수정/목록) + `DeleteCaseButton` **무조건** → `CaseDetailClient`.

#### 항목별 판정 문장

1. **상세 진입 권한**  
   `getSessionUser()`로 **비로그인**은 `/login`으로 보내고, 이후 `assertCaseAccess("case.read", permissionContextFromSession(…))`를 호출한다. **기본 접근 제어는 존재**한다.  
   다만 **DELETED** 상태를 이 파일이 **직접 검사하지 않으므로**, **권한** 통제는 있으나 **DELETED 전용 차단**은 **이 계층에 없다**.

2. **삭제 사건 차단**  
   `caseRecord`를 읽은 뒤 `assertCaseAccess`만 수행하며, `found.status === "DELETED"` **같은 차단 분기는 없다**. service·permission 경유 축과 **달리**, 이 페이지는 **DELETED 차단** 관점에서 **구조 리스크**로 보는 것이 맞다.

3. **상태 카드 표시**  
   `serializeCaseDetail(caseRecord)`를 `CaseDetailClient`에 넘긴다. **상세 데이터 전달 허브**로서 **안정**적이나, 상태 카드 **완성도**는 `CaseDetailClient`·`CaseStatusCard` **함께** 봐야 닫힌다.

4. **진행 액션 노출**  
   **상단**은 AI 인터뷰·수정·목록 + `DeleteCaseButton`뿐. **사건 상태** 기반 세부 액션은 `CaseDetailClient` → `CaseStatusActions` **축** — 이 파일은 **상위 조립** 지점이다.

5. **삭제 버튼 노출**  
   `<DeleteCaseButton caseId={caseId} />`가 **조건 없이** 렌더링된다. **사건 상세** 화면에서 **삭제 버튼 노출 책임**은 **이 파일**이 진다고 **확정**해도 된다.

6. **raw 상세 / API 불균일**  
   `prisma.case.findUnique` + `assertCaseAccess` 구조 — **잠긴** raw `detail` API([243])와 **같은 계열**의 **UI 쪽** raw 단건 **보강** 근거로 쓴다.

#### 이 파일에 대한 한 줄 판정

`src/app/(protected)/cases/[caseId]/page.tsx`는 사건 상세 **상위 조립 지점**으로서 **기본 접근 권한**은 확인하나 **DELETED를 직접 차단하지 않으며**, 특히 **삭제 버튼**을 **조건 없이** 직접 노출하므로 사건 상세 축의 **핵심 구조 리스크**이자 **raw 단건 상세** 보강 **근거**로 본다.

#### 체크리스트용 (압축)

- `[caseId]/page.tsx`
  - 상세 진입 권한: **있음** (`getSessionUser` + `assertCaseAccess("case.read", …)`)
  - **DELETED 직접 차단:** **없음**
  - **삭제 버튼:** 상단에서 `DeleteCaseButton` **조건 없이** 직접 렌더링
  - **판정:** 사건 상세 **상위 조립 지점**이며, **DELETED 차단 부재**와 **삭제 버튼 노출**이 함께 있는 **구조 리스크** 축

#### 시트용 (1줄)

- `사건 상세` / `page.tsx`: 기본 접근 권한은 있으나 **DELETED 직접 차단은 없고**, 상단 `DeleteCaseButton`을 **조건 없이** 노출 — **구조 리스크** + **[243]** **raw** 보강 축

<a id="case-detail-client-2026-04-23"></a>

### 8.2. `case-detail-client.tsx` — 2026-04-23 (실사, Step 2)

**근거 파일:** `src/components/cases/case-detail-client.tsx` (대략 L1~L577).

**코드 앵커 (요지):** `useState(caseRecord)` / `useEffect` 동기화 · `computeCaseFacts` → `getAllowedCaseActions` → `caseActionsForUi` (`DELIVER_DOCUMENT` = 기본 허용 **및** 선택 문서 `status === "LOCKED"`) · `cannotCreateDocument` = `CLOSED`/`REJECTED`/`DELETED` · `refreshCase` → `GET` `/api/cases/${id}/detail` · 배너 `INTAKE_PENDING` / `REVIEW_PENDING`(담당·의뢰인) · `CaseStatusCard` / `CaseStatusActions` / `CaseSummaryPanel` / 문서 목록·`DocumentReviewPanel`·본문 미리보기·`ParagraphStructurePanel`.

#### Step 2 판정표 (이 파일 기준)

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 상태 카드 표시 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | 사건/인터뷰/문서(선택) 상태 + `facts` **배지** 연동 — **의미 설명**은 카드·문맥 **의존** | **현 구조 유지**, **공표 전** 문구만 최종 |
| 진행 액션 노출 | 보정 필요 | `case-detail-client.tsx` | `getAllowedCaseActions` 직접 + `DELIVER_DOCUMENT` **화면** 보정 — **상단** 링크와 **우측** 액션 **분리** | **역할 구분** 문구 보강 |
| 문서 생성 차단 규칙 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | `cannotCreateDocument` + 버튼 `title` (종료·반려·삭제 안내) | **규칙 유지**, 안내 **문구**만 |
| 문서 목록/선택 | **완료** | `case-detail-client.tsx` | 목록·`active`·빈 상태·**라벨** | **유지** |
| 문단 구조/본문 미리보기 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | 선택 시 패널 **연결**·미선택 **빈 상태** | **빈 상태**·첫 **진입** 설명만 선택 보강 |
| 보완 안내 배너 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | `INTAKE`·`REVIEW` **역할** 분기·`caseDetailHubReturnHref` 등 | 문구 **양호** — **허브** 동선만 점검 |
| 사건 요약 표시 | 완료에 가까운 보정 필요 | `case-detail-client.tsx` | `CaseSummaryPanel` `caseId` + `interviewCompleted` | **생성 시점** / **빈 상태** 최종 |
| 삭제 사건 차단(화면 내부) | 보정 필요 | `case-detail-client.tsx` | **입구**에서 전면 차단 **아님** — **문서 생성**만 `DELETED` 등에서 `cannotCreateDocument` | **page** / **Step 3** **service·permission**과 **종합** |
| raw 상세/API 불균일 대응 | 구조 리스크 | `case-detail-client.tsx` | **caseRecord** **신뢰** 렌더 + `refreshCase` = **`/detail` API** | **[243]**, 상위·**detail** **차단**과 **한 덩어리**로 설명 |

#### 항목별 판정 문장

1. **상태 카드** — `CaseStatusCard`에 사건/인터뷰/문서(선택) 상태·`facts` **전달** → **핵심** 상태 표시 **연결**은 **양호**. 남는 것은 **의미**를 읽기 쉬운 **문구** 수준 **보정**.  
2. **진행 액션** — `getAllowedCaseActions` 후 `caseActionsForUi`에서 `DELIVER_DOCUMENT`만 **LOCKED** 선택 문서에 **맞춤**. 논리는 **분명**하나 **상단**·**우측** **액션 층**이 **나뉘어** **혼란** 가능.  
3. **문서 생성 차단** — `cannotCreateDocument` = `["CLOSED","REJECTED","DELETED"]` (실제: `["CLOSED", "REJECTED", "DELETED"].includes(localCase.status)`) + `title` **명시** → **안정**적.  
4. **문서 목록/선택** — `selectedDocumentId`·`active`·빈 상태 — **완료** **가능** 판정.  
5. **문단·본문** — 선택 시 `DocumentReviewPanel`·**본문 미리보기**·`ParagraphStructurePanel`·미선택 **빈** UI — **구조** **양호**, **첫 사용자** **설명**만 **미세** 보강.  
6. **보완 배너** — `INTAKE`·`REVIEW`(담당/의뢰인) **분기**·`supplementHub`·`caseDetailHubReturnHref` — **보완/작업 허브** **역할** **수행**.  
7. **삭제(화면 내부)** — **입구** **전면** 차단 **없음**; **DELETED**에서 **새 문서**만 **막힘** → **부분** 차단, **상위**와 **합산** **필수**.  
8. **raw** — `caseRecord` **그대로** 화면화; `refreshCase`는 **`/api/cases/.../detail`** — **[243]** **불균일**과 **직접** **맞닿음**.

#### 이 파일에 대한 한 줄 판정

`src/components/cases/case-detail-client.tsx`는 사건 상세 **실질 업무 허브**로 **상태**·**진행 액션**·**문서**·**문단**·**보완 안내**를 **잘** 연결하나, **DELETED 전체** **차단**은 **직접** 하지 않고 **상위**가 준 **상세**를 **그대로** 쓰므로 **[243]** **raw** **불균일** **리스크**와 **맞닿는다**.

#### 체크리스트용 (압축)

- `case-detail-client.tsx`  
  - **상태 카드:** **연결** 양호  
  - **진행 액션:** `getAllowedCaseActions` + `DELIVER_DOCUMENT` **LOCKED** **보정**  
  - **문서 생성:** `CLOSED` / `REJECTED` / `DELETED` **명시** 차단 + `title`  
  - **문서 목록/선택:** **안정**  
  - **문단/본문:** **연결** 양호  
  - **보완 배너:** **역할** 분기 **존재**  
  - **판정:** **업무 허브**·UX **강** — **DELETED** **전면** **미차단** → **상위**·**raw** **리스크** **연결**

#### 시트용 (1줄)

- `case-detail-client.tsx`: 상태·액션·문서·문단·**보완** **허브** — **문서 생성**은 `DELETED` 등 **차단**; **props·`/detail` 갱신** 데이터 **신뢰** **렌더** → **raw** **불균일** **리스크** **접선**

#### Step 1+2 **중간 결론**

- **`page.tsx`:** **상위** **조립** — **삭제** **버튼** **책임** + **raw** **상세** **구조** **리스크**  
- **`case-detail-client.tsx`:** **하위** **업무** **허브** — **UX** **연결** **양호** — **내려온** **상세** **그대로** **화면화**  
- **요약:** **DELETED** **차단** **책임**은 **page** / **service** / **permission** / **`detail` API** **축**에 **있고**, **그** **불균일**이 **하위** **사건** **상세** **전체** **구조** **리스크**로 **전달**된다.

**Step 3 이후 최종 문장:** **[§8.3](#step3-permissions-service-2026-04-23)** 참고.

<a id="step3-permissions-service-2026-04-23"></a>

### 8.3. `case.permissions.ts` + `case.service.ts` — 2026-04-23 (실사, Step 3)

**대상:** `src/features/cases/case.permissions.ts`, `src/features/cases/case.service.ts`

#### 핵심 결론

- 사건 상세의 **DELETED 직접 차단 핵심 계층**은 **`case.permissions.ts`의 `getCaseAccessContext`** 이다.  
- `case.service.ts`의 **`getCaseDetailService`** 는 먼저 **`getCaseAccessContext(currentUser, caseId)`** 를 호출하며(L91), 여기서 `!found || found.status === "DELETED"` 이면 **`NotFoundError("사건을 찾을 수 없습니다.")`** (`case.permissions.ts` L78~80). 따라서 **service 경유 상세 축**은 **DELETED를 숨긴다**.  
- 반면 **raw 단건 상세 축**(`page.tsx`, `api/cases/[caseId]/detail/route.ts` 등)은 **이 계층을 타지 않으면** 동일 보장이 없을 수 있어, **구조 리스크**는 **하위 UI**보다 **상위 raw 조회·접근 구조의 불균일**에 있다.

#### Step 3 판정 문장

1. **상세 진입 권한** — `getCaseDetailService`가 **선행**으로 `getCaseAccessContext`를 호출한다. `getCaseAccessContext`는 **`!found || found.status === "DELETED"`** 시 **`NotFoundError("사건을 찾을 수 없습니다.")`** 를 던진다. **service 경유 상세 진입**은 **DELETED를 명시적으로 숨긴다**.  
2. **삭제 사건 차단** — **일괄** 적용되지 **않는다**. **`getCaseAccessContext`를 타는** service 경유 축은 **DELETED**를 **숨기나**, `[caseId]/page.tsx`·`detail/route.ts` **류** **raw 단건** 축은 **이 차단을 직접 쓰지 않는다** → **「service 차단 / raw 미차단 후보」** **이중 구조** **리스크**.  
3. **service 계층** — `case.service.ts`는 **DELETED 복구** 기능이 **없고**, 상세·목록·대시보드를 **permission / repository** 에 **위임**하는 **중간** 계층이다. **`softDeleteCaseService`** 는 `status: "DELETED"` 로 갱신하고 **`CASE_SOFT_DELETE`** 감사 로그를 남긴다(L161~183) — **복구**가 아니라 **차단·위임·감사** 축.  
4. **permission 계층** — `buildAccessibleCaseWhere` 가 `status: { not: "DELETED" }` **base** (L27~28). `getCaseAccessContext`에서 **DELETED** → **NotFound**. **사건 상세에서 DELETED를 실제로 닫는 핵심 차단**은 **이 파일**이다.

#### Step 3 한 줄 판정

**`getCaseAccessContext`** 가 **service 경유** 사건 상세에서 **DELETED**를 **실제로 NotFound 차단**하는 **핵심** 계층이고, **`case.service.ts`** 는 이를 **호출**하는 **중간** 서비스이므로, **남은 핵심 리스크**는 **하위 UI**가 아니라 **raw 단건 상세 축**과의 **구조 불균일**이다.

#### 체크리스트 (압축)

**Step 3 — `case.permissions.ts` + `case.service.ts`**

- `getCaseAccessContext`: `found.status === "DELETED"` → **NotFound**  
- `getCaseDetailService`: **먼저** `getCaseAccessContext` → **service 경유** 상세는 **DELETED** **숨김**  
- `case.service.ts`: **복구** 계층 **아님** — **위임·감사**(`softDeleteCaseService` 등)  
- **판정:** **DELETED** **실제** 차단 **핵심** = **`case.permissions.ts`** · **구조 리스크** = **raw** **단건** **vs** **service** **불균일**

#### 시트용 (1줄)

- **사건 상세 Step 3:** **service** **경유** 상세는 **`getCaseAccessContext`** 가 **DELETED** → **NotFound** **차단**; **남은** **핵심** **리스크** = **raw** **단건** **상세** **축**과의 **구조** **불균일**

#### 사건 상세 **최종** 중간 결론 (Step 1~3)

| Step | 파일 | 한 줄 |
|------|------|--------|
| **1** | `[caseId]/page.tsx` | **상위** **조립** — **삭제** **버튼** **무조건** **노출**, **raw** **상세** **구조** **리스크** |
| **2** | `case-detail-client.tsx` | **상태·액션·문서·배너** **연결** **업무** **허브** — **상위** **데이터** **신뢰** **렌더** |
| **3** | `case.permissions.ts` + `case.service.ts` | **service** **경유** **상세**에서 **DELETED** **실제** **차단** **=** **`getCaseAccessContext`** |

**닫는 문장 (고정):** 사건 상세는 **UI·업무 허브** 관점에서는 **상당히** 잘 **연결**되어 있으나, **DELETED** **차단**은 **하위** **화면**이 아니라 **service + `getCaseAccessContext`** **축**에서 **걸리며**, **raw** **단건** **상세** **축**과의 **불균일**이 **사건** **상세** **구조** **리스크**의 **핵심**이다.

#### Step 1~3 잠금 상태 (공표 전·운용 한 줄)

- 본 문서 **상단** 「Step 1~3 잠금(한 줄·운용)」과 동일하다. Step 1~3 실사 및 증빙 **[248]** 기준으로 **안정 잠금**이 확인되었다.

---

## 9. 상호참조

- `docs/project-governance/CORE_USER_FLOW_CLOSURE_CHECKLIST.md` — **§9 사건 상세**
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md` — **[243]**·**[246]**·**[247]**·**[248]**·**[249]** 등
- (필요 시) `PREMISE2`·`DELETED` 관련 체크리스트

---

## 10. 문서 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | V1 신설 — 6축·파일 순서·4상태·실무 표·1차 예상·Top3 질문·Step 순서 |
| 2026-04-23 | `page.tsx` **Step 1** 실사 — `§4` 표 + `§8.1` 상세·한 줄·압축·시트 1줄 |
| 2026-04-23 | `case-detail-client.tsx` **Step 2** 실사 — `§4` **종합** `§8.2`·**중간** 결론 — 증빙 **[247]** |
| 2026-04-23 | `case.permissions` + `case.service` **Step 3** — `§4` **최종**·`§8.3`·**닫는** **문장** — 증빙 **[248]** |
| 2026-04-23 | **Step 1~3** **잠금** **한** **줄**·**§8.3** **상호** **참조** — 증빙 **[249]** |
