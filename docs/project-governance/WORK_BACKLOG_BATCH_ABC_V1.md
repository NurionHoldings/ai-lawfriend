# AI법친 실무형 작업 지시서 — Batch A · B · C (V1)

**관련**

- 총괄 기준선: `docs/project-governance/TOP3_FINAL_INTEGRATED_JUDGMENT.md` §0-1
- 증빙: `docs/project-governance/IMPLEMENTATION_EVIDENCE.md` (본 문서 반영 시 최신 블록)
- 당일 실행: `docs/project-governance/LAUNCH_DAY_QUICK_RUNBOOK.md`
- **Batch A** 파일 순서·정책: `BATCH_A_FILE_ORDER_V1.md` — **증빙** [269]~[277] · **Batch A(사건 축) 마감** (아래 **§ Batch A / Batch B**)
- **Batch B (후속):** `IMPLEMENTATION_EVIDENCE` [278] — `legal-documents` / `auth` / `admin` / `staff` `route`+UI, 전역 `success`/`ok` 유틸(별도)

**목적**

공표 이후·운영 전에 잡은 **실질 미비점 6건**을, **우선순위**와 **Batch** 단위로 **한 문서**에서 추적한다.  
본 문서는 **정책 선택**이 필요한 항목은 **분기(권장안 A/B)**를 명시하고, **완료 기준**을 **검증 가능**하게 둔다.

## Batch A / Batch B — 기준선 (2026-04-23)

### Batch A 마감(핵심 보완축, 사건 축)

- **[275]** A-2 수동 문서 세트 잠금
- **[276]** `api/cases` 범위 **응답 정렬** **중간 마감** (`ok` / `toErrorResponse` 축, 도메인 JSON)
- **[277]** STAFF·인터뷰 완료·**`allowedLifecycleActions` / 상태** **증빙** (코드·`verify:277`·vitest; **로컬 실동작 캡처**는 **선택 강화**·체크리스트·수동 쪽으로 **분리**)

**요약:** Batch A는 **사건 축** 기준선·증빙 **마감**으로 본다. **후속**은 Batch B(및 **별도 스프린트**의 **공용** `success`/`ok` **유틸** 전면 개편)로 이어간다.

### Batch B(후속)

- **`legal-documents` / `auth` / `admin` / `staff`:** 미정렬 `route`와 **호출 UI**를 **한 쌍씩** `ok` / `toErrorResponse` · **`json.ok === true`** 기준 **점진 정렬** (증빙 **§[278]**, `IMPLEMENTATION_EVIDENCE.md`)
- **공용** `success`/`ok` **흡수 유틸** **전면 개편**은 Batch B **병행 가능**하나 **범위·일정은 별도**로 둔다.

---

## 0. 요약 — 바로 적용할 보완 우선순위

| 순위 | 초점 | 비고 |
|------|------|------|
| **1순위** | 권한·상태 불일치 제거 | 버그·혼선 방지 |
| **2순위** | API 응답 규격 통일 | 오류 메시지 품질·유지보수 |
| **3순위** | 요약 저장형 스냅샷 | 발표 후 운영·추적·비교 |
| **4순위** | 문서 생성 정책 서버화 | 확장·운영 편의 (급하지 않음) |

---

## 1. 가장 먼저 고쳐야 할 실질 미비점 6개

### 1) 인터뷰 권한이 페이지와 API에서 어긋남

**현상**

- 인터뷰 **페이지**는 `getCaseAccessContext(...)`만 통과하면 열린다.
- 인터뷰 **service**는 `isOwner || isAdmin || isAssignedLawyer`만 허용한다.
- **STAFF**는 페이지는 열리는데 **API는 막힐 수 있는** 구조다.

**해결 — 둘 중 하나로 명확히 선택**

