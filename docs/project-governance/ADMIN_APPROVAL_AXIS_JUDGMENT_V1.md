# 관리자 승인 축 — 실무 판정 (V1)

**용도:** 관리자·변호인 측 **문서 승인 → 잠금 → 전달 준비** 흐름이 실제 코드·권한·상태·이력·후속 액션까지 닫혀 있는지 **레포 실사** 기준으로 확정할 때 쓰는 판정서.

**관련:** `CASE_DETAIL_ACTUAL_JUDGMENT_V1.md` (사건 상세·문서 UI·동선) · `INTERVIEW_SUMMARY_DOCUMENT_FLOW_JUDGMENT_V1.md` (인터뷰→요약→문서 생성) — **별도 축**이나 동일 **사건·문서** 맥락에서 읽는다.

**V1 신설 (2026-04-23):** 증빙 **[257]** (`IMPLEMENTATION_EVIDENCE.md`).

**Step 1 — 승인 UI 실제 확정 (2026-04-23):** `document-review-panel.tsx` 실사 — **[§9](#admin-approval-step1-2026-04-23)**. (증빙 **[258]**)

**Step 2 — 승인/잠금 API 실제 확정 (2026-04-23):** `approve/route.ts` · `lock/route.ts` — **[§10](#admin-approval-step2-2026-04-23)**. (증빙 **[259]**)

**현재 기준 (2026-04-23, 한 줄):** 관리자 승인 축은 **Step 1** UI **[258]**, **Step 2** API **[259]** 기준으로 **승인·잠금**의 **사용자 노출**과 **서버 동작**이 **실제 확정 가능** 수준으로 **닫혔다**. (판정 본문 **§9**·**§10** · 동일·공표 총괄 **§11**)

**읽는 순서 (고정):** **한 줄 / 공표** → 머리말 → **[§11](#admin-approval-section-11)** → **§10** → **\[259\]** → **§13** → **\[260\]** → **§14** → **\[261\]** → **Step 1~4 종합** **[§15](#admin-approval-summary-2026)**.

**Step 3 — 승인 후 상세(진행 한 줄, 2026-04-23):** 관리자 승인 축은 **[258]**·**[259]**로 **UI**와 **API**가 **잠겼고**, **다음 Step 3**는 `case-detail-client.tsx`에서 **승인 후 상세 반영**, **잠금 후 전달 준비**, **사용자 후속 UX**를 **실제 확정**하는 **단계**다. (판정 본문 **[§13](#admin-approval-step3-section-2026)** · 증빙 **[260]**)

**Step 4 — 승인 이력/운영(한 줄, 2026-04-23):** **승인·잠금** **API**·**상세**·**패널** 4경로로 **이력/운영** **축**을 **정리**한다. (판정 본문 **[§14](#admin-approval-step4-section-2026)** · 증빙 **[261]**)

**완결 선언 (2026-04-23, 한 줄):** 관리자 승인 축은 **[§9](#admin-approval-step1-2026-04-23)**·**[§10](#admin-approval-step2-2026-04-23)**·**[§13](#admin-approval-step3-section-2026)**·**[§14](#admin-approval-step4-section-2026)**·**[§15](#admin-approval-summary-2026)**와 **[261]** 기준으로 **실제 확정 판정**, **종합 압축**, **시트 최종본**, **운용 기준**까지 모두 갖춘 **완결형 축**으로 **잠겼다**. (Step별·세부 **남은 과제**는 **[§15](#admin-approval-summary-2026)** **종합 한 줄** 참고)

---

## 0. 점검 기준

### 점검 원칙

- 승인 **기능의 존재**보다 **승인 전후 상태 변화**와 **사용자 후속 흐름**을 더 중요하게 본다.
- **승인 / 반려 / 잠금 / 전달 준비**가 서로 **충돌**하지 않아야 한다.
- **관리자 화면** 기준뿐 아니라 **변호사/스태프**·**의뢰인** 입장에서 승인 **결과가 어떻게 보이는지**도 확인한다.
- “버튼이 있다”가 아니라 **권한** · **상태** · **이력** · **고지** · **후속 액션**까지 닫혀야 완료다.

### 판정 상태

| 판정 | 의미 |
|------|------|
| **확정 완료** | 승인 흐름과 후속 상태·이력이 모두 닫힘 |
| **보정 필요** | 기능은 되나 문구, 버튼 위치, 상태 안내 보강 필요 |
| **구조 리스크** | 승인 자체는 되나 권한/상태/후속 연결 **불균일** 가능성 |
| **미완료** | 핵심 승인 흐름이 실제로 끊김 |

---

## 1. 확정 대상

관리자 승인 축은 아래 **6개**로 나눠 보면 가장 명확하다.

1. **승인 대상 식별** — 무엇을 승인하는가(사건 vs 문서), 승인 대기 상태가 명확한가
2. **승인 권한** — 누가 승인할 수 있는가, 관리자/변호사/스태프 분리
3. **승인 실행** — 승인 버튼·API·실패 시 이유 노출
4. **승인 후 상태 반영** — 문서 상태, 사건 상태, allowed actions, 잠금/전달 준비 연결
5. **승인 이력/감사** — 누가·언제, 추적 가능성
6. **사용자 후속 경험** — 승인 후 역할별로 **다음에 무엇을 할지** 드러나는가

---

## 2. 먼저 볼 파일 순서

| # | 경로 | 비고 |
|---|------|------|
| 1 | `src/components/cases/document-review-panel.tsx` | 승인·잠금 등 문서 액션 UI |
| 2 | `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts` | 승인 API — Step 2 (**[§10](#admin-approval-step2-2026-04-23)**) |
| 3 | `src/app/api/legal-documents/[legalDocumentId]/lock/route.ts` | 잠금 API — Step 2 (**[§10](#admin-approval-step2-2026-04-23)**) |
| 4 | `src/components/cases/case-detail-client.tsx` | Step 3 — 상세·`refresh`·전달 — **[§13](#admin-approval-step3-section-2026)** |
| 5 | `src/components/cases/case-status-actions.tsx` | 사건/문서 액션 노출 |
| 6 | approval / verification / delivery 관련 API·화면 | 실사 시 구체 경로 기입 |
| 7 | 문서 상태 정의, allowed actions 관련 파일 | 필요 시 `prisma`·`case.permissions` 등 |

**실무 권장 순서 (Step):**

- **Step 1** 승인 UI
- **Step 2** 승인/잠금 API
- **Step 3** 승인 후 상세 화면 반영
- **Step 4** 승인 이력/후속 액션

---

## 3. 실무 판정표 (확정 시 기입)

**갱신:** Step 1 UI **[258]**·**§9**, Step 2 API **[259]**·**§10**, Step 3 상세 **[260]**·**§13**, Step 4 **이력/운영** **[261]**·**§14**.

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 승인 대상 식별 | **확정 완료** | `document-review-panel.tsx` | 낮음 | **§9** |
| 승인 권한 분리 | **완료에 가까운 확정 완료** (UI+서버) | `document-review-panel`, `approve`/`lock` | `assertCaseAccess`+`canApproveDocument` vs **lock**의 **role 직검** 차이 | **§9**·**§10** · 운영 문서에 짧게 정리 |
| 승인 버튼 노출 | **확정 완료** | `document-review-panel.tsx` | 낮음 | **§9** |
| 승인 실행 API | **확정 완료** | `approve/route.ts` | 낮음 | **§10** |
| 승인 실패 메시지 | **완료에 가까운 확정** (UI+API) | 패널·`approve`/`lock` | 응답 **스타일** 완전 통일은 아님 | **§9**·**§10** · 추후 포맷 통일 가능 |
| 승인 후 문서 상태 반영 | **확정 완료** | `approve/route.ts` | 낮음 | **§10** |
| 승인 후 사건 후속 액션 반영 | **확정 완료** | `case-detail-client` | **`refreshCase`** after 승인/잠금 | **§13**·**[260]** |
| 잠금(lock) 연결 | **확정 완료** (UI+API) | `document-review-panel`, `lock/route.ts` | 낮음 | **§9**·**§10** |
| 전달(deliver) 준비 상태 연결 | **확정 완료** (선택+잠금 조건) | `case-detail-client` | `DELIVER`는 **LOCKED** 선택 시만 UI 노출 | **§9**·**§13**·**[260]** |
| 승인 이력/감사·운영 추적 | **확정 완료** / **완료에 가까운 확정** (표시·고도화) | `approve`·`lock`·`case-detail`·`document-review-panel` | **승인자명** **즉시** 노출·**문구** **미세** | **§14**·**[261]** |
| 승인 후 사용자 안내 | **확정 완료** (패널+상세) | `document-review-panel`·`case-detail-client` | 승인·잠금·전달 **동선** | **§9**·**§13**·**[260]** |

> **1차(§5):** **§5** = 초기 예상. **UI** ≈ **§9**·**[258]**, **API** ≈ **§10**·**[259]**, **상세** ≈ **§13**·**[260]**, **이력/운영** ≈ **§14**·**[261]**.

---

## 4. 항목별 확인 질문

### 승인 대상 식별

- 현재 승인 대상이 **문서**인지 **사건**인지 화면에서 분명한가
- 승인 대기 상태가 **어디서** 드러나는가
- **선택 문서** 기준인지 **전체 사건** 기준인지 헷갈리지 않는가

### 승인 권한 분리

- 관리자만 가능한가, 변호사도 가능한가
- 의뢰인은 당연히 못 해야 하는데 **UI·API** 모두 막히는가

### 승인 버튼 노출

- 문서 상태에 따라 버튼 노출이 바뀌는가
- 이미 승인된 문서에 **다시** 승인 버튼이 보이지 않는가
- **잠금 전/후** 액션이 섞이지 않았는가

### 승인 실행 API

- 승인 API가 실제로 **문서 상태**를 바꾸는가
- 실패 시 이유가 적절히 반환되는가
- **중복 승인** / 잘못된 상태 승인을 막는가

### 승인 후 상태 반영

- 승인 직후 상세 화면이 **refresh**되어 상태가 바뀌는가
- **다음 가능한 액션**이 다시 계산되는가

### 잠금 연결

- 승인 후 **잠금**으로 이어지는가(또는 그 전제가 명확한가)
- **잠금** 가능한 조건이 명확한가

### 전달 준비 상태

- 잠금 후 **전달 완료** 처리와 연결되는가
- **전달**은 잠긴 문서에서만 열리는가

### 승인 이력/감사

- 누가·언제 승인했는지, 타임라인/감사로그에 남는가

### 사용자 후속 경험

- 승인 후 **다음 행동**이 화면에 드러나는가
- 관리자/변호사/의뢰인 **각각** 자연스러운가

---

## 5. 1차 예상 판정 (기억·맥락 기준)

**전제:** **실사 전**·세션 맥락 기준 **예상**이며 **확정이 아님** (보수적).

| 항목 | 1차 예상 |
|------|----------|
| 승인 대상 식별 | 완료에 가까운 보정 필요 |
| 승인 권한 분리 | 보정 필요 |
| 승인 버튼 노출 | 완료에 가까운 보정 필요 |
| 승인 실행 API | 완료에 가까운 보정 필요 |
| 승인 실패 메시지 | 보정 필요 |
| 승인 후 문서 상태 반영 | 완료에 가까운 보정 필요 |
| 승인 후 사건 후속 액션 반영 | 보정 필요 |
| 잠금 연결 | 완료에 가까운 보정 필요 |
| 전달 준비 상태 연결 | 완료에 가까운 보정 필요 |
| 승인 이력/감사 기록 | 보정 필요 |
| 승인 후 사용자 안내 | 보정 필요 |

---

## 6. 1차 예상의 핵심 이유

- `case-detail-client.tsx`에서 이미 `handleApproveDocument` · `handleLockDocument` · `DELIVER_DOCUMENT` 연결이 **보이는** 것으로, **기본 골격은 존재**한다.
- 승인 축은 “없는 기능”이 아니라 **어디까지 닫혔는지 실사로 확정**해야 하는 축에 가깝다.
- 특히 **문서 승인 → 잠금 → 전달 처리** 흐름이 코드상 드러나므로, **핵심은 결손보다** **권한/상태/후속 UX 마감**일 가능성이 크다.

---

## 7. 최우선 질문 3개

1. 문서 승인은 **누가**, **어떤 상태**에서 누를 수 있는가
2. 승인 후 실제로 **잠금**과 **전달 준비**로 자연스럽게 이어지는가
3. 승인/잠금 **이력**이 관리자 실무 기준으로 **충분히** 남는가

---

<a id="admin-approval-section-8"></a>

## 8. Step 1 ~ Step 4

### Step 1. 승인 UI

**먼저 볼 것:** `document-review-panel.tsx` · `case-detail-client.tsx`  
**확정할 것:** 승인 버튼 노출, 상태별 버튼 변화, 역할별 노출 차이  
**상세(실제값):** **[§9](#admin-approval-step1-2026-04-23)** · **[258]**

### Step 2. 승인/잠금 API

**먼저 볼 것:** `approve/route.ts` · `lock/route.ts`  
**확정할 것:** 상태 변경, 실패 메시지, 중복/예외 차단  
**상세(실제값):** **[§10](#admin-approval-step2-2026-04-23)** · **[259]**

### Step 3. 승인 후 상세 반영

<a id="admin-approval-step3-2026-04-23"></a>

**기준 파일:** `src/components/cases/case-detail-client.tsx` (보조 UI: `document-review-panel.tsx`). **판정 본문** **[§13](#admin-approval-step3-section-2026)** · 증빙 **[260]**.

**진행(고정, 한 줄):** 관리자 승인 축은 **[258]**·**[259]**로 **UI**와 **API**가 **잠겼고**, **다음 Step 3**는 `case-detail-client.tsx`에서 **승인 후 상세 반영**, **잠금 후 전달 준비**, **사용자 후속 UX**를 **실제 확정**하는 **단계**다.

**핵심 3가지(요약) — 아래는 `case-detail-client`·패널로 **확정**한 축(전체 **7항**·문장·시트는 **§13**):**

| # | 항목 | 판정 | 코드 근거(요지) |
|---|------|------|-----------------|
| 1 | **승인** 성공 후 `refreshCase()`로 상태 **재반영** | **확정 완료** | `handleApproveDocument`·`handleLockDocument` **성공 시** 모두 `await refreshCase()` |
| 2 | **잠금** 후 `DELIVER_DOCUMENT`가 **잠금 문서**에서만 | **확정 완료** | `caseActionsForUi.DELIVER_DOCUMENT` = `allowedCaseActions.DELIVER_DOCUMENT && selectedDocument?.status === "LOCKED"` |
| 3 | **승인 → 잠금 → 전달**이 화면에서 **자연스럽게** | **확정 완료** | `document-review-panel`: 승인 후 **잠금 안내** → 잠금 후 **검증** 링크·**상단 진행 액션** 안내; 상세 **우측** 액션에 **전달** 노출(잠금+권한 전제) |

**보조:** `case-status-actions.tsx`·역할별 미세는 **Step 4**·운용 실사.

### Step 4. 승인 이력/운영

**먼저 볼 것:** `approve`/`lock` **타임라인** — `case-detail` **`TimelinePanel`** — `document-review-panel` **승인일/잠금일**  
**확정할 것:** **운영 이력** **추적**, **검증/전달** **연결**  
**상세(실제값):** **[§14](#admin-approval-step4-section-2026)** · **[261]**

---

<a id="admin-approval-step1-2026-04-23"></a>

## 9. Step 1 — 승인 UI (`document-review-panel.tsx`, 2026-04-23·실제값)

**파일:** `src/components/cases/document-review-panel.tsx` (증빙 **[258]**)

### Step 1 승인 UI — 실제 판정표

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 승인 대상 식별 | **확정 완료** | `document-review-panel.tsx` | 낮음 | 유지 |
| 승인 권한 분리 | **완료에 가까운 확정 완료** | `document-review-panel.tsx` + **[§10](#admin-approval-step2-2026-04-23)** | UI **이중** + 서버 `assertCaseAccess`·`canApproveDocument` / **lock** **role** 직검 (**§10**) | 운영 문서에 **권한 구현** 차이 짧게 정리 |
| 승인 버튼 노출 | **확정 완료** | `document-review-panel.tsx` | 낮음 | 유지 |
| 잠금 버튼 노출 | **확정 완료** | `document-review-panel.tsx` | 낮음 | 유지 |
| 상태별 액션 변화 | **확정 완료** | `document-review-panel.tsx` | 낮음 | 유지 |
| 승인 실패 사전 안내 | **완료에 가까운 확정 완료** | `document-review-panel.tsx` | 비활성 **이유**를 버튼 옆에 더 직접 쓰기 여지 | UX 미세 |
| 승인 후 다음 행동 안내 | **완료에 가까운 확정 완료** | `document-review-panel.tsx` | 역할 **차등**은 Step 3 + 상세 액션 | `case-status-actions`·상세 **최종 점검** |

### 항목별 판정 문장

1. **승인 대상 식별**  
패널은 **선택된 문서 1건**을 다룬다. 상태 배지, 문단 수, 승인일·잠금일(그리드), 승/잠 전제 문구로 **대상·진행 단계**가 드러난다. **확정 완료**.

2. **승인 권한 분리**  
`canApprove` / `canLock` = `["ADMIN","LAWYER"].includes(currentRole)`(잠금은 추가로 `status === "APPROVED"`). **STAFF/CLIENT**는 승인·잠금 **버튼을 보지 못한다**. **UI** + 서버 **[§10]** — **상세** **`refresh`**·**동선**은 **[§13](#admin-approval-step3-section-2026)**.

3. **승인 버튼**  
`canApprove`일 때만 `문서 승인` 표시. `approveDisabled` = `busy` · 필수 문단 누락 · `LOCKED` · `APPROVED` · `ARCHIVED`. **확정 완료**.

4. **잠금 버튼**  
`canLock` = ADMIN/LAWYER **이면서** `APPROVED`만. 승인 전엔 잠금 없음, `isTerminal`이면 액션 영역 전체 비노출·읽기 전용. **확정 완료**.

5. **상태별 액션**  
`LOCKED`/`ARCHIVED` → 제목·본문 “읽기 전용”·terminal 안내, `APPROVED` → “승인본 잠금만” 안내, `LOCKED` → 검증 링크·상단 전달, `ARCHIVED` → 종료 설명. **확정 완료**.

6. **승인 실패 사전 안내**  
문단 미작성 → 빨강 박스 “비어 있는 문단…”, 충족 시 녹색 “기본 검토 조건…”, terminal → 종료 문구. **완료에 가까운 확정**(버튼 옆 **한 줄** 보강 여지).

7. **승인 후 다음 행동**  
`APPROVED` → “지금 할 일: **승인본 잠금**…”, `LOCKED` → **문서 검증** 링크 + **상단** 진행 액션, `ARCHIVED` → 절차 종료. **완료에 가까운 확정**(역할·상세와 **Step 3**).

### Step 1 최종 한 줄 판정

`document-review-panel.tsx`는 **승인 대상 식별**, **승인/잠금 버튼 노출**, **상태별 액션**, **다음 행동 안내**를 **실제로** 잘 닫고 있으며, 관리자 승인 축 **Step 1 승인 UI**는 **사실상 확정 가능** 수준이다. **권한·상태**의 **서버 측**은 **[§10](#admin-approval-step2-2026-04-23)** Step 2 API와 **교차**하여 **닫힘**(**[259]**).

### 체크리스트 (압축) — Step 1 (실값)

- **대상:** 선택 문서 1건 — 상태·문단 수·승인일·잠금일
- **권한(UI):** ADMIN / LAWYER만 승인·(APPROVED 시) 잠금
- **승인:** busy·문단·`LOCKED`/`APPROVED`/`ARCHIVED` 시 비활성
- **잠금:** `APPROVED`에서만
- **터미널:** `LOCKED`/`ARCHIVED` → 읽기 전용, 액션 제거
- **판정:** UI **확정** — **API** 권한/상태 차단은 **§10**·**[259]**와 **교차 완료**

### 시트용 (1줄)

- **승인 Step 1(실값):** `document-review-panel`은 승인 **대상**·**ADMIN/LAWYER** 기준 **승인·잠금** 노출, **상태별** 읽기 전용/다음 액션 **안내**까지 **코드로 닫힘**; **서버 권한**은 **§10** `approve`/`lock` **과** **교차**하여 **최종**(**[259]**).

---

<a id="admin-approval-step2-2026-04-23"></a>

## 10. Step 2 — 승인/잠금 API (`approve` / `lock`, 2026-04-23·실제값)

**파일:**  
`src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`  
`src/app/api/legal-documents/[legalDocumentId]/lock/route.ts`  
(증빙 **[259]**)

### Step 2 — 승인/잠금 API — 실제 판정표

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 승인 실행 API | **확정 완료** | `approve/route.ts` | 낮음 | 유지 |
| 승인 권한의 실제 서버 차단 | **완료에 가까운 확정 완료** | `approve` · `lock` | **approve**는 `assertCaseAccess` + `canApproveDocument`, **lock**은 `assertCaseAccess` + **role** 직접 검사로 구현이 약간 다름 | 권한 문구만 **운영 문서**에 정리 |
| 승인 실패 메시지 | **완료에 가까운 확정 완료** | `approve` · `lock` | 에러 **응답 형식**이 완전 동일한 스타일은 아님 | 유지, **추후** 응답 포맷 통일 가능 |
| 중복 승인/잘못된 상태 승인 차단 | **확정 완료** | `approve/route.ts` | 낮음 | 유지 |
| 승인 후 문서 상태 반영 | **확정 완료** | `approve/route.ts` | 낮음 | 유지 |
| 승인 후 사건 후속 액션 반영 | **완료에 가까운 확정 완료** | `approve` · `case-detail-client.tsx` | 사건 **APPROVED** 맞춤은 명확, **allowed actions**는 상세 **refresh**에 의존 | 유지 |
| 잠금 실행 API | **확정 완료** | `lock/route.ts` | 낮음 | 유지 |
| 잠금 조건 차단 | **확정 완료** | `lock/route.ts` | 낮음 | 유지 |
| 승인/잠금 이력·타임라인 기록 | **확정 완료** | `approve` · `lock` | 낮음 | 유지 |
| 문단/버전 스냅샷 처리 | **확정 완료** | `approve` · `lock` | 낮음 | 유지 |

### 항목별 판정 문장

1. **승인 실행 API**  
`approve`는 문서를 `findUnique`로 읽고 권한 확인 뒤 트랜잭션에서 `legalDocument.status = "APPROVED"`, `latestApprovedAt` · `latestApprovedById`, 문서 **body** 스냅샷, `lockOnApproval: true` 문단 `APPROVED`, 새 `legalDocumentVersion`, 사건 `status` **APPROVED**, `DOCUMENT_APPROVED` 타임라인까지 **한 번에** 처리한다. **문서 승인과 사건 승인 단계**를 **함께** 반영하는 **중심 API**로 **확정** 가능.

2. **승인 권한의 실제 서버 차단**  
승인: `assertCaseAccess("document.approve", …)` · `canApproveDocument(…)` — 실패 시 `ForbiddenError("문서 승인 권한이 없습니다.")`. 잠금: `assertCaseAccess("document.lock", …)` 뒤 `["ADMIN","LAWYER","SUPER_ADMIN"]` **role** 검사. **UI뿐 아니라 서버**에서 **실제** 차단. **approve**와 **lock**의 구현 **방식 차이**는 **운영 문서**에 **짧게** 남기는 것이 좋다.

3. **승인 실패 메시지**  
이미 `APPROVED`/`LOCKED`면 “이미 승인된 문서는 다시 승인할 수 없습니다.” **잠금**은 비로그인 “로그인이 필요합니다.”, **role** 부적합 “문서 잠금은 관리자 또는 변호사만 가능합니다.”, 상태 부적합 “승인된 문서만 잠글 수 있습니다.” — **실무** 수준.

4. **중복 승인/잘못된 상태 승인 차단**  
`document.status === "APPROVED" \|\| document.status === "LOCKED"`이면 **즉시** 차단 — **중복 승인**·잠금 **후** 재승인 **모두** 막는다.

5. **승인 후 문서 상태 반영**  
`APPROVED` · `latestApproved*` 기록, `lockOnApproval` 문단 `APPROVED`, **승인 버전** 스냅샷 — **확정 완료**.

6. **승인 후 사건 후속 액션 반영**  
주석·코드상 사건 `APPROVED`는 **이후** `DELIVER_DOCUMENT` **전이**와 **정합**하도록 맞춤. 상세는 **승인 성공 후** `refreshCase()`로 **최신** 상태·다음 액션 **재로딩** — **후속** 구조는 **실제로** 이어짐(allowed actions는 **새** detail **의존**).

7. **잠금 실행 API**  
`APPROVED` 문서에 대해 `legalDocument.status = "LOCKED"`, `lockedAt` · `lockedById`, 대상 문단 `LOCKED`, `DOCUMENT_LOCKED` 타임라인 — **닫힌** 구조.

8. **잠금 조건 차단**  
`APPROVED`가 **아니면** “승인된 문서만 잠글 수 있습니다.” **400** — **승인 후에만** 잠금 — **서버**에서 **확정**.

9. **승인/잠금 이력·타임라인**  
`DOCUMENT_APPROVED` · `metaJson`(documentId, versionNo, approvedAt, approvedById), `DOCUMENT_LOCKED` — **운영** 추적 **이력** 남음.

10. **문단/버전 스냅샷**  
승인: 현재 문단 **스냅샷**을 version에, 승인 시점 **body** **재구성**. 잠금: **승인본**을 **잠금** 상태로 — **승인본 보존**·잠금 **체계**로 **연결**.

### Step 2 최종 한 줄 판정

**승인/잠금 API**는 서버에서 **권한·상태 차단**, **승인본 스냅샷·버전**, 사건 **APPROVED** 반영, 문서 **LOCKED** 전환, **타임라인**까지 **닫혀** 있으며, **관리자 승인 축** **핵심 서버 동작**은 **실제 확정 가능** 수준이다. **상세·동선**은 **[§13](#admin-approval-step3-section-2026)** Step 3·**[260]**으로 **닫힘**.

### 체크리스트 (압축) — Step 2 (실값)

- **approve:** `document.approve` 권한, **중복** 승인·`LOCKED` 차단, 문서/문단 `APPROVED`·**버전** 스냅샷, 사건 `APPROVED`, `DOCUMENT_APPROVED` 타임라인
- **lock:** `document.lock` + **ADMIN / LAWYER / SUPER_ADMIN**, **APPROVED** → `LOCKED`, 문단 `LOCKED`, `DOCUMENT_LOCKED`
- **판정:** Step 2 **서버** = **확정** — **상세·전달** = **§13**·**[260]**

### 시트용 (1줄)

- **승인 Step 2(실값):** `approve`·`lock` API는 **권한·상태** 차단, **승인본** 스냅샷·**버전**, **사건 APPROVED**·문서 **LOCKED**·**타임라인**까지 **서버에서** 닫힘 (**[259]**).

---

<a id="admin-approval-section-11"></a>

## 11. 공표 전 운용 한 줄

**지금 기준(닫힘 선언, 한 문장):** 관리자 승인 축은 **Step 1** UI **[258]**, **Step 2** API **[259]** 기준으로 **승인·잠금**의 **사용자 노출**과 **서버 동작**이 **실제 확정 가능** 수준으로 **닫혔다**.  
Step 1·2 **판정 본문**은 각각 **§9** · **§10**; **증빙**은 `IMPLEMENTATION_EVIDENCE.md`의 **[EVIDENCE-20260423-258]** · **[EVIDENCE-20260423-259]**.

**읽는 순서 (고정):** **한 줄·공표** = 머리말 + **§11** → **§10** → **\[259\]** → **§13** → **\[260\]** → **§14**·**이력/운영** → **\[261\]**.

**승인·잠금 핵심(코드·문서):** **승인 API** — 권한 검사, **중복 승인** 차단, **문서** `APPROVED`, **문단** `APPROVED`, **버전 스냅샷** 생성, **사건** `APPROVED`, **`DOCUMENT_APPROVED`** 타임라인. **잠금 API** — 권한 검사, **승인된 문서만** 잠금, **문서** `LOCKED`, **문단** `LOCKED`, **`DOCUMENT_LOCKED`** 타임라인.

**승인 축 총괄:** Step 1~4 **닫힘**·**잔여 과제**는 [**§15**](#admin-approval-summary-2026) **종합 한 줄** / **최종 압축** / **시트 1줄**을 본다.  
**Step 1** **[§9](#admin-approval-step1-2026-04-23)** · **[258]** · **Step 2** **[§10](#admin-approval-step2-2026-04-23)** · **[259]** · **Step 3** **[§13](#admin-approval-step3-section-2026)** · **[260]** · **Step 4** **[§14](#admin-approval-step4-section-2026)** · **[261]** · **종합** **[§15](#admin-approval-summary-2026)**.

---

## 12. 문서 이력

| 날짜 | 내용 |
|------|------|
| 2026-04-23 | V1 신설 — §0~8·**§9=Step1~§12=이력**·Step 1~4·`§3`/`§5` 1차 — 증빙 **[257]** (이후 **§9~§12** 재편) |
| 2026-04-23 | **Step 1 UI** `document-review-panel` — **`§3`·`§9`**, `§11` 공표, 증빙 **[258]** |
| 2026-04-23 | **Step 2 API** `approve`·`lock` — **`§3`·`§10`**, `§11` 공표, 증빙 **[259]** |
| 2026-04-23 | **현재 기준(한 줄)**·**§11** 닫힘 선언 + 승인/잠금 **핵심** 적시, `IMPLEMENTATION_EVIDENCE` **[259]** **근거 메모** 동기 |
| 2026-04-23 | **Step 3** `case-detail-client`·확인 **3항** **확정** — **`§13`**·`§3`·`§8`·`§11`·**읽는 순서**·증빙 **[260]** |
| 2026-04-23 | **`§13`** Step 3 **실값** 문안 **붙여넣기**용 **전면** — **판정표 7행**·**항목별 7문**·**교차 근거** 4경로·시트 1줄 **보완** |
| 2026-04-23 | **`§14`** Step 4 **이력/운영** **실값** — 4**경로**·**7행**·**6문**·`§3`·머리·`§8`·`§11`·증빙 **[261]** |
| 2026-04-23 | **`§14`** **문안** **정리**·**`§15`** **Step 1~4** **종합**·**시트** **최종**·`IMPLEMENTATION_EVIDENCE` **[261]** **마감** |
| 2026-04-23 | **머리말** **완결** **선언**·**§15** **반영** **의미**·**Top 3** **축**·**\[249\]**·**\[254\]~\[256\]**·**\[258\]~\[261\]**·**종합판정서** **다음** **단계** |

---

<a id="admin-approval-step3-section-2026"></a>

## 13. Step 3 — 승인 후 상세 반영 / 잠금 후 전달 준비 / 사용자 후속 UX (실값)

(증빙 **[260]** · 2026-04-23)

**대상 파일**

- `src/components/cases/case-detail-client.tsx`
- 교차 근거: `src/components/cases/document-review-panel.tsx` (**[§9](#admin-approval-step1-2026-04-23)**)
- 교차 근거: `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts` (**[§10](#admin-approval-step2-2026-04-23)**)
- 교차 근거: `src/app/api/legal-documents/[legalDocumentId]/lock/route.ts` (**[§10](#admin-approval-step2-2026-04-23)**)

### Step 3 실제 판정표

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 승인 성공 후 상세 반영 | **확정 완료** | `case-detail-client.tsx` | 낮음 | 유지 |
| 잠금 성공 후 상세 반영 | **확정 완료** | `case-detail-client.tsx` | 낮음 | 유지 |
| `DELIVER_DOCUMENT` 잠금 문서 한정 | **확정 완료** | `case-detail-client.tsx` | 낮음 | 유지 |
| 승인 → 잠금 → 전달 준비 동선 | **완료에 가까운 확정 완료** | `case-detail-client.tsx`, `document-review-panel.tsx` | 낮음 | 유지 |
| 승인 후 다음 행동 안내 | **완료에 가까운 확정 완료** | `document-review-panel.tsx`, `case-detail-client.tsx` | 낮음 | 유지 |
| 잠금 후 검증/전달 안내 | **완료에 가까운 확정 완료** | `document-review-panel.tsx`, `case-detail-client.tsx` | 낮음 | 유지 |
| 상세 화면 기준 후속 UX | **완료에 가까운 확정 완료** | `case-detail-client.tsx` | 상단 액션과 패널 안내를 처음 보는 사용자는 한 번에 이해하지 못할 수 있음 | 문구 미세 보정 가능 |

### 항목별 실제 판정 문장

**1. 승인 성공 후 상세 반영**

- `case-detail-client.tsx`의 `handleApproveDocument(documentId)`는 승인 API 호출 **성공 후** `await refreshCase()`를 실행합니다.
- `refreshCase()`는 `/api/cases/${localCase.id}/detail`을 다시 읽어 **최신** 사건 상세 데이터를 **로컬 상태**에 반영합니다.
- 따라서 **승인 성공 후** 문서 상태, 사건 상태, **허용 액션**은 상세 화면에서 **실제로** 다시 계산·반영됩니다.

**2. 잠금 성공 후 상세 반영**

- `handleLockDocument(documentId)` 역시 **잠금 API 성공 후** `await refreshCase()`를 호출합니다.
- 따라서 **잠금 직후** 문서 상태 `LOCKED`, 잠금일, **후속 액션** 변경이 상세 화면에 **즉시** 반영되는 구조입니다.

**3. `DELIVER_DOCUMENT` 잠금 문서 한정**

- `caseActionsForUi`에서 `DELIVER_DOCUMENT`는  
  `allowedCaseActions.DELIVER_DOCUMENT && selectedDocument?.status === "LOCKED"`  
  조건일 때만 `true`가 됩니다.
- 즉 **사건 전체 상태만**이 아니라 **현재 선택 문서가 실제로 잠금된 경우에만** 전달 액션이 열립니다.
- 이 항목은 **상세 화면** 기준으로 **명시적으로** 닫혀 있습니다.

**4. 승인 → 잠금 → 전달 준비 동선**

- `document-review-panel.tsx`는 문서 상태가 `APPROVED`일 때  
  “**지금 할 일:** … **승인본 잠금**만 누르세요.”  
  를 안내합니다. (문구·레이아웃은 **§9**·코드)
- 문서가 `LOCKED`가 되면 **검증** 링크와 함께  
  “사건 **마무리(전달)**는 **페이지 상단** 진행 액션을 따르세요.”  
  라고 안내합니다. (배치·최종 문장은 코드 기준)
- 상세 **우측** `CaseStatusActions` 영역에서는 **잠금 문서 선택** 시에만 **전달 완료** 처리 액션이 열리므로, **승인 → 잠금 → 전달 준비**의 흐름이 **서로** 맞물립니다.

**5. 승인 후 다음 행동 안내**

- **승인 직후** review panel에서 사용자가 **다음에** 해야 할 일은 “**승인본 잠금**”으로 **좁혀집니다**.
- 이는 **승인 이후** 후속 액션을 **단일 단계**로 정리해 주는 효과가 있어, **관리자/변호사** 실무 흐름상 자연스럽습니다.

**6. 잠금 후 검증/전달 안내**

- `document-review-panel.tsx`는 **잠금 후**
  - **문서 검증** 페이지 링크
  - **페이지 상단** 진행 액션에서 **전달** 처리  
  를 안내합니다.
- `case-detail-client.tsx`는 `DELIVER_DOCUMENT`가 **열려** 있을 때 안내 박스로  
  “잠금·검증 확인 후 **실제 전달**을 마칠 때만 누르세요.”  
  를 보여줍니다. (채널 입력·타임라인 기록은 이어지는 흐름)
- 따라서 **잠금 후**에는 **검증 → 전달**이라는 **후속 경험**이 **실제 화면** 기준으로 이어집니다.

**7. 상세 화면 기준 후속 UX**

- 상세 화면은 **승인**과 **잠금**의 **API 성공** 이후 `refreshCase()`로 **최신 데이터**를 다시 반영하고,
- **review panel** / **상태 카드** / **진행 액션** / **문서 목록**이 **함께** 갱신되는 구조입니다.
- 즉 **승인 축** **Step 3**은 “**API 성공 후** 사용자가 **화면에서** 다음 행동을 **이해**할 수 있는가” **기준**으로 볼 때, **실제로** 상당히 **잘** 닫혀 있습니다.
- **남는 것**은 **기능 결손**이 아니라 **상단** 액션·**패널** 안내 **문구**의 **미세 보정** 정도입니다.

**참고(코드 인용) — 1~3 항 `case-detail-client`**

```219:234:src/components/cases/case-detail-client.tsx
  async function handleApproveDocument(documentId: string) {
    try {
      setIsBusy(true);
      const res = await fetch(`/api/legal-documents/${documentId}/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(json.message ?? "문서 승인에 실패했습니다.");
        return;
      }
      await refreshCase();
      alert("문서가 승인되었습니다.");
    } finally {
      setIsBusy(false);
    }
  }
```

```237:252:src/components/cases/case-detail-client.tsx
  async function handleLockDocument(documentId: string) {
    try {
      setIsBusy(true);
      const res = await fetch(`/api/legal-documents/${documentId}/lock`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(json.message ?? "문서 잠금에 실패했습니다.");
        return;
      }
      await refreshCase();
      alert("문서가 잠금되었습니다.");
    } finally {
      setIsBusy(false);
    }
  }
```

```109:116:src/components/cases/case-detail-client.tsx
  const caseActionsForUi = useMemo(
    () => ({
      ...allowedCaseActions,
      DELIVER_DOCUMENT:
        Boolean(allowedCaseActions.DELIVER_DOCUMENT && selectedDocument?.status === "LOCKED"),
    }),
    [allowedCaseActions, selectedDocument?.status],
  );
```

### Step 3 최종 한 줄 판정

`case-detail-client.tsx` **기준**으로 관리자 승인 축의 **Step 3**는 **승인/잠금 API** 성공 후 `refreshCase()`로 **상세 상태**가 **다시** 반영되고, `DELIVER_DOCUMENT`는 **잠금된 선택 문서**에서만 열리며, **review panel**과 **상단** 진행 액션이 **승인 → 잠금 → 전달 준비**의 **후속 UX**를 **실제로** 이어주므로 **확정 가능** 수준으로 **닫혀** 있다. (**[260]**)

### Step 3 압축 체크리스트

- `approve` **성공** 후 `refreshCase()` **반영**
- `lock` **성공** 후 `refreshCase()` **반영**
- `DELIVER_DOCUMENT`는 `selectedDocument.status === "LOCKED"`일 때 **만** 노출
- `APPROVED` **상태:** 다음 행동 = **승인본 잠금**
- `LOCKED` **상태:** **검증** 링크 + **상단** 진행 액션에서 **전달** 처리 안내
- **판정:** 승인 **후** 상세 반영과 **전달 준비** UX는 **실제 코드** 기준으로 **확정 가능** — **남는 것**은 **문구/안내** **미세 보정**

### Step 3 시트 1줄

- **관리자 승인 Step 3(실값):** `case-detail-client` **기준**으로 **승인·잠금** **성공 후** `refreshCase`로 **상세**가 **재반영**되고, **`DELIVER`는** **LOCKED** **선택**에서만 **열리며**, **review panel**·**상단 액션**이 **승인→잠금→전달** **UX**를 **잇는다** (**[260]**).

---

<a id="admin-approval-step4-section-2026"></a>

## 14. Step 4 — 승인 이력 / 운영 축 (실값)

(증빙 **[261]** · 2026-04-23)

직접 확정한 것과 운영상 보강 여지를 나누어 쓴다. (권한·동선: **§9~§13**·**[258]~[260]**)

**대상 파일**

- `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts` (**[§10](#admin-approval-step2-2026-04-23)**)
- `src/app/api/legal-documents/[legalDocumentId]/lock/route.ts` (**[§10](#admin-approval-step2-2026-04-23)**)
- `src/components/cases/document-review-panel.tsx` (**[§9](#admin-approval-step1-2026-04-23)**)
- `src/components/cases/case-detail-client.tsx` (**[§13](#admin-approval-step3-section-2026)**)

### Step 4 실제 판정표

| 항목 | 현재 판정 | 근거 파일 | 핵심 리스크 | 조치 |
|------|-----------|-----------|-------------|------|
| 승인 이력 기록 | **확정 완료** | `approve/route.ts`, `document-review-panel.tsx` | 낮음 | 유지 |
| 잠금 이력 기록 | **확정 완료** | `lock/route.ts`, `document-review-panel.tsx` | 낮음 | 유지 |
| 타임라인 기반 운영 추적 | **확정 완료** | `approve/route.ts`, `lock/route.ts`, `case-detail-client.tsx` | 낮음 | 유지 |
| 승인본 식별 정보(승인일/잠금일/버전) | **완료에 가까운 확정 완료** | `approve`·`lock`·`document-review-panel` | **승인자 이름/표시** 고도화 여지 | **필요 시** 화면 고도화 |
| 검증/전달 운영 연결 | **완료에 가까운 확정 완료** | `document-review-panel`·`case-detail-client`·`lock` | **안내 문구** **미세** 보정 여지 | 유지 |
| 관리자 입장의 후속 처리 가능성 | **완료에 가까운 확정 완료** | `case-detail-client`·`document-review-panel` | **패널/상단 액션** **분리** 이해 필요 | **안내** **문구** 유지 |
| 승인 이력/운영 축 종합 | **완료에 가까운 확정 완료** | **전체** | **기능** **결손**보다 **운영** **UX** **미세** 보정 | 유지 |

### 항목별 실제 판정 문장

**1. 승인 이력 기록**

- 승인 API는 `DOCUMENT_APPROVED` 유형의 `caseTimelineEvent`를 생성하고, `metaJson`에 `documentId`, `versionNo`, `approvedAt`, `approvedById`를 기록한다.
- 문서 본체에도 `latestApprovedAt`, `latestApprovedById`가 남는다.
- 따라서 승인 이력은 타임라인과 문서 메타데이터 양쪽에 기록된다.

**2. 잠금 이력 기록**

- 잠금 API는 `DOCUMENT_LOCKED` 유형의 `caseTimelineEvent`를 생성하고, 문서에는 `lockedAt`, `lockedById`를 기록한다.
- 문단도 함께 `LOCKED` 상태로 전환되므로 잠금 시점의 운영 이력이 실제로 남는다.

**3. 타임라인 기반 운영 추적**

- 상세 화면의 `case-detail-client.tsx`는 `TimelinePanel`을 렌더링하며 최신 타임라인 이벤트를 화면에 포함한다.
- 승인/잠금 API가 각각 `DOCUMENT_APPROVED`, `DOCUMENT_LOCKED` 이벤트를 남기므로, 관리자는 상세 화면에서 승인/잠금 운영 이력을 따라갈 수 있다.

**4. 승인본 식별 정보(승인일/잠금일/버전)**

- `document-review-panel.tsx`는 승인일(`latestApprovedAt`)과 잠금일(`lockedAt`)을 직접 표시한다.
- 승인 API는 새 `legalDocumentVersion`을 만들고 `versionNo`를 증가시키며 승인 스냅샷을 남긴다.
- 즉 승인본의 시점과 버전은 실제로 식별 가능하다.
- 다만 현재 패널에서는 “누가 승인했는지”를 **이름**으로 직접 보여주지는 않으므로, 필요 시 고도화할 수 있다.

**5. 검증/전달 운영 연결**

- 문서가 `LOCKED`이면 `document-review-panel`은 문서 검증 페이지 링크를 노출하고, 페이지 상단 진행 액션에서 전달을 처리하라고 안내한다.
- `case-detail-client`는 선택 문서가 `LOCKED`일 때만 `DELIVER_DOCUMENT` 액션을 열고, 안내 박스로 잠금·검증 확인 후 실제 전달을 유도한다.
- 따라서 검증 → 전달 운영 연결은 실제로 화면에서 이어진다.

**6. 관리자 입장의 후속 처리 가능성**

- 승인 후에는 “승인본 잠금”, 잠금 후에는 “검증 확인 및 전달” 순서가 패널과 상세 액션에 나뉘어 안내된다.
- 즉 관리자는 상세 화면만으로도 승인 이후의 후속 처리 동선을 따라갈 수 있다.
- 남은 것은 기능 결손이 아니라, 이 흐름을 더 직관적으로 보이게 하는 **문구/배치** 수준의 미세 보정이다.

**7. 승인 이력/운영 축 종합 (위 표 7행)**

- 네 경로·7항을 합치면 DB/타임라인에 남는 사실과 화면 동선이 맞다. **잔여**는 **UX**·**문구**·**승인자 표시** 고도화 정도다.

### Step 4 최종 한 줄 판정

관리자 승인 축의 **Step 4**는 승인/잠금 API가 타임라인과 문서 메타데이터에 운영 이력을 **실제로** 남기고, 상세 화면은 이를 **검증 링크**·**전달 액션**과 연결해 **후속 운영** 흐름까지 이어주므로, **승인 이력/운영 축**도 **실제 확정 가능** 수준으로 **닫혀** 있다. (**[261]**)

### Step 4 압축 체크리스트

- 승인 시 `DOCUMENT_APPROVED` 타임라인 + `latestApprovedAt`/`By` + 버전 스냅샷 기록
- 잠금 시 `DOCUMENT_LOCKED` 타임라인 + `lockedAt`/`By` 기록
- 상세 화면 `TimelinePanel`에서 운영 이력 확인
- `document-review-panel`에서 승인일/잠금일 확인
- `LOCKED` 후 검증 링크 + 상단 진행 액션에서 전달 처리 안내
- **판정**
  - 승인 이력/운영 축은 **실제 코드** 기준으로 **닫힘**
  - 남는 것은 **승인자 표시** / **운영 설명**의 **미세 고도화** 정도

### Step 4 시트 1줄

- **관리자 승인 Step 4(실값):** 승인/잠금 API는 **타임라인**과 **문서 메타데이터**에 **운영 이력**을 남기고, 상세 화면은 이를 **검증 링크**·**전달 액션**과 연결해 **후속 운영 흐름**까지 **실제로** 이어준다 (**[261]**).

---

<a id="admin-approval-summary-2026"></a>

## 15. 관리자 승인 축 — Step 1~4 종합 (실값, 2026-04-23)

증빙 **[257]**(신설) ~ **[261]**(Step 4 **마감**). **붙여넣기**·**시트**·**공표**용 **최종 압축**이다.

### 이번 구조(§15·[261]) 반영의 의미

- **§15**가 생겨 관리자 승인 축을 **한 번에** 읽을 수 있는 **종합 허브**가 생겼다.
- **[261]**은 단순 추가 증빙이 아니라 **마감 증빙** 역할을 한다(Step 4 본문 + Step 1~4 **종합**·**운용 기준** 동기).
- 이제 **추가 파일**을 보더라도 **재판정**이 아니라 **보강 검증** 기준으로 다룰 수 있다(**§15**「**운용 기준**」과 머리말 **완결 선언**).

### 관리자 승인 축 전체 종합 한 줄

관리자 승인 축은 **Step 1** UI, **Step 2** 승인·잠금 API, **Step 3** 승인 후 상세 반영, **Step 4** 승인 이력/운영 연결까지 **실제 코드** 기준으로 **닫혀** 있으며, **남은 과제**는 **핵심 기능 결손**이 아니라 **권한 설명**·**상단 액션**·**운영 안내 문구**의 **미세 고급화**에 가깝다.

### 관리자 승인 축 최종 압축

- **Step 1** UI ([**§9**](#admin-approval-step1-2026-04-23) · **[258]**)
  - 승인 대상 식별 가능
  - ADMIN / LAWYER 기준 승인·잠금 버튼 노출
  - 상태별 읽기 전용 전환과 다음 행동 안내 존재

- **Step 2** 승인/잠금 API ([**§10**](#admin-approval-step2-2026-04-23) · **[259]**)
  - **approve:** 권한 확인, 중복 승인 차단, 문서 `APPROVED`, 문단 `APPROVED`, 버전 스냅샷 생성, 사건 `APPROVED`, `DOCUMENT_APPROVED` 타임라인
  - **lock:** 권한 확인, `APPROVED` 문서만 `LOCKED` 가능, 문서 `LOCKED`, 문단 `LOCKED`, `DOCUMENT_LOCKED` 타임라인

- **Step 3** 승인 후 상세 반영 ([**§13**](#admin-approval-step3-section-2026) · **[260]**)
  - `approve` / `lock` 성공 후 `refreshCase()` 반영
  - `DELIVER_DOCUMENT`는 **잠긴 선택 문서**에서만 노출
  - **review panel** + 상단 진행 액션이 **승인 → 잠금 → 전달 준비** UX를 연결

- **Step 4** 승인 이력/운영 ([**§14**](#admin-approval-step4-section-2026) · **[261]**)
  - 승인/잠금 이력이 타임라인과 문서 메타데이터에 기록
  - 승인일/잠금일/버전 식별 가능
  - **검증** 링크와 **전달** 액션으로 후속 운영 연결

- **최종 판정**
  - 관리자 승인 축은 **실제 코드** 기준으로 **확정 가능** 수준
  - 남는 것은 **기능 추가**보다 **운영 문구**와 **UX** **미세** 마감

### 관리자 승인 축 시트 1줄 (최종)

- **관리자 승인 축 최종:** **승인** UI, `approve`/`lock` **API**, **승인 후** 상세 반영, **승인 이력·운영** 연결까지 **실제 코드** 기준으로 **닫혀** 있으며, **남은 과제**는 **기능 결손**이 아니라 **권한**·**안내**·**운영** UX의 **미세 고급화**다 (**[257]~[261]**).

### 운용 기준

- 관리자 승인 축 **판정 본문**은 본문 **§9~§10**(Step 1~2) · **§13**(Step 3) · **§14**(Step 4) · **§15**(종합)을 **기준**으로 본다.
- 이후 **추가 실사**는 **재판정**보다 **보강 검증**으로 취급한다.

### 프로젝트 전체 기준 — Top 3 핵심 축과 증빙 구간 (`IMPLEMENTATION_EVIDENCE.md`)

| 축 | 판정서(요지) | 증빙 구간(기준) |
|----|--------------|-----------------|
| **사건 상세** | `CASE_DETAIL_ACTUAL_JUDGMENT_V1.md` | **[249]** |
| **인터뷰 → 요약 → 문서 생성** | `INTERVIEW_SUMMARY_DOCUMENT_FLOW_JUDGMENT_V1.md` | **[254]** ~ **[256]** |
| **관리자 승인** | 본 문서 `ADMIN_APPROVAL_AXIS_JUDGMENT_V1.md` | **[258]** ~ **[261]** |

### 다음 단계 (프로젝트)

**AI법친** 본 작업의 **Top 3 핵심 축**은 모두 **실제 확정 판정**과 **종합 정리**까지 **마감**됐다. **3축**을 **하나**로 **묶는** **종합판정서(초안)**는 `docs/project-governance/TOP3_FINAL_INTEGRATED_JUDGMENT.md`에 **두고**, **이후** **공표 직전** **운영 기준**·**미세 마감**에 **쓴다** (**`IMPLEMENTATION_EVIDENCE.md` [262] 참조**).

---

## 상호참조

- `docs/project-governance/TOP3_FINAL_INTEGRATED_JUDGMENT.md` — **Top 3** **전체** **종합** **판정(허브)**·**[262]**
- `docs/project-governance/CASE_DETAIL_ACTUAL_JUDGMENT_V1.md` — 사건 상세·문서 UI
- `docs/project-governance/INTERVIEW_SUMMARY_DOCUMENT_FLOW_JUDGMENT_V1.md` — 인터뷰→요약→문서 생성(별도 Top 3 축)
- `docs/project-governance/IMPLEMENTATION_EVIDENCE.md` — **[257]** · **[258]** (Step 1) · **[259]** (Step 2) · **[260]** (Step 3) · **[261]** (Step 4·**§14**·**§15** **마감**)
