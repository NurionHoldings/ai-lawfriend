# AI법친 Batch A 컴파일 오류 예상/수정법 세트

**문서 ID:** AIBEOPCHIN-BATCH-A-COMPILE-FIX-V1  
**상태:** Draft v1  
**목적:** Batch A(사건 상태·전이·요약·문서·검증 등) 반영 직후 발생할 가능성이 높은 컴파일/타입/런타임 초기 오류를 파일별로 예측하고, 즉시 수정 가능한 대응법을 제공한다.

**적용 대상(명세상 경로):**

- `prisma/schema.prisma`
- `src/lib/definitions/case-status.ts`
- `src/app/api/cases/route.ts`
- `src/app/api/cases/[caseId]/route.ts`
- `src/app/api/cases/[caseId]/transition/route.ts`
- `src/app/api/cases/[caseId]/interview/complete/route.ts`
- `src/app/api/cases/[caseId]/summary/generate/route.ts`
- `src/app/api/cases/[caseId]/documents/route.ts`
- `src/app/api/paragraphs/[paragraphId]/regenerate/route.ts`
- `src/app/api/paragraphs/[paragraphId]/lock/route.ts`
- `src/app/api/approvals/[documentId]/approve/route.ts`
- `src/app/api/documents/[documentId]/delivery/route.ts`
- `src/app/api/verification/verify/route.ts`
- `src/app/api/admin/verify-canonical-sources/route.ts`

---

## 0. 현행 저장소 경로 매핑 (명세 템플릿 ↔ 본선)

| 명세/패치 예시 경로 | 본선 AI법친에서의 대응 |
|---------------------|-------------------------|
| `PATCH .../cases/[caseId]/status` 와 별도 `transition` | `PATCH /api/cases/[caseId]/status` 유지 + **`POST /api/cases/[caseId]/transition`** (동일 본문) |
| `approvals/[documentId]/approve` | **`/api/legal-documents/[legalDocumentId]/approve`** |
| `documents/[documentId]/delivery` | **`/api/legal-documents/[legalDocumentId]/delivery`** (의뢰인 전달·사건 `DELIVER_DOCUMENT` 전이) |
| `paragraphs/[paragraphId]/regenerate` · `lock` | **`/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/...`** (별칭 라우트 미구성 시 여기가 본선) |
| `CaseSummary` · `contentJson` 저장 | 스키마에 `CaseSummary` 없을 수 있음 → **`summary/generate`는 응답만 생성**하는 패턴도 허용 |
| `@/lib/api/response` 의 `ok`/`fail` | 본선은 **`@/lib/api-response`** (`ok`, `created`, `fail`, `handleApiError`) 또는 **`@/lib/domain-api-response`** (`ok`, `toErrorResponse`) 혼용 → import 통일 |

**중요 원칙:**

- 상태 관련 오류는 반드시 **`prisma/schema.prisma`** 와 **`src/lib/definitions/case-status.ts`** 를 먼저 대조한다.
- **`npm run verify:canonical-sources`** 가 실패하면(본선 스크립트는 **파일 존재** 검사) 다른 파일 오류를 먼저 고치지 말고, 누락 파일·경로부터 해결한다.
- **enum 문자열 일치** 검사는 선택적으로 **`POST /api/admin/verify-canonical-sources`** (`src/lib/verify-canonical-case-status-align.ts`) 를 사용한다.
- **`check-status`** 경고는 휴리스틱이므로 컴파일 오류와 섞어서 해석하지 않는다.

---

