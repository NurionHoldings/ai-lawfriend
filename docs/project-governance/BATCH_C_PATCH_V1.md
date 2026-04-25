# AI법친 Batch C 실코드 패치 세트

**문서 ID:** AIBEOPCHIN-BATCH-C-PATCH-V1  
**상태:** Draft v1  
**목적:** Batch A/B 정렬 이후 남은 UI 표현, 관리자 설명, 요약 조회/재생성, 문단 버전/비교/복원, 인터뷰·사건 상세 화면을 정의서 기준으로 마감하는 **패치 지시서**다.

**Batch C 범위 (명세상 경로·개념):**

- `src/middleware.ts`
- `src/app/api/auth/register/route.ts` *(본선은 `signup` 경로 병행 여부 확인)*
- `src/app/api/auth/login/route.ts`
- `src/app/(protected)/cases/[caseId]/page.tsx`
- `src/components/cases/*`
- `src/app/(protected)/cases/[caseId]/interview/page.tsx`
- `src/components/cases/case-interview-client.tsx`
- `src/app/api/cases/[caseId]/summary/route.ts` *(없으면 신규 또는 `summary/generate`와 역할 분리)*
- `src/app/api/cases/[caseId]/summary/regenerate/route.ts` *(스키마·저장소 정합 후)*
- 문단 버전 API *(본선: `documents/[documentId]/paragraph-versions/...` 등 — 아래 §0)*
- `src/app/api/admin/.../case-status-check/...` *(미구현 시 신규)*
- 관련 UI

**핵심 원칙:**

- Batch C는 **새 핵심 도메인 규칙을 만들지 않는다.** Batch A/B에서 잠근 기준을 **화면·보조 route·운영 설명**까지 확장한다.
- 상태·전이·권한·질문셋·문서 truth source는 **Batch A/B 확정분을 그대로** 따른다.
- UI는 서버를 **재해석하지 말고**, `allowedLifecycleActions` / `getAllowedCaseActions` / `status` / `paragraphs` / 검증 메타 등 **합의된 필드**를 기준으로 렌더링한다.

---

## 0. 현행 저장소 매핑 (패치 전 필독)

| 문서/템플릿 | 본선 AI법친 |
|-------------|-------------|
| 쿠키명 `session` | **`aibupchin_access_token`** (`middleware.ts`, `AUTH_COOKIE_NAME`) |
| 회원가입 경로 | `/signup` 등 — **`register/route`** 가 없을 수 있음 |
| `ok`/`fail` from `@/lib/api/response` | **`@/lib/api-response`** (`ok`, `created`, `fail`, `handleApiError`) |
| 사건 **사건번호** `caseNumber` | **스키마에 필드 없을 수 있음** — UI는 `id`·제목 중심 또는 스키마 확장 후 표시 |
| 사건 상세 CTA | **`CaseDetailClient`** + **`getAllowedCaseActions`** (객체 플래그) + 서버 **`allowedLifecycleActions`** (배열) — Batch C에서 **둘의 역할을 문서화하고 중복·불일치 제거** |
| 상태 라벨 | **`CASE_STATUS_LABELS`** (`case-status.ts` 등에서 export — 이름 오타 `CASE_STATUS_LABEL` 아님) |
| `GET .../summary` · `regenerate` | **`CaseSummary` 모델 없으면** 목록/재생성 route는 **마이그레이션·서비스 설계 후** 또는 **`summary/generate` 단일**로 유지 |
| `api/paragraphs/[paragraphId]/versions` | 본선은 **`/api/documents/[documentId]/paragraph-versions`** 및 **`.../restore`** 패턴이 있음 |
| 관리자 `case-status-check` | **파일 없을 수 있음** — `navigator` 출력 설명용 **신규 관리 API** 또는 **기존 admin UI 문구**만 보강 |
| 비밀번호 | 예시의 평문 저장 **금지** — 기존 **해시·로그인 서비스** 유지 |

---

# 1. Batch C 목표 (6가지)

