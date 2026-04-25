# 파일별 재정렬 패치 지시서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | AIBEOPCHIN-FILE-REALIGN-PATCH-V1 |
| 상태 | Draft v1 |
| 버전 | 초안 0.7 |
| 목적 | [정의서 대비 구현 역점검표](./ALIGNMENT_AUDIT_V1.md)를 바탕으로, 실제 코드베이스에 반영할 수 있는 **파일 단위 재정렬 패치 지시**를 제공한다. |

### 기준 문서

- [API_SPEC_V1.md](./API_SPEC_V1.md) (API 명세 1차본)  
- [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) (정의서 대비 구현 역점검표)  
- [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md)  
- [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md)  
- [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md)  
- [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md)  
- [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md)  
- [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md)  
- [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md)  
- [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md)  
- [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md)  
- [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md)  
- [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md)  

### 기준 파일

- `tools/aibeopchin_navigator.py`  
- `prisma/schema.prisma`  
- `src/lib/definitions/case-status.ts`  

### 핵심 원칙

- 새 기능 추가보다 기준문서·명세 정렬이 우선이다.  
- 상태 관련 단일 기준은 아래 2개만 인정한다.  
  - `prisma/schema.prisma` 의 `CaseStatus`  
  - `src/lib/definitions/case-status.ts`  
- `npm run verify:canonical-sources` 통과 전 결과물은 현행 기준으로 인정하지 않는다.  
- `check-status` 는 휴리스틱이므로 경고 건수만으로 오류를 단정하지 않는다.  
- 본 문서는 **P0·P1 정렬 우선** 기준으로 작성한다.  

---

## 0. 명세 경로와 현행 저장소 경로 매핑

[API_SPEC_V1.md](./API_SPEC_V1.md) 의 이상 경로와, **현재 저장소**의 대표 경로가 다를 수 있다. 패치 시 아래를 우선 참고한다.

| 구분 | 명세·지시서 관용 경로 | 현행 저장소(참고) | 비고 |
|------|------------------------|-------------------|------|
| 사건 상태 전이 | `POST/ PATCH .../transition` | `src/app/api/cases/[caseId]/status/route.ts` (`PATCH`, `action`·`reason`) | 동일 역할로 정렬 |
| 회원가입 | `.../auth/register` | `src/app/api/auth/signup/route.ts` | 라우트명 상이 |
| 문서 초안 생성(사건 하위) | `POST .../documents` | `src/app/api/cases/[caseId]/documents/generate/route.ts` 등 | `draft`·`generate` 다중 경로 병행 |
| 문단 재생성 | `.../paragraphs/.../regenerate` | `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/regenerate/route.ts` 등 | `legal-documents` 네이밍 |
| 승인 | `.../approvals/.../approve` | `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts` | 동등 기능·정렬 대상 |
| 검증(공개) | `.../verification/verify` | `src/app/api/document-verification/route.ts` 등 | 실제 라우트 grep으로 확정 |
| 관리자 canonical 검증 | `.../admin/verify-canonical-sources` | **미구현일 수 있음** | `npm run verify:canonical-sources`(CLI)가 본선 |
| 사건 요약 전용 API | `.../summary/generate` | 별도 라우트 없을 수 있음 | `detail`·서비스 레이어·타 모듈에 분산 가능 |

**원칙:** FILE-xxx 블록의 경로는 **우선 검색 키워드로 실파일을 찾고**, 위 표로 상위 디렉터리를 교정한다.

---

## 1. 사용 방법

이 문서는 아래 순서로 사용한다.