## 1. 반영 직후 권장 점검 순서 (본선 명령)

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
```

`check-status` (선택, Windows에서는 `py -3` 또는 `python`):

```bash
py -3 tools/aibeopchin_navigator.py check-status --scope case
```

**오류 처리 우선순위:**

1. Prisma schema 오류  
2. enum/type mismatch 오류  
3. import/export 오류  
4. relation/include/select 오류  
5. route body/response 타입 오류  
6. placeholder 미치환 오류  
7. lint 경고·unused 변수 정리  

---

# 2. 최상위 공통 오류 묶음

## ERR-COMMON-01 Prisma Client가 새 필드를 모름

### 대표 메시지 예시

- `Property 'documentParagraph' does not exist on type 'PrismaClient'`
- `Unknown arg 'paragraphs' in include for type Document`
- `Object literal may only specify known properties`

### 원인

- `schema.prisma` 변경 후 `prisma generate` 미실행  
- relation/model 추가는 했지만 Prisma Client가 갱신되지 않음  

### 즉시 수정법

1. `npx prisma validate`  
2. `npx prisma generate`  
3. 타입 서버·Next dev 재시작  
4. 여전히 안 되면 model/relation 이름이 실제 schema와 코드에서 불일치하는지 점검  

### grep 키워드

- `documentParagraph`
- `legalDocumentParagraph`
- `paragraphs`
- `approval`
- `verification`
- `delivery`

---

## ERR-COMMON-02 enum 값이 타입과 안 맞음

### 대표 메시지 예시

- `Type '"INTAKE_PENDING"' is not assignable to type 'CaseStatus'`
- `Property 'REVIEW_PENDING' does not exist on type ...` (문서 도메인은 `LegalDocumentStatus` 의 **`REVIEW_REQUIRED`** 등 실제 enum 확인)

### 원인

- `case-status.ts` 와 Prisma `CaseStatus` 불일치  
- 문서 예시 상태값·문서 상태 enum 혼동  

### 즉시 수정법

1. `prisma/schema.prisma` 의 `enum CaseStatus` 를 먼저 기준으로 확정  
2. `src/lib/definitions/case-status.ts` 의 `CaseStatusEnum`(zod) 배열을 **동일 값**으로 맞춤  
3. route·서비스의 문자열 literal 전수 검색 후 canonical 값으로 교체  

### grep 키워드

- `'CREATED'`, `'IN_INTERVIEW'`, `'INTERVIEW_DONE'`, `'DRAFTING'`, `'REVIEW_PENDING'`
- 법률문서: `'DRAFT'`, `'REVIEW_REQUIRED'`, `'APPROVED'`, `'LOCKED'`

---

## ERR-COMMON-03 Response helper import 실패

### 대표 메시지 예시

- `Cannot find module '@/lib/api/response'`
- `Module has no exported member 'ok'`

### 원인

- 보조 유틸을 만들지 않았거나 경로가 다름  
- 본선은 `@/lib/api-response` / `@/lib/domain-api-response` 사용  

### 즉시 수정법

1. 패치 예시의 `@/lib/api/response` 를 **`@/lib/api-response`** 또는 실제 사용 중인 helper로 치환  
2. route 간 응답 형식(`{ success, data }` vs `{ ok, data }`)을 한 축으로 맞춤  

### grep 키워드

- `from '@/lib/api/response'`
- `from "@/lib/api-response"`
- `domain-api-response`

---

## ERR-COMMON-04 unused 변수 / lint 실패

### 대표 메시지 예시

- `'reason' is assigned a value but never used`

### 원인

- 패치 예시에서 TODO placeholder 유지  

### 즉시 수정법

1. 감사로그·타임라인에 연결  
2. 당장 연결하지 못하면 `void reason` 등으로 명시적 무시(팀 규칙에 따름)  

---

# 3. 파일별 오류 예상/수정법

## FILE-001 `prisma/schema.prisma`

(ERR-001-01 ~ 04: enum 중복·relation 양방향·테이블명 충돌·`@default` 값 — 사용자 문서와 동일)

본선 참고: `Case` 기본 상태는 **`CREATED`** 등 실제 enum을 확인할 것. 임의로 `INTAKE_PENDING` 만 넣어 `@default` 하면 검증 실패한다.

---

## FILE-002 `src/lib/definitions/case-status.ts`

(ERR-002-01 ~ 02: export 충돌·Prisma와 로컬 타입 — 사용자 문서와 동일)

본선은 **`CaseStatusEnum = z.enum([...])`** 형태. 관리자 canonical API의 파서는 이 패턴을 전제로 한다(`verify-canonical-case-status-align.ts`). 구조를 바꿀 경우 해당 정규식도 함께 수정한다.

---

## FILE-008 `src/app/api/cases/route.ts`

### ERR-008-01 ~ 03

본선 `cases/route.ts`는 **`createCaseService` / `listCasesService`** 를 사용한다. 패치 예시의 `caseType`·`clientId`·`summary` 는 **`model Case`** 에 없으면 타입 오류가 난다 — 실제 필드명은 `ownerUserId`, `title`, `description` 등을 확인한다.

---

## FILE-009 `src/app/api/cases/[caseId]/route.ts`

### ERR-009-01 include 관계명

본선 상세(풀 include)는 **`GET /api/cases/[caseId]/detail`** 쪽 직렬화를 주로 쓴다. `[caseId]/route.ts` 는 **서비스+`caseSelect`** 기반이라 relation 예시와 다를 수 있다.

### ERR-009-02 PATCH 빈 객체

`updateCaseService` 는 **빈 입력** 시 `ValidationError` 를 던지도록 되어 있다. 패치 예시의 `fail` 직접 반환과 중복되지 않게 할 것.

---

## FILE-010 `src/app/api/cases/[caseId]/transition/route.ts`

### ERR-010-01 action 타입

본선은 **`LifecycleActionEnum`(zod)** + **`.strict()`** 로 `action` 을 좁힌다. `status` 키는 **400** 으로 거절한다.

### ERR-010-02 전이 map

실제 전이는 **`src/lib/definitions/case-lifecycle.ts` 의 `CASE_TRANSITIONS`** 와 **`checkCaseTransitionOrThrow`** 가 단일 기준이다. 별도 `resolveNextCaseStatus` map 만 두면 이중 정의가 된다.

---

## FILE-015 `src/app/api/cases/[caseId]/interview/complete/route.ts`

### ERR-015-01 relation 이름

본선은 **`completeCaseInterviewService`** 에서 **`Interview`**, 타임라인 메모 기반 답변 등 **실제 스키마명**을 사용한다. `interviewAnswers`·`questionSetBinding` 같은 예시명은 그대로 붙이지 말 것.

### ERR-015-02 interviewSession

스키마에 해당 모델이 없으면 **`prisma.interviewSession`** 호출은 컴파일 오류다. 본선은 **`Interview`** 테이블을 갱신한다.

---

## FILE-018 `src/app/api/cases/[caseId]/summary/generate/route.ts`

### ERR-018-01 caseSummary 미존재

본선 구현은 **DB 저장 없이** `listCaseInterviewAnswersService` 결과로 응답만 생성할 수 있다. `prisma.caseSummary` 를 쓰려면 **스키마 추가·마이그레이션**이 선행되어야 한다.

### ERR-018-02 sanitize 헬퍼

함수는 **동일 파일 상단** 또는 `src/lib/ai/` 등 공용 모듈로 옮겨 스코프 오류를 방지한다.

---

## FILE-021 `src/app/api/cases/[caseId]/documents/route.ts`

### ERR-021-01 본선 패턴

본선은 **`export { POST } from "./generate/route"`** 형태의 별칭일 수 있다. `documentTemplate`·`sections` relation 예시는 **`DocumentTemplate`** 이 JSON 기반(`definitionJson`)인지 확인한다.

---

## FILE-024 / FILE-025 `paragraphs/[paragraphId]/...`

본선 **기본 경로**는 아래이다.

- `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/regenerate/route.ts`
- `src/app/api/legal-documents/[legalDocumentId]/paragraphs/[paragraphId]/lock/route.ts`

`paragraphId` 만으로 라우트를 만들 경우 **`legalDocumentId` 조회** 또는 공용 핸들러 추출이 필요하다.

---

## FILE-029 `approvals/[documentId]/approve/route.ts`

본선: **`src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`**

- 문서 상태는 **`LegalDocumentStatus`** (`REVIEW_REQUIRED`, `APPROVED` 등).  
- `CURRENT_USER_ID` 대신 **`getSessionUser()` → `sessionUser.id`**.  

---

## FILE-031 `documents/[documentId]/delivery/route.ts`

본선: **`src/app/api/legal-documents/[legalDocumentId]/delivery/route.ts`**

- Prisma `Delivery` 모델이 없을 수 있음 → **타임라인 이벤트 + `applyCaseStatusTransition(DELIVER_DOCUMENT)`** 패턴.  
- `document.status` 는 **`APPROVED` / `LOCKED`** 등 실제 enum으로 비교한다.  

---

## FILE-033 `src/app/api/verification/verify/route.ts`

### ERR-033-01 재노출 경로

본선은 **`export { POST } from "../../document-verification/route"`** 처럼 **상대 경로 한 단계씩** 맞춘다. `../document-verification` 만으로는 `api/verification/` 기준으로 잘못될 수 있다.

### ERR-033-02 공개 응답

기존 **`documentVerificationService.verifyByCode`** 응답 구조를 따른다. ID·이름 노출 정책은 별도 검토.

---

## FILE-035 `src/app/api/admin/verify-canonical-sources/route.ts`

### ERR-035-01 Edge runtime

`fs` 를 쓰는 검증을 route에 넣었다면 파일 상단에:

```ts
export const runtime = "nodejs";
```

### ERR-035-02 정규식·`CaseStatusEnum` 형태

본선 `src/lib/verify-canonical-case-status-align.ts` 가 **`CaseStatusEnum = z.enum([...])`** 를 파싱한다. 형식 변경 시 이 모듈과 함께 수정한다.

### ERR-035-03 권한

본선은 **ADMIN / SUPER_ADMIN** 만 허용하는 예시가 있을 수 있다. 팀 정책에 맞게 조정한다.

---

# 4. 런타임 동작 오류 예상

(사용자 문서 RUN-01 ~ RUN-04 와 동일 논리.)

추가 본선 메모:

- 사건 상세 UI는 **`getAllowedCaseActions`** (`case-action-guard.ts`) 와 **`allowedLifecycleActions`**(서버)를 함께 참고할 수 있다. 둘이 어긋나면 **사실 관계(`computeCaseFacts`)** 부터 확인한다.

---

# 5. 가장 먼저 볼 grep 키워드 묶음

(사용자 문서 §5와 동일. 본선 추가: `LegalDocument`, `legalDocument`, `LifecycleActionEnum`, `applyCaseStatusTransition`.)

---

# 6. 빠른 복구 우선순위

1. `schema.prisma` 오류 전부 해결  
2. `npx prisma generate` 재실행  
3. `case-status.ts` 와 Prisma `CaseStatus` 정렬  
4. `npm run verify:canonical-sources` 통과(파일 존재)  
5. (선택) `POST /api/admin/verify-canonical-sources` 로 enum 문자열 일치  
6. `transition`·`status`·`applyCaseStatusTransition` 타입 정리  
7. `interview/complete`·서비스 레이어 relation 정리  
8. `summary/generate`·저장 여부 정리  
9. `legal-documents` 승인·전달·문단 라우트 정리  
10. unused/lint 정리  

---

# 7. 개발팀용 즉시 대응 템플릿

```md
## [오류 대응 기록]
- 오류 파일:
- 오류 메시지:
- 원인 분류:
  - schema / enum / import / relation / placeholder / response helper / 기타
- 수정 내용:
- 재검증 명령:
- 재검증 결과:
- 근거 메모:
```

---

# 8. 결론

Batch A 반영 직후 가장 흔한 실패는 다음 네 종류다.

1. **schema와 코드의 relation/model 이름 불일치**  
2. **canonical `CaseStatus`·법률문서 `LegalDocumentStatus` 값 불일치**  
3. **`prisma generate` 누락**  
4. **패치 예시 placeholder·타 프로젝트 경로 그대로 사용**  

따라서 실제 반영 시에는 기능 로직보다 먼저 **본선 §0 경로 매핑**, **`schema.prisma`**, **`case-status.ts`**, **실제 response/session 유틸** 을 확인한다.

---

## 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| Draft v1 | 2026-04-19 | 초안. Batch A 컴파일·타입·런타임 대응, 본선 경로·명령 반영 |

---

## 관련 문서

- [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) — 파일별 재정렬 패치 지시  
- [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) — 증빙 기록  
- `scripts/verify-canonical-sources.ts` — 파일 존재 검증  
- `src/lib/verify-canonical-case-status-align.ts` — enum·zod 배열 문자열 비교  
