# AI법친 Batch A 오류 대응 후 최종 정리 + Batch B 실코드 패치 세트

**문서 ID:** AIBEOPCHIN-BATCH-A-FINAL-B-BATCH-V1  
**상태:** Draft v1  
**목적:** Batch A 반영 중 발생한 오류를 정리한 뒤, 정의서 기준으로 이어지는 Batch B 실코드 패치 세트를 바로 적용 가능하도록 연결한다.

**기준 문서:**

- API 명세 1차본 (`API_SPEC_V1.md`)
- 정의서 대비 구현 역점검표 (`ALIGNMENT_AUDIT_V1.md`)
- 파일별 재정렬 패치 지시서 (`FILE_REALIGN_PATCH_V1.md`)
- Batch A 실제 코드 반영·컴파일 대응 (`IMPLEMENTATION_EVIDENCE.md`, `BATCH_A_COMPILE_FIX_V1.md`)

**핵심 원칙:**

- Batch A는 **canonical / status / action / server guard** 정렬이 목적이다.
- Batch B는 **인터뷰 저장·질문셋 버전·문서 상세·문단 패널·승인 요청·검증 메타**의 연결 정렬이 목적이다.
- 상태 관련 완료 판정은 항상 **`npm run verify:canonical-sources`** 와 **`check-status`** 기록을 함께 남긴다.
- **`check-status`** 는 휴리스틱이므로 **경고 건수만으로 오류를 단정하지 않는다.**

---

## 0. 현행 저장소 경로 매핑 (명세 템플릿 ↔ 본선)

| 문서상 경로·개념 | 본선 AI법친 |
|------------------|-------------|
| `approvals/[documentId]/approve` | **`/api/legal-documents/[legalDocumentId]/approve`** |
| `documents/[documentId]/delivery` | **`/api/legal-documents/[legalDocumentId]/delivery`** |
| `paragraphs/[paragraphId]/regenerate` · `lock` | **`/api/legal-documents/.../paragraphs/[paragraphId]/...`** |
| `documents/[documentId]` (타임라인 초안) | **`CaseTimelineMemo`** 등 — `document-detail` 서비스·`DocumentParagraph` 매핑 테이블 |
| 법률 문서(의뢰인 문서 워크플로) | **`LegalDocument`** + **`LegalDocumentParagraph`** |
| `CaseQuestionSetBinding` | 스키마에 **없을 수 있음** — 현재는 `Interview.questionSetId`·활성 `QuestionSet` 조회 패턴 → Batch B에서 바인딩 테이블 도입 여부 검토 |
| `prisma.document` | 본선은 **`LegalDocument`** / 타임라인 쪽과 **이중 도메인** — Batch B에서 “어느 문서 축”을 우선할지 결정 |
| 승인 요청 전용 `request-approval` | **미구현 시** 후보: 기존 **`POST /api/documents/[documentId]/review`** 와 역할 정합, 또는 신규 라우트 |
| `@/lib/api/response` 의 `fail` | 본선: **`@/lib/api-response`**, **`@/lib/domain-api-response`** (`ok`, `toErrorResponse`, `fail`) |

**전이 action 단일 기준:** `LifecycleActionEnum` · `CASE_TRANSITIONS` — 문서 예시의 `CaseTransitionAction` 별칭 파일을 새로 만들 경우 **이중 정의**가 되지 않게 `case-lifecycle.ts` 와 정합할 것.

---

# Part 1. Batch A 오류 대응 후 최종 정리 패치

## 1.1 목표

Batch A에서 넣은 패치가 컴파일은 되더라도 아래가 남을 수 있다.

1. 문자열 literal 상태값이 일부 route/UI에 남음  
2. response helper가 일부 route에만 적용됨  
3. relation 명 mismatch를 임시 우회해 구조가 제각각임  
4. 승인/전달/검증 route가 감사로그에 미약하게만 연결됨  
5. `TODO`, `void reason` 등 placeholder가 남음  

따라서 Batch A 최종 정리는 **기능 추가가 아니라** 흩어진 임시 대응을 **한 규칙으로 정렬**하는 단계다.

---

## 1.2 Batch A 최종 정리 우선순위

### A-CLN-01 status / action 문자열 literal 정리

