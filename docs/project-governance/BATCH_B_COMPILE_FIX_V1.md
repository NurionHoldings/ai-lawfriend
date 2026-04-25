# AI법친 Batch B 컴파일 오류 예상/수정법 세트

**문서 ID:** AIBEOPCHIN-BATCH-B-COMPILE-FIX-V1  
**상태:** Draft v1  
**목적:** [BATCH_A_FINAL_AND_BATCH_B_V1.md](./BATCH_A_FINAL_AND_BATCH_B_V1.md) 의 Batch B 반영 직후 발생할 가능성이 높은 컴파일/타입/초기 런타임 오류를 파일별로 예측하고, 즉시 수정 가능한 대응법을 제공한다.

**적용 대상:**

- `src/lib/auth/*`
- `src/app/api/cases/[caseId]/question-set/route.ts`
- `src/app/api/cases/[caseId]/interview/route.ts`
- `src/app/api/documents/[documentId]/route.ts`
- `src/app/api/documents/[documentId]/paragraphs/route.ts`
- `src/app/(protected)/documents/[documentId]/page.tsx`
- `src/app/api/documents/[documentId]/request-approval/route.ts` *(신규 추가 시 또는 `review` 등 기존 경로와 정합)*
- `src/app/api/documents/[documentId]/verification/route.ts` *(신규 추가 시 — 본선은 `document-verification` 서비스·공개 API가 별도일 수 있음)*

**중요 원칙:**

- Batch B 오류는 대부분 **relation 이름 불일치**, **권한 유틸 구조 불일치**, **문서/질문셋 모델명 불일치**에서 발생한다.
- 상태 관련 오류가 보이면 먼저 **Batch A canonical 정렬**이 유지되는지 확인한다.
- **`npm run verify:canonical-sources`** 는 Batch B에서도 함께 기록하되, Batch B의 주 오류는 주로 **status보다 relation / DTO / UI fetch 구조**에서 난다.
- **`check-status`** 는 휴리스틱이므로 경고 건수만으로 실패를 단정하지 않는다.

---

## 0. 현행 저장소와의 정합 (읽고 패치할 것)

| 문서/패치 가정 | 본선 AI법친 |
|----------------|-------------|
| `prisma.interviewAnswer` · `caseId_questionId` | 스키마에 **`InterviewAnswer` 모델이 없을 수 있음**. 답변은 **`Interview.answersJson`** 및/또는 **타임라인 메모 JSON** (`case-interview.service`) 에 저장되는 패턴이 있음 → Batch B에서 테이블 추가 전에는 **예시 upsert 코드가 그대로 컴파일되지 않음**. |
| `CaseQuestionSetBinding` | **별도 모델 없음**일 수 있음 — `Interview.questionSetId` / 활성 `QuestionSet` 조회. |
| `prisma.document` + `template` + `paragraphs` relation | 타임라인 문서는 **`CaseTimelineMemo`** 등 **서비스 레이어**(`documentDetailService`) — Prisma 모델명이 **`Document`가 아님** |
| 문단 API | 법률 문서는 **`LegalDocumentParagraph`** (`sectionKey`, `displayOrder` 등) — **`order`** 가 아닐 수 있음 |
| `GET /api/documents/[id]` 응답 | **`NextResponse.json({ document })`** 형태 — `{ success, data }` 가 아닐 수 있음 → UI는 **`json.document`** 접근 확인 |
| 승인 요청 | **`POST /api/documents/[documentId]/review`** 가 이미 있을 수 있음 — `request-approval` 신규 시 **중복·enum** 정합 필요 |
| 검증 메타 | **`prisma.verification`** 테이블이 없을 수 있음 — 검증은 **버전·해시 기반 서비스** (`document-verification`) |

---

