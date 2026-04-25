# AI법친 Batch B 오류 대응 후 최종 정리 패치

**문서 ID:** AIBEOPCHIN-BATCH-B-FINAL-CLEANUP-V1  
**상태:** Draft v1  
**목적:** Batch B 반영 중 발생한 auth / relation / response shape / 승인·검토 / 검증 관련 오류를 정리하고, 질문셋–인터뷰–문서 상세–문단 패널–승인 요청–검증 메타 흐름을 정의서 기준으로 최종 정렬한다.

**기준 문서:**

- API 명세 1차본 (`API_SPEC_V1.md`)
- 정의서 대비 구현 역점검표 (`ALIGNMENT_AUDIT_V1.md`)
- 파일별 재정렬 패치 지시서 (`FILE_REALIGN_PATCH_V1.md`)
- [BATCH_A_FINAL_AND_BATCH_B_V1.md](./BATCH_A_FINAL_AND_BATCH_B_V1.md)
- [BATCH_B_COMPILE_FIX_V1.md](./BATCH_B_COMPILE_FIX_V1.md)

**핵심 원칙 (목표 아키텍처):**

| # | 축 | 목표 |
|---|----|------|
| 1 | 사건–질문셋 | **사건에 고정된 질문셋 버전** (스키마상 바인딩 테이블·필드가 생기면 그것을 truth source) |
| 2 | 인터뷰 저장 | **answers 구조** 일관 (본선은 JSON 맵·타임라인 메모 등 실제 구현과 정의서의 `answers[]` 표현을 맞출 것) |
| 3 | 문서 상세 | **paragraphs** 를 렌더링 기준 (타임라인 문서 축 vs **LegalDocument** 축이 있으면 문서 도메인별로 분리 명시) |
| 4 | 승인 요청 | **승인 요청 단계** 분리 (`request-approval` 신설 또는 기존 **`review`** API와 역할 통일) |
| 5 | 검증 메타 | 승인 이후 생성되는 검증 정보 — **`Verification` Prisma 모델**이 없으면 **`document-verification` 서비스** 기준으로 문서화 |

**공통:**

- 상태 관련 완료 판정은 **`npm run verify:canonical-sources`** 와 **`check-status`** 기록을 함께 남긴다.
- **`check-status`** 는 휴리스틱이므로 **경고 건수만으로 상태 오류를 단정하지 않는다.**

---

## 0. 현행 저장소와의 정합 (반드시 읽을 것)

| 문서 예시 | 본선 AI법친 |
|-----------|-------------|
| `require-case-access` 의 `clientId` / `assigneeId` | **`Case`** 는 `ownerUserId`, `assignedLawyerUserId`, `assignedStaffUserId` 등 — **`getCaseAccessContext`** / **`assertCaseAccess`** 기존 패턴 재사용 권장 |
| `CaseQuestionSetBinding` · `loadCaseQuestionSet` | 스키마에 **없을 수 있음** — 마이그레이션 전에는 **`Interview`의 questionSet 필드 + 고정 버전 정책** 등으로 대체하고, latest fallback 제거만이라도 적용 |
| `DocumentStatus` · `REVIEW_PENDING` | Prisma **`LegalDocumentStatus`** 는 **`REVIEW_REQUIRED`** 등 실제 enum — 사건 **`CaseStatus`** 의 `REVIEW_PENDING` 과 **혼동 금지** |
| 문서 상세 `GET /api/documents/[id]` | 응답이 **`{ document }`** 인지 **`{ success, data }`** 인지 **실측 후** UI·문서를 하나로 통일 |
| `approve` 경로 | **`/api/legal-documents/[legalDocumentId]/approve`** 가 본선 — `request-approval` 정리 시 **같은 enum 축**으로 맞출 것 |
| `Verification` row | **전용 테이블이 없을 수 있음** — internal route는 **서비스/repository** 와 동일한 조회 키 사용 |

---

# 1. Batch B 최종 정리 목표

Batch B 반영 후 흔히 남는 문제:

1. auth 유틸이 route마다 다르게 호출됨  
2. question-set 이 **버전 고정**을 말하지만 실제로는 **최신 질문셋**을 참조함  
3. interview 의 저장은 맞지만 **completion / nextQuestionIds** 계산이 제각각임  
4. document detail 과 paragraphs route 가 **서로 다른 소스**를 사용함  
5. **승인 요청·검토** 과 **approve** 가 서로 다른 상태값을 기대함  
6. **internal verification** 과 공개 **`/api/document-verification`** 의 조회 기준이 다름  
7. **page.tsx** 가 API 응답 shape 와 맞지 않음  