- **대상:** Batch A에서 수정한 API·서비스, `case-form` 제외한 status 비교 UI  
- **조치:**  
  - 사건 상태: **`CaseStatus`(@prisma/client)** 또는 `case-status.ts`의 zod 타입과 **상수 참조**  
  - 전이: **`LifecycleAction`** + `evaluateCaseTransition` / `applyCaseStatusTransition` 경로와 중복 없이 유지  

### A-CLN-02 response helper 통일 (점진적)

- **대상:** 동일 도메인 내 route (예: 사건 API는 `api-response`, 도메인 일부는 `domain-api-response`)  
- **조치:** 한 축으로 맞추거나, **문서화된 예외**(공개 검증·관리자)만 별 형식 유지  

### A-CLN-03 placeholder 제거

- **대상:** `CURRENT_USER_ID`, 무의미한 `void reason`, 미연결 `TODO`  
- **조치:** `getSessionUser` / `writeAuditLog` (`@/lib/audit-log`) 연결  

### A-CLN-04 승인·전달 route 세션 연결

- **본선 파일:**  
  - `src/app/api/legal-documents/[legalDocumentId]/approve/route.ts`  
  - `src/app/api/legal-documents/[legalDocumentId]/delivery/route.ts`  
- **조치:** 이미 세션을 쓰는지 점검; 누락 시 401·`approvedById` 등 보정  

### A-CLN-05 relation 임시 우회 제거

- **원칙:** `schema.prisma` 의 relation 명과 `include`/`select` 정합. 다단계 쿼리는 **주석으로 이유** 남기기.  

### A-CLN-06 감사로그 최소 연결

- **유틸:** `writeAuditLog` (`src/lib/audit-log.ts`) — 필드명은 프로젝트 스키마(`actorUserId`, `entityType`, `entityId`, `metadata`)에 맞출 것.  
- **대상 후보:** 전이·인터뷰 완료·요약 생성·문단 재생성/잠금·승인·전달 (이미 타임라인만 있는 경우 감사와 역할 분리 명시)  

---

## 1.3 Batch A 최종 정리 파일별 보정 포인트

| ID | 파일 | 보정 포인트 |
|----|------|-------------|
| FILE-AF-01 | `src/app/api/cases/[caseId]/transition/route.ts` | `LifecycleActionEnum` + strict; `applyCaseStatusTransition` 단일 경로; 감사는 이미 타임라인에 있으면 중복 방지 |
| FILE-AF-02 | 인터뷰 완료는 **서비스** `completeCaseInterviewService` | `completedAt` 단일 생성·재사용은 서비스 내부에서 처리 |
| FILE-AF-03 | `src/app/api/cases/[caseId]/summary/generate/route.ts` | DB 저장 없으면 version 이슈 없음 → 공용 `sanitize`/`disclaimer` 는 `src/lib/ai/output-policy.ts` 로 분리 후보 |
| FILE-AF-04 | `src/app/api/cases/[caseId]/documents/route.ts` | `generate` 재노출만이면 로직은 `documents/generate/route.ts` 에 집중 |
| FILE-AF-05 | `legal-documents/.../paragraphs/.../regenerate` | AI 정책 helper 공용화; 이미 타임라인 이벤트 있으면 감사와 역할 구분 |
| FILE-AF-06 | `legal-documents/.../approve` | 세션 ID 사용 확인; `LegalDocumentStatus` 비교값 확정 |
| FILE-AF-07 | `legal-documents/.../delivery` | channel·recipient zod; 타임라인+전이 이미 있으면 감사 보강만 |
| FILE-AF-08 | `src/app/api/verification/verify/route.ts` | 재노출 시 응답 형식은 `document-verification` 과 동일 |
| FILE-AF-09 | `src/app/api/admin/verify-canonical-sources/route.ts` | `export const runtime = "nodejs"` 권장; 관리자 가드 유지; `verify-canonical-case-status-align.ts` 정규식 유지보수 |

### 신규 공용 helper 후보 (선택)

- `src/lib/ai/output-policy.ts` — `sanitizeLegalOverclaim`, `applySummaryDisclaimer` (summary/generate·문단 재생성에서 공유)  
- **주의:** `src/lib/cases/action-guards.ts` 에 `START_INTERVIEW` 등을 새로 정의하면 **`LifecycleActionEnum` 과 충돌** — 필요 시 `case-lifecycle`에서만 export 하거나 thin wrapper만 둔다.  