## 1. 반영 직후 권장 점검 순서

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 tools/aibeopchin_navigator.py check-status --scope case
```

추가 권장: 질문셋·인터뷰·문서 상세·문단 API를 **수동 호출**해 응답 shape를 확인한다.

**오류 처리 우선순위:**

1. auth 공통 유틸 import/export 오류  
2. 질문셋/인터뷰 **실제 저장 구조**와 패치 예시 불일치  
3. 문서 상세 **서비스/repository** include·relation 오류  
4. 문단 패널 accessor·정렬 필드 오류  
5. `page.tsx` fetch/props/`useEffect` 타입 오류  
6. 승인 요청·검토 route의 **문서 상태 enum** 불일치 (`LegalDocumentStatus` vs 타임라인 문서 상태 문자열)  
7. verification 메타 **unique/relation** — 스키마 부재 시 조회 방식 변경  

---

# 2. 최상위 공통 오류 묶음

## ERR-B-COMMON-01 auth 유틸이 Response를 throw해서 타입이 꼬임

(원문과 동일 — **해결:** `getSessionUser()` → null 이면 route에서 `401` 반환.)

### grep 키워드

`requireAuth(`, `throw fail(`, `UNAUTHORIZED`

---

## ERR-B-COMMON-02 include relation 이름이 실제 schema와 다름

(원문과 동일.)

**본선 보강:** `QuestionSet` 의 질문 목록은 **`questions` relation이 아니라 `Json` 컬럼**일 수 있음 — `schema.prisma` 의 `QuestionSet` 확인.

### grep 키워드

`include: {`, `questionSetVersion`, `questions`, `template`, `paragraphs`, `approval`

---

## ERR-B-COMMON-03 복합 unique 키 이름 불일치

(원문과 동일 — `findFirst` + `update`/`create` 대체.)

**본선:** `InterviewAnswer` 테이블이 없으면 이 오류 대신 **“모델 없음”** 이 먼저 난다 → 저장 방식을 **기존 서비스**에 맞출 것.

---

## ERR-B-COMMON-04 page.tsx에서 any/nullable 문제

(원문과 동일.)

**본선:** fetch 응답이 `{ document }` 인지 `{ data: { document } }` 인지 **실제 API 한 건만이라도 Network 탭으로 확인** 후 접근자 통일.

---

# 3. 파일별 오류 예상/수정법

## FILE-B-01 `src/lib/auth/*`

### ERR-B-01-01 getSessionUser export/import

본선에서 흔한 경로:

- `@/lib/auth/session` — `getSessionUser`
- `@/lib/get-session-user` — re-export
- `@/lib/auth/require-session-user` — `requireSessionUser`

**수정법:** 한 프로젝트 안에서 **세션 조회 진입점을 하나로 정하고** 나머지는 re-export로 맞춘다.

### ERR-B-01-02 require-case-access와 스키마 필드

예시의 `clientId` / `assigneeId` 는 **`Case` 모델과 불일치**할 수 있음. 본선은 `ownerUserId`, `assignedLawyerUserId`, `assignedStaffUserId`, `CaseAssignment` 등을 사용 — **`getCaseAccessContext`** (`features/cases/case.permissions.ts`) 재사용 권장.

---

## FILE-B-02 `question-set/route.ts`

### ERR-B-02-01 ~ B-02-03

(원문 유지: 바인딩 모델 없음, questions가 JSON, completion 계산.)

**본선:** `getCaseInterviewQuestionSetService` 기반으로 이미 동작 중이면, Batch B는 **응답 필드명·버전 고정 정책**만 맞추면 컴파일 오류가 줄어든다.

---

## FILE-B-03 `interview/route.ts`

### ERR-B-03-01 interviewAnswer 모델 없음

**메시지:** `Property 'interviewAnswer' does not exist on type 'PrismaClient'`

**수정법:** `saveInterviewAnswer` / `case-interview.service` 의 **실제 저장 경로**로 통합. 새 테이블을 도입할 때만 `prisma migrate` 후 accessor 추가.

### ERR-B-03-02 ~ B-03-03

(원문 유지 — 값 normalize, `$transaction` 배열 대신 `for` 루프.)

---

## FILE-B-04 `documents/[documentId]/route.ts`

### ERR-B-04-01 ~ B-04-03

(원문 유지.)

**본선:** `documentDetailService.getDocumentDetail` 이 Prisma `document` 모델을 쓰지 않을 수 있음 — **include 수정은 repository/service 쪽**과 함께 할 것.

---

## FILE-B-05 `documents/[documentId]/paragraphs/route.ts`

### ERR-B-05-01 ~ B-05-02

(원문 유지.)

**본선:** `DocumentParagraph` 테이블은 **`CaseTimelineMemoParagraph`** 로 매핑(`@@map("DocumentParagraph")`) 등 **이름이 혼동되기 쉬움** — repository에서 쓰는 delegate 확인.

---

## FILE-B-06 `(protected)/documents/[documentId]/page.tsx`

### ERR-B-06-01 ~ B-06-03

(원문 유지.)

**본선 강조:** API가 `{ document }` 를 주면 `json.document` — **`json.data.document`** 로 고정하면 런타임 undefined.

---

## FILE-B-07 `request-approval/route.ts`

### ERR-B-07-01 `REVIEW_PENDING` vs `REVIEW_REQUIRED`

타임라인 문서와 **법률 문서(`LegalDocument`)** 의 상태 enum이 다름. 문자열 **`REVIEW_PENDING`** 은 **사건 `CaseStatus`** 쪽에 가깝고, 법률 문서는 **`LegalDocumentStatus.REVIEW_REQUIRED`** 일 수 있음.

**수정법:** 수정하는 route가 **어느 문서 도메인**인지 먼저 고른 뒤 enum 일치.

### ERR-B-07-02 paragraphs relation

본선은 **별도 count 쿼리** 또는 **서비스 메서드**로 문단 수 확인이 안전.

---

## FILE-B-08 `verification/route.ts`

### ERR-B-08-01 ~ B-08-02

(원문 유지.)

**본선:** `prisma.verification` 이 없으면 **404 route 추가 자체가 의미 없음** — `documentVerificationRepository` / 공개 `POST /api/document-verification` 과 연결하는 방식으로 설계.

---

# 4. 런타임 동작 오류 예상

(원문 RUN-B-01 ~ RUN-B-05 유지.)

**본선 RUN-B 추가:** 질문셋은 200인데 **`questions` 가 JSON 문자열**이라 파싱 전에 빈 배열로 보이는 경우 → `JSON.parse` 또는 서비스 레이어에서 이미 파싱된 형태인지 확인.

---

# 5. 가장 먼저 볼 grep 키워드 묶음

(원문 §5 유지.)

추가: `answersJson`, `CaseTimelineMemo`, `LegalDocument`, `LegalDocumentParagraph`, `displayOrder`, `documentDetailService`.

---

# 6. 빠른 복구 우선순위

(원문 §6 유지.)

0. **스키마에 없는 모델을 가정한 Batch B 예시 코드 제거 또는 마이그레이션으로 뒷받침** (본선 추가 항목)

---

# 7. 개발팀용 즉시 대응 템플릿

(원문 §7 유지.)

---

# 8. Evidence 기록 블록

`IMPLEMENTATION_EVIDENCE.md`에 남길 때 **명령은 본선 기준**으로 적는다.

```md
## [BATCH-B-COMPILE-01] auth/question-set/interview 오류 대응
- 수정 파일:
  - ...
- 검증 명령:
  - npx tsc --noEmit
  - npm run lint
  - npm run verify:canonical-sources
  - py -3 tools/aibeopchin_navigator.py check-status --scope case
- 검증 결과:
  - [작성 필요]
- 근거 메모:
  - ...

## [BATCH-B-COMPILE-02] document/paragraph/page/request-approval/verification 오류 대응
- 수정 파일:
  - ...
- 검증 명령: (동일)
- 검증 결과:
  - [작성 필요]
- 근거 메모:
  - ...
```

---

# 9. 결론

Batch B에서 가장 흔한 실패는 원문의 다섯 가지에 더해, 본선에서는 **여섯 번째**로 **“스키마에 없는 예시 모델/관계를 그대로 붙여 넣은 경우”** 가 자주 겹친다.

1. auth 공통 유틸 export/import 구조 불일치  
2. 사건–질문셋–버전 relation/JSON 구조 불일치  
3. interview answer 테이블 가정과 실제 저장 방식 불일치  
4. 문서 상세·문단이 **타임라인 문서 vs LegalDocument** 로 이원화된 것과 패치 예시 불일치  
5. request-approval·approve·검토 route 간 **상태 enum 축** 불일치  
6. verification **테이블 가정**과 실제 **document-verification** 구현 불일치  

다음 단계는 **Batch B 오류 대응 후 최종 정리** 또는 **Batch C** 로 자연스럽게 이어진다.

---

## 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| Draft v1 | 2026-04-19 | 초안. Batch B 컴파일·타입·런타임 대응, 본선 §0·명령 반영 |

## 관련 문서

- [BATCH_A_FINAL_AND_BATCH_B_V1.md](./BATCH_A_FINAL_AND_BATCH_B_V1.md)
- [BATCH_A_COMPILE_FIX_V1.md](./BATCH_A_COMPILE_FIX_V1.md)
- [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)
