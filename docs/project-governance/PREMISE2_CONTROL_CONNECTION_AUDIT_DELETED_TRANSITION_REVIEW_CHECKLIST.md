# DELETED 관련 전이·가드·UI·타 모듈 역점검 체크리스트

| 항목 | 내용 |
|------|------|
| 상위 스냅샷 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-228]** — `softDeleteCaseService`·진입 명확 / 상태별 삭제·직접 복구는 스코프 밖 |
| 교차 문서 | **[EVIDENCE-20260421-227]** — §6 DENY-8 / §11 OPEN-4 역할 분리 |
| 통합 시트 | [PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md](./PREMISE2_CONTROL_CONNECTION_AUDIT_SHEET.md) OPEN-4·DENY-8 행 |
| 본 체크리스트 신설 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-229]** |
| §1 전이 로직 실확인 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-230]** |
| §2 가드 점검 실확인 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-231]** |
| §3 API 점검 실확인 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-232]** |
| §4 UI 점검 실확인 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-233]** |
| §5 타 모듈 점검 실확인 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-234]** |
| §6 DENY-8 / OPEN-4 연결 점검 실확인 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-235]** |
| §7 evidence 반영·종합 정리 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-236]** |
| §7 후속 1순위 — 전이·`REOPEN_CASE` 본문 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-237]** |
| §7 후속 2순위 — allowed-actions / permissions 본문 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-238]** |
| §7 후속 3순위 — 표준 `status`/`transition`·사건 API 복구 키워드 1차 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-239]** |
| §7 [239] 기준 서버 재확인·UI 원문 대기 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-240]** |
| §7 UI 6파일 3질문 실사 진행 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-241]** — **6/6 마감·최종 잠금** · 닫는 문장·요지는 증빙 「[241] 최종 잠금」절 |
| §7 OPEN-4 / DENY-8 최종 잠금 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-242]** — **단일 출처** · OPEN-4/DENY-8만 말할 때 **[242]**만 인용 · 펼침은 UI→[241]·서버→[240]·후속→[239] |
| §7 [239] 후속 1번 — repository 축 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-243]** — DELETED 판정 재검토 아님 · 3질문 실사 |
| §7 [243] repository 축 **최종 압축 (고정)** | 본 체크리스트 아래「**[243] … 최종 압축 (고정)**」·증빙 **[243]**(본문+초안+**보강** `api/.../detail` **재확인**+`cases/[caseId]/page` **1차**) |
| §7 repository 축 3질문 붙여넣기 템플릿 | [REPOSITORY_DELETED_3QUESTION_WORK_TEMPLATE.md](./REPOSITORY_DELETED_3QUESTION_WORK_TEMPLATE.md) — 표·판정 문장·[243]·체크리스트·시트·파일 1개 완성형 |
| §7 UI 6파일 실사 붙여넣기 템플릿 | [DELETED_UI_6FILE_3QUESTION_WORK_TEMPLATE.md](./DELETED_UI_6FILE_3QUESTION_WORK_TEMPLATE.md) — 3질문 표·판정 문장·[241] 증빙·체크리스트·시트 문안 |
| §7 다음 세션 — UI 6파일 실사 절차 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260421-239]** 「**바로 시작 순서**」·「**그다음 후속**」·「**한 줄로 닫으면**」 · 중간 결론 **[240]** |

점검 결과는 **[228] 후속** 별도 evidence 블록으로 누적한다. `check-status` 단독 근거 금지는 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 공통 규칙 4-1을 따른다.

**다음 세션 시작:** DELETED 판정 재검토 없음 — **[242]** 인용 체계 확인 후 **실무는 [239] 후속** · **첫 항목 repository 축 [243]** (진행). 근거 펼침 시 **[241]**·**[240]**.

### [243] [239] 후속 1번 — repository 축 (압축)

- **질문 1:** DELETED 복구·재생성 성격 함수 존재 여부  
- **질문 2:** 조회 계층의 DELETED 제외/포함 규칙  
- **질문 3:** soft delete 이후 운영 추적 잔존 경로  

**현재 상태:** DELETED 판정 재검토가 아니라, **[242]** 이후 후속 실무 점검 축 — 증빙 **[243]** 본문.

**파일 실사 누적 — `api/cases/[caseId]/detail/route.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회 계층: **`findUnique(where: { id })`** · 명시적 DELETED 제외 필터 **없음** · **`canAccessCase`는 status 미검사**  
3. 운영 추적·연계: **interviews / legalDocuments / caseTimelineEvents** 포함 상세 응답  

**파일 실사 누적 — `src/lib/definitions/permissions.ts`**

1. 사건 DELETED 복구·재생성 함수: **없음** (`document.restore` 등은 문서·문단 권한 키)  
2. 접근 계층: **DELETED·case status 미참조** · `canAccessCase`는 role/owner/assigned/participant만 · **ADMIN 즉시 통과**  
3. 운영 추적: **직접 없음**  

**파일 실사 누적 — `src/lib/cases/case-detail-serialize.ts`**

1. 사건 DELETED 복구 함수: **없음**  
2. 조회/DELETED 필터: **없음**(조회 비수행, 전달 `caseRecord`만 직렬화)  
3. 상세 노출: **status / latestInterview / documents·paragraphs·versions / timelineEvents** 등 넓은 직렬화  

**교차 실사 — `src/lib/authz.ts` (`assertCaseAccess`)**

1. **NotFound 등으로 DELETED 숨김:** **없음** · 실패 시 **403 `Error`** 만  
2. **`canAccessCase` 래퍼:** **예** · 추가 분기 없음  
3. **DELETED 최종 차단층:** **아님** · 판단 내용은 `canAccessCase`와 동일  

**파일 실사 누적 — `api/cases/[caseId]/documents/generate/route.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회 계층: **raw `findUnique({ id })` 후** `caseRecord.status` 로 **DELETED·REJECTED·CLOSED → 400** 명시 차단  
3. 운영 추적(이 경로): **없음** · 차단 시 문서·문단·버전·`DRAFTING`·타임라인 기록 **미진행**  

**파일 실사 누적 — `api/admin/alerts/board/route.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회 계층: 검색 `case.findMany`(title) **status 미필터** · **`board-filters.ts`와 조합 시** 보드 where에 **DELETED 제외 없음** *(AlertEvent 수명은 별도)*  
3. 운영 추적: **있음** · **Alert 보드** · DELETED 사건 연계 alert/event **잔존 가능**  

**파일 실사 누적 — `src/lib/alerts/board-filters.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회 계층 DELETED 규칙: **없음** · `buildAlertBoardWhere`는 severity·escalation·assignee·rule·dueAt·`q`·`caseIdsMatchingSearch`만 · **case status 미참조**  
3. 운영 추적: **있음** · `q` 시 **`entityType: "CASE"`** + **`entityId in caseIdsMatchingSearch`** OR · **status 필터 없음**  

**파일 실사 누적 — `src/lib/cases/apply-case-status-transition.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회 계층: **raw `findUnique`** · DELETED 차단은 **내부 없음** · **`checkCaseTransitionOrThrow` 전이 규칙 위임**  
3. 운영 추적: **있음** · **`CASE_STATUS_CHANGED`** 타임라인  

**파일 실사 누적 — `src/features/document-drafts/document-draft.repository.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회 계층 DELETED 규칙: **없음** · 사건 **status 미차단** · **`CaseTimelineMemo`** `deletedAt: null`만  
3. 운영 추적: **있음** · **`CASE_DOCUMENT_DRAFT`** 메모 저장·조회  

**파일 실사 누적 — `api/cases/[caseId]/route.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회/차단: **service 위임** · GET → **`getCaseDetailService`** · DELETED 상세 판정은 **service** 책임  
3. 운영 추적: **DELETE = `softDeleteCaseService` 진입점** · soft delete 후속은 **service 축**  

**파일 실사 누적 — `api/cases/[caseId]/status/route.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회/차단: **직접 조회 없음** · **`applyCaseStatusTransition`** · 전이 규칙 위임  
3. 운영 추적: **상태 변경 타임라인 = 전이 엔진 내부** · `allowedLifecycleActions` 응답 부착  

**파일 실사 누적 — `api/cases/[caseId]/transition/route.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회/차단: **`status/route.ts`와 동일** · POST 별칭 · **`applyCaseStatusTransition`만**  
3. 운영 추적: **동일(전이 엔진 위임)**  

**파일 실사 누적 — `src/features/cases/case.service.ts`**

1. DELETED 복구·재생성 성격 함수: **없음** · `softDeleteCaseService`는 `status: "DELETED"` 갱신만  
2. 조회/DELETED 규칙: **직접 `status` 필터 없음** · **`getCaseAccessContext`+`findCaseById`** · **`findAccessibleCases`** · **`findRecentAccessibleCases`** 하위 위임  
3. 운영 추적: **있음** · **`CASE_SOFT_DELETE`** (및 `CASE_CREATE`/`CASE_UPDATE` 감사)  

**파일 실사 누적 — `src/features/cases/case.permissions.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회/DELETED 규칙: **있음** · **`buildAccessibleCaseWhere` base `not: "DELETED"`** · **`getCaseAccessContext` `!found`/`status === "DELETED"` → `NotFoundError`** (vs `lib/definitions/permissions` `canAccessCase` **별개**)  
3. 운영 추적: **직접 없음** — **접근·필터·차단 계층**  

