# Batch A — 파일별 수정 순서표 (V1)

**관련**

- 상위: `docs/project-governance/WORK_BACKLOG_BATCH_ABC_V1.md`
- 증빙(문서·순서 잠금): `IMPLEMENTATION_EVIDENCE.md` **[269]**
- 증빙(코드·A-1): `IMPLEMENTATION_EVIDENCE.md` **[270]**

---

## 0. Batch A 목표

- 인터뷰 **권한 정책** 통일
- 승인·잠금 **권한 정책** 통일
- 승인 API **`ARCHIVED`** 차단
- 응답 포맷 **1차** 통일

---

## 1단계. 인터뷰 권한 정책 먼저 고정

### 1-1. 기준 정책 문장 잠금

**문서에 아래 둘 중 하나를 최종 정책으로 고정한다.**

| 안 | 내용 |
|----|------|
| **A** | `ADMIN` / `LAWYER` / `STAFF` / `OWNER` — 인터뷰 **수행** 허용 |
| **B** | `ADMIN` / `LAWYER` / `OWNER`만 **수행**, `STAFF`는 **조회만** |

**이 문서·형(운영) 기준 확정: 안 A**  
실무에서 **스태프**가 **사실관계 입력 보조**를 할 가능성이 높다는 이유로, **수행**까지 허용하는 쪽이 자연스럽다.

### 1-2. 먼저 고칠 파일

- `src/features/case-interview/case-interview.service.ts`
- `src/app/(protected)/cases/[caseId]/interview/page.tsx`
- `src/components/cases/case-interview-client.tsx`
- `src/app/api/cases/[caseId]/interview/route.ts`
- `src/app/api/cases/[caseId]/interview/complete/route.ts`

### 1-3. 수정 포인트

- `assertCaseInterviewAccess()` 기준 **통일**
- **page** 진입 권한과 **service** 저장·완료 권한 **일치**
- **STAFF** 허용 여부에 따라 **버튼·readonly** 처리 **일치** (안 A 확정 시 **STAFF**도 수행 **가능**으로 맞출 것)
- **완료** 처리도 **같은** 권한 기준

### 1-4. 완료 기준

- `STAFF`로 인터뷰 페이지 진입 시  
  - **저장·완료**가 **허용**이면 **둘 다 허용**  
  - **조회만**이면 **둘 다 차단**  
- **「페이지는 열리는데 저장은 안 됨」** 상태 **제거**

---

## 2단계. 승인·잠금 권한 정책 통일

### 2-1. 먼저 고칠 파일

- `src/components/cases/document-review-panel.tsx`
- `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/lock/route.ts`

### 2-2. 수정 포인트

- **승인 가능** role과 **잠금 가능** role을 **한 기준**으로 통일
- **`SUPER_ADMIN` 포함 여부** 최종 확정
- **UI** 버튼 노출 = **API** 허용
- `approve`와 `lock`의 **권한 체크 방식** 차이 **최소화**

### 2-3. 권장 정책 (이 순서표 기준)

- **가능:** `ADMIN` / `LAWYER` / `SUPER_ADMIN`
- **불가:** `STAFF` / `CLIENT`

이렇게 갈 경우 **`document-review-panel.tsx`에도 `SUPER_ADMIN`**을 반영해야 한다.

### 2-4. 완료 기준

- **UI**에 버튼 보이는 role과 **API**에서 **실제** 허용하는 role이 **완전히** 같을 것

---

## 3단계. 승인 API 상태 차단 보강

### 3-1. 먼저 고칠 파일

- `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`

### 3-2. 수정 포인트

- 현재 `APPROVED`, `LOCKED`만 직접 차단한다면 **`ARCHIVED`** **명시** 차단
- 정책을 더 **선명**하게: **승인 가능 상태만 allow**, 나머지 **deny**

**예 (참고)**

| 승인 가능 | `DRAFT`, `REVIEW_PENDING` |
|----------|---------------------------|
| 승인 불가 | `APPROVED`, `LOCKED`, `ARCHIVED` |

### 3-3. 완료 기준

- `ARCHIVED` 문서 **승인 요청** 시 **반드시** 실패
- **실패 메시지**가 UI·운영 문구와 **충돌**하지 않을 것

---

## 4단계. 응답 포맷 1차 통일

### 4-1. 먼저 기준 선택

**권장 (본 순서표 기준)**

- 성공: `{ "ok": true, "data": ... }`
- 실패: `{ "ok": false, "message": "..." }`

**이유:** 코드베이스에 `ok(...)` 유틸이 많이 보이고, **전환 비용**이 비교적 적다.

### 4-2. 먼저 고칠 파일

**서버**

- `src/app/api/cases/[caseId]/interview/route.ts`
- `src/app/api/cases/[caseId]/interview/complete/route.ts`
- `src/app/api/cases/[caseId]/summary/generate/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/lock/route.ts`

**클라이언트**

- `src/components/cases/case-detail-client.tsx`
- `src/components/cases/case-interview-client.tsx`
- `src/components/cases/case-summary-panel.tsx`

### 4-3. 수정 포인트

- `success` / `ok` **혼용 제거**
- 에러 **메시지** 위치 **통일**
- `readApiErrorMessage()` **단순화**
- `isJsonApiSuccess()` **축소** 또는 **제거**

### 4-4. 완료 기준

- 클라이언트에서 `ok`와 `success`를 **동시에** 흡수하는 코드 **없앰**
- API 응답 **예측 가능**
- **실패** 메시지 파싱이 **한** 방식으로 끝남

---

## 권장 실제 작업 순서 (Batch A-1 ~ A-4)