이번 최종 정리는 **기능 확장**이 아니라, 위 연결을 **한 기준으로 수렴**시키는 것이 목적이다.

---

# 2. 최종 정리 우선순위

## B-CLN-01 auth 호출 방식 통일

- **대상:** `@/lib/auth/session`, `@/lib/get-session-user`, `@/lib/auth/require-session-user` 사용 route 일원화  
- **권장:** `throw Response` 금지 → `getSessionUser()` / `requireSessionUser()` 결과에 따라 route에서 **401** 명시  
- **예시 패턴:**

```ts
const sessionUser = await getSessionUser();
if (!sessionUser) {
  return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
}
```

`require-auth.ts` 를 thin wrapper 로 두려면 **실제 export 경로 하나**에만 두고 나머지는 re-export.

---

## B-CLN-02 case access 규칙 통일

- **권장:** 신규 `require-case-access.ts` 를 만들기보다 **`getCaseAccessContext`**, **`assertCaseAccess`** (`authz` + `case.permissions`) 로 정렬  
- 문서 route는 **documentId → caseId 조회 후** 동일 규칙 적용  

---

## B-CLN-03 question-set 을 latest 에서 binding 직접 참조로 고정

- **금지:** `questionSet.findFirst({ orderBy: updatedAt desc })` 만으로 사건 질문 결정  
- **허용:** (스키마 반영 후) `caseQuestionSetBinding` 또는 **`Interview.questionSetVersion` + `QuestionSet` id** 등 **사건에 저장된 키**  
- relation 이름은 **`schema.prisma`** 기준  

---

## B-CLN-04 interview 저장 구조·completion 표준화

- **answers[]** DTO 검증(zod)  
- completion: **전체 노출 질문 수 대비** 퍼센트 (분기 엔진과 `visibleQuestions` 기준 통일)  
- **`nextQuestionIds`**: 분기 엔진이 있으면 연결, 없으면 **빈 배열이라도 shape 고정**  

---

## B-CLN-05 질문셋 route 와 interview 의 질문 source 통일

- **원칙:** 인터뷰 저장·완료·진행률에 쓰는 질문 목록 = 질문셋 API가 내려주는 **동일 버전**  
- **후보 유틸:** `src/lib/interview/load-case-question-set.ts` — 단, **binding 모델이 없으면** 서비스 함수로 “고정 버전 로드”만 캡슐화  

---

## B-CLN-06 document detail truth source 를 paragraphs 로 확정

- **타임라인 문서:** `CaseTimelineMemo` + `DocumentParagraph` 매핑 — **body vs 문단** 혼용 시 UI는 **문단 배열** 우선  
- **LegalDocument:** `LegalDocumentParagraph` + `displayOrder` 정렬  
- page 는 **한 API 응답 규약**만 사용 (`json.document` vs `json.data` — **실측 후 통일**)

---

## B-CLN-07 detail / paragraphs route 의 정렬 필드 통일

- **원칙:** 상세·패널 모두 **동일 필드**로 `orderBy` (예: `orderIndex`, `displayOrder`)  

---

## B-CLN-08 request-approval 과 approve 의 상태 enum 동기화

- **타임라인 문서** vs **LegalDocument** 별로 enum 이 다르면 **라우트 파일을 도메인별로 분리**하고 상수도 분리  
- 본선 법률문서: **`LegalDocumentStatus`** (`DRAFT`, `REVIEW_REQUIRED`, `APPROVED` …) — `@prisma/client` 기준 상수화 권장  
- **`DOCUMENT_STATUS` 예시의 `REVIEW_PENDING`** 은 **사건 상태**에 가깝고 법률문서와 다를 수 있음 → 파일 `document-status.ts` 추가 시 **enum 명과 일치**시킬 것  

---

## B-CLN-09 verification internal / public 조회 기준 통일

- **공개:** `POST /api/document-verification` (또는 `/api/verification/verify` 별칭) — **verificationCode**  
- **내부:** documentId 기준이면 **서비스**가 사용하는 테이블/버전 id 와 동일한 키로 조회  
- `findUnique({ where: { documentId } })` 가 불가하면 **`findFirst`**

---

## B-CLN-10 page.tsx 응답 shape / 타입 정렬

- **금지:** API 형식 확인 없이 `json.data.document` 만 가정  
- **권장:** `DocumentDetailDto` 를 **실제 fetch 응답**에 맞춰 정의하고, nullable·`paragraphs` 배열 처리  