**파일 실사 누적 — `src/features/cases/case.repository.ts`**

1. DELETED 복구·재생성 성격 함수: **없음**  
2. 조회/DELETED 규칙: **불균일** · **`findAccessibleCases` / `findRecentAccessibleCases`:** `buildAccessibleCaseWhere` → **DELETED 제외** · **`findCaseById`:** `where: { id }`만 → **DELETED 미필터**  
3. 운영 추적: **직접 없음** · **DELETED row** `find`/`update` **기반은 있음** (상위 service가 감사)  

**판정 (누적):** 복구성 함수 없음 · **`case.permissions`+`case.repository`+라우트 체인으로 [243] 구조 닫힘** — **raw `detail` vs `getCaseAccessContext` (핵심)** · **목록/단건 repo 불균일 확인** · **`documents/generate` 차단** · **Alert** · **[240] 전이** · **`[caseId]/route`·`case.service`·`document-draft`** · DELETED **일괄 아님** — 증빙 **[243]** · **잔여** 본문 「남은 이슈」·`find*` **전역**

### [243] repository 축 최종 압축 (고정)

- **복구 우회 함수:** 현재 확인 범위에서 **없음**
- **DELETED 차단 구조:**
  - **raw 단건 상세 축:** **미차단 후보** 존재
  - **service + `getCaseAccessContext` 축:** DELETED 시 **`NotFound`** 차단
  - **일부 라우트:** `caseRecord.status` **분기**로 직접 차단
  - **목록/최근 목록:** `buildAccessibleCaseWhere`로 차단
- **운영·초안 잔존:**
  - **Alert 보드** 축 잔존
  - **draft repository** 축 잔존
- **최종 판정:**
  - **DELETED 정책**은 **공통 단일 차단층**이 아니라 **축별로 불균일**하게 분기됨
  - **핵심 리스크**는 **전이 엔진**이 아니라 **raw 단건 상세 조회** 축
- **후속:**
  - 남은 `find*` 후보는 **재판정**이 아니라 **보강 검증**으로 처리

**보강 구조 (잠금·증빙 [243]):** **재확인(API)** `src/app/api/cases/[caseId]/detail/route.ts` — raw `findUnique`·`assertCaseAccess`·`serializeCaseDetail` = **raw 상세 노출 후보 축 재확인** · **1차(페이지)** `src/app/(protected)/cases/[caseId]/page.tsx` = **API뿐 아니라 페이지 축**에도 **동일 성격** 고정. **detail API 한 줄 정본**은 증빙 「**[243] 보강 구조 (잠금)**」·「**detail/route 보강 검증**」.

### OPEN-4 / DENY-8 최종 판정 (압축 · [242]와 동일)

**인용:** 이 절·OPEN-4/DENY-8 일반 논의는 증빙 **[242]** 「인용 우선순위」와 같다.

- **OPEN-4 최종 판정**
  - 표준 전이/API/UI 기준 DELETED 복구 전용 경로 없음
  - 남은 범위는 복원·재생성·soft delete 후 처리의 설명/운영/추적 문서화
- **DENY-8 최종 판정**
  - DELETED 사건의 일반 재진입은 서버·UI 모두에서 확인되지 않음
  - 현재 구현과 정합적으로 최종 잠금

---

## 1. 전이 로직 점검

**목표:** `DELETED` 진입과 `DELETED` 이후 경로가 전이 정의상 어떻게 다뤄지는지 확인

### 진행 체크(누적)

- [x] `DELETED` **진입** 경로(API → 서비스 → 저장소 갱신) 확인 — **[230]** 본문
- [ ] `CASE_TRANSITIONS`(코드 본문)에 `to: DELETED` 허용 상태 — **현재 업로드 코드 범위에서는 미확인** — **[230]**
- [ ] `CASE_TRANSITIONS`(코드 본문)에 `from: DELETED` 직접 전이 — **현재 업로드 코드 범위에서는 미확인** — **[230]**
- [ ] `DELETED` → `CREATED` 직접 복구/복원 전이 — **현재 업로드 코드 범위에서는 미확인** — **[230]**
- [ ] `REOPEN_CASE`가 `DELETED` 출발/도착 포함 — **현재 업로드 코드 범위에서는 미확인** — **[230]**
- [ ] `applyCaseStatusTransition` / `evaluateCaseTransition` / `checkCaseTransitionOrThrow`의 `DELETED` 분기 — **전이 유틸 본문 미확인** — **[230]**
- [x] 전이 유틸 없이 `status: "DELETED"` 직접 저장 **우회 경로** — `softDeleteCaseService` → `updateCaseById` 확인 — **[230]**

### 실제 확인 결과 ([EVIDENCE-20260421-230])

#### 1) `DELETED` 진입 전이 — **확인됨**

저장소 기준 `DELETE /api/cases/[caseId]/route.ts`가 `softDeleteCaseService`를 호출하고, 이 서비스가 `updateCaseById(caseId, { status: "DELETED" })`를 직접 실행합니다. 따라서 API → 서비스 → 저장소 갱신으로 이어지는 **`DELETED` 진입 경로는 명확**합니다.

[CASE_LIFECYCLE_TRANSITION_SUMMARY.md](./CASE_LIFECYCLE_TRANSITION_SUMMARY.md) **§5 허용 전이 표**도 `CREATED` → `DELETED`, `INTAKE_PENDING` → `DELETED`를 이 경로(`case.service.ts` `softDeleteCaseService` · `DELETE` `api/cases/[caseId]/route.ts`)로 직접 연결하고 있습니다.

#### 2) 상태별 삭제 제한 — **현재 스코프에서는 미확인**

`softDeleteCaseService`는 `isOwner || isAdmin` 권한만 검사하고, **현재 상태값에 따른 별도 분기**는 보이지 않습니다. 즉, **이 파일 범위**에서는 상태별 삭제 제한 로직은 확인되지 않았습니다.

문서에서도 `HOLD` → `DELETED`, `REJECTED` → `DELETED`는 `impl_ref`는 있으나 **출발 상태 제한 코드 확인 필요**로 남아 있습니다.

#### 3) `DELETED` → `CREATED` 직접 전이 — **미확인**

현재 업로드된 `case.service.ts`와 `route.ts`에는 `DELETED` 상태에서 다시 `CREATED`로 되돌리는 함수나 라우트가 없습니다.

문서도 이 전이를 직접 허용 전이로 보지 않고, **OPEN-4**는 설명 축, **DENY-8**은 일반 재진입 금지 축으로 분리해 두고 있습니다.

#### 4) `REOPEN_CASE`와의 연결 — **현재 스코프에서는 `DELETED`와 직접 연결 근거 미확인**

문서상 `REOPEN_CASE`는 `IN_INTERVIEW` 예외 재개 축으로 계속 언급되지만, **현재 업로드된 코드 범위**에서는 `DELETED`와 직접 이어지는 구현은 확인되지 않았습니다.

### 체크리스트 기입 문안(§1)

**전이 로직 점검 결과**

- **DELETED 진입 경로 확인** — `DELETE /api/cases/[caseId]/route.ts` → `softDeleteCaseService` → `updateCaseById(..., { status: "DELETED" })` 확인.
- **`CASE_TRANSITIONS`에 `to: DELETED` 허용 상태 정의 확인** — 현재 업로드 코드 범위에서는 미확인.
- **`CASE_TRANSITIONS`에 `from: DELETED` 직접 전이 정의 확인** — 현재 업로드 코드 범위에서는 미확인.
- **`DELETED` → `CREATED` 직접 복구/복원 전이 확인** — 현재 업로드 코드 범위에서는 미확인.
- **`REOPEN_CASE`가 `DELETED`를 출발/도착 상태로 포함하는지 확인** — 현재 업로드 코드 범위에서는 미확인.
- **서비스 계층에서 전이 정의 우회 경로 존재 여부 확인** — `softDeleteCaseService`가 전이 유틸 호출 없이 `status: "DELETED"`를 직접 저장하는 우회 경로임을 확인.

**기록용 한 줄(기입 완료)**

- 전이 정의상 `DELETED`는 현재 업로드 **문서**에서 일부 허용 진입(`CREATED`, `INTAKE_PENDING`) 참조는 있으나, **전이 유틸 본문**은 아직 미확인이다.
- 직접 복구 전이는 현재 업로드 코드 범위에서 미확인이다.
- 우회 상태 변경 경로는 `softDeleteCaseService`가 `updateCaseById(..., { status: "DELETED" })`를 직접 호출하는 방식으로 확인된다.

### 현재 판정(§1만)

전이 로직 점검만 놓고 보면,

- **확인 완료:** `DELETED` 진입 경로  
- **미확인:** 상태별 삭제 제한, `DELETED` → `CREATED` 직접 복구, `REOPEN_CASE`와의 연결, 전이 유틸 본문  

**문서 정합:** 그래서 **DENY-8** / **OPEN-4**를 지금처럼

- **DENY-8** = 일반 재진입 금지  
- **OPEN-4** = 복원·재생성·soft delete 후 처리 설명 축  

