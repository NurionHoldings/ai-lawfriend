# [347] 3순 **B 잔여 심화** — LC-04/LC-05 · Case-API · Case-UI **후보 실사** 작업지시서

## 0. 작업명

[347] 3순 **B 잔여 심화** — [ALIGNMENT §6-2](ALIGNMENT_AUDIT_V1.md#6-2-사건-라이프사이클-정합성) **`LC-04`·`LC-05`** 및 [FOLLOWUP §4](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md) **`Case-API-갭`** · **`Case-UI-갭`** 실사 (갭 목록화 → 소규모 수정·**별도 `PR`**)

> **범위 밖(본 지시서에 넣지 않음):** **FILE-1B-잔여**·**IV-01/02**·admin `question-set` **대규모** — 필요 시 별 작업지시·`PR`.

## 1. 기준

| 항목 | 내용 |
|------|------|
| 상위 | [#347-tier3-bc-next-after-bg1](IMPLEMENTATION_EVIDENCE.md#347-tier3-bc-next-after-bg1) · [#work-instruction-347-tier3-followup-bc](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-bc) · [WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md) **§3 B** · **§4** |
| 선행 | [#work-instruction-347-tier3-case-interview-gap-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit) 1차 실사 · [#b-g1-ux-pr-20260426](IMPLEMENTATION_EVIDENCE.md#b-g1-ux-pr-20260426) **G-1 해소** |
| ALIGN | [§6-2 `LC-04`·`LC-05`](ALIGNMENT_AUDIT_V1.md#6-2-사건-라이프사이클-정합성)(현재 **`미실사·후속(B/C)`**) · Case·화면 연계는 [§6-11](ALIGNMENT_AUDIT_V1.md#6-11-화면-우선순위-및-화면-api-연결-정합성) `UI-01`·`UI-02`·`UI-04`(필요 시 교차 참고) |
| 증빙 | `EVIDENCE-20260426-353` / `353+` · [SPEC #spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정) |

## 2. 목적

**allowedActions / 화면 버튼 / Case API 응답**이 **서버·정의서 기준**과 어긋나지 않는지 **심화 실사**하고, **타임라인·감사로그**에 **상태 전이**가 필요한 수준으로 남는지 확인한다. **문서 클로저만**으로 끝낼 수 있으면 ALIGNMENT 판정만 갱신하고, **코드 갭**이면 **항목별 작은 `PR`**로 분리한다.

## 3. 절대 재오픈·금지

| 구분 | 비고 |
|------|------|
| [343]~[352]·Step3 1·2순 | **동일 `PR` 혼재·축 재오픈 금지** |
| 닫힌 실착 축 | 353+ [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) · P1·P0·통합 실착 — **닫힌 범위 확대·재설계 금지** |
| **`CaseStatus` canonical** | `prisma/schema.prisma` · `src/lib/definitions/case-status.ts` **enum 변경** 금지 |
| **353+ 이중 축** | `getAllowedCaseActions` / `allowedLifecycleActions` **실착·닫힘** — **재오픈하지 않음**; 본 실사는 **LC-04/05·Case API/UI 정합**에 한함 |

## 4. 실사 범위 (후보별)

### 4-1. `LC-04` — allowedActions 계산 정합성

- **확인:** `GET /api/cases/:caseId/detail`(및 관련 응답)의 **`allowedLifecycleActions`** vs 화면 **`getAllowedCaseActions`**·버튼 노출 — **불일치·임의 노출** 여부  
- **서버:** `PATCH /status`·`POST /transition`·`applyCaseStatusTransition` — **UI에 안 보이는 액션 호출 가능** 여부(회귀)  
- **산출:** 불일치 목록·재현 시나리오·권장 조치(클라만 / API만 / 둘 다)

### 4-2. `LC-05` — 타임라인·감사로그 상태 전이 기록

- **확인:** `caseTimelineEvents`·감사로그(`writeAuditLog` 등) — **상태 전이**가 누락·중복 없이 기록되는지  
- **산출:** 기록 공백·필드 부족·정의서 대비 갭

### 4-3. **Case-API-갭** (FOLLOWUP §4)

- **확인:** `src/app/api/cases/**` — 목록·상세·전이·첨부·배정 등 **권한 가드**·응답 필드·에러 형식 **정의서·IO** 대비  
- **주의:** **IO-05** 닫힘 축 — **재오픈 없이** 회귀·소규모 보강만

### 4-4. **Case-UI-갭** (FOLLOWUP §4)

- **확인:** `src/app/(protected)/cases/**` — 목록·상세·편집·보충 등 **라우트·CTA**가 [SCREEN_PRIORITY_TABLE](SCREEN_PRIORITY_TABLE.md)·정의서 **MVP 순서**·API 연결과 정합한지  
- **교차:** `UI-01`(MVP 순서)·`UI-02`(상단 카드)·`UI-04`(문서 생성 엔트리) — **전면 개편 금지**, 갭만 목록화

### 4-5. 권장 읽는 순서

1. [CASE_LIFECYCLE_DEFINITION.md](CASE_LIFECYCLE_DEFINITION.md) · [PERMISSION_DEFINITION.md](PERMISSION_DEFINITION.md)  
2. [ALIGNMENT §6-2·§6-11](ALIGNMENT_AUDIT_V1.md#6-역점검표-본문)  
3. [#work-instruction-347-tier3-case-interview-gap-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit) (1차 실사)

## 5. 산출물

- **[IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md)** — [`#work-instruction-347-tier3-b-residual-lc-case-api-ui`](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui)에 **실사 요약**·갭·`PR`·검증  
- **[ALIGNMENT_AUDIT_V1.md](ALIGNMENT_AUDIT_V1.md) §6-2** — `LC-04`·`LC-05` **판정** 갱신(실사로 좁힐 수 있을 때만)  
- **`PR`** — `EVIDENCE-20260426-353` 또는 `353+` · **B-잔여-LC/API/UI** 등 식별 가능한 제목

## 6. 검증

- **`src/**` 변경 시:** `npm run verify:349-12`  
- **문서만 변경 시:** `npm run verify:canonical-sources`

## 7. 증빙 앵커

- 본 작업지시: 이 문서  
- 실행 기록: [#work-instruction-347-tier3-b-residual-lc-case-api-ui](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui)  
- 상위: [#347-tier3-bc-next-after-bg1](IMPLEMENTATION_EVIDENCE.md#347-tier3-bc-next-after-bg1)