---

## 1.4 Batch A 완료 판정 체크리스트

- [ ] `npx prisma validate` 통과  
- [ ] `npx prisma generate` 통과  
- [ ] `npx tsc --noEmit` 통과  
- [ ] `npm run lint` 통과  
- [ ] `npm run verify:canonical-sources` 통과  
- [ ] `py -3 tools/aibeopchin_navigator.py check-status --scope case` (또는 `python ...`) **기록** 완료  
- [ ] 사건 생성 시 **body로 status 직접 입력 불가** (서버 초기값)  
- [ ] 사건 상세 **PATCH** 에서 **status 수정 불가** (`updateCaseSchema.strict`)  
- [ ] **transition** 은 **action 기반**만 (`status` 키 거부)  
- [ ] 인터뷰 완료 시 **필수 질문 검증** (서비스)  
- [ ] 요약 생성 시 **고지문·과장 완화** (해당 route)  
- [ ] 문서 생성 시 **템플릿·문단 시드** (`generate` route)  
- [ ] **잠금 문단 재생성 차단**  
- [ ] **승인 후** 문단 잠금 정책과 정합  
- [ ] **승인 전 전달 차단**  
- [ ] 공개 검증 **응답 최소화** 정책 검토  
- [ ] `IMPLEMENTATION_EVIDENCE.md` 기록 완료  

---

# Part 2. Batch B 실코드 패치 세트

## 2.1 Batch B 범위

다음 파일군을 다룬다 (본선 경로 기준).

| 우선순위 | 경로 |
|----------|------|
| 인증·권한 | `src/lib/auth/*`, `src/lib/authz.ts`, `src/features/cases/case.permissions.ts` |
| 질문셋 | `src/app/api/cases/[caseId]/question-set/route.ts` |
| 인터뷰 | `src/app/api/cases/[caseId]/interview/route.ts`, `case-interview.service.ts` |
| 타임라인 문서 | `src/app/api/documents/[documentId]/route.ts`, `paragraphs/route.ts`, `(protected)/documents/[documentId]/page.tsx` |
| 검토·승인 흐름 | 기존 `documents/.../review`, `approval-review`; 법률문서는 `legal-documents/...` |
| 검증 메타 | `document-verification` 서비스·저장소 — 필요 시 `verification` 별칭과 정합 |

**목표:**

1. 사건–질문셋–버전 연결 고정 (스키마 부족 시 마이그레이션 후보 명시)  
2. 인터뷰 저장 구조·분기 처리 정렬  
3. 문서 상세·문단 패널·검토 패널 연결 (타임라인 문서 축 vs `LegalDocument` 축 구분)  
4. 승인 요청 단계 분리 (기존 `review` API와 용어 통일)  
5. 검증 메타 조회 구조 정렬  

---

## 2.2 FILE-B-01 `src/lib/auth/*`

- **목표:** `requireSessionUser`, `getCaseAccessContext`, `assertCaseAccess` 등 **이미 있는 유틸**을 Batch B route에서 일관 사용  
- **주의:** 예시의 `prisma.case.clientId` 는 본선 `Case` 모델과 불일치할 수 있음 → **`ownerUserId`·배정 필드** 기준으로 `require-case-access` 류를 설계  

---

## 2.3 FILE-B-02 `question-set/route.ts`

- **현행:** `getCaseInterviewQuestionSetService` — 활성 질문셋 중심  
- **Batch B:** 사건별 **고정 버전**(`Interview.questionSetVersion` 등) 우선 조회로 바꿀지 결정; `caseQuestionSetBinding` 테이블 없으면 **후속 마이그레이션** 항목으로 기록  

---

## 2.4 FILE-B-03 `interview/route.ts`

- **현행:** 답변 저장·플로우는 **서비스 + 타임라인 메모 JSON** 등 본선 패턴  
- **Batch B:** `answers[]` 표준화는 **기존 `saveInterviewAnswer` / validators** 와 정의서 필드명 정합  

---

## 2.5 FILE-B-04 ~ B-06 문서 상세·문단·페이지