으로 유지하는 현재 문서 정리는 **여전히 타당**합니다.

---

## 2. 가드 점검

**목표:** 삭제 가능 조건과 복구 가능 조건이 권한 외에 상태 기준으로도 잠겨 있는지 확인

### 진행 체크(누적)

- [x] `softDeleteCaseService` **삭제 권한 가드** — **[231]** 본문
- [x] 동 서비스가 **권한 중심**인지·상태 분기 부재 — **[231]**
- [ ] **상태별 삭제 제한**이 라우트·타 레이어에 있는지 — **현재 스코프 미확인** — **[231]**
- [ ] **복구/복원** 가능 상태 제한 별도 가드 — **현재 스코프 미확인** — **[231]**
- [ ] `allowedLifecycleActions`의 `DELETED` 처리(본문 열람) — **제출 스코프에서 미확인** — **[231]** · 후속: `src/lib/cases/allowed-actions.ts`
- [ ] `permissions`·`getCaseAccessContext` **내부** `DELETED` 특별 처리 — **제출 스코프에서 미확인** — **[231]** · 후속: `src/features/cases/case.permissions.ts`

### 실제 확인 결과 ([EVIDENCE-20260421-231])

#### 1) 삭제 서비스 가드 존재 여부 — **확인됨**

`softDeleteCaseService`는 먼저 `getCaseAccessContext(currentUser, caseId)`를 호출한 뒤, `access.isOwner || access.isAdmin` 조건이 아니면 `ForbiddenError("삭제 권한이 없습니다.")`를 발생시킵니다. 즉, **삭제 권한 가드 자체는 존재**합니다.

#### 2) 삭제 가드가 권한만 보는지 여부 — **확인됨**(`softDeleteCaseService` 파일 범위)

현재 업로드된 `softDeleteCaseService` 내부에는

- 현재 상태가 무엇인지  
- 특정 상태에서만 삭제 가능한지  
- `DELETED` 상태는 다시 삭제 불가인지  

같은 **상태별 제한 분기가 없습니다**. 확인되는 검사는 **`isOwner || isAdmin` 권한 조건**뿐입니다. 따라서 **이 파일 범위**에서는 삭제 가드는 **권한 중심**이고, **상태 가드는 직접 확인되지 않았습니다**.

#### 3) 상태별 삭제 제한이 별도 레이어에 있는지 — **현재 스코프에서는 미확인**

`DELETE /api/cases/[caseId]/route.ts`는 별도 상태 검사 없이 `softDeleteCaseService`를 호출합니다. 현재 업로드된 파일 범위에서는 `CASE_TRANSITIONS` · `allowedLifecycleActions` · `permissions` 상세 구현 · 상태 전이 유틸 **본문을 직접 보지 못했기 때문에**, 다른 레이어에 상태별 삭제 제한이 숨어 있는지는 **아직 확정할 수 없습니다**.

#### 4) `allowedLifecycleActions`가 `DELETED`를 어떻게 다루는지 — **미확인**(제출 스코프)

`case.service.ts`는 `getAllowedLifecycleActionsForCase`를 import해서 생성/상세/수정 응답에 붙이지만, **해당 함수 본문은 제출·점검 세션에서 열람하지 않은 경우** `DELETED` 상태에서 허용 액션을 비우는지, 복구 액션을 주는지, 삭제 액션을 숨기는지는 **그 세션 기준으로 확인 불가**입니다. (저장소에 파일이 있으면 후속에서 `allowed-actions.ts` 열람.)

#### 5) `permissions` 계층에서 `DELETED`를 따로 막는지 — **미확인**(제출 스코프)

현재 보이는 것은 `getCaseAccessContext` 호출뿐이고, **그 내부 구현을 같은 세션에서 열람하지 않은 경우** `DELETED` 사건 수정 금지·복구 금지·열람 제한 같은 별도 정책이 있는지는 **확인되지 않았습니다**. (후속: `case.permissions.ts` 열람.)

### 체크리스트 기입 문안(§2)

**§2 가드 점검 결과**

- **`softDeleteCaseService` 외 삭제 관련 서비스 존재 여부 1차 확인** — 현재 업로드 범위에서는 `softDeleteCaseService`가 직접 확인됨.
- **`softDeleteCaseService`가 권한만 검사하는지 재확인** — `isOwner || isAdmin`만 검사하고 상태별 분기는 현재 파일에 없음.
- **삭제 가능 상태 제한 별도 가드 존재 여부 확인** — 현재 업로드 범위에서는 미확인.
- **복구/복원 가능 상태 제한 별도 가드 존재 여부 확인** — 현재 업로드 범위에서는 미확인.
- **`allowedLifecycleActions` 계산에서 `DELETED` 처리 확인** — 함수 본문 미열람(제출 스코프)으로 미확인.
- **`permissions` 레이어의 `DELETED` 특별 처리 확인** — `getCaseAccessContext` 내부 미열람(제출 스코프)으로 미확인.

**기록용 한 줄(기입 완료)**

- 삭제 가드는 현재 업로드 파일 기준으로 **권한만 확인됨**.
- 상태별 삭제 제한은 현재 스코프에서 **미확인**.
- 복구 가드는 현재 스코프에서 **미확인**.
- allowed-actions / permissions 계층의 `DELETED` 처리도 현재 스코프에서 **미확인**.

### 현재 판정(§2만)

가드 점검만 놓고 보면,

- **확인 완료:** 삭제 권한 가드 존재 · 서비스 계층에서는 권한 검사 후 직접 `DELETED` 상태 저장  
- **미확인:** 상태별 삭제 제한 · 복구/복원 가드 · `allowedLifecycleActions`의 `DELETED` 처리 · `permissions` 계층의 `DELETED` 특별 처리  

**실무 판단:** 현재 범위에서는 **“삭제는 권한 가드만 확인됨, 상태 가드는 아직 미확인”**으로 적는 것이 가장 정확합니다. 이 결과는 **[228]** 의 “삭제 진입은 확인, 상태별 삭제 제한과 직접 복구는 본 스코프 밖”이라는 증빙 방향과도 일치합니다.

**evidence용 짧은 문장**

`softDeleteCaseService` 기준으로 삭제 가드는 `isOwner || isAdmin` 권한 확인까지는 명확하다. 다만 현재 업로드 범위에서는 상태별 삭제 제한, 복구/복원 가드, `allowedLifecycleActions`와 permissions 계층의 `DELETED` 특별 처리는 확인되지 않았다. 따라서 가드 점검 결과는 **“권한 가드 확인 / 상태 가드 미확인”**으로 기록한다.

---

## 3. API 점검

**목표:** 삭제와 복구가 어떤 라우트에서 실제로 열려 있는지 확인

### 진행 체크(누적)

- [x] `DELETE /api/cases/[caseId]/route.ts` 존재·`softDeleteCaseService` 연결 — **[232]**
- [x] `PATCH /api/cases/[caseId]` 에서 `status` 직접 수정 차단 — **[232]**
- [ ] `PATCH /api/cases/:caseId/status` 본문·`DELETED` 분기 — **제출 세션 미열람** — **[232]** · 후속: `src/app/api/cases/[caseId]/status/route.ts`
- [ ] `POST /api/cases/:caseId/transition` 본문·`DELETED` 분기 — **제출 세션 미열람** — **[232]** · 후속: `src/app/api/cases/[caseId]/transition/route.ts`
- [ ] `DELETE` 외 **사건** 삭제 전용 route 추가 여부 — **이번 세션에서는** `[caseId]/route.ts` 중심 — **[232]**
- [ ] 복구/복원/재생성·직접 복구 API·응답 메시지 — **현재 스코프 미확인** — **[232]**

**검색 키워드**

`DELETED` · `softDeleteCaseService` · `restore` · `recover` · `reopen` · `transition` · `status: "DELETED"`

### 실제 확인 결과 ([EVIDENCE-20260421-232])

#### 1) 삭제 API 존재 여부 — **확인됨**

`src/app/api/cases/[caseId]/route.ts`에는 `DELETE` 핸들러가 존재하고, 이 핸들러는 `softDeleteCaseService(currentUser, caseId)`를 호출합니다. `softDeleteCaseService`는 다시 `updateCaseById(caseId, { status: "DELETED" })`를 직접 실행하므로, **API 계층에서 삭제 요청이 실제로 `DELETED` 상태 저장으로 이어지는 경로**가 확인됩니다.

#### 2) `PATCH /api/cases/[caseId]`에서 상태 직접 수정 차단 여부 — **확인됨**

같은 route 파일의 `PATCH` 핸들러는 요청 body 안에 `status` 필드가 있으면 곧바로 `ValidationError`를 던지며,

> status 직접 수정은 허용되지 않습니다. 사건 상태 전이는 PATCH /api/cases/:caseId/status 또는 POST /api/cases/:caseId/transition 을 사용하세요.

라고 명시합니다. 즉, **이 라우트 자체에서는 상태 직접 수정이 차단**됩니다.

#### 3) `status` / `transition` 전용 API 존재 가능성 — **문서상·에러 문구상 가능성 확인 / 본문 미열람**