| 묶음 | 파일 | 목표 |
|------|------|------|
| **Batch A-1** | `case-interview.service.ts` · `interview/page.tsx` · `case-interview-client.tsx` **+** `case.permissions.ts` (접근·STAFF·사건 **목록** 선행) | 인터뷰 **권한 정책** (안 A) **통일** — **[270]** |
| **Batch A-2** | `interview/route.ts` · `interview/complete/route.ts` | 인터뷰 API **응답·권한** 마감 (통일·`ok` 선행·전 단계와 합) |
| **Batch A-3** | `document-review-panel.tsx` · `approve/route.ts` · `lock/route.ts` | 승인·잠금 **권한·상태** 통일, **`ARCHIVED` 차단** |
| **Batch A-4** | `case-detail-client.tsx` · `case-summary-panel.tsx` | (필요 시 `case-interview-client` **잔정리**) **응답 포맷**에 맞춘 **클라** 정리·**에러** 단순화 |

*참고:* 인터뷰 클라이언트 권한 UI는 **A-1**에서 주로 맞추고, **ok** 전역 정리는 **A-2~A-4**에서 API·detail·summary와 **같이** 맞춘다.

---

## 검증 순서

**각 묶음** 반영 후 아래 **순서**로 확인한다.

1. **타입** / **빌드** (`tsc` · `lint` 등)
2. **인터뷰** page **진입** · **저장** · **완료** (`STAFF` 포함)
3. **승인·잠금** **버튼** 노출 (role별)
4. **승인** API · **잠금** API **상태** 차단 (`ARCHIVED` **포함**)
5. **요약** / **상세** **에러** 메시지 **정상** 출력

---

## 한 줄

Batch A는 **권한·상태·응답**을 **파일 순서대로** 맞추고, **검증**은 **빌드 → 인터뷰 → 문서 → 클라** 순으로 **끊어서** 본다.

---

## Batch A — 문서·실행 **잠금** (읽는 기준)

- **백로그** 기준: `WORK_BACKLOG_BATCH_ABC_V1.md`
- **Batch A 실행 순서** 기준: 본 문서 `BATCH_A_FILE_ORDER_V1.md`
- **증빙:** [269]~[277] — `IMPLEMENTATION_EVIDENCE.md` (**Batch A** **사건** **축** **마감** **근거**) · [278] — **Batch B** (`api/cases` **외** **영역**)

**한 줄 (Batch A 마감):** [275] **+** [276] `api/cases` **+** [277] **;** **로컬** **실동작** **캡처** **는** **선택** **강화** **증빙** **으로** **분리** **.** **다음** **:** [278] Batch B — `legal-documents` **등** **·** **공용** `success`/`ok` **유틸** **는** **별도** **스프린트**

### A-1 코드 반영 요약 (안 A, STAFF)

- `case.permissions.ts`: **배정 STAFF** `isAssignedStaff` · `canRead` / `canWriteCase` · `buildAccessibleCaseWhere`(STAFF+배정) · `canPerformCaseInterview()`.
- `case-interview.service.ts`: `canManageInterview` = `canPerformCaseInterview` (안 A 주석) · `assertCaseInterviewAccess`·`completeCaseInterview` **단일** 축.
- `interview/page.tsx` → `CaseInterviewClient`: **`canEditInterview`** prop (`getCaseAccessContext`·**동일** **식**).
- `case-interview-client.tsx`: `interviewReadOnly` = **`!canEditInterview`** **또는** 종결·반려·삭제 · 배너 **권한/상태** 문구 (**[270]**·**[271]**)

### A-2 코드 반영 요약 (입력·에러 계열)

- `interview/route.ts` — **POST** `value`: `string | number | boolean | string[] | null` **검증** (`isInterviewApiValue`) · 생략 시 `null` · **GET/POST 응답 shape 유지**
- `interview/complete/route.ts` — `getSessionUser`·`UnauthorizedError`·`ok`·`toErrorResponse` (`domain-api-response`, `interview/route` **동일** 계열) (**[272]**)
- **수동** 4시나리오 — **[273]** — **절차·템플릿** (문서 **세트** **잠금**): `BATCH_A2_MANUAL_CHECKLIST_V1.md` + **§[EVIDENCE-20260423-275]**; **STAFF/상태** **실** **검** **후속** **§[277]**

### A-3 코드 반영 (승인·잠금)

- `legal-documents/.../approve` — `DRAFT`·`REVIEW_REQUIRED` **만** 승인 · **`ARCHIVED`** **거부** · `catch` `unknown` (**[274]**)
- `legal-documents/.../lock` — `UnauthorizedError` / `NotFoundError` / `ForbiddenError` / `ValidationError` + `toErrorResponse`
- `document-review-panel` — **API** **동일** **축** **주석** · `canActAsLawyerOrAdmin`

### A-4 — 응답 **정렬** **[276]** (착수·점진)

- **[276]** = **A-4** **전면** **완료** **아님** — `summary`·`timeline`·`api/cases/[caseId]` **등** **슬라이스** **누적**; **이후** **API**·**응답** **쌍**·**`cases` POST** **등** (**`IMPLEMENTATION_EVIDENCE` [276] 범위** **선언**)
- **서버 (점진):** `route` **쌍** **마다** `ok` / `toErrorResponse` + **도메인** **에러** (레거시 `api-response`·`Response.json` **감소**)
- **클라 (점진·첫** **슬라이스**): `case-summary-panel` **해당** **fetch** **정리** **완**; `case-detail-client`·`case-interview-client`·**공용** `ok`/`success` **흡수** **유틸** **전면** **개편** → **후속** **A-4** **또는** **별도** **스프린트**
- **기준**·**스캔** **목록:** `IMPLEMENTATION_EVIDENCE` **[276]**·본 문서 **§4**