| 권장안 | 내용 |
|--------|------|
| **A (STAFF도 인터뷰 수행 허용)** | `assertCaseInterviewAccess()`에서 **assignedStaff**도 허용. 인터뷰 **page / API / 문서·FAQ 문구**를 **STAFF 허용** 기준으로 통일. |
| **B (STAFF는 읽기만)** | 인터뷰 page에서 STAFF 진입 시 **「조회만 가능」** 배너. **POST 저장·complete** 차단, 버튼 비활성화. |

**수정 위치 (우선)**

- `src/features/case-interview/case-interview.service.ts`
- 필요 시 인터뷰 관련 **문서·FAQ** 문구

**완료 기준**

- STAFF 계정으로 들어갔을 때 **「페이지는 열리는데 저장은 안 되는」** 어색한 상태가 **없어야** 한다.

---

### 2) 승인·잠금 권한 기준이 UI와 API에서 완전히 같지 않음

**현상**

- **UI**: `ADMIN`, `LAWYER`만 승인·잠금 버튼 노출.
- **잠금 API**: `SUPER_ADMIN`도 허용.
- **승인 API**: `APPROVED`, `LOCKED`만 차단 — `ARCHIVED`는 **직접** 차단하지 않음. UI는 `ARCHIVED`를 **terminal**로 봄.

**해결 — 권한 기준 단일화**

- **역할**: 아래 중 **하나**로 확정한다.  
  - **옵션 1:** `ADMIN` / `LAWYER` / `SUPER_ADMIN` 모두 승인·잠금 가능 → **UI에도 `SUPER_ADMIN` 반영**  
  - **옵션 2:** `SUPER_ADMIN` 제외 → **lock API role 검사에서 제거**

- **승인 API 상태 차단 보강** (`approve/route.ts` 등)

  - **`ARCHIVED` 차단** 필수.
  - 가능하면 `REJECTED` 및 기타 비정상 상태도 **명시적** 검토.

**예시 정책 (참고)**

- 승인 **가능**: `DRAFT`, `REVIEW_PENDING`  
- 승인 **불가**: `APPROVED`, `LOCKED`, `ARCHIVED`

**완료 기준**

- **UI 버튼 노출**과 **API 차단** 기준이 **한 표**로 설명 가능해야 한다.
- `ARCHIVED` 문서에 승인 API를 호출해도 **반드시** 막혀야 한다.

---

### 3) 승인 API가 사건 상태를 직접 `APPROVED`로 넣음

**현상**

- 문서 승인 시 사건 상태를 **route에서** `case.update({ status: "APPROVED" })` 식으로 직접 반영한다.
- **상태 전이 엔진 바깥**에서 수행되는 케이스가 있다.

**해결**

- `approveDocumentAndAdvanceCase(...)` **service** 또는 **기존 전이 계층**을 부르는 **wrapper**로 감싼다.
- **route**는 orchestration만, **상태 의미·정책**은 **service/전이 계층**이 갖는다.

**완료 기준**

- **「사건 상태 변경」**은 어디서든 **한 군데 정책**을 타야 한다. (승인 정책 변경·조건·감사로그를 route마다 흩뿌리지 않음.)

---

### 4) 클라이언트가 응답 형식 혼재를 흡수 중

**현상**

- `case-detail-client.tsx`가 `readApiErrorMessage()`와 `isJsonApiSuccess()` 등으로 **ok / success** 혼용을 흡수한다. → **응답 계약이 통일되지 않음**의 신호.

**해결 — API 응답 규격 1개로 전역 고정**

- 예시 A: `{ "success": true, "data": ... }` / `{ "success": false, "error": { "message": "..." } }`
- 예시 B: `{ "ok": true, "data": ... }` / `{ "ok": false, "message": "..." }`  
- **둘 중 하나만** 채택.

**우선 수정 후보 (파일)**

- `case-detail-client.tsx`
- `case-summary-panel.tsx`
- `case-interview-client.tsx`
- `interview/route.ts`, `interview/complete/route.ts`, `summary/generate/route.ts`, approve·lock route

**완료 기준**