위 `PATCH` 에러 문구 때문에, `PATCH /api/cases/:caseId/status` · `POST /api/cases/:caseId/transition` 전용 API가 저장소에 존재할 가능성은 **높음**이 확인됩니다. 다만 이번 제출·점검 세션에서는 **해당 route 본문을 직접 열람하지 않았으므로**, `DELETED` 관련 분기 여부 자체는 **아직 미확인**입니다.

(저장소 동기화 시 후속: `src/app/api/cases/[caseId]/status/route.ts`, `.../transition/route.ts` 열람.)

#### 4) 복구/복원/재생성 전용 API 존재 여부 — **현재 스코프에서는 미확인**

이번에 열람한 API 파일은 `src/app/api/cases/[caseId]/route.ts` 한 개뿐이며, 그 안에는 **GET · PATCH · DELETE**만 있습니다. 따라서 `restore` · `recover` · `reopen` · `recreate` 같은 명시적 복구/복원 route가 있는지 없는지는 **아직 확정할 수 없습니다**. 현재까지는 **[228]** 에서 정리한 그대로, **`DELETED` → `CREATED` 직접 복구 API**는 본 스코프에서 **미확인**으로 두는 것이 맞습니다.

#### 5) `DELETED` → `CREATED` 직접 복구를 여는 API 여부 — **미확인**

현재 열람한 `DELETE` route와 `case.service.ts`에서는 **삭제 진입만** 확인되며, `DELETED` 상태를 다시 일반 업무 상태로 돌리는 API는 **보이지 않습니다**. 따라서 API 관점에서도 현재까지는 **“삭제 진입 API는 확인, 직접 복구 API는 미확인”**으로 적는 것이 가장 정확합니다.

### 체크리스트 기입 문안(§3)

**§3 API 점검 결과**

- **`DELETE /api/cases/[caseId]/route.ts` 존재 및 삭제 서비스 연결 확인** — `DELETE` → `softDeleteCaseService` → `updateCaseById(..., { status: "DELETED" })` 확인.
- **`PATCH /api/cases/[caseId]`에서 `status` 직접 수정 차단 확인** — `status` 포함 시 `ValidationError` 발생, 상태 전이는 별도 `status` / `transition` API 사용 안내.
- **`PATCH /api/cases/:caseId/status` 본문 열람** — 이번 세션 미열람.
- **`POST /api/cases/:caseId/transition` 본문 열람** — 이번 세션 미열람.
- **복구/복원/재생성 전용 route 존재 여부 확인** — 현재 스코프 미확인.
- **`DELETED` → `CREATED` 직접 복구 API 존재 여부 확인** — 현재 스코프 미확인.
- **`DELETED` 관련 API 응답 메시지 / 분기 확인** — 전용 route 미열람으로 미확인.

**기록용 한 줄(기입 완료)**

- 삭제 API는 `DELETE /api/cases/[caseId]/route.ts`에서 확인됨.
- 상태 직접 수정은 `PATCH /api/cases/[caseId]`에서 차단됨.
- 상태 전이 전용 API는 에러 문구상 존재 가능성이 높지만, 이번 세션에서는 본문 미열람으로 미확인.
- 직접 복구 API는 현재 스코프에서 미확인.

### 현재 판정(§3만)

API 점검만 놓고 보면,

- **확인 완료:** 삭제 API 존재 · 삭제 API가 실제 `DELETED` 상태 저장으로 이어짐 · 일반 `PATCH /api/cases/[caseId]`에서 상태 직접 수정 차단  
- **미확인:** `PATCH /api/cases/:caseId/status` 본문 · `POST /api/cases/:caseId/transition` 본문 · 복구/복원/재생성 전용 API · `DELETED` → `CREATED` 직접 복구 API  

**실무 판단:** 현재 범위에서는 **“삭제 API와 상태 직접 수정 차단은 확인됨 / 전이 전용 API와 직접 복구 API는 미확인”**으로 적는 것이 가장 정확합니다.

**evidence용 짧은 문장**

`DELETE /api/cases/[caseId]/route.ts`와 `softDeleteCaseService` 연결로 삭제 API 경로는 확인되었고, 일반 `PATCH /api/cases/[caseId]`에서는 `status` 직접 수정이 차단된다. 다만 `PATCH /api/cases/:caseId/status`, `POST /api/cases/:caseId/transition`, 복구·복원·재생성 전용 API와 `DELETED` → `CREATED` 직접 복구 경로는 이번 제출·점검 세션에서 본문 미열람 상태이므로 미확인으로 유지한다.

---

## 4. UI 점검

**목표:** 사용자가 삭제/복구를 실제로 누를 수 있는지 확인

### [241] UI 6파일 3질문 실사 (6/6 마감)

**목적:** **[240]** 에서 보류된 UI 소비 축을 실제 JSX 기준으로 확인한다.

**점검 파일(순서):** `delete-case-button.tsx` → `case-status-actions.tsx` → `case-detail-client.tsx` → `case-status-card.tsx` → `[caseId]/page.tsx` → `cases/page.tsx`

#### `delete-case-button.tsx` — **[241]** 반영 완료

1. **삭제 버튼 노출 조건:** 파일 **내부 조건 없음.** `caseId`만 받아 버튼을 즉시 렌더링. **`cases/[caseId]/page.tsx`** 에서 **조건 없이** 상단에 배치됨(증빙 **[241]**).
2. **DELETED 복구·재생성 버튼:** **없음.**
3. **소비 방식:** `getAllowedCaseActions` / `allowedLifecycleActions` **미사용.** 독자 허용 판정 조건식도 없음 — **`loading`만** 비활성화용.

**판정:**

- 이 파일은 삭제 **허용 여부를 판단하지 않는** 단순 **실행** 버튼이다.
- DELETED **복구 UI를 제공하지 않는다.**
- **상세 페이지**(`cases/[caseId]/page.tsx`) 기준으로는 **상단 무조건 노출** — 목록 페이지 등 **다른 진입**은 별도 실사.

#### `case-status-actions.tsx` — **[241]** 반영 완료

1. **삭제 버튼 노출 조건:** **해당 파일에 삭제 버튼 없음.**
2. **DELETED 복구·재생성 버튼:** **없음** (`restore`/`recover`/`recreate`/`undelete` 분기·문구 없음). `REOPEN_CASE`·「사건 재개」는 있으나 **이 파일만**으로 DELETED 복구 전용이라 단정하지 않음.
3. **소비 방식:** props **`allowed: AllowedCaseActions`** 로 각 액션 버튼 조건부 렌더. **`allowedLifecycleActions` 직접 소비 없음** · **`getAllowedCaseActions` 이 파일 내부 호출 없음.**

**판정:**

- 이 파일은 **삭제 진입 UI를 제공하지 않는다.**
- **DELETED 복구 전용 UI도 제공하지 않는다.**
- **`REOPEN_CASE` 소비처이므로** 실제 `DELETED`와 연결되는지는 **상위에서 넘기는 `allowed` 계산**([238]·`case-action-guard`)과 **대조**가 필요하다.

#### `case-detail-client.tsx` — **[241]** 반영 완료

1. **삭제 버튼 노출 조건:** 이 파일에 삭제 버튼 **직접 없음** · `DeleteCaseButton` **import/렌더 없음.**
2. **DELETED 복구·재생성 버튼:** **없음** · 진행 액션은 **`CaseStatusActions` 위임.**
3. **소비 방식:** **`getAllowedCaseActions(...)` 직접 호출** → `caseActionsForUi` → `CaseStatusActions` · **`DELIVER_DOCUMENT`만** 선택 문서 `LOCKED`로 보정 · **`allowedLifecycleActions` 직접 사용 없음** · **`cannotCreateDocument`에 `DELETED` 포함**으로 문서 생성 버튼 차단.

**판정:**

- 삭제·DELETED 복구 UI를 **직접 렌더링하지 않는다.**
- **액션 허용 계산의 핵심 소비 지점**(`getAllowedCaseActions` + 화면 보정).
- **`DELETED`에서 문서 생성 금지**를 코드로 명시한다.

#### `case-status-card.tsx` — **[241]** 반영 완료

1. **삭제 버튼 노출 조건:** **삭제 버튼 없음** · 제목·상태·사실 배지·날짜만 표시.
2. **DELETED 복구·재생성 버튼:** **없음** (`restore`/`recover`/`recreate`/`undelete`/`REOPEN_CASE` 분기·문구 없음).
3. **소비 방식:** **`getAllowedCaseActions` / `allowedLifecycleActions` / 독자 액션 조건식 모두 미사용** · 표시용 props만.

**판정:**

- 삭제·DELETED 복구 UI **제공 안 함** · **액션 허용 계산 소비 지점 아님** · **상태 표시 전용 카드.**

#### `cases/[caseId]/page.tsx` — **[241]** 반영 완료

1. **삭제 버튼 노출 조건:** **`assertCaseAccess("case.read", ...)` 후** 상단에 **`<DeleteCaseButton caseId={caseId} />` 조건 없이** 직접 렌더.
2. **DELETED 복구·재생성 버튼:** **없음** (AI 인터뷰·수정·목록·삭제만).
3. **소비 방식:** **`getAllowedCaseActions` / `allowedLifecycleActions` 직접 미사용** · 삭제 노출 **독자 가드 없음.**

**판정:**

- **삭제 버튼 노출 책임**을 지는 **상단 조립 지점** · DELETED 복구 UI 없음.

