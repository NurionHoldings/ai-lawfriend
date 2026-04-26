# [347] 3순 **C · GW-0.3/SPEC 직교** 착수 **전 판정** 작업지시서

## 0. 작업명

[347] 3순 **다음 활성 축 C**(GW-0.3 / SPEC 직교)에 **들어가기 전**, **GW-0.2 마감 상태**와 **SPEC·질문셋 본맥 겹침**을 판정하고 **별도 `EVIDENCE` / `PR` 필요성**을 한 장으로 정리한다.

## 1. 전제 (닫힘)

| 항목 | 증빙 |
|------|------|
| **[347] 3순 B축 닫힘** | [#347-tier3-b-axis-closure-c-next-20260426](IMPLEMENTATION_EVIDENCE.md#347-tier3-b-axis-closure-c-next-20260426) |
| **A·B 완료** | ALIGN6 문서 클로저 · Case/인터뷰 1차·B-G1·B 잔여 심화·B-LC05 |

본 지시서는 **B를 재실행하지 않는다.**

## 2. 절대 재오픈·혼입 금지

| 구분 | 비고 |
|------|------|
| **[343]~[350]** | 질문셋 Step3 본맥·닫힌 Phase **재오픈 금지** |
| **353+ 닫힌 실착 축** | [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) 등 **확대·재설계 금지** |
| **P1 RB·IO (닫힘)** | `RB-01~05` · `IO-05` 실착 범위 **재오픈 금지** |
| **[347] B축** | Case/인터뷰 갭·심화·LC-05 묶음 **재오픈 금지** |
| **`CaseStatus` canonical** | `prisma/schema.prisma` · `src/lib/definitions/case-status.ts` **enum 변경 금지** |

**혼재 금지:** [348]~[352]·Step3 1·2순 흐름과 **동일 `PR`** — [#spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정) · [FOLLOWUP §2](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md).

## 3. 1차 판정 — GW-0.2 **(나) 마감** 상태

**목적:** C 착수가 **GW-0.2 (가) 재판정 없이** 가정해도 되는지 명시한다.

1. 읽기: [EVIDENCE-20260426-352](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-352) · [SPEC GW-0.2 범위·완료](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-2-범위-완료).
2. **확인할 것 (체크리스트):**
   - 본 주기가 **(나)**로 마감되었는가 — **이번 흐름에서** 신규 `src/**`·B안 전환·§5.4 행 이관·`API_SPEC` success/ok 강제 개정 **없음**.
   - **향후** GW-0.2에서 `src/**`가 필요하면 **별도** `EVIDENCE` / `PR`·**(가) 재판정** — **C(GW-0.3) `PR`과 동일 브랜치에 섞지 않는다.**
3. **산출 (팀 기입):** 한 줄 결론 — 예: 「GW-0.2 (나) 마감 유지 확인. C는 GW-0.3/SPEC 직교만 전제.」

## 4. 2차 판정 — SPEC / **질문셋 본맥** 겹침

**목적:** C에서 하려는 일이 **질문셋 런타임·admin 대규모·343~350 재오픈**에 해당하는지 먼저 분류한다.

1. 읽기: [SPEC #spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정) · [#gw-0-3-범위-완료](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-3-범위-완료) · [CASE_STATUS_DEFINITION §7 Step 3](CASE_STATUS_DEFINITION.md#7-다음-문서-작업-순서-프로젝트-기준)(맥락).
2. **겹침 질문 (예·팀이 Yes/No로 답):**
   - 이번 C 착수가 **`QUESTION_SET_DEFINITION` 본문·질문셋 admin UI 대규모** 또는 **인터뷰 런타임 단일 소스(`questions` vs `definitionJson`)**를 바꾸는가?
   - **[343]~[350]**에서 이미 닫힌 **동일 주제**를 다시 여는가?
3. **분기:**
   - **겹침 없음 / 문서·정렬만** → [#gw-0-3-범위-완료](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-3-범위-완료) **(A)** 층에 가깝게 기록 가능 · `verify:canonical-sources` 중심.
   - **겹침 있음 / 본 착수** → **(가)** 층 · **반드시 별도** `EVIDENCE-20260426-353+` (또는 도메인별 소절) · **`src/**` 있으면** `verify:349-12` **별 PR**.

## 5. 별도 EVIDENCE / `PR` 필요성 — 팀 정리표

| 항목 | 판정 (팀 기입) |
|------|----------------|
| GW-0.2 (나) 마감 전제 | ☐ 확인 / ☐ 이슈 있음(설명) |
| SPEC·질문셋 겹침 | ☐ 없음 · ☐ 있음(어디와) |
| GW-0.3 분기 | ☐ (A) 정렬·문서만 · ☐ (가) 본 착수 |
| 제안 `EVIDENCE` ID / 소절 앵커 | |
| `PR` 분리 원칙 (한 줄) | |
| 검증 (`verify:canonical-sources` / `verify:349-12`) | |

## 6. 산출물

- **[IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md)** — [#work-instruction-347-tier3-c-gw03-spec-preflight](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-c-gw03-spec-preflight)에 **판정 요약**·위 표·착수 승인 한 줄.
- (선택) [WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md) **§4** 후보 **C** 행에 팀 1순위 메모.

## 7. 검증

- **문서만 변경:** `npm run verify:canonical-sources`
- **`src/**` 변경 시:** `npm run verify:349-12` (**본 지시서는 원칙적으로 판정 전 단계** — `src/**` 변경이 나오면 겹침·`PR` 분리 재검토)

## 8. 증빙 앵커

- 본 작업지시: 이 문서
- 실행 기록: [#work-instruction-347-tier3-c-gw03-spec-preflight](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-c-gw03-spec-preflight)
- 상위: [#347-tier3-b-axis-closure-c-next-20260426](IMPLEMENTATION_EVIDENCE.md#347-tier3-b-axis-closure-c-next-20260426) · [#347-tier3-bc-next-after-bg1](IMPLEMENTATION_EVIDENCE.md#347-tier3-bc-next-after-bg1) · [#work-instruction-347-tier3-followup-bc](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-bc)