1. 보호 라우트·**JWT·역할**과 auth 응답 구조 표현 정리  
2. 사건 상세 **상단 카드·행동 버튼** (`getAllowedCaseActions` / `allowedLifecycleActions` 정합)  
3. 인터뷰 **진행률·완료 조건·UI 상태** 서버 기준 정렬  
4. 사건 요약 **조회/재생성** 구조 정렬 (스키마 없으면 로드맵 명시)  
5. 문단 **버전 목록·복원** (실제 경로는 `paragraph-versions` 등)  
6. 관리자 **`check-status`** 의미(휴리스틱) **API/UI 문구** 정렬  

---

# 2. FILE-C-01 `src/middleware.ts`

## 현행

- JWT 쿠키 `aibupchin_access_token`  
- `/dashboard`, `/cases`·`/lawyer`·`/admin` 보호, `/login`, `/signup` 게스트  
- `/admin` 은 **역할·경로 예외**(STAFF/LAWYER 일부 경로) 처리  

## Batch C 지시

1. **문서 예시처럼 전면 교체하지 말고**, 공개·보호 경로 목록을 **정의서·화면 우선순위표**와 다시 대조한다.  
2. middleware는 **세부 사건 권한·role 전부**를 맡기지 말고 **라우트 가드**와 역할 분담을 유지한다.  
3. `matcher` 는 `middleware.ts` 하단 **기존 `config`** 와 충돌 없이 조정한다.  

---

# 3. FILE-C-02 · C-03 Auth `register` / `login`

- **응답 형식:** 기존 클라이언트가 기대하는 `{ success, data, error }` (`api-response`) 와 맞출 것.  
- **공개 가입 역할:** `UserRole` · 정책에 맞게 `CLIENT` 등만 허용.  
- **비밀번호:** 기존 회원가입·로그인 모듈의 **bcrypt 등** 유지.  

*(전체 교체용 예시 코드는 템플릿 참고 — 레포의 `auth` 구현체에 맞게 줄단위 수정.)*

---

# 4. FILE-C-04 `cases/[caseId]/page.tsx` + FILE-C-05 컴포넌트

- 페이지는 보통 **`CaseDetailClient`** 등 **기존 컴포넌트**를 감싼다 — **상단 카드 필드**는 `SerializedCaseDetail` + `detail` API와 맞춘다.  
- **버튼 노출:**  
  - 클라이언트: `getAllowedCaseActions` → `START_INTERVIEW`, `COMPLETE_INTERVIEW` 등 **키 객체**  
  - 서버가 내려주는 `allowedLifecycleActions` 와 **이름·의미 통일** (Batch C 정리 항목)  
- Badge: **`CASE_STATUS_LABELS[status]`** — raw enum 문자열을 JSX에 직접 박지 말 것.  

---

# 5. FILE-C-06 · C-07 인터뷰 페이지 / `case-interview-client.tsx`

- 진행률·필수 누락은 **`getInterviewFlow` / save 응답** 기준.  
- 완료는 **`POST .../interview/complete`** 성공 후에만 반영.  
- `fetch` 응답: API가 `ok: true, data` 인지 `success: true` 인지 **통일 후** 파싱.  

---

# 6. FILE-C-08 `summary/route.ts` · FILE-C-09 `regenerate/route.ts`

- **`prisma.caseSummary` 가 없으면** GET/재생성은 **추가 테이블·마이그레이션** 또는 **기존 `summary/generate` 응답 캐시 전략**을 문서에 명시한 뒤 구현한다.  
- `contentJson` 등 필드명은 **스키마 확정 후** 치환.  
- 공용 **`sanitizeLegalOverclaim` / disclaimer** 는 `src/lib/ai/output-policy.ts` (Batch B 최종 정리 후보) 로 모을 수 있음.  

---

# 7. FILE-C-10 · C-11 문단 버전/복원

**본선 경로 예:**