#### `cases/page.tsx` — **[241]** 반영 완료

1. **삭제 버튼 노출 조건:** **해당 파일에 삭제 버튼·행 삭제 액션 없음.** 새 사건 등록·검색·상세 링크·보완 안내·페이지네이션만.
2. **DELETED 복구·재생성 버튼:** **없음** (`restore`/`recover`/`recreate`/`undelete`/`REOPEN_CASE` 분기·문구 없음).
3. **소비 방식:** **`getAllowedCaseActions` / `allowedLifecycleActions` / 독자 액션 조건식 모두 미사용** · **`listCasesService`** 결과 목록 표시만.

**판정:**

- **목록·검색·보완 안내 허브 링크 전용** · 삭제·DELETED 복구 UI 없음 · **액션 가드 소비 지점 아님** · DELETED 재진입 판정과 직접 무관.

### 진행 체크(누적)

- [x] `delete-case-button.tsx` — **[241]** 3질문 실사 완료(내부 조건 없음·복구 없음·가드 미소비)
- [x] `case-status-actions.tsx` — **[241]** 3질문 실사 완료(삭제 UI 없음·복구 전용 없음·`AllowedCaseActions` 소비)
- [x] `case-detail-client.tsx` — **[241]** 3질문 실사 완료(삭제·복구 직접 없음·가드 직접 계산·독자 보정)
- [x] `case-status-card.tsx` — **[241]** 3질문 실사 완료(버튼 없음·가드 미소비·표시 전용)
- [x] `cases/[caseId]/page.tsx` — **[241]** 3질문 실사 완료(삭제 무조건 노출·복구 없음·가드 직접 미소비)
- [x] **`cases/page.tsx`** — **[241]** 3질문 실사 완료(삭제·복구 UI 없음·`listCasesService`·가드 미소비)
- [ ] `DELETED` 목록/상세 표시·복구·수정 버튼 — **현재 스코프 미확인** — **[233]**
- [x] **간접 참고:** `PATCH /api/cases/[caseId]` 에서 `status` 직접 수정 차단 — **[232]**·**[233]**
- [x] **간접 참고:** `case.service.ts` 응답에 `allowedLifecycleActions` 포함 — 서비스 측 — **[233]** · UI 사용 방식은 미열람

### 실제 확인 결과 ([EVIDENCE-20260421-233])

#### 1) 삭제 버튼/액션 노출 조건 — **현재 스코프에서는 미확인**

이번 세션에서 직접 열람한 파일은 `case.service.ts`, `api/cases/[caseId]/route.ts`, 증빙/체크리스트 문서들입니다. 이 범위에는 **사건 상세 화면이나 사건 목록 UI 컴포넌트 본문**이 포함되지 않습니다. 따라서 사건 상세에서 삭제 버튼이 어떤 조건에서 보이는지, 목록에서 삭제 액션이 어떤 역할에서 보이는지는 **지금은 확정할 수 없습니다**.

#### 2) `DELETED` 상태 사건의 UI 표시 여부 — **미확인**

`case.service.ts`는 상세/생성/수정 응답에 `allowedLifecycleActions`를 붙이지만, **실제 UI 컴포넌트가 이 값을 어떻게 사용**해 버튼을 숨기거나 보이게 하는지는 이번 세션에서 **본문 미열람** 상태입니다. 따라서 `DELETED` 상태 사건이 목록에 보이는지, 상세 화면 접근이 가능한지, 별도 배지/비활성 표시가 있는지는 **미확인**입니다.

#### 3) 복구/복원/재생성 버튼 존재 여부 — **미확인**

현재 확인한 API/서비스 범위에서는 `DELETED` → `CREATED` 직접 복구 경로가 보이지 않았고, **UI 파일도 열람하지 않았습니다**. 그래서 사용자가 클릭 가능한 복구·복원·재생성 버튼이 있는지 여부는 **아직 확인되지 않았습니다**. 이 항목은 **DENY-8 / OPEN-4** 후속과도 직접 연결됩니다.

#### 4) `DELETED` 상태에서 수정/상태 변경 UI 차단 여부 — **간접 근거 일부 확인 / UI 본문은 미확인**

간접 근거로는 `PATCH /api/cases/[caseId]`가 `status` 직접 수정을 차단하고, 상태 전이는 별도 `status` / `transition` API를 쓰라고 안내합니다. 즉, **일반 수정 API 차원**에서는 상태 필드 직접 수정이 막혀 있습니다. 하지만 이것만으로 **UI 버튼 비노출/비활성** 여부를 확정할 수는 없습니다. 실제 버튼 노출 조건은 **UI 컴포넌트 본문**을 열어봐야 하므로 UI 판정은 **아직 미확인**으로 두는 것이 맞습니다.

#### 5) 사용자 오해 가능성 — **미확인**

OPEN-4 / DENY-8 문서상으로는 `DELETED` → `CREATED`를 직접 허용 전이로 보지 않도록 정리돼 있습니다. 그러나 **실제 UI**에서 이를 오해할 만한 버튼/문구가 있는지는 현재 세션에서 **확인하지 않았습니다**.

### 체크리스트 기입 문안(§4)

**§4 UI 점검 결과**

- **사건 상세에서 삭제 버튼 노출 조건 확인** — 이번 제출·점검 세션에서 상세 UI 본문 미열람
- **사건 목록에서 삭제 액션 노출 조건 확인** — 이번 제출·점검 세션에서 목록 UI 본문 미열람
- **`DELETED` 상태 사건 목록/상세 표시 방식 확인** — 현재 스코프에서는 미확인
- **`DELETED` 상태 복구/복원/재생성 버튼 존재 여부 확인** — 현재 스코프에서는 미확인
- **`DELETED` 상태 수정/상태 변경 버튼 차단 여부 확인** — UI 본문 미열람으로 미확인
- **`DELETED` → `CREATED`를 직접 허용 전이로 오해할 만한 UI 문구/버튼 확인** — 현재 스코프에서는 미확인

**보조 참고**

- `case.service.ts`는 응답에 `allowedLifecycleActions`를 붙이지만, 실제 UI 사용 방식은 **본문 미열람** 상태다.
- `PATCH /api/cases/[caseId]`는 `status` 직접 수정을 차단한다는 점만 **API 측 간접 근거**로 확인된다.

**기록용 한 줄(기입 완료)**

- 삭제/복구 UI는 이번 제출·점검 세션 기준 **미확인**.
- `DELETED` 상태 UI 처리도 현재 스코프에서 **미확인**.
- 다만 일반 수정 API에서 `status` 직접 수정은 **차단**되므로, UI가 상태 변경을 직접 `PATCH`로 보내는 구조는 **아닐 가능성이 높다**.

### 현재 판정(§4만)

UI 점검만 놓고 보면,

- **확인 완료:** 직접적인 UI 항목은 없음  
- **간접 확인:** 일반 `PATCH /api/cases/[caseId]`는 `status` 직접 수정 차단 · 서비스 응답에 `allowedLifecycleActions` 포함  
- **미확인:** 삭제 버튼 노출 조건 · 복구/복원/재생성 버튼 존재 · `DELETED` 상태 목록/상세 처리 · 수정/상태 변경 버튼 차단 · 사용자 오해 유발 UI 문구  

**실무 판단:** 현재 범위에서는 **“UI 본문 미열람으로 전 항목 미확인, 다만 API 차원의 상태 직접 수정 차단과 `allowedLifecycleActions` 존재는 간접 참고”**로 적는 것이 가장 정확합니다.

**evidence용 짧은 문장**

이번 제출·점검 세션에서는 사건 상세/목록 UI 본문을 직접 열람하지 않았으므로, 삭제 버튼 노출 조건, `DELETED` 상태 표시 방식, 복구/복원/재생성 버튼 존재 여부, 수정/상태 변경 차단 여부는 모두 **미확인**으로 유지한다. 다만 `case.service.ts`가 응답에 `allowedLifecycleActions`를 포함하고, `PATCH /api/cases/[caseId]`가 `status` 직접 수정을 차단한다는 점은 **UI 후속 점검의 간접 참고 근거**다.

---

## 5. 타 모듈 점검

**목표:** 저장소 전반에서 `DELETED`가 누락 없이 일관되게 처리되는지 확인

### 진행 체크(누적)

- [ ] `findAccessibleCases` · `findRecentAccessibleCases` · `findCaseById` 등 **repository 본문** 열람 — **이번 세션 미열람** — **[234]**
- [ ] **dashboard / recent cases** 에서 `DELETED` 포함·제외 **필터 로직** — `getDashboardCasesService` 연결만 확인, 로직 미확인 — **[234]**
- [x] **audit-log 삭제 이벤트:** `softDeleteCaseService` → `writeAuditLog` · `action: "CASE_SOFT_DELETE"` — **[234]**
- [ ] **복구/복원 audit** (`CASE_RESTORE` 등) · audit 유틸 **전체 action 목록** 본문 — **현재 스코프 미확인** — **[234]**
- [ ] **timeline / notifications / dashboard UI / summary** 등 `DELETED` 특별 처리 — **이번 세션 미열람** — **[234]**
- [x] **allowed-actions / permissions 연결 흔적:** `getAllowedLifecycleActionsForCase` · `getCaseAccessContext` — 서비스 측 — **[234]** · `DELETED` 분기 본문은 미열람
- [x] **canonical 기준선:** `verify:canonical-sources` **exit 0** 유지 — 증빙 기록 기준 — **[234]**
- [ ] **검색·export·report·validator/schema** 세부 — 이번 기입에서 별도 실확인 없음 — 후속