---

# 3. 파일별 최종 정리 패치 포인트

| ID | 대상 | 포인트 |
|----|------|--------|
| FILE-BF-01 | `get-session-user` / session | export 단일화 |
| FILE-BF-02 | `require-auth` | thin wrapper, throw 금지 |
| FILE-BF-03 | 사건 접근 | `getCaseAccessContext` 등 기존 함수 활용 |
| FILE-BF-04 | `question-set/route.ts` | 버전 고정, completion |
| FILE-BF-05 | `interview/route.ts` | DTO, 동일 question source, 저장 경로 |
| FILE-BF-06 | `documents/.../route.ts` | 서비스·paragraph truth source |
| FILE-BF-07 | `documents/.../paragraphs/route.ts` | accessor·orderBy 통일 |
| FILE-BF-08 | `documents/.../page.tsx` | fetch shape·타입 |
| FILE-BF-09 | `request-approval` 또는 `review` | 문단 검증·상태 enum·감사 |
| FILE-BF-10 | `verification` 내부 조회 | 서비스와 동일 소스 |

---

# 4. Batch B 최종 정리용 공용 helper 후보

| 파일 | 용도 |
|------|------|
| `src/lib/interview/normalize-answer-value.ts` | 답변 `unknown` → 저장 형식 |
| `src/lib/interview/calc-completion.ts` | answered / total → 퍼센트 |
| `src/lib/documents/legal-document-status.ts` | **`LegalDocumentStatus`** 상수 (스키마와 1:1) |

> 일반 `DOCUMENT_STATUS` 로 **사건·문서 enum을 섞지 말 것.** 필요 시 `case-status.ts` vs **법률문서** 파일을 분리한다.

---

# 5. Batch B 최종 정리 후 검증 순서

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 tools/aibeopchin_navigator.py check-status --scope case
```

**시나리오 (문서 §5 원문 유지, 본선에 맞게 경로만 조정):**

- 승인 플로우 확인 시 **`/api/legal-documents/...`** 경로 포함 여부 결정  

---

# 6. Evidence 기록 블록

`IMPLEMENTATION_EVIDENCE.md`에 복사해 사용한다. 명령은 본선 기준이다.

```md
## [BATCH-B-FINAL-01] auth / question-set / interview 최종 정리
- 수정 파일:
  - (실제 경로)
- 검증 명령:
  - npx tsc --noEmit
  - npm run lint
  - npm run verify:canonical-sources
  - py -3 tools/aibeopchin_navigator.py check-status --scope case
- 검증 결과:
  - [작성 필요]
- 근거 메모:
  - auth 호출 통일
  - 질문셋 버전 source 통일
  - completion 퍼센트·질문 source 통일

## [BATCH-B-FINAL-02] document / paragraphs / 승인·검증 / UI 최종 정리
- 수정 파일:
  - (실제 경로)
- 검증 명령: (동일)
- 검증 결과:
  - [작성 필요]
- 근거 메모:
  - paragraphs truth source
  - LegalDocumentStatus·검토·승인 정합
  - verification internal/public 소스 통일
```

---

# 7. 다음 단계 연결

1. **Batch C** — middleware, 사건/인터뷰 UI, summary, 문단 versions/diff, check-status 설명 등 ([FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) Batch C 참고)  
2. **실레포 diff 패치본** — 본 문서·Batch A/B 문서를 실제 파일 줄번호에 매핑  

---

# 8. 결론

Batch B 최종 정리의 핵심은 다음 네 가지다.

1. **auth·사건 접근 호출 단일화** (기존 `getCaseAccessContext` 활용 권장)  
2. **question-set / interview 가 동일한 질문·버전 source 사용** (latest fallback 제거)  
3. **문서 도메인별로 truth source를 paragraphs(또는 동등 문단 배열)로 고정**  
4. **승인 요청·승인·검증** 이 **같은 enum·같은 서비스 소스**를 참조  

네 가지가 정리되면 이후 기능 추가 시 정의서 기준으로의 흔들림이 줄어든다.

---

## 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| Draft v1 | 2026-04-19 | 초안. Batch B 최종 정리·검증·Evidence |

## 관련 문서

- [BATCH_B_COMPILE_FIX_V1.md](./BATCH_B_COMPILE_FIX_V1.md)
- [BATCH_A_FINAL_AND_BATCH_B_V1.md](./BATCH_A_FINAL_AND_BATCH_B_V1.md)
- [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)