1. **기준 소스 파일군**을 먼저 정렬한다.  
2. 권한·사건·인터뷰·요약·문서·승인·검증 순으로 **P0 항목**부터 반영한다.  
3. 각 패치 후 **검증 명령**을 수행한다.  
4. [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **실제 기록** 절에 결과를 남긴다.  
5. 모든 상태 관련 패치 후 `verify:canonical-sources` 와 `check-status` 를 **함께** 기록한다.  

---

## 2. 전체 반영 순서

### Step 0. 기준 소스 잠금

- `prisma/schema.prisma`  
- `src/lib/definitions/case-status.ts`  
- `tools/aibeopchin_navigator.py`  

**시작 기준선:** [CASE_STATUS_DEFINITION **§7.1**](./CASE_STATUS_DEFINITION.md#71-phase-1-첫-실작업--기준선-고정-2026-04-23) — 상태·`DELETED`·soft delete·`allowedLifecycleActions` **정합** **확인** **스냅** ([EVIDENCE-20260423-314](./IMPLEMENTATION_EVIDENCE.md)) **후** **Batch** / FILE-xxx **진행**.

### Step 0 이후 — Batch 1-A / 1-B (고정) {#batch-1a-1b}

Step 0 **다음** **첫** **실제** **재정렬** **묶음**은 **상태축**·**최근** **보강**([308]~[310]·R3 **§3.1**·[314] **기준선**이 **직접** **닿는** **case** **핵심** **경로**)로 **고정**한다 — [EVIDENCE-20260423-315](./IMPLEMENTATION_EVIDENCE.md).

> **Step 0 이후 첫 실제 파일 묶음(확정 문안):** `prisma/schema.prisma`, `src/lib/definitions/case-status.ts`, `src/lib/cases/case-lifecycle.ts`, `src/lib/cases/allowed-actions.ts`, `src/lib/cases/soft-delete-case.service.ts`, `src/app/api/cases/[caseId]/route.ts`, `src/components/cases/case-detail-client.tsx`

**현행** **저장소** **기준** **대응(동일** **역할;** **패치** **시** **실** **경로**):

| Batch 1-A 항목(문안) | 현행 경로(참고) |
|---------------------|-----------------|
| `…/case-lifecycle.ts` | `src/lib/definitions/case-lifecycle.ts` |
| `…/soft-delete-case.service.ts` | `src/features/cases/case.service.ts` (`softDeleteCaseService` 등) |
| (그 외) | 위 **확정** **문안** **및** **아래** **리스트** **와** **동일** |

**Batch 1-A (첫** **묶음,** **상태** **핵심)** — **파일** **단위** **(현행** **기준** **권장** **리스트**):

- `prisma/schema.prisma`  
- `src/lib/definitions/case-status.ts`  
- `src/lib/definitions/case-lifecycle.ts`  
- `src/lib/cases/allowed-actions.ts`  
- `src/features/cases/case.service.ts` (soft delete·DTO·`allowedLifecycleActions` **부착** **맥락**)  
- `src/app/api/cases/[caseId]/route.ts`  
- `src/components/cases/case-detail-client.tsx`  

**이** **묶음을** **먼저** **쓰는** **이유** — [314](./IMPLEMENTATION_EVIDENCE.md) **기준선**·`DELETED`·`allowedLifecycleActions`·soft delete DTO·canonical·전이/허용 액션·**사건** **상세** **UI** **가** **한** **축**으로 **읽힌다** (R3 **§3.1** (a)(b)(c) · [EVIDENCE-20260423-308](./IMPLEMENTATION_EVIDENCE.md)~[310](./IMPLEMENTATION_EVIDENCE.md) **가** **닿는** **경로**).

**이** **Batch** **에서** **할** **일** (신규 **기능** **추가** **가** **아** **님**):

- **파일** **역할**이 [§7.1](./CASE_STATUS_DEFINITION.md#71-phase-1-첫-실작업--기준선-고정-2026-04-23)·[CASE_LIFECYCLE](./CASE_LIFECYCLE_DEFINITION.md)·[PERM](./PERMISSION_DEFINITION.md) **초안**·기준과 **맞는지**  
- **상태** **정의** / **전이** / **허용** **액션**이 **모듈** **간** **흩어짐**·**이중** **축** [§6-11] **없이** **읽히는지**  
- **API** DTO**와** **UI** **소비** (`case-detail-client`)**가** **같은** DTO/규칙**을** **보는지**  
- **soft** **delete** / `DELETED` **가** **예외** **덩어리** **가** **아** **닌** **구조** **속** **인지**  
- **다음** **Batch** **1-B** (아래) **로** **넘길** **경계** **가** **선명한지**  

**Batch 1-A** **완료** **기준** **(닫힘** **조건**):

- **상태** **canonical** **source** = `schema.prisma` + `case-status.ts` **이** **축** **유지**  
- `case-lifecycle`·`allowed-actions` **역할** **경계** = [CASE_LIFECYCLE]·[PERM]·문서 **기준** **와** **모순** **없이** **설명** **가능**  
- `case.service` (soft delete) **과** `DELETE`/`GET` **등** `…/[caseId]/route` DTO = **서로** **정합**  
- `case-detail-client` = 위 DTO·**상태**·`allowedLifecycleActions` / **클라** `getAllowedCaseActions` **해석** [§6-11] **가** **일** **치**  
- **1-B** **로** **넘길** **파일** = **이름** **·** **범위** **가** **분명**  

**Batch 1-B** (다음 **묶음** **후보,** **상태** **핵심** **이후** **—** **인터뷰** **축**; **실행·판정:** [**§2** **Batch 1-B**](#batch-1b-실행) · [317](./IMPLEMENTATION_EVIDENCE.md))

- `src/app/api/cases/[caseId]/interview/route.ts`  
- `src/app/api/cases/[caseId]/interview/complete/route.ts`  
- `src/features/case-interview/case-interview.service.ts` (및 **동** **기능** **레포**·`validators`·`repository` **등** **필요** **시** **동** **묶음**)  
- 인터뷰 **관련** **클라이언트** (예: `src/components/cases/case-interview-client.tsx`·`src/app/(protected)/cases/[caseId]/interview/page.tsx` — [Step 3](#step-3-질문셋인터뷰-정렬) **와** **접** **선**)

**순서** **한** **줄:** **핵심** **상태/삭제/상세** (1-A) **→** **인터뷰** (1-B) **→** (기존) [§5** **최소** **반영** **배치** **세트**](#5-최소-반영-배치-세트) **Batch** **A** **등**.

### Batch 1-A 실행 순서·판정 (2026-04-23) {#batch-1a-실행}

**열** **순서** **(실** **점검):** `prisma/schema.prisma` → `src/lib/definitions/case-status.ts` → `src/lib/definitions/case-lifecycle.ts` → `src/lib/cases/allowed-actions.ts` → `src/features/cases/case.service.ts` → `src/app/api/cases/[caseId]/route.ts` → `src/components/cases/case-detail-client.tsx` (삭제 **버튼** **노출** **은** **동일** **배치** **맥락**에서 `src/app/(protected)/cases/[caseId]/page.tsx` 의 `canRequestSoftDelete` **와** **함께** **확인**).

**Step 1·canonical** — **Batch 1-A Step 1 판정:** 상태 canonical source는 `schema.prisma`와 `case-status.ts` 두 파일로 유지하며, 최근 soft delete / `DELETED` / `allowedLifecycleActions` 보강([EVIDENCE-20260423-308](./IMPLEMENTATION_EVIDENCE.md)~[310](./IMPLEMENTATION_EVIDENCE.md)·[314](./IMPLEMENTATION_EVIDENCE.md)·[315](./IMPLEMENTATION_EVIDENCE.md))과 충돌 없음.

**Step 2·전이** **·** **허용** **액션** — **Batch 1-A Step 2 판정:** `case-lifecycle.ts`와 `allowed-actions.ts`는 `DELETED` 출발 없음, `DELETED` → `[]`, 진행 액션 차단 규칙을 동일 의미로 유지하며 최근 R3 보강 [(a)(b)]와 정합한다.

**Step 3·soft** **delete** **서비스** — **Batch 1-A Step 3 판정:** `softDeleteCaseService`는 `canSoftDeleteCase` 기준과 동일한 RB 조건을 사용하고, DELETE 이후 DTO에 `allowedLifecycleActions`를 포함해 `DELETED` 상태 반환 shape를 안정적으로 제공한다.

**Step 4·case** **API** — **Batch 1-A Step 4 판정:** `/api/cases/[caseId]/route.ts`의 GET/PATCH/DELETE는 동일한 `ok(data)` 축을 유지하며, DELETE는 `softDeleteCaseService`의 `DELETED` + `allowedLifecycleActions` DTO와 정합한다.

**Step 5·사건** **상세** **UI** — **Batch 1-A Step 5 판정:** `case-detail-client.tsx`는 `getAllowedCaseActions`로 `DELETED`에서 진행 액션을 차단하고, 문서 생성 제한 등 상태 반영을 서버·정의서 기준과 일치하게 사용한다. **삭제** **요청** **버튼** **노출**은 상위 `page.tsx`의 `canRequestSoftDelete`와 동일 RB 축을 따른다.

**Batch 1-A** **완료** **선언** **(한** **줄):** Batch 1-A는 상태 canonical source, 라이프사이클/허용 액션, soft delete 서비스, `/api/cases/[caseId]` DTO, 사건 상세 UI의 상태/액션 소비를 최근 R3 보강과 정합한 상태로 확인하고 완료한다 — [EVIDENCE-20260423-316](./IMPLEMENTATION_EVIDENCE.md).

**검증** **명령** **(닫을** **때):**

```bash
npx tsc --noEmit
npm run verify:canonical-sources
python tools/aibeopchin_navigator.py check-status --scope case
```

`check-status --scope case`는 휴리스틱 경고가 있을 수 있으며 **단독**으로 실패 판정 근거로 쓰지 않는다 ([IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md) **§4-1**·[CASE_STATUS **§5.1**](./CASE_STATUS_DEFINITION.md#51-check-status-결과-해석-필수)).

### Batch 1-B 실행 순서·판정 (인터뷰·완료·상태 전이) {#batch-1b-실행}

**대상:** `src/app/api/cases/[caseId]/interview/route.ts` · `src/app/api/cases/[caseId]/interview/complete/route.ts` · `src/features/case-interview/case-interview.service.ts` (및 **동** **레이어** `case-interview.repository.ts` **등** **완료** **마킹**) · `src/app/(protected)/cases/[caseId]/interview/page.tsx` · `src/components/cases/case-interview-client.tsx` — **교차:** `COMPLETE_INTERVIEW` **호출**은 **사건** **상세** `src/components/cases/case-detail-client.tsx` (`POST` `/interview/complete`) — [EVIDENCE-20260423-317](./IMPLEMENTATION_EVIDENCE.md).

**Batch 1-B Step 1·route** **계약** — **판정:** GET/POST **인터뷰** **는** `ok(flow)` / `ok({ saved, flow })` **로** **질문** **흐름** **만** **노출**; **권한** `assertCaseInterviewAccess` = `canPerformCaseInterview` **(안** A)**. POST **답** **저장** 시 `CREATED` **→** `IN_INTERVIEW` **는** 코드 `CASE_TRANSITIONS`·`START_INTERVIEW`([`case-lifecycle.ts`](../../src/lib/definitions/case-lifecycle.ts)) **와** [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) **초안** **전이** **의도** **가** **맞물림**.

**Batch 1-B Step 2·완료** **·** **CaseStatus** — **판정:** `completeCaseInterviewService` **는** (1) **필수** **응답** **검증** (2) **인터뷰** `COMPLETED` (3) `CREATED`/`INTAKE_PENDING`/`IN_INTERVIEW` **일** **때** **만** **사건** `INTERVIEW_DONE` **갱신** (4) **반환** `status` = **갱신** **후** `afterCase.status` **(최근** [317] **정합)** (5) `allowedLifecycleActions` = `getAllowedLifecycleActionsForCase(afterCase.status, role)` **로** [Batch 1-A](./FILE_REALIGN_PATCH_V1.md#batch-1a-실행) **와** **동일** **축**.

**Batch 1-B Step 3·클라이언트** — **판정:** `CaseInterviewClient` **는** `canEditInterview`·`caseStatus` **로** **읽기** **전용** **막음**; **인터뷰** **완료** **버튼** **흐름** **은** **상세** `case-detail-client` **의** `COMPLETE_INTERVIEW` **→** `/interview/complete` **+** `refreshCase()` **로** `allowedLifecycleActions`·**상세** DTO **재** **동기화**.

**Batch 1-B** **완료** **(한** **줄):** Batch 1-B **는** **인터뷰** **API·서비스·화면**이 **권한** `canPerformCaseInterview`·**답** **저장** `CREATED→IN_INTERVIEW`·**완료** `INTERVIEW_DONE`·**응답** `allowedLifecycleActions`·**UI** `COMPLETE_INTERVIEW` **경로**를 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md)·[`allowed-actions.ts`](../../src/lib/cases/allowed-actions.ts) **([1-A](./FILE_REALIGN_PATCH_V1.md#batch-1a-실행))** **와** **끊기지** **않게** **확인**한다.

### Step 1. 권한·인증 정렬

- `src/lib/auth/*`  
- `src/middleware.ts`  
- `src/app/api/auth/*`  

### Step 2. 사건·상태 정렬

- `src/app/api/cases/route.ts`  
- `src/app/api/cases/[caseId]/route.ts`  
- `src/app/api/cases/[caseId]/status/route.ts` (명세상 `transition` 에 대응)  
- `src/app/(protected)/cases/[caseId]/page.tsx`  
- `src/components/cases/*`  

### Step 3. 질문셋·인터뷰 정렬

- `src/app/api/cases/[caseId]/question-set/route.ts`  
- `src/app/api/cases/[caseId]/interview/route.ts`  
- `src/app/api/cases/[caseId]/interview/complete/route.ts`  
- `src/app/(protected)/cases/[caseId]/interview/page.tsx`  
- `src/components/cases/case-interview-client.tsx`  
- `src/app/(protected)/admin/question-sets/*`  

### Step 4. 사건 요약 정렬

- 요약 전용 route가 없으면 `src/app/api/cases/[caseId]/detail/route.ts`·서비스·직렬화 레이어  
- `src/app/api/cases/[caseId]/summary/*` (추가 시)  
- 사건 상세 상단 카드 관련 컴포넌트  

### Step 5. 문서·문단 정렬

- `src/app/api/cases/[caseId]/documents/*`  
- `src/app/api/documents/[documentId]/*`  
- `src/app/api/legal-documents/[legalDocumentId]/*`  
- `src/app/(protected)/documents/[documentId]/page.tsx`  
- 문단 패널·검토 패널 컴포넌트  

### Step 6. 승인·전달·검증 정렬

- `src/app/api/documents/[documentId]/review/route.ts`, `approval-review/route.ts` 등  
- `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`  
- `src/app/api/documents/[documentId]/delivery/route.ts` (존재 시)  
- `src/app/api/document-verification/route.ts` 등  

### Step 7. 관리자·증빙 정렬

- `src/app/api/admin/*`  
- [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)  
- 검증 스크립트·CI 설정  

---

## 3. 파일별 재정렬 패치 지시

### 3-1. 기준 소스 파일군

#### FILE-001 `prisma/schema.prisma`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 사건 상태, 문서·문단·승인·전달 관련 모델을 정의서 기준으로 고정 |

**검색 키워드**

`enum CaseStatus`, `model Case`, `model LegalDocument`, `DocumentParagraph`, `Approval`, `Delivery`, `Verification`

**확인·수정 지시**

- `enum CaseStatus` 값이 [상태값 정의서](./CASE_STATUS_DEFINITION.md)와 정확히 일치하는지 확인한다.  
- 레거시·테스트·화면 전용 값이 enum에 남아 있으면 제거한다.  
- `Case` 모델의 `status` default가 [라이프사이클 정의서](./CASE_LIFECYCLE_DEFINITION.md) 초기 상태와 일치하는지 확인한다.  
- 문서가 body 단일 문자열 중심이면 `DocumentParagraph` 중심 구조로 전환 가능한지 점검한다.  
- 문단 버전·승인·전달·검증 메타 모델이 없으면 **추가 후보**로 표시한다.  
- 승인·전달·검증 메타가 단일 테이블에 과적재되어 있으면 분리 필요 메모를 남긴다.  

**삽입·교체 위치 기준**

- `enum CaseStatus` 블록 전체를 canonical 기준으로 재작성  
- `model Case` 내 `status` 필드 선언부 재확인  
- `model LegalDocument` 및 문단·버전 relation 블록 추가 검토  

**금지 사항**

- 상태 alias 추가 금지  
- UI 표시 문자열을 enum 값으로 넣지 말 것  

**반영 후 검증**

```bash
npx prisma validate
npx prisma generate
npm run verify:canonical-sources
```

---

#### FILE-002 `src/lib/definitions/case-status.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 상태값·라벨·전이 액션의 단일 기준 파일 고정 |

**검색 키워드**

`CASE_STATUS`, `CaseStatus`, `statusLabel`, `allowedActions`, `transition`

**확인·수정 지시**

- `prisma/schema.prisma` 의 `CaseStatus` 와 1:1 일치하게 맞춘다.  
- 내부 값과 화면 표시 라벨을 분리한다.  
- action 기반 전이 표는 이 파일 또는 이 파일이 참조하는 **단일 모듈**에서 관리한다.  
- `allowedActions` 계산 기준이 있으면 권한·상태 기준과 연결 구조를 명시한다.  
- 개별 화면에서 상태 문자열을 하드코딩하지 않도록 export 구조를 정리한다.  

**삽입·교체 위치 기준**

- 상태 상수·배열·맵 정의부 전면 정렬  
- `status` → `label` map 과 `allowedActions` 관련 정의를 인접 배치  
- `action` → `nextStatus` 표를 별도 섹션으로 분리  

**반영 후 검증**

```bash
npm run verify:canonical-sources
python tools/aibeopchin_navigator.py check-status
```

---

#### FILE-003 `tools/aibeopchin_navigator.py`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 문서·구현 단계 순서가 현재 기준문서 흐름과 어긋나지 않게 유지 |

**검색 키워드**

`Phase`, `API`, `alignment`, `plan`

**확인·수정 지시**

- 문서 진행 순서가 **API 명세 → 역점검표 → 본 패치 지시서** 순인지 확인한다.  
- `check-status` 관련 scope·prefix는 휴리스틱 안내와 함께 유지한다.  
- 새 기능 항목이 기준문서 잠금보다 먼저 오도록 배치되어 있으면 뒤로 이동한다.  

**반영 후 검증**

```bash
python tools/aibeopchin_navigator.py --help
```

내비게이터 출력 캡처 또는 텍스트를 evidence에 기록한다.

---

### 3-2. 권한·인증 파일군

#### FILE-004 `src/middleware.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 보호 라우트 기본 접근 제어 정렬 |

**검색 키워드**

`matcher`, `auth`, `session`, `role`

**확인·수정 지시**

- 보호 영역과 공개 영역을 분리한다.  
- 관리자 경로(`/admin` 계열)가 일반 보호 경로와 동일하게 열려 있지 않은지 확인한다.  
- 단순 로그인만 체크하고 세부 role·resource 검증이 빠져 있으면 **서버 route**에서 보완하도록 메모한다.  

---

#### FILE-005 `src/lib/auth/*`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 역할 판정·세션 유틸 단일화 |

**검색 키워드**

`getSessionUser`, `requireRole`, `requireAuth`, `hasPermission`, `assertCaseAccess`

**확인·수정 지시**

- role 문자열 하드코딩을 제거한다.  
- 사건 단위 접근권한 판정 함수가 없으면 추가 후보로 기록한다.  
- route별로 제각각 쓰는 guard를 공통 함수로 모은다.  
- `allowedActions` 계산에 필요한 권한 판정 함수의 **단일 출처**를 정리한다.  

**반영 후 검증**

- 관련 단위 테스트 실행  
- 권한 없는 사용자 API 접근 시 403 반환 확인  

---

#### FILE-006 `src/app/api/auth/signup/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P2 |
| 목적 | 회원가입 DTO·권한 기본값 정렬 (명세상 `register` 에 대응) |

**검색 키워드**

`POST`, `role`, `password`

**확인·수정 지시**

- 공개 회원가입 허용 역할 범위를 정책대로 제한한다.  
- 응답 구조를 [API_SPEC_V1.md](./API_SPEC_V1.md) `success`·`data`·`error` 표준으로 정렬한다.  
- 사용자 생성 감사로그가 없으면 후속 보강 대상으로 기록한다.  

---

#### FILE-007 `src/app/api/auth/login/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P2 |
| 목적 | 로그인 응답·에러 표준화 |

**검색 키워드**

`POST`, `email`, `password`, `session`

**확인·수정 지시**

- 응답 구조를 API 명세와 맞춘다.  
- 문자열 에러 직접 반환 대신 표준 에러 구조를 사용한다.  

---

### 3-3. 사건·상태 파일군

#### FILE-008 `src/app/api/cases/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 사건 목록·생성 API 정렬 |

**검색 키워드**

`GET`, `POST`, `status`, `caseNumber`

**확인·수정 지시**

- 목록 응답이 `items`·`page`·`pageSize`·`total` 구조인지 확인한다.  
- 사건 생성 시 요청 body에서 `status` 를 받지 않도록 한다.  
- 초기 상태는 서버가 canonical 기준으로 주입한다.  
- 생성 응답에 `allowedActions` 가 필요하면 포함한다.  

**삽입·교체 위치 기준**

- POST body parsing 직후 `status` 제거·무시 처리  
- create data 구성부에서 `status` 를 고정값 또는 서비스 함수 계산값으로 주입  

**반영 후 검증**

- 사건 생성 API 수동 호출  
- 생성 직후 상세 조회 시 초기 상태 확인  

---

#### FILE-009 `src/app/api/cases/[caseId]/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 사건 상세·수정 API 정렬 |

**검색 키워드**

`GET`, `PATCH`, `allowedActions`, `status`

**확인·수정 지시**

- GET 응답에 상단 카드용 요약 필드와 `allowedActions` 포함 여부 확인  
- PATCH에서 `status` 직접 수정 허용 로직이 있으면 제거  
- 사건 단위 접근권한 검증 수행  

**금지 사항**

- 상세 PATCH에서 `status` 직접 업데이트 금지  

---

#### FILE-010 `src/app/api/cases/[caseId]/status/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 사건 상태 전이를 action 기반 단일 경로로 고정 ([API_SPEC_V1.md](./API_SPEC_V1.md) 의 `.../transition` 에 대응) |

**검색 키워드**

`action`, `status`, `transition`, `allowedActions`, `LifecycleAction`

**확인·수정 지시**

- 요청 body는 `action`, `reason`(선택) 만 받도록 정렬한다.  
- `status` 직접 입력을 받는 코드가 있으면 제거한다.  
- 현재 상태 + `action` 조합으로만 next status를 계산한다.  
- 권한 검증과 전이 조건 검증을 서버에서 모두 수행한다.  
- 성공 응답에 변경된 `case.status` 와 `allowedActions` 를 포함한다.  
- 감사로그·타임라인 기록을 남긴다.  

**삽입·교체 위치 기준**

- body validation 스키마에서 `status` 제거  
- transition resolver 호출부 단일화  
- 마지막 응답 직전에 `allowedActions` 재계산  

**반영 후 검증**

- 허용 action 전이 성공  
- 비허용 action 전이 400·409 확인  
- `npm run verify:canonical-sources`  
- `python tools/aibeopchin_navigator.py check-status`  

---

#### FILE-011 `src/app/(protected)/cases/[caseId]/page.tsx`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 사건 상세 화면이 정의서 기준 상단 카드·버튼·요약 구조를 따르게 정렬 |

**검색 키워드**

`allowedActions`, `summary`, `interview`, `document`

**확인·수정 지시**

- 상단 카드에 사건 상태, 인터뷰 진행도, 최신 요약, 문서·첨부 현황을 묶어 표시한다.  
- 버튼 노출은 서버가 내려준 `allowedActions` 기준으로 한다.  
- 임의 `status` 비교식 하드코딩을 최소화한다.  
- 인터뷰 완료·문서 생성·승인 요청 CTA가 잘못된 상태에서 보이지 않게 정렬한다.  

---

#### FILE-012 `src/components/cases/*`

| 항목 | 내용 |
|------|------|
| 우선순위 | P2 |
| 목적 | 사건 관련 badge·filter·action 컴포넌트 정렬 |

**검색 키워드**

`statusLabel`, `badge`, `transition`, `completeInterview`

**확인·수정 지시**

- 상태 배지 라벨이 canonical label map을 참조하도록 수정한다.  
- 컴포넌트 내부 하드코딩 상태 문자열을 제거한다.  
- 버튼 활성·비활성 기준을 `allowedActions` 로 일원화한다.  

---

### 3-4. 질문셋·인터뷰 파일군

#### FILE-013 `src/app/api/cases/[caseId]/question-set/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 사건-질문셋-버전 연결 정렬 |

**검색 키워드**

`questionSet`, `version`, `questions`

**확인·수정 지시**

- 사건에 연결된 질문셋 버전을 반환하는지 확인한다.  
- “최신 질문셋”만 강제 참조하는 구조면 사건 고정 버전 참조로 정렬한다.  
- 응답에 인터뷰 진행 상태·진행률·마지막 응답 지점을 포함한다.  

---

#### FILE-014 `src/app/api/cases/[caseId]/interview/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 답변 저장 구조·분기 계산 정렬 |

**검색 키워드**

`answers`, `questionId`, `value`, `branch`

**확인·수정 지시**

- 요청 body는 `answers[]` 구조를 표준화한다.  
- 서버 기준으로 분기 계산을 수행한다.  
- [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) 와 일치하는지 맞춘다.  
- 저장 후 `completion`, `nextQuestionIds` 를 반환한다.  

---

#### FILE-015 `src/app/api/cases/[caseId]/interview/complete/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 인터뷰 완료 검증과 사건 상태 전이 연결 |

**검색 키워드**

`complete`, `required`, `transition`, `completion`

**확인·수정 지시**

- 필수 질문 미응답 시 완료 불가 검증을 서버에서 수행한다.  
- 인터뷰 완료 시 사건 상태 전이(action 기반)를 함께 수행한다.  
- 성공 응답에 인터뷰 완료 상태, 사건 상태, `allowedActions` 를 포함한다.  
- 프론트 완료 플래그만 저장하는 구조면 제거한다.  

**반영 후 검증**

- 필수 응답 누락 상태에서 완료 시도 → 실패 확인  
- 필수 응답 충족 후 완료 시도 → 사건 상태 전이 확인  

---

#### FILE-016 `src/app/(protected)/cases/[caseId]/interview/page.tsx`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 인터뷰 화면 흐름 정렬 |

**검색 키워드**

`complete`, `saveDraft`, `progress`, `questions`

**확인·수정 지시**

- 완료 버튼은 API 성공 후에만 완료 상태로 반영한다.  
- 진행률·필수 질문 누락 경고를 서버 응답 기준으로 표시한다.  
- 질문 분기는 서버 응답 또는 서버 기준 데이터로 처리한다.  

---

#### FILE-017 `src/components/cases/case-interview-client.tsx`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 프론트 임시 상태와 서버 기준 상태를 정렬 |

**검색 키워드**

`localAnswers`, `branch`, `isComplete`, `progress`

**확인·수정 지시**

- 프론트 임시 분기 로직이 서버 기준과 충돌하면 제거한다.  
- 완료 가능 여부 판정은 서버 검증 결과를 우선 사용한다.  
- 저장·완료 버튼 상태를 서버 응답과 동기화한다.  

---

### 3-5. 사건 요약 파일군

#### FILE-018 사건 요약 생성 진입점

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 사건 요약 생성 구조를 명세 기준으로 고정 |
| 현행 후보 | `src/features/case-interview/*`, 직렬화·`detail` 응답, 별도 route 추가 |

**검색 키워드**

`summary`, `caseOverview`, `timeline`, `issues`, `riskNotes`, `disclaimer`

**확인·수정 지시**

- 출력 구조가 [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) 와 일치하는지 맞춘다.  
- [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md) 문구를 서버 생성 단계에서 강제 적용한다.  
- [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md) 위반 표현 필터를 적용한다.  
- 첨부 반영 범위는 [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) 에 맞춘다.  

**반영 후 검증**

- 생성 결과에 고지문 존재 확인  
- 금지 표현 필터 테스트  

---

#### FILE-019 `src/app/api/cases/[caseId]/detail/route.ts` (및 직렬화)

| 항목 | 내용 |
|------|------|
| 우선순위 | P2 |
| 목적 | 최신 요약·상단 카드용 필드 정렬 (전용 `summary` route 가 없을 때 대체) |

**검색 키워드**

`latestSummary`, `version`, `serializeCaseDetail`

**확인·수정 지시**

- 최신 버전·최신 승인 기준이 있으면 명확히 한다.  
- 사건 상세 상단 카드가 요구하는 최소 요약 필드를 포함한다.  

---

#### FILE-020 요약 재생성 route·서비스

| 항목 | 내용 |
|------|------|
| 우선순위 | P2 |
| 목적 | 재생성 이력 구조 정렬 |

**검색 키워드**

`regenerate`, `reason`, `version`

**확인·수정 지시**

- overwrite인지 version 추가인지 정책을 고정한다.  
- 재생성 사유를 감사로그 또는 메타에 남긴다.  

---

### 3-6. 문서·문단 파일군

#### FILE-021 `src/app/api/cases/[caseId]/documents/generate/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 문서 초안 생성이 템플릿·질문셋 기반으로만 이루어지도록 정렬 (명세의 `POST .../documents` 에 대응) |

**검색 키워드**

`templateCode`, `templateVersion`, `document`, `paragraph`, `LegalDocument`

**확인·수정 지시**

- `templateId` 명목이 아닌 경우 `templateCode`·`templateVersion` 등 **현행 스키마**에 맞춘다.  
- 자유형 body 생성 로직이 있으면 제거하거나 보조 경로로 격리한다.  
- 생성 직후 문단(`LegalDocumentParagraph` 등) 구조를 함께 만든다.  
- 사건 요약·질문 답변과 템플릿 문단 매핑을 명시적으로 수행한다.  

---

#### FILE-022 `src/app/api/documents/[documentId]/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 문서 상세 응답 정렬 |

**검색 키워드**

`approvedVersionId`, `template`, `allowedActions`, `status`

**확인·수정 지시**

- 문서 상태, 템플릿 정보, 승인 상태, `allowedActions` 를 포함한다.  
- body 단일 문자열만 반환하는 구조면 문단 구조 중심 조회로 정렬한다.  
- 승인본 잠금 상태를 응답에 포함한다.  

---

#### FILE-023 `src/app/api/documents/[documentId]/paragraphs/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 문단 패널 데이터 정렬 |

**검색 키워드**

`paragraphs`, `order`, `locked`, `approved`

**확인·수정 지시**

- 문단 코드, 순서, 잠금, 승인, 최신 버전 메타를 반환한다.  
- 정렬 기준은 `order` 오름차순으로 고정한다.  

---

#### FILE-024 `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/regenerate/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 선택 문단 재생성 범위를 서버에서 강제 |

**검색 키워드**

`paragraphId`, `instructions`, `locked`, `version`

**확인·수정 지시**

- 대상 문단만 재생성하도록 범위를 고정한다.  
- 잠금 문단 재생성 금지 또는 override 정책을 분리한다.  
- 재생성 후 버전 이력을 남긴다.  
- AI 출력 정책 필터를 적용한다.  

**금지 사항**

- 문단 재생성 API에서 전체 문서 재생성 금지  

---

#### FILE-025 문단 잠금 route

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 잠금 상태를 서버 기준으로 강제 |
| 현행 후보 | `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/lock/route.ts`, `.../legal-documents/.../lock/route.ts` |

**검색 키워드**

`locked`, `reason`

**확인·수정 지시**

- 잠금·해제 요청 body를 단순화한다.  
- 잠금 상태는 수정·재생성·순서 변경 API에서 공통 참조한다.  
- 잠금 변경 이력을 감사로그에 남긴다.  

---

#### FILE-026 `src/app/api/documents/[documentId]/versions/*` 및 `paragraph-versions/*`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 버전 이력·diff·restore 정렬 |

**검색 키워드**

`versions`, `diff`, `restore`

**확인·수정 지시**

- 버전 목록 조회와 restore API를 분리·정리한다.  
- restore 시 신규 버전으로 남길지 pointer만 바꿀지 정책을 고정한다.  
- diff 응답 구조를 화면 패널과 맞춘다.  

---

#### FILE-027 `src/app/(protected)/documents/[documentId]/page.tsx`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 문서 상세 화면 흐름 정렬 |

**검색 키워드**

`review`, `paragraph`, `diff`, `approve`

**확인·수정 지시**

- 문단 구조 패널과 승인 전 검토 패널을 분리한다.  
- 승인 요청 전 검토 흐름을 강제한다.  
- 승인 후 편집 CTA를 숨기거나 read-only로 전환한다.  

---

### 3-7. 승인·전달·검증 파일군

#### FILE-028 `src/app/api/documents/[documentId]/approval-review/route.ts` 또는 `review/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 승인 요청 단계 분리 |

**검색 키워드**

`requestApproval`, `review`, `status`

**확인·수정 지시**

- draft에서 바로 approve로 가지 않도록 request 단계로 분리한다.  
- 승인 요청 시 필수 검토 조건을 점검한다.  

---

#### FILE-029 `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 승인본 잠금과 승인 메타 기록 (명세 `approvals/.../approve` 대응) |

**검색 키워드**

`approve`, `approvedVersionId`, `locked`, `approvedAt`, `approvedBy`

**확인·수정 지시**

- 승인 시 현재 버전을 승인본으로 고정한다.  
- 승인본 잠금을 적용한다.  
- 승인자·승인시각·승인버전 ID를 기록한다.  
- 필요 시 검증코드 생성 시점을 여기서 고정한다.  

**반영 후 검증**

- 승인 후 문단 편집·재생성 차단 확인  
- 승인 메타 조회 확인  

---

#### FILE-030 반려 route

| 항목 | 내용 |
|------|------|
| 우선순위 | P2 |
| 목적 | 반려 사유 기록 정렬 |
| 현행 후보 | `legal-documents`·`documents` 하위 reject 계열 (grep으로 확정) |

**검색 키워드**

`reject`, `reason`

**확인·수정 지시**

- 반려 사유 필드 필수 여부를 정책대로 고정한다.  
- 반려 후 문서 상태가 재수정 가능한 상태로 돌아가는지 확인한다.  

---

#### FILE-031 `src/app/api/documents/[documentId]/delivery/route.ts` (존재 시) 또는 동등 기능

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 승인본만 전달되도록 가드 정렬 |

**검색 키워드**

`delivery`, `recipient`, `channel`, `approved`

**확인·수정 지시**

- 승인 상태 검증 없이는 전달 불가로 막는다.  
- 전달 대상·채널·시각을 기록한다.  
- 문서 타임라인·감사로그 연동을 추가한다.  

---

#### FILE-032 문서 검증 메타 route

| 항목 | 내용 |
|------|------|
| 우선순위 | P1 |
| 목적 | 검증 메타 조회 정렬 |

**검색 키워드**

`verificationCode`, `qr`, `url`

**확인·수정 지시**

- 승인본 기준 검증코드·URL 메타를 반환한다.  
- 내부 식별자 전체를 외부 응답에 노출하지 않는다.  

---

#### FILE-033 `src/app/api/document-verification/route.ts` (및 공개 검증 진입점)

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 공개 검증 응답 최소화와 진위 확인 정렬 |

**검색 키워드**

`verificationCode`, `valid`, `approvedAt`, `caseNumber`

**확인·수정 지시**

- 입력은 `verificationCode` 중심으로 단순화한다.  
- 응답은 진위 확인에 필요한 최소 필드만 반환한다.  
- 민감 개인정보 노출을 제거한다.  

**반영 후 검증**

- 유효·무효 코드 각각 테스트  
- 공개 응답 payload 검토  

---

### 3-8. 관리자·증빙 파일군

#### FILE-034 관리자 check-status 관련 route·UI

| 항목 | 내용 |
|------|------|
| 우선순위 | P2 |
| 목적 | check-status 결과 해석 방식 정렬 |
| 현행 후보 | `src/app/api/admin/*` 중 진단용 (없으면 문서·운영 메시지만 정렬) |

**검색 키워드**

`warningCount`, `errorCount`, `check-status`

**확인·수정 지시**

- 경고 건수를 곧바로 오류 판정으로 보여주지 않게 한다.  
- “휴리스틱 점검”임을 응답 또는 UI 설명에 명시한다.  

---

#### FILE-035 `scripts/verify-canonical-sources.ts` 및 `npm run verify:canonical-sources`

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | canonical source 검증 **본선** 고정 (HTTP 관리자 route는 선택) |

**검색 키워드**

`verify-canonical-sources`, `CaseStatus`, `schema.prisma`, `case-status.ts`

**확인·수정 지시**

- 최소한 아래 2개 파일을 함께 검증하도록 한다.  
  - `prisma/schema.prisma`  
  - `src/lib/definitions/case-status.ts`  
- 불일치 시 명확한 실패(exit 0이 아님)를 반환한다.  
- evidence에서 바로 참조 가능한 출력 구조를 유지한다.  

---

#### FILE-036 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)

| 항목 | 내용 |
|------|------|
| 우선순위 | P0 |
| 목적 | 완료 판정용 실제 기록 절 정렬 |

**검색 키워드**

`실제 기록`, `수정 파일`, `검증 명령`, `검증 결과`, `근거 메모`

**확인·수정 지시**

- 각 패치 단위마다 아래 4가지를 반드시 남긴다: 수정 파일, 검증 명령, 검증 결과, 근거 메모.  
- 상태 관련 패치는 아래 2개를 **함께** 남긴다.  
  - `npm run verify:canonical-sources`  
  - `python tools/aibeopchin_navigator.py check-status`  
- “완료” 표기는 검증 결과가 있는 경우에만 사용한다.  

**권장 기록 블록**

```markdown
## [PATCH-ID] 제목
- 수정 파일:
- 검증 명령:
- 검증 결과:
- 근거 메모:
```

---

## 4. 공통 grep 키워드 묶음

### 4-1. 상태·전이

`status:`, `CaseStatus.`, `allowedActions`, `transition`, `action:`, `PATCH`

### 4-2. 권한

`role`, `requireAuth`, `requireRole`, `getSessionUser`, `forbidden`, `403`, `assertCaseAccess`

### 4-3. 인터뷰

`questionSet`, `answers`, `questionId`, `branch`, `complete`, `progress`

### 4-4. 요약

`summary`, `caseOverview`, `timeline`, `issues`, `riskNotes`, `disclaimer`

### 4-5. 문서·문단

`templateId`, `templateCode`, `paragraph`, `regenerate`, `locked`, `version`, `restore`, `diff`

### 4-6. 승인·전달·검증

`requestApproval`, `approve`, `reject`, `delivery`, `verificationCode`, `approvedVersionId`

---

## 5. 최소 반영 배치 세트

**접선:** [§2 **Batch 1-A**](#batch-1a-실행) ([316](./IMPLEMENTATION_EVIDENCE.md)) **·** [**Batch 1-B**](#batch-1b-실행) ([317](./IMPLEMENTATION_EVIDENCE.md)) **→** [**§5** **FILE** **Batch** **A**](#file-batch-a-실행) ([318](./IMPLEMENTATION_EVIDENCE.md)) **→** [**Batch** **B**](#file-batch-b-실행) ([319](./IMPLEMENTATION_EVIDENCE.md)) **→** [**Batch** **C**](#file-batch-c-실행) ([320](./IMPLEMENTATION_EVIDENCE.md)).

### Batch A — 반드시 먼저

- FILE-001 `prisma/schema.prisma`  
- FILE-002 `src/lib/definitions/case-status.ts`  
- FILE-008 `src/app/api/cases/route.ts`  
- FILE-009 `src/app/api/cases/[caseId]/route.ts`  
- FILE-010 `src/app/api/cases/[caseId]/status/route.ts`  
- FILE-015 `src/app/api/cases/[caseId]/interview/complete/route.ts`  
- FILE-018 사건 요약 생성 진입점(서비스·route·직렬화)  
- FILE-021 `src/app/api/cases/[caseId]/documents/generate/route.ts`  
- FILE-024 문단 재생성 route (`legal-documents/.../regenerate`)  
- FILE-025 문단 잠금 route  
- FILE-029 `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`  
- FILE-031 전달 route(존재 시)  
- FILE-033 `src/app/api/document-verification/route.ts` (및 공개 검증)  
- FILE-035 `npm run verify:canonical-sources`  
- FILE-036 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)  

### Batch B — Batch A 직후

- FILE-005 `src/lib/auth/*`  
- FILE-013 question-set route  
- FILE-014 interview route  
- FILE-022 document detail route  
- FILE-023 document paragraphs route  
- FILE-027 document detail page  
- FILE-028 approval-review·review route  

### Batch C — 표현·UI·보강 정렬

- FILE-004 `middleware.ts`  
- FILE-006·007 auth route 표준화  
- FILE-011·012 사건 화면·컴포넌트  
- FILE-016·017 인터뷰 화면·클라이언트  
- FILE-019·020 요약 조회·재생성  
- FILE-026 문단 버전 API  
- FILE-030 반려 route  
- FILE-034 check-status 설명 정렬  

### FILE Batch A 실행·판정 (§5 — [318](./IMPLEMENTATION_EVIDENCE.md)) {#file-batch-a-실행}

**전제:** [Batch 1-A](#batch-1a-실행) ([316](./IMPLEMENTATION_EVIDENCE.md)) · [Batch 1-B](#batch-1b-실행) ([317](./IMPLEMENTATION_EVIDENCE.md)) **완료** — **상태축**·**인터뷰축** **기준** **과** **모순** **없이** **읽힌다**.

**대상(그리드):** [위 **「Batch** **A** **—** **반드시** **먼저」** **목록**](#5-최소-반영-배치-세트) **—** FILE-001,002,008,009,010,015,018,021,024,025,029,031,033,035,036.

**Step 1·canonical (FILE-001,002,035,036)** — **판정:** `CaseStatus` **는** `schema.prisma` **와** `case-status.ts` **가** **1:1**; **`npm run verify:canonical-sources`** **는** **두** **파일** **존재** **본선**; **증빙** [318] **절** **갱신**.

**Step 2·사건** **API** **(FILE-008,009,010,015)** — **판정:** **생성** **시** `status` **거부**·**상세** `PATCH` **에서** `status` **거부**; **전이** **는** `PATCH` `/api/cases/:id/status` **또는** `POST` `/api/cases/:id/transition` **의** `action`+`reason` **만** — **`PATCH`** **body** **는** **`POST` `transition`과** **동일하게** **`.strict()`** **(알** **수** **없는** **키** **거부)**. **인터뷰** **완료** [FILE-015] **=** [1-B](./FILE_REALIGN_PATCH_V1.md#batch-1b-실행) **[317]**.

**Step 3·요약·문서** **P0** **(FILE-018,021,024,025,029,031,033)** — **판정:** **요약** `buildInterviewSummary` **및** **인터뷰** **UI** **보조**; **문서** **생성** **은** `templateCode`·`questionSetCode`·**인터뷰** `COMPLETED` **가드**; **문단** **재생성/잠금**·**승인**·**전달(`deliver`)** `APPROVED`/`LOCKED`·**검증** `document-verification` **은** **기존** **가드** **와** [CASE_LIFECYCLE]·[PERM] **축** **일치** **여부** **확인**.

**Batch** **A** **완료** **(한** **줄):** **§5** **Batch** **A** **는** [318](./IMPLEMENTATION_EVIDENCE.md) **에** **기록한** **대로** **최소** **반영** **세트** **를** **1-A/1-B** **와** **끊기지** **않게** **정적** **점검**하고, **필요** **시** **(예:** **`PATCH` `status` `.strict()`)** **만** **코드** **정렬**한다; **다음** **=** [Batch** **B**](#5-최소-반영-배치-세트).

### FILE Batch B 실행·판정 (§5 — [319](./IMPLEMENTATION_EVIDENCE.md)) {#file-batch-b-실행}

**전제:** [Batch A](#file-batch-a-실행) ([318](./IMPLEMENTATION_EVIDENCE.md)) — [Batch 1-B](./FILE_REALIGN_PATCH_V1.md#batch-1b-실행)와 맞은 상태축·인터뷰축·`PATCH` `status` / `POST` `transition`의 `.strict()` body 계약.

**대상(그리드):** [「Batch B — Batch A 직후」](#5-최소-반영-배치-세트) — FILE-005,013,014,022,023,027,028.

**Step 1·auth (FILE-005):** `src/lib/auth/roles.ts`에 역할·`UserRole`·`allowedLifecycleActions` 직교를 적은 모듈 주석(대규모 role 리팩터는 범위 밖).

**Step 2·질문셋 (FILE-013):** `GET`·`getCaseAccessContext`·질문셋 응답은 `getCaseInterviewQuestionSetService`에 집약(사건 권한 축은 1-B와 동일).

**Step 3·interview (FILE-014):** POST body를 `saveInterviewAnswerBodySchema` (`.strict()`)로 파싱 — [Batch A]의 전이 API와 동일한 “알 수 없는 키 거부” 취지. GET `ok(flow)` 유지.

**Step 4·문서 (FILE-022,023,028):** `documentIdParams`·`update`·`review`·`putDocumentParagraphs`·`markApprovalReview`에 Zod `.strict()`. `assertCaseDocumentDraftAccess`·`ok` 축 유지.

**Step 5·문서 page (FILE-027):** 서버 `getDocumentDetail` DTO·`case.status`는 사건 전이 API와 별도 직교; 화면은 맥락 주석으로만 [Batch A]과 연결.

**Batch B 완료(한 줄):** [319](./IMPLEMENTATION_EVIDENCE.md) — §5 File Batch B는 인터뷰·문서·승인전검토 API 요청 body를 [Batch A] `.strict()` 취지에 맞추고, auth·page는 주석·스키마로 닫는다. **다음:** [Batch C](#file-batch-c-실행) ([320](./IMPLEMENTATION_EVIDENCE.md)).

### FILE Batch C 실행·판정 (§5 — [320](./IMPLEMENTATION_EVIDENCE.md)) {#file-batch-c-실행}

**전제:** [Batch B](#file-batch-b-실행) ([319](./IMPLEMENTATION_EVIDENCE.md)) — [Batch A/B](#5-최소-반영-배치-세트)에서 잠근 `.strict()` body·상태 전이·인터뷰/문서 API 정렬 축.

**대상(그리드):** [「Batch C — 표현·UI·보강 정렬」](#5-최소-반영-배치-세트) — FILE-004,006,007,011,012,016,017,019,020,026,030,034.

- **Step 1·middleware (FILE-004):** `src/middleware.ts` — 보호 경로·주석·`isAllowedLawyerAdminPath` 등 §2·§5 A/B와 직교 유지(신규 규칙 없음).  
- **Step 2·auth (FILE-006,007):** `src/lib/validators/auth.ts` — `signUpSchema`·`loginSchema`에 Zod `.strict()` (Batch A·B와 동일한 “알 수 없는 키 거부”).  
- **Step 3·사건/인터뷰 UI (FILE-011,012,016,017):** 사건 상세·인터뷰 페이지·클라이언트 — `allowedLifecycleActions`·전이 API·`detail` DTO와 읽힘 맞는 **맥락 주석**.  
- **Step 4·요약·초안 (FILE-019,020):** `GET …/detail`·`summary/generate`·`document-draft.validators` — `.strict()`·주석; 도메인 규칙 확장 없음.  
- **Step 5·문단 버전 (FILE-026):** `document-version.validators` + `versions/snapshot` + `paragraph-versions` POST — params/body Zod `.strict()`.  
- **Step 6·반려 (FILE-030):** 독립 `reject` API route **없음** — 문서 `POST .../review`의 `REJECT` 흐름 + [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md)에 그 사실을 기록.  
- **Step 7·navigator (FILE-034):** `check-status`는 휴리스틱(§4-1, CASE_STATUS §5.1는 소스로 직접 읽지 말 것) — `aibeopchin_navigator.py` 모듈 상단 설명 정렬.  

**Batch C 완료(한 줄):** [320](./IMPLEMENTATION_EVIDENCE.md) — §5 File Batch C는 middleware·auth·UI·문서 버전/초안·내비를 A/B에서 잠근 전이·`.strict()`·API 정렬에 맞춘다. **다음:** [SPEC §0 **읽는** **순서** (320 **이후)](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-320-이후-거버넌스-순서) **·** [321](./IMPLEMENTATION_EVIDENCE.md) (B안/질문셋 = 비기본·별도 증빙).

---

## 6. 패치 후 검증 순서

### 공통

- 타입 검사(프로젝트에 스크립트가 있으면 실행, 없으면 `npx tsc --noEmit` 검토)  
- 린트  
- 주요 라우트 수동 점검  
- evidence 기록  

### 권장 명령

```bash
npm run lint
npx tsc --noEmit
npm run verify:canonical-sources
python tools/aibeopchin_navigator.py check-status
```

(`tsc` 는 `tsconfig.json` 존재 시)

### 시나리오 검증

1. 사건 생성 → 초기 상태 확인  
2. 사건 상세 → `allowedActions` 확인  
3. 인터뷰 답변 저장 → 진행률 확인  
4. 인터뷰 완료 → 사건 상태 전이 확인  
5. 사건 요약 생성 → 고지문 포함 확인  
6. 문서 초안 생성 → 문단 구조 생성 확인  
7. 문단 재생성 → 잠금 문단 차단 및 버전 이력 확인  
8. 승인 요청 → 승인 → 승인본 잠금 확인  
9. 전달 → 승인 전 차단 · 승인 후 전달 성공 확인  
10. 검증코드 조회 및 공개 검증 확인  

---

## 7. 증빙 기록 규칙

각 패치 배치 완료 후 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 에 최소 아래 형식으로 남긴다.

```markdown
## [BATCH-A-01] 상태·전이 canonical 정렬
- 수정 파일:
  - prisma/schema.prisma
  - src/lib/definitions/case-status.ts
  - src/app/api/cases/[caseId]/status/route.ts
- 검증 명령:
  - npx prisma validate
  - npm run verify:canonical-sources
  - python tools/aibeopchin_navigator.py check-status
- 검증 결과:
  - prisma validate 통과
  - verify canonical 통과
  - check-status 경고 1건(휴리스틱)
- 근거 메모:
  - status 직접 수정 경로 제거
  - action 기반 전이만 허용
  - check-status 는 휴리스틱이므로 단독 오류 판정 근거로 사용하지 않음
```

---

## 8. 최종 지침

이 문서의 핵심은 “어떤 기능을 더 만들지”가 아니라, 이미 구현된 기능을 잠근 정의서 기준으로 되돌려 **정렬하는 순서와 위치**를 고정하는 것이다.

따라서 실제 반영은 아래 원칙을 지킨다.

- 상태·전이·권한·P0 항목부터 먼저 수정한다.  
- 프론트보다 **서버 기준**을 먼저 고정한다.  
- route와 schema를 먼저 정렬하고, UI는 그 다음에 맞춘다.  
- **evidence 없는 완료 판정은 하지 않는다.**  
- 상태 관련 작업은 항상 `verify:canonical-sources` 와 `check-status` 를 함께 남긴다.  

---

## 9. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 0.7 초안 | 2026-04-23 | §5 [FILE **Batch** **C** **실행**·**판정**](#file-batch-c-실행)·middleware·auth·UI·초안/버전·check-status(내비)·[320](./IMPLEMENTATION_EVIDENCE.md) |
| 0.6 초안 | 2026-04-23 | §5 [FILE **Batch** **B** **실행**·**판정**](#file-batch-b-실행)·인터뷰/문서 **Zod** `.strict()`·[319](./IMPLEMENTATION_EVIDENCE.md) |
| 0.5 초안 | 2026-04-23 | §5 [FILE **Batch** **A** **실행**·**판정**](#file-batch-a-실행)·`PATCH` `status` **body** `.strict()`·[318](./IMPLEMENTATION_EVIDENCE.md) |
| 0.4 초안 | 2026-04-23 | §2 [Batch 1-B 실행·판정](#batch-1b-실행)·`completeCaseInterviewService` **반환** `status`·[317](./IMPLEMENTATION_EVIDENCE.md) |
| 0.3 초안 | 2026-04-23 | §2 [Batch 1-A 실행·판정](#batch-1a-실행)·[EVIDENCE-20260423-316](./IMPLEMENTATION_EVIDENCE.md) |
| 0.2 초안 | 2026-04-23 | §2 [Step 0 이후 **Batch 1-A / 1-B**](#batch-1a-1b) (상태 핵심·인터뷰 후보)·Step 0 §7.1 [314]·[EVIDENCE-20260423-315](./IMPLEMENTATION_EVIDENCE.md) |
| 0.1 초안 | 2026-04-19 | FILE-001~036·배치 A/B/C·grep·검증·증빙·§0 현행 경로 매핑. npm·npx 기준 명령. |