**검색 키워드**

`CASE_SOFT_DELETE` · `DELETED` · `findAccessibleCases` · `findRecentAccessibleCases` · `allowedLifecycleActions` · `dashboard` · `timeline` · `audit`

### 실제 확인 결과 ([EVIDENCE-20260421-234])

#### 1) repository 계층의 `DELETED` 기본 필터 — **미확인**

`case.service.ts`는 `findAccessibleCases`, `findRecentAccessibleCases`, `findCaseById`, `updateCaseById`를 import해서 사용하지만, **repository 본문은 이번 세션에서 직접 열람하지 않았습니다**. 따라서 목록/조회 시 `DELETED` 사건을 기본 제외하는지, 포함하는지, 별도 필터가 있는지는 **아직 확인할 수 없습니다**.

#### 2) dashboard / recent cases에서 `DELETED` 노출 여부 — **미확인**

`getDashboardCasesService`가 `findRecentAccessibleCases(currentUser, 5)`를 호출하는 것은 확인되지만, 이 조회가 `DELETED` 상태를 포함/제외하는지는 **repository 본문 미열람** 상태라 **아직 미확인**입니다.

#### 3) audit-log에서 삭제 이벤트 외 복구 이벤트 존재 여부 — **삭제 이벤트는 확인 / 복구 이벤트는 미확인**

`softDeleteCaseService`는 `writeAuditLog`를 호출하면서 `action: "CASE_SOFT_DELETE"`를 남깁니다. 따라서 **삭제 이벤트 기록은 확인**됩니다.

반면 현재 열람 범위에서는 `CASE_RESTORE` · `CASE_RECOVER` · `CASE_REOPEN` · `CASE_UNDELETE` 같은 복구/복원 이벤트는 **확인되지 않았습니다**. 다만 **audit-log 유틸 본문과 전체 action 목록은 직접 열람하지 않았으므로**, “존재하지 않는다”가 아니라 **현재 스코프에서 미확인**이 정확합니다.

#### 4) timeline / notifications / 기타 후속 모듈의 `DELETED` 특별 처리 — **미확인**

이번 세션에서 **timeline, notifications, dashboard UI, summary 계열 모듈 본문은 직접 열람하지 않았습니다**. 따라서 `DELETED` 상태에서 타임라인에 특별 표시가 있는지, 알림이 나가는지, 대시보드에서 숨겨지는지, 별도 배지/경고가 있는지는 **모두 미확인**입니다.

#### 5) allowed-actions / permissions와의 연결 흔적 — **간접 흔적은 확인 / 본문 로직은 미확인**

`case.service.ts`는 응답에 `getAllowedLifecycleActionsForCase(found.status, currentUser.role)` 결과를 붙입니다. 따라서 **allowed-actions 계층과 연결은 확인**됩니다.

또한 `getCaseAccessContext(currentUser, caseId)`를 통해 **permissions 계층과도 연결**됩니다.

하지만 `DELETED` 상태에서 어떤 allowed action이 나오는지, permissions가 `DELETED` 사건을 특별 취급하는지는 **본문 미열람** 상태라 **미확인**입니다.

#### 6) canonical / 상태 정의 일치 여부 — **기준선은 확인 / 타 모듈 반영은 미확인**

`IMPLEMENTATION_EVIDENCE.md`에서 `npm run verify:canonical-sources`가 반복해서 **exit 0**으로 기록되어 있으므로, **canonical source 기준선은 현재 유지**되고 있습니다.

다만 이것이 곧바로 repository / dashboard / audit / notifications까지 `DELETED` 처리가 완전하다는 뜻은 아니므로, **타 모듈 반영 자체는 별도 확인**이 필요합니다.

### 체크리스트 기입 문안(§5)

**§5 타 모듈 점검 결과**

- **repository 계층 기본 필터에서 `DELETED` 포함/제외 여부 확인** — `findAccessibleCases`, `findRecentAccessibleCases`, `findCaseById` **본문 미열람**
- **dashboard / recent cases에서 `DELETED` 노출 여부 확인** — `getDashboardCasesService` 연결만 확인, 실제 필터 로직 **미확인**
- **audit-log 삭제 이벤트 존재 확인** — `CASE_SOFT_DELETE` 기록 확인
- **audit-log 복구/복원 이벤트 존재 여부 확인** — 현재 스코프에서는 **미확인**
- **timeline / notifications / summary 계열 `DELETED` 특별 처리 확인** — 현재 스코프에서는 **미확인**
- **allowed-actions / permissions 연결 흔적 확인** — `getAllowedLifecycleActionsForCase`, `getCaseAccessContext` 호출 확인
- **allowed-actions / permissions 본문에서 `DELETED` 특별 처리 확인** — 이번 제출·점검 세션에서는 **본문 미열람**
- **canonical 기준선 유지 확인** — `verify:canonical-sources` **exit 0** 유지

**기록용 한 줄(기입 완료)**

- repository / dashboard / timeline / notifications의 `DELETED` 처리 로직은 **현재 스코프에서 미확인**.
- audit-log의 삭제 이벤트(`CASE_SOFT_DELETE`)는 **확인**됨.
- allowed-actions / permissions **연결 흔적**은 확인되지만, `DELETED` **특별 처리 본문**은 **미확인**.
- canonical 기준선은 **유지**되지만, 타 모듈 처리 완전성까지 입증한 것은 **아님**.

### 현재 판정(§5만)

타 모듈 점검만 놓고 보면,

- **확인 완료:** 삭제 시 audit-log 이벤트 `CASE_SOFT_DELETE` · allowed-actions / permissions **연결 흔적** · canonical 기준선 유지  
- **미확인:** repository 필터의 `DELETED` 포함/제외 · dashboard / recent cases 노출 여부 · timeline / notifications 특별 처리 · 복구/복원 audit 이벤트 · allowed-actions / permissions 본문의 `DELETED` 분기  

**실무 판단:** 현재 범위에서는 **“타 모듈 중 삭제 감사로그와 계층 연결 흔적은 확인, 실제 `DELETED` 특별 처리 로직은 대부분 미확인”**으로 적는 것이 가장 정확합니다.

**evidence용 짧은 문장**

현재 제출·점검 세션 범위에서는 `case.service.ts`를 통해 `CASE_SOFT_DELETE` 감사 로그와 `allowedLifecycleActions` / `getCaseAccessContext` 연결은 확인되었다. 다만 repository 필터, dashboard, timeline, notifications, 복구 audit 이벤트, allowed-actions / permissions 본문의 `DELETED` 특별 처리는 직접 열람하지 않았으므로 **미확인**으로 유지한다. `verify:canonical-sources` **exit 0**은 유지되지만, 이것만으로 타 모듈 반영 완전성을 입증하지는 않는다.

---

## 6. DENY-8 / OPEN-4 연결 점검

**목표:** 문서 정리와 실구현이 충돌하지 않는지 최종 확인

### 진행 체크(누적)

