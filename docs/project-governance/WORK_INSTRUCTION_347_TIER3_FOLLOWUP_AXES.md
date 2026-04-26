# [347] 3순 후속 활성 축 정리 — ALIGNMENT §6·Case/인터뷰·GW-0.3 후보 선정

## 0. 작업명

[347] 3순 **후속** 활성 축을 **3갈래**로 재분류하고, **다음 실착 1순위**를 팀이 고를 수 있도록 **후보표**를 확정한다.

**진행 스냅 (2026-04-26):** [347] 3순 **A**(ALIGN6 문서)·**B**(Case/인터뷰 갭·심화·LC-05) **닫힘** — [#347-tier3-b-axis-closure-c-next-20260426](IMPLEMENTATION_EVIDENCE.md#347-tier3-b-axis-closure-c-next-20260426). **다음 활성 축 = C** (GW-0.3 / SPEC 직교). `post_352_next_347_tier3_alignment` 문구 동기화됨.

## 1. 필수 확인 순서

1. [IMPLEMENTATION_EVIDENCE.md — `#evidence-20260426-353`](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353) 본절·「범위 (초기)」·「[353-1] 완료 후」
2. **전제 완료:** [#p0-347-tier3-p0-p2-integrated-20260426](IMPLEMENTATION_EVIDENCE.md#p0-347-tier3-p0-p2-integrated-20260426) — P0 잔여(ST-01·[310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310)(1)(3))·P2(ST-02·ST-05·운영) **통합 실착** 처리됨
3. `tools/aibeopchin_navigator.py` — `post_352_next_347_tier3_alignment` (본 작업에서 **문구 정리** 대상)
4. [SPEC #spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정) · [GW-0.3 범위](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-3-범위-완료)

## 2. 닫힌 축 — 후속 후보에서 **제외** (재오픈·혼입 금지)

아래는 **닫힌 상태**로 두고, 후속 1순위 표에 **넣지 않는다**.

| 축 | 증빙(예) |
|----|-----------|
| P0 첫 코드 (IV-04~ST-03) | [#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426) |
| P0 잔여·P2 **통합 실착** 묶음 | [#p0-347-tier3-p0-p2-integrated-20260426](IMPLEMENTATION_EVIDENCE.md#p0-347-tier3-p0-p2-integrated-20260426) |
| P1 `RB-01~05` | `#p0-353-p1-rb01` ~ `rb05` |
| IO-05 | `#p0-353-p1-io05` |
| 353+ UI 가용 이중 축 | [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) |
| [343]~[352] Step3/Phase 닫힌 축 | 점검표·상단 불릿 |

**금지:** `CaseStatus` **canonical** 변경 · `prisma/schema.prisma` / `src/lib/definitions/case-status.ts` **enum 수정** (별도 합의·EVIDENCE 없이).

## 3. 남은 후보 — 3개 축으로 재분류

### A. ALIGNMENT §6 잔여

- [ALIGNMENT_AUDIT_V1.md §6](ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) 역점검표 **판정·보류** 행
- R3~R9·[SPEC R3 §3.1](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#31--r3r9st-2차-심화-점검) 교차·**→ ALIGNMENT** ID 연결 **잔여**
- [353-1] 문서 스냅 이후 **문서만** 닫을 수 있는 항목(§6-1 ST 세부 등은 [310](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310)과 함께 읽음)

### B. Case / 인터뷰 잔여 갭

- **[347] 3순 B 묶음 — 닫힘 (2026-04-26):** 실사·B-G1·B 잔여 심화·B-LC05 완료 — [#347-tier3-b-axis-closure-c-next-20260426](IMPLEMENTATION_EVIDENCE.md#347-tier3-b-axis-closure-c-next-20260426). **FILE-1B**·대규모 **IV** 등은 본 닫힘과 별개 트랙.
- **화면** · **API** · **라우트** · **Case/인터뷰 흐름 정합** — 정의서·ALIGNMENT·기존 EVIDENCE 대비 **구현 관찰 vs 갭**
- **`CaseStatus`·인터뷰 완료 경로** 등은 닫힌 축(§2) **재오픈 없이** 회귀·정합만
- **실제 코드 실사·수정 가능성** 있음 — 문서 클로저만으로 끝나지 않을 수 있음
- [#evidence-20260426-353](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353) 「범위 (초기)」·[#work-instruction-347-tier3-followup-bc](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-bc)
- **실사 작업지시:** [WORK_INSTRUCTION_347_TIER3_CASE_INTERVIEW_GAP_AUDIT.md](WORK_INSTRUCTION_347_TIER3_CASE_INTERVIEW_GAP_AUDIT.md) · [#work-instruction-347-tier3-case-interview-gap-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit)
- **B 잔여 심화(LC-04/05·Case-API/UI):** [WORK_INSTRUCTION_347_TIER3_B_RESIDUAL_LC_CASE_API_UI.md](WORK_INSTRUCTION_347_TIER3_B_RESIDUAL_LC_CASE_API_UI.md) · [#work-instruction-347-tier3-b-residual-lc-case-api-ui](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui)
- 필요 시 **`EVIDENCE-20260426-353+`** 또는 **도메인별** 소절에 누적(348~352·1·2순 `PR` **혼재 금지**)

### C. GW-0.3 / SPEC 직교 축

- **착수 전 판정 (필수):** [WORK_INSTRUCTION_347_TIER3_C_GW03_SPEC_PREFLIGHT.md](WORK_INSTRUCTION_347_TIER3_C_GW03_SPEC_PREFLIGHT.md) · [#work-instruction-347-tier3-c-gw03-spec-preflight](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-c-gw03-spec-preflight) — GW-0.2 **(나)** 마감 전제 · SPEC/질문셋 겹침 · 별도 EVIDENCE/PR.
- **GW-0.3 (A) 1차 실착 (2026-04-26):** [#c-gw03-a-tier3-20260426](IMPLEMENTATION_EVIDENCE.md#c-gw03-a-tier3-20260426) — 문서·정렬만 · **(가) 본착수는 별 PR**.
- **다음 활성 축 (2026-04-26~)** — [347] 3순 **B 닫힘** 이후: [#347-tier3-b-axis-closure-c-next-20260426](IMPLEMENTATION_EVIDENCE.md#347-tier3-b-axis-closure-c-next-20260426) · [#347-tier3-bc-next-after-bg1](IMPLEMENTATION_EVIDENCE.md#347-tier3-bc-next-after-bg1).
- **GW-0.2 이후 별도 판정** — [352] 마감·문서권 Step3/Phase 종료 이후 [GW-0.3](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-3-범위-완료) **범위·완료**를 SPEC와 함께 읽음
- SPEC/질문셋·`QUESTION_SET_DEFINITION` 본맥과 **겹치면** **(가)/(나)** 분기 → **별도 EVIDENCE** / `PR` (본 맥락과 **혼재 금지**)
- **[343]~[350] 재오픈 금지** — 직교·분기만 허용, 닫힌 Phase **다시 열지 않음**
- [347] **후보 3**·[#spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정)과 충돌하지 않게 읽기

**참고(직교):** [352] 이후 **GW-0.2** `src/**` 필요 시 **별도** EVIDENCE·**(가) 재판정** — 본 표 **A~C와 동일 PR 혼입 금지**가 기본.

## 4. 다음 실착 1순위 — 팀 선정용 후보표

팀은 아래에서 **한 행**을 **1순위**로 고른 뒤, `EVIDENCE`·`PR` 제목·본문에 `EVIDENCE-20260426-353`·(선택) 본 작업지시 앵커를 남긴다.

| 우선(팀 기입) | 분류 | 후보 ID | 한 줄 범위 | 전형적 산출 | `src/**` |
|:-------------:|:----:|---------|------------|-------------|:--------:|
| **☑ 1순위** | **A** | **ALIGN-§6-문서** | §6 표 **보류·부분일치** 행 **문서 클로저**만 | `IMPLEMENTATION_EVIDENCE`·`ALIGNMENT` 소개/판정 열 | 없음~최소 |
| ☐ | **A** | **ALIGN-R3-교차** | R3 §3.1·R9·ST 행 **교차 압축** 잔여 | SPEC·ALIGNMENT 링크 정리 | 없음~최소 |
| ☐ | **B** | **Case-API-갭** | Case 상세·목록·인터뷰 API **정합·누락** (권한·IO 닫힘 전제) | 회귀·소규모 수정 | 있을 수 있음 |
| ☐ | **B** | **Case-UI-갭** | 화면·라우트 **정의서 대비** 관찰 | UI·문서 | 있을 수 있음 |
| ☐ | **B** | **FILE-1B-잔여** | [FILE_REALIGN 1-B](FILE_REALIGN_PATCH_V1.md#batch-1b-실행) 등 **잔여 정합** | 소규모 PR | 있을 수 있음 |
| ☐ | **C** | **GW-0.3-분기** | 3순 vs 질문셋 **겹침** → SPEC **(가)/(나)**·별 EVIDENCE | 문서·분기 확정 | (가)에서만 |
| ☐ | **C** | **SPEC-347-확장** | `#spec-347-후속-고정` **후속 고정**만 갱신 | SPEC·`IMPLEMENTATION` 상단 | 없음 |

**혼입 금지:** [348]~[352]·Step3 1·2순 흐름과 **동일** `PR` · 닫힌 축(§2) **재오픈**.

**[347] 문서권 마감 이후 — 코드 착수 우선순위:** [WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md](WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md) · [IMPLEMENTATION `#work-instruction-post-347-dev-candidate-priority`](IMPLEMENTATION_EVIDENCE.md#work-instruction-post-347-dev-candidate-priority) — 팀 확정 **1순위 개발 `PR` = FILE-1B** · [실착 지시](WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md).

## 5. 산출물

- `IMPLEMENTATION_EVIDENCE.md` — `#evidence-20260426-353` 인접에 **팀 선택 1순위** 한 줄 기록(선택: [#work-instruction-347-tier3-followup-axes](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-axes) 링크)
- **1순위 A 실행:** [WORK_INSTRUCTION_347_TIER3_ALIGN6_DOC_CLOSURE.md](WORK_INSTRUCTION_347_TIER3_ALIGN6_DOC_CLOSURE.md) — ALIGNMENT **§6** 문서 클로저 절차·[#work-instruction-347-tier3-align6-doc-closure](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-align6-doc-closure)
- **B 잔여 심화:** [WORK_INSTRUCTION_347_TIER3_B_RESIDUAL_LC_CASE_API_UI.md](WORK_INSTRUCTION_347_TIER3_B_RESIDUAL_LC_CASE_API_UI.md) · [#work-instruction-347-tier3-b-residual-lc-case-api-ui](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui)
- **C 착수 전 판정:** [WORK_INSTRUCTION_347_TIER3_C_GW03_SPEC_PREFLIGHT.md](WORK_INSTRUCTION_347_TIER3_C_GW03_SPEC_PREFLIGHT.md) · [#work-instruction-347-tier3-c-gw03-spec-preflight](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-c-gw03-spec-preflight)
- `tools/aibeopchin_navigator.py` — `post_352_next_347_tier3_alignment` **후속 3축·통합실착 완료** 반영
- **[347] 이후 코드:** [WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md](WORK_INSTRUCTION_POST_347_DEV_CANDIDATE_PRIORITY.md) · [WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md](WORK_INSTRUCTION_POST_347_FILE_1B_ATTACHMENT_CASE_LINK.md)

## 6. 검증

- **문서만 변경:** `npm run verify:canonical-sources`
- **`src/**` 변경 발생:** `npm run verify:349-12`

## 7. 증빙 앵커

- 본 작업지시: **[#work-instruction-347-tier3-followup-axes](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-axes)** (`IMPLEMENTATION_EVIDENCE.md`에 소절로 연결)
- **1순위 A 실행 기록:** [#work-instruction-347-tier3-align6-doc-closure](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-align6-doc-closure) · [WORK_INSTRUCTION_347_TIER3_ALIGN6_DOC_CLOSURE.md](WORK_INSTRUCTION_347_TIER3_ALIGN6_DOC_CLOSURE.md)
- **B / C:** [#work-instruction-347-tier3-followup-bc](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-bc) · **B 닫힘·C 활성:** [#347-tier3-b-axis-closure-c-next-20260426](IMPLEMENTATION_EVIDENCE.md#347-tier3-b-axis-closure-c-next-20260426) · [#347-tier3-bc-next-after-bg1](IMPLEMENTATION_EVIDENCE.md#347-tier3-bc-next-after-bg1) · **C 착수 전:** [#work-instruction-347-tier3-c-gw03-spec-preflight](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-c-gw03-spec-preflight) · **B 증빙 소급:** [#work-instruction-347-tier3-case-interview-gap-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit) · [#work-instruction-347-tier3-b-residual-lc-case-api-ui](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui)