- **`documents/[documentId]/route.ts`:** `documentDetailService` — body vs 문단 truth source 정책 문서화  
- **`documents/[documentId]/paragraphs/route.ts`:** 문단 패널 API 정렬  
- **`(protected)/documents/[documentId]/page.tsx`:** 좌 문단 / 우 본문 / 하단 검토·승인 CTA 레이아웃 (법률문서 상세 페이지와 **화면 우선순위표** 연동)  

---

## 2.7 FILE-B-07 승인 요청 (명세명 `request-approval`)

- **본선:** `POST /api/documents/[documentId]/review` 가 검토·상태 전환 담당 가능  
- **Batch B:** “승인 요청” 명칭을 API 경로·문서에 통일할지, `request-approval/route.ts` **신설**할지 선택  

---

## 2.8 FILE-B-08 검증 메타 `documents/.../verification`

- **본선:** 검증 코드는 **`documentVerificationService`** · 잠긴 버전 기반  
- **Batch B:** 문서 상세 내부에서 조회할 메타를 **기존 서비스**에서 끌어올지, 경량 GET route를 **신설**할지 결정  

---

# Part 3. Batch B 반영 순서

1. **auth·사건 접근** 공통 패턴 재확인 (`requireSessionUser`, `getCaseAccessContext`)  
2. **question-set** → **interview** 저장·버전 정책  
3. **documents (타임라인)** 상세·paragraphs·페이지  
4. **legal-documents** 승인·전달·문단과의 **용어·상태 enum** 정리  
5. **review / verification** 노출 정책  

---

# Part 4. Batch B 반영 후 검증 순서

```bash
npm run lint
npx tsc --noEmit
npm run verify:canonical-sources
py -3 tools/aibeopchin_navigator.py check-status --scope case
```

**시나리오 (정의서에 맞게 조정):**

1. 질문셋 조회가 **사건에 고정된 버전**을 반환하는가 (또는 로드맵상 허용 범위 명시)  
2. 인터뷰 답변 저장 후 플로우·필수 검증이 서버와 일치하는가  
3. 타임라인 문서 상세에서 문단 구조가 드러나는가  
4. 승인·검토·법률문서 워크플로가 서로 다른 ID 체계일 때 **사용자 혼동 방지** UI/문구가 있는가  

---

# Part 5. Evidence 기록 블록

`IMPLEMENTATION_EVIDENCE.md`에 아래 형식으로 남긴다.

```md
## [BATCH-A-FINAL-01] Batch A 오류 대응 후 최종 정리
- 수정 파일:
  - (실제 수정 파일 나열)
- 검증 명령:
  - npx prisma validate
  - npx prisma generate
  - npx tsc --noEmit
  - npm run lint
  - npm run verify:canonical-sources
  - py -3 tools/aibeopchin_navigator.py check-status --scope case
- 검증 결과:
  - (로그·exit 코드)
- 근거 메모:
  - placeholder 제거·세션·감사로그·response 정렬 요약

## [BATCH-B-01] 질문셋/인터뷰 저장 구조 정렬
- 수정 파일:
  - ...
- 검증 명령: (동일)
- 검증 결과:
  - ...
- 근거 메모:
  - 사건-질문셋 버전 연결·answers 구조

## [BATCH-B-02] 문서 상세/문단/승인·검증 연결
- 수정 파일:
  - ...
- 검증 명령: (동일)
- 검증 결과:
  - ...
- 근거 메모:
  - paragraphs truth source·승인 단계·검증 메타
```

---

# Part 6. 결론

1. **Batch A 최종 정리**로 placeholder·guard·audit·canonical 비교를 마감한다.  
2. 그다음 **Batch B**로 질문셋/인터뷰/문서 상세/승인·검증 **연결 구조**를 잠근다.  
3. 이후 **Batch C**에서 UI 표현·관리자 설명·세부 패널을 다듬는다.  

현재 단계는 새 기능을 대량 추가하기보다, **Batch A 안정화 후 Batch B 연결을 고정**하는 것이 맞다.

---

## 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| Draft v1 | 2026-04-19 | 초안. A 최종 정리 + B 패치 세트·검증·Evidence |

## 관련 문서

- [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md)  
- [BATCH_A_COMPILE_FIX_V1.md](./BATCH_A_COMPILE_FIX_V1.md)  
- [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)  