- `GET/PATCH ...` — `src/app/api/documents/[documentId]/paragraph-versions/route.ts`  
- restore — `.../paragraph-versions/[versionGroupId]/restore/route.ts`  

**지시:**

- **`paragraphId` 단독** 전역 라우트를 새로 만들기보다 **기존 document-anchored API** 와 정렬 필드(`orderIndex`, `versionGroupId`)를 통일한다.  
- Prisma 모델은 **`DocumentParagraphVersion`** 등 실제 이름 확인 후 예시의 `paragraphVersion` accessor 치환.  

---

# 8. FILE-C-12 관리자 `check-status` 설명

- **신규:** `GET /api/admin/case-status-check` 등 — 응답에 **휴리스틱 안내** 배열 포함.  
- **또는** 관리자 대시보드 정적 문구만 보강.  
- 문구는 **[BATCH_A_COMPILE_FIX_V1.md](./BATCH_A_COMPILE_FIX_V1.md)** 의 `check-status` 해석과 동일 축을 유지한다.  

---

# 9. Batch C 최종 검증 순서

```bash
npx tsc --noEmit
npm run lint
npm run verify:canonical-sources
py -3 tools/aibeopchin_navigator.py check-status --scope case
```

**시나리오:** 사용자 문서 §14 유지 — 본선 경로·응답 형식에 맞게 조정해 실행한다.  

---

# 10. Evidence 기록 블록

`IMPLEMENTATION_EVIDENCE.md`에 붙여넣을 때 **명령은 `npx` / `npm` / `py -3`** 로 적는다.

```md
## [BATCH-C-01] middleware / auth / 사건 상세·컴포넌트 정렬
- 수정 파일:
  - (실제)
- 검증 명령:
  - npx tsc --noEmit
  - npm run lint
  - npm run verify:canonical-sources
  - py -3 tools/aibeopchin_navigator.py check-status --scope case
- 검증 결과:
  - [작성 필요]
- 근거 메모:
  - ...

## [BATCH-C-02] 인터뷰 UI / 요약 / 문단 버전 정렬
- 수정 파일:
  - (실제)
- 검증 명령: (동일)
- 검증 결과:
  - [작성 필요]
- 근거 메모:
  - ...

## [BATCH-C-03] 관리자 check-status 설명 정렬
- 수정 파일:
  - (실제)
- 검증 명령:
  - npx tsc --noEmit
  - npm run lint
- 검증 결과:
  - [작성 필요]
- 근거 메모:
  - 휴리스틱 안내 문구 고정
```

---

# 11. 현재까지 완성률 단계 판정 (보수적 참고치)

문서·정렬 체계 대비 **실코드·검증·evidence** 가 덜 채워진 상태를 가정한 **주관적·보수적** 눈대중이다. 절대값으로 고정하지 않는다.

| 구분 | 참고치 | 비고 |
|------|--------|------|
| 문서/설계/정렬 기준 확정도 | **약 84%** | 기준문서·Batch A/B/C·오류 대응 문서까지 정리됨 |
| 실제 코드 반영·컴파일 준비도 | **약 68%** | 줄 단위 diff·전 범위 검증은 미완일 수 있음 |
| 실서비스 구동 관점 기능 완성도 | **약 56%** | 통합 시나리오·운영 마감은 추가 작업 |
| **종합 (보수적)** | **약 62%** | “문서는 충분, 코드/검증·운영은 진행 중” 정도의 뜻 |

---

# 12. 다음 단계

1. **실레포 줄 단위 diff 패치본** — Batch A/B/C 문서를 실제 파일에 매핑  
2. **운영·배포 직전 마감** — 통합 테스트, 롤백, 복구 체크리스트  

---

## 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| Draft v1 | 2026-04-19 | 초안. Batch C 범위·본선 매핑·검증·Evidence·완성률 참고 |

## 관련 문서

- [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md)
- [BATCH_B_FINAL_CLEANUP_V1.md](./BATCH_B_FINAL_CLEANUP_V1.md)
- [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)