- [x] **`DELETED` 진입**이 **[228]**·실구현과 일치 — **`DELETE` → `softDeleteCaseService` → `updateCaseById(..., { status: "DELETED" })`** — **[235]**
- [x] **`DELETED` → `CREATED` 직접 경로** — 현재 스코프 **미확인** → 직접 허용 전이로 **단정하지 않는** 문구 유지 **타당** — **[235]**
- [x] **DENY-8** — §6-1 기준 **일반 재진입 금지 축** 문서상 확인 — **[235]** · **[227]**
- [x] **OPEN-4** — §11·**[209]**/**[227]** 계열 **설명·추적 축** 문서상 확인 — **[235]**
- [x] **두 행 관계** — **상충 아님** · 금지 축 + 설명 축 **교차 구조** — **[235]** · **[227]**
- [ ] **직접 복구/복원 구현** 최종 실근거 — **미확인** — 후속(§3·§5·UI 등과 연계)
- [ ] **운영 정책·UI·4축 통제** 최종 실근거 — **후속 과제** — **[235]**
- [ ] 직접 복구 **발견 시** DENY-8 / OPEN-4 문구 수정 필요 여부 — **해당 없음**(현재 미발견)

### 실제 확인 결과 ([EVIDENCE-20260421-235])

#### 1) `DELETED` 진입 경로와 현재 문서 정리의 정합성 — **확인됨**

`DELETE /api/cases/[caseId]/route.ts`가 `softDeleteCaseService`를 호출하고, 해당 서비스가 `updateCaseById(..., { status: "DELETED" })`를 직접 실행하므로, **`DELETED` 진입 경로는 실구현상 명확**합니다.

이는 **[228]**에서 고정한 “`DELETED` 진입 실구현 확인”과 일치하며, **OPEN-4 / DENY-8 문서 정리와 충돌하지 않습니다**.

#### 2) `DELETED` → `CREATED` 직접 허용 전이 여부 — **현재 스코프에서는 미확인**

현재 업로드된 `case.service.ts`, `route.ts`, 그리고 이번 제출·점검 세션에서 열람한 증빙 범위에서는 **`DELETED` 상태를 다시 `CREATED`로 돌리는 직접 구현 경로가 보이지 않습니다**.

따라서 **`DELETED` → `CREATED`를 직접 허용 전이로 단정하지 않는다**는 현재 문서 정리는 **유지가 맞습니다**.

#### 3) DENY-8 역할 확인 — **문서상 확인됨**

§6-1에서 **DENY-8**은 `DELETED` → `CREATED`를 **일반 흐름 재진입 금지**로 잠그는 행으로 정리돼 있습니다. `CREATED`는 예시 토큰이고, 실제 의미는 삭제된 사건이 **별도 복구 정책 없이** 일반 업무 상태로 재진입하는 전반을 가리킵니다.

현재 스코프에서 **직접 복구 경로가 확인되지 않았으므로**, 이 **금지 축은 여전히 타당**합니다.

#### 4) OPEN-4 역할 확인 — **문서상 확인됨**

**OPEN-4**는 `DELETED` → `CREATED`를 **직접 허용 전이로 확정하는 행이 아니라**, 삭제 이후 처리의 성격을 **복원 / 재생성 / soft delete 후 처리**로 보수적으로 설명·추적하는 축으로 정리돼 있습니다.

현재 실구현 확인 범위에서도 **직접 복구 경로가 없으므로**, OPEN-4를 **설명 축**으로 두는 현재 문구는 **구현과 모순되지 않습니다**.

#### 5) DENY-8과 OPEN-4의 관계 — **상충 아님 / 교차 구조로 확인**

현재 기준에서 두 행은 **서로 충돌하지 않습니다**.

- **DENY-8:** 일반 흐름 재진입 금지  
- **OPEN-4:** 복원·재생성·soft delete 후 처리 설명·추적  

즉, 둘은 **금지 축 + 설명 축의 교차 구조**로 읽는 것이 맞습니다.

#### 6) 후속 실근거 필요 범위 — **여전히 남아 있음**

아직 남은 것은 아래입니다.

- 상태별 삭제 제한  
- `DELETED` → `CREATED` 직접 복구/복원 route 또는 service 존재 여부  
- UI에서 삭제/복구 버튼 노출 여부  
- 운영·감사 규칙  
- `allowedLifecycleActions` / permissions / transition 유틸 **본문 확인**  

따라서 **§6 연결 점검 결과**는 **문서 정합 확인 완료 / 실근거 추가 확보 필요**로 적는 것이 가장 정확합니다.

### 체크리스트 기입 문안(§6)

**§6 DENY-8 / OPEN-4 연결 점검 결과**

- **`DELETED` 진입 경로가 현재 문서([228])와 일치하는지 확인** — `DELETE` → `softDeleteCaseService` → `status: "DELETED"` 확인.
- **직접 복구 경로 미확인 상태에서 DENY-8 / OPEN-4 문구 유지 타당성 확인** — 현재 스코프에서는 `DELETED` → `CREATED` **직접 경로 미확인**.
- **DENY-8 = 일반 재진입 금지 축 확인** — §6-1 기준으로 문서상 고정.
- **OPEN-4 = 복원·재생성·soft delete 후 처리 설명 축 확인** — §11 및 **[209]**/**[227]** 계열 문구와 정합.
- **두 행이 상충 관계가 아니라 금지 축 + 설명 축인지 확인** — 현재 확인 범위에서는 **상충 없음**.
- **직접 복구/복원 구현 경로 존재 여부 최종 확인** — 현재 스코프에서는 **미확인**
- **운영 정책·UI·4축 통제 근거 최종 확인** — **후속 과제**

**기록용 한 줄(기입 완료)**

- `DELETED` 진입 실구현은 **확인됨**.
- `DELETED` → `CREATED` **직접 복구 경로**는 현재 스코프에서 **미확인**.
- 따라서 **DENY-8**은 일반 재진입 금지, **OPEN-4**는 복원·재생성·soft delete 후 처리 설명 축으로 유지하는 **현재 문서 정리는 실구현과 정합적**임.

### 현재 판정(§6만)

§6 연결 점검만 놓고 보면,

- **확인 완료:** `DELETED` 진입 경로 존재 · `DELETED` → `CREATED` 직접 허용 전이 단정 금지 유지 **타당** · DENY-8 / OPEN-4 **역할 분리 문서 정합** · 두 행은 **상충이 아니라 교차 구조**  
- **미확인:** 직접 복구/복원 **실구현 경로** · 운영 정책 · UI/4축 통제 **실근거**  

**실무 판단:** 현재 범위에서는 **“DENY-8 / OPEN-4 문서 정리는 실구현과 충돌하지 않으며, 남은 잔여는 직접 복구·운영·UI·4축 실근거 확인”**으로 적는 것이 가장 정확합니다.

**evidence용 짧은 문장**

현재 제출·점검 세션에서 `DELETED` 진입은 `DELETE /api/cases/[caseId]/route.ts` → `softDeleteCaseService` → `updateCaseById(..., { status: "DELETED" })`로 확인되었다. 반면 `DELETED` → `CREATED` 직접 복구 경로는 확인되지 않았으므로, **DENY-8**은 일반 재진입 금지, **OPEN-4**는 복원·재생성·soft delete 후 처리 설명 축으로 유지하는 현재 문서 정리는 **실구현과 정합적**이다. 남은 잔여는 운영 정책·UI·4축 통제 근거와 직접 복구 경로 확인이다.

---

## 7. evidence 반영 체크

**목표:** 점검 결과를 새 증빙으로 바로 남길 수 있게 준비

### 진행 체크(누적)

- [x] §1~§6 실확인·**[230]**~**[235]**와 정합되는 **종합 evidence 정리** 초안 기입 — **[236]**
- [x] 확인된 것 / 미확인 / 판정 / DENY-8·OPEN-4 결론 / **다음 실근거 순서** / 짧은 결론 문장 — **[236]**
- [ ] 절별 ☐ 항목 **☑ 전환** — 후속 실근거 확보 후
- [x] **[237]** 전이·`REOPEN_CASE`·`status`/`transition` 본문 열람  
- [x] **[238]** allowed-actions / permissions 본문 열람(사용자 **미열람 시 문안** + 열람 후 확정 병기)  
- [x] **[239]** 표준 전이만 문장 고정 · `api/cases`·`features/cases` 복구 키워드 1차 스캔(`supportsRestore`는 문서 플래그로 구분)  
- [ ] 새 세션 **별도 evidence** 누적 — 순서 4~7 실행 시

### 실제 확인 결과 ([EVIDENCE-20260421-236]) — 종합

#### 1) 확인된 것

`DELETED` **진입 실구현**은 확인되었다.

- `DELETE /api/cases/[caseId]/route.ts`가 `softDeleteCaseService`를 호출하고, 해당 서비스가 `updateCaseById(..., { status: "DELETED" })`를 **직접 실행**한다.

일반 `PATCH /api/cases/[caseId]`에서는 **`status` 직접 수정이 차단**된다. 상태 전이는 별도 `status` / `transition` API를 사용하도록 **명시**되어 있다.

삭제 가드는 현재 열람 범위에서 **`isOwner || isAdmin` 권한 확인**까지는 확인되었다.

**`CASE_SOFT_DELETE`** 감사 로그 기록은 확인되었다.

`getAllowedLifecycleActionsForCase`, `getCaseAccessContext`, `findRecentAccessibleCases` 호출을 통해 **allowed-actions / permissions / dashboard** 계층과의 **연결 흔적**은 확인되었다.

현재 스코프에서 **`DELETED` → `CREATED` 직접 복구 경로**는 확인되지 않았으므로, **DENY-8 / OPEN-4**의 현재 문서 정리는 **실구현과 충돌하지 않는다**.

**[237] 후속 열람(전이·`REOPEN_CASE`):** `src/lib/definitions/case-lifecycle.ts`의 `CASE_TRANSITIONS`에 **`DELETED` 규칙 없음** · **`REOPEN_CASE`**는 `from: ["REJECTED","CLOSED"]`, `to: "IN_INTERVIEW"`만 · `src/lib/case-action-guard.ts`의 `REOPEN_CASE`도 **`REJECTED`·`CLOSED`만** · `applyCaseStatusTransition` → `checkCaseTransitionOrThrow` → `evaluateCaseTransition` 단일 테이블 · `PATCH .../status`·`POST .../transition`은 위 체인만 호출.

**[238] 후속 열람(allowed-actions / permissions) — 사용자 제출 문안(본문 미열람 스코프):** `case.service.ts`에서 **`getAllowedLifecycleActionsForCase`·`getCaseAccessContext` 연결**은 확인되나, `allowed-actions.ts`·`case.permissions.ts` 본문 미열람 시 **`DELETED` 특별 처리는 미확인**으로 적는 것이 정확함(**[231]·[234]·[236]** 과 정합). **본 증빙 세션 열람 후:** `getAllowedLifecycleActionsForCase`는 `getAvailableTransitions`만 사용 → **`DELETED`에서는 허용 액션 빈 배열** · `getCaseAccessContext`는 **`DELETED`면 NotFound** · `buildAccessibleCaseWhere`는 **`status not DELETED`**(목록 기본 제외). UI **`getAllowedCaseActions`**와의 연동은 별도.