- 클라이언트에서 `ok`와 `success`를 **동시에** 감싸는 코드가 **없어져야** 한다.
- 에러 파싱 **helper**가 **단순**해져야 한다.

---

### 5) 사건 요약이 온디맨드 응답형이라 운영 흔적이 약함

**현상**

- `CaseSummary` 테이블 없이 인터뷰 답변을 읽어 **즉시 생성**하는 구조. 미리보기는 되지만, **「언제·어떤 답변 기준」**의 **공식 스냅**이 약하다.

**해결 — 선택형 2단계**

1. **1단계 (유지)**: 지금처럼 미리보기·온디맨드 생성.
2. **2단계**: **「이 요약을 현재 기준 요약으로 저장」** 버튼 + 저장.

**저장 위치 (택1)**

- `caseTimelineMemo`에 `CASE_SUMMARY_SNAPSHOT`  
- 또는 **전용** `CaseSummarySnapshot` 테이블

**완료 기준**

- **미리보기**와 **기준 요약**이 **분리**되어야 한다.
- 운영자는 **기준 요약 1개**를 고정해 설명할 수 있어야 한다.

---

### 6) 문서 생성 모달 매핑이 클라이언트 하드코딩

**현상**

- `DocumentCreateModal`이 문서 종류·질문셋/템플릿 **버전**을 **클라이언트 상수**로 둔다. 정책 변경 시 **프론트 재배포** 의존.

**해결 — 서버/DB 기준**

**1단계**

- `GET/POST` 등: `/api/cases/[caseId]/documents/options` (이름은 구현에 맞게)
- **문서 종류**, **질문셋 코드·버전**, **템플릿 코드·버전**, **생성 가능 여부**를 응답.

**2단계**

- 모달은 **서버가 준 옵션만** 렌더.

**완료 기준**

- `DOCUMENT_OPTIONS` **하드코딩**을 **줄이거나 제거**.
- 문서 생성 정책을 **서버 단일 기준**으로 설명 가능.

---

## 2. Batch로 묶은 실행 계획

### Batch A — 즉시 (버그·혼선 제거)

- 인터뷰 **권한 정책** 통일 (§1 **권장안 A 또는 B** 선행 확정)
- 승인·잠금 **UI ↔ API** 권한 통일 (§2)
- 승인 API **`ARCHIVED` 차단** (§2)
- 응답 포맷 **1차** 통일 (§4) — **최소한** 위 엔드포인트·클라이언트부터

Batch A **실행**은 `BATCH_A_FILE_ORDER_V1.md` (인터뷰 **안 A**, 승인·잠금 **`SUPER_ADMIN`**, 응답 **`ok`**)에 적힌 **A-1~A-4**·**검증** 순서를 따른다.

### Batch B — 발표 직후 체감

- 요약 **저장 스냅샷** (§5 2단계)
- 승인·잠금 **후 안내** 문구 개선
- **실패 메시지** 문장 정리 (응답 통일과 시너지)

### Batch C — 구조 고도화

- 문서 생성 **옵션 서버화** (§6)
- **상태 전이** 공통 service화 (§3과 연계)
- **운영자용** 설정·문서 타입 정책화 (선행 설계)

---

## 3. 이 문서의 완료 정의(문서 자체)

- [ ] §1 **정책 분기(인터뷰 A/B, 승인 역할)** 를 **제품/운영**에서 **한 줄**로 확정하고 본 문서에 **기입**·**날짜** 남김
- [ ] Batch A 항목이 **PR·커밋** 단위로 **이슈/티켓**에 연결됨
- [ ] `IMPLEMENTATION_EVIDENCE.md`에 Batch A **완료** 시 **검증**·**수정 파일** **기록**

---

## 4. 한 줄로

**권한·상태·응답**은 **먼저** 한 선으로 맞추고, **요약 스냅**과 **문서 옵션 서버화**는 **그다음** 확장·고도화로 가져간다.