**[239] 후속(표준 전이·복구 키워드·서버/UI 가드):** `PATCH .../status`·`POST .../transition` → **`applyCaseStatusTransition` → `checkCaseTransitionOrThrow` → `checked.nextStatus`로만 갱신** · **`CASE_TRANSITIONS`만** · **`DELETED`는 `from`/`to` 없음** · **`REOPEN_CASE`** 는 **`REJECTED`·`CLOSED` → `IN_INTERVIEW`만**(**[237]**). **`getAllowedLifecycleActionsForCase`** 는 **`getAvailableTransitions`만** → **`DELETED`면 빈 배열**(**[238]**). **`getAllowedCaseActions`** 의 **`REOPEN_CASE`** 는 **`REJECTED`·`CLOSED`만** · **`DELETED` 미포함**. **표준 서버 규칙은 완료** · **UI 버튼 노출**은 6파일·3질문 **미완료**(증빙 **[239]** 「**현재 잠긴 판정**」「**바로 시작 순서**」).

#### 2) 아직 미확인인 것

- **상태별 삭제 제한** 존재 여부  
- **`DELETED` 복구 전용** 구현이 `api/cases`·`features/cases` **밖**(전역 라우트·스크립트·직접 DB·운영 절차)에 있는지  
- **사건 상세/목록 UI**에서 삭제·복구·재생성 버튼 노출 조건  
- **repository / dashboard / timeline / notifications**에서 `DELETED` 상태 특별 처리  
- ~~**`allowedLifecycleActions` / permissions 본문**에서 `DELETED` 특별 처리~~ — **[238]** 서버 본문 열람으로 확정(위 **[238]** 단락) · UI `getAllowedCaseActions` 연동은 미확인  
- **운영·감사 규칙**에서 삭제 후 복구 정책, 예외 절차, 일반 재진입 금지의 직접 문구  

#### 3) 현재 판정

현재까지의 점검 결과를 종합하면, `DELETED` 관련 증빙은 **문서 정합 확인 + 일부 구현 경로 확인** 단계까지 진행되었다.

즉, **삭제 진입 경로**와 **권한 가드**, **상태 직접 수정 차단**, **삭제 감사 로그**는 확인되었고, **[237]**·**[238]**·**[239]**으로 **표준 액션 전이·권한·사건 API 범위 1차 복구 키워드 스캔**까지 확장되었다. 그럼에도 **상태별 삭제 제한**, **UI·타 모듈·운영 정책**, **`api/cases` 밖 전역 복구 경로**의 직접 근거는 아직 확보되지 않았다. 따라서 현재 단계는 **문서 정리 완료 / 실근거 단계적 확보 / 잔여 미확인**으로 판정한다.

#### 4) DENY-8 / OPEN-4 정합 결론

현재 확인 범위에서는 **`DELETED` → `CREATED`를 직접 허용 전이로 단정할 근거가 없다**.

따라서 **DENY-8**은 일반 재진입 금지, **OPEN-4**는 복원·재생성·soft delete 후 처리 설명·추적 축으로 유지하는 현재 문서 구조는 **실구현과 정합적**이다. 이 두 행은 **상충 관계가 아니라** 금지 축 + 설명 축의 **교차 구조**로 본다.

#### 5) 다음 실근거 확보 순서

1. **`CASE_TRANSITIONS` / `REOPEN_CASE` / 전이 유틸** 본문 열람 — **[237]** 완료  
2. **allowed-actions / permissions** 본문 열람 — **[238]** 완료(미열람 시 문안 + 열람 후 확정)  
3. **복구·복원 키워드** — 표준 `status`/`transition`은 복구 전용 아님·`DELETED` 전이 없음(**[239]** 고정) · `api/cases`·`features/cases` 1차 `rg` 완료(잔여: 전역·UI·운영)  
4. **사건 상세 / 목록 UI**에서 삭제·복구 관련 버튼 노출 조건 확인  
5. **repository / dashboard / timeline / notifications / audit-log**의 `DELETED` 특별 처리 확인  
6. **운영·감사 정책 문서**에서 삭제 후 복구 및 예외 절차 확인  
7. 위 결과를 바탕으로 **DENY-8 / OPEN-4**와 본 체크리스트의 ☐ 항목을 ☑로 전환하고, **새 evidence**로 누적  

#### 6) evidence용 짧은 결론

현재 제출·점검 세션 기준으로 `DELETED` 관련 역점검은 **삭제 진입 실구현**, **권한 가드**, **상태 직접 수정 차단**, **삭제 감사 로그**, **계층 연결 흔적**까지는 확인되었다. **[237]**으로 **전이 테이블·`REOPEN_CASE`·`status`/`transition`**까지 열람해, **`DELETED`는 액션 전이 규칙에 없고** `REOPEN_CASE`는 **`IN_INTERVIEW` 단일 재개 축**임을 확정했다. **[239]**으로 **두 API는 표준 전이만**·**이 경로로 `DELETED` 복구 없음**·**사건 API 폴더 1차 복구 키워드 스캔**을 고정했다. 반면 **상태별 삭제 제한**, **UI**, **타 모듈**, **운영 정책**, **전역 복구 경로**는 아직 미확인이다. 따라서 현재 단계는 **문서 정합 유지 + 실근거 단계적 확보([237]·[238]·[239]) + 후속 실확인 필요**로 정리한다.

---

### §7 evidence 정리 결과 (축약본)

#### 확인된 것

- `DELETE /api/cases/[caseId]/route.ts` → `softDeleteCaseService` → `updateCaseById(..., { status: "DELETED" })`로 `DELETED` 진입 경로 확인  
- `PATCH /api/cases/[caseId]`에서 `status` 직접 수정 차단 확인  
- `softDeleteCaseService`의 권한 가드(`isOwner || isAdmin`) 확인  
- `CASE_SOFT_DELETE` 감사 로그 확인  
- allowed-actions / permissions / dashboard 계층 연결 흔적 확인  
- `DELETED` → `CREATED` 직접 복구 경로 미확인 상태에서 DENY-8 / OPEN-4 문서 정리가 실구현과 정합적임을 확인  
- **[237]** `CASE_TRANSITIONS`·`REOPEN_CASE`·전이 유틸·`PATCH .../status`·`POST .../transition` 본문: **`REOPEN_CASE`는 `REJECTED`·`CLOSED` → `IN_INTERVIEW`만** · **`DELETED`는 테이블·액션 가드에 없음** · 액션 전이는 `evaluateCaseTransition` 단일 테이블  
- **[238]** 서버 `allowed-actions.ts`·`case.permissions.ts`: **`DELETED` → 허용 액션 빈 배열·NotFound·목록 제외**(미열람 스코프 문안은 증빙 본문에 보존)  
- **[239]** 표준 전이·**`allowedLifecycleActions` 빈 배열**·**UI `REOPEN_CASE` 가드 `DELETED` 제외** · `api/cases`/`features/cases` 1차 키워드(`supportsRestore`는 문서 플래그) · **§1~§6 표준 복구 전이 없음**  

#### 아직 미확인인 것

- 상태별 삭제 제한  
- **`api/cases`·`features/cases` 밖** 복구 전용 구현·운영 절차  
- 삭제/복구 UI 노출 조건  
- repository / dashboard / timeline / notifications 특별 처리  
- UI `getAllowedCaseActions`와 화면 연동  
- 운영·감사 직접 문구  

#### 다음 실근거 확보 순서

1. ~~전이 유틸 / `REOPEN_CASE`~~ — **[237]** 열람 완료  
2. ~~allowed-actions / permissions~~ — **[238]** 열람 완료  
3. ~~표준 전이·사건 API 범위 복구 키워드 1차 스캔~~ — **[239]** 완료(전역·UI·운영은 잔여)  
4. UI  
5. repository / dashboard / timeline / notifications  
6. 운영·감사 정책  
7. 결과 evidence 누적 및 ☐→☑ 전환  

#### 한 줄 결론

- 현재 단계는 **문서 정합 유지 + 표준 서버·전이·가드 규칙 확정([237]·[238]·[239]) + UI 버튼 노출 조건 미완(6파일·3질문) + 잔여(repo/dashboard/timeline·운영·전역)** 상태다.

---

## 바로 실행 순서

1. ~~**[236]** 순서 **3** — 사건 `api/cases`·`features/cases` 복구 키워드 1차 스캔~~ — **[239]** 완료(서버·표준 복구 **완료** · 증빙 「**현재 잠긴 판정**」「**한 줄로 닫으면**」 참고)  
2. 사건 **상세·목록 UI** — **[239]** **UI 6파일**·**3질문**으로 **버튼 노출 조건 끝까지 확인**(현재 미완료)  
3. **repository / dashboard / timeline**(/notifications) 검색  
4. **운영·감사** 문서 검색  
5. 필요 시 **`src` 전역** `restore`/`recover`/`undelete` 등 재스캔(문서·admin과 구분)  
6. 결과를 **`IMPLEMENTATION_EVIDENCE.md`** 새 evidence로 누적 · ☐→☑ 전환  
