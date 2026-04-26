# [347] 3순 차순 B · Case·인터뷰 갭 **실사** 작업지시서

## 0. 작업명

[347] 3순 차순 **B** · Case·인터뷰 갭 **코드·화면 실사** (갭 목록화 → 필요 시 소규모 수정·별도 `PR`)

## 1. 기준

| 항목 | 내용 |
|------|------|
| 상위 선정 | [#work-instruction-347-tier3-followup-bc](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-bc) · [WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md) **§3 B** · **§4** (`Case-API-갭` · `Case-UI-갭` · `FILE-1B-잔여`) |
| ALIGN6 연계 | [#work-instruction-347-tier3-align6-doc-closure](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-align6-doc-closure)에서 **후속(B/C)**로 넘긴 §6 행 — 특히 `IV-*`·관련 `UI-*`·`LC-04`·`LC-05`·`미실사·후속(B/C)` |
| 증빙 트랙 | `EVIDENCE-20260426-353` / `353+` — [SPEC #spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정) |

## 2. 목적

정의서·ALIGNMENT와 **실제 구현**을 대조해 **갭·회귀 위험**을 목록화한다. **문서만**이 아니라 **`src/**`·라우트·API 실사**가 포함된다. 수정이 필요하면 **소규모·항목별 `PR`**로 분리한다.

## 3. 절대 재오픈·금지 (ALIGN6·FOLLOWUP과 동일)

| 구분 | 비고 |
|------|------|
| [343]~[352]·Step3 1·2순 | **동일 `PR` 혼재·축 재오픈 금지** |
| 닫힌 실착 축 | 353+ 이중 축 [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) · P1 `RB-*`·`IO-05` · P0 첫 코드 [#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426) · 통합 실착 [#p0-347-tier3-p0-p2-integrated-20260426](IMPLEMENTATION_EVIDENCE.md#p0-347-tier3-p0-p2-integrated-20260426) — **검증·회귀는 가능, 범위 확대·재설계는 별도 합의** |
| **`CaseStatus` canonical** | `prisma/schema.prisma` · `src/lib/definitions/case-status.ts` **enum 변경** — 별도 합의·EVIDENCE 없이 **금지** |
| admin `question-set` **대규모** | [353-1] 전제와 동일 — **본 실사의 기본 범위 밖** (필요 시 별 트랙) |

## 4. B · Case·인터뷰 갭 **실사 범위**

1. **Case 상세 화면** — 상태·액션·카드·허용 액션 표시와 서버 응답 정합  
2. **인터뷰 화면** — 플로우·완료 CTA·로딩/오류 후 갱신  
3. **Case 관련 API route** — 상세·목록·전이·메타데이터·권한 가드  
4. **Interview 관련 API route** — 플로우·답변 저장·complete·검증  
5. **`CaseStatus` 사용 맥락** — UI·서비스·응답 DTO에서 **canonical·label** 분리, 하드코딩 문자열 잔존 여부 (**enum 변경은 §3 금지**)  
6. **인터뷰 완료 후** — 사건 상태·사건 상세 **refetch/표시** 정합 ([FILE_REALIGN 1-B](FILE_REALIGN_PATCH_V1.md#batch-1b-실행)·기존 EVIDENCE와 충돌 없는지)  
7. **문서 생성 진입과 사건 상세 연결** — CTA·라우트·권한·상태 전제  
8. **ALIGNMENT §6** — 위 실사 결과로 [#work-instruction-347-tier3-align6-doc-closure](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-align6-doc-closure)에서 **후속(B)**로 넘긴 **Case/인터뷰 관련** ID(`IV-*`·`UI-01`·`UI-02`·`UI-04`·`UI-06`·`LC-04`·`LC-05` 등) **행별** 관찰·판정 갱신 여부 판단  

### 4-1. 권장 읽는 순서 (착수 전)

1. [CASE_STATUS_DEFINITION.md](CASE_STATUS_DEFINITION.md) · [CASE_LIFECYCLE_DEFINITION.md](CASE_LIFECYCLE_DEFINITION.md) · [SCREEN_PRIORITY_TABLE.md](SCREEN_PRIORITY_TABLE.md) (해당 화면)  
2. [ALIGNMENT_AUDIT_V1.md §6](ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) (`6-2`·`6-4`·`6-11` 등)  
3. [#work-instruction-347-tier3-followup-bc](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-bc)

## 5. 산출물

- **[IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md)** — [`#work-instruction-347-tier3-case-interview-gap-audit`](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit)에 **실사 요약**(스코프·갭 목록·재현·권장 조치·PR 분리)  
- **[ALIGNMENT_AUDIT_V1.md](ALIGNMENT_AUDIT_V1.md) §6** (선택) — 실사로 **판정**을 좁힐 수 있는 행만 갱신  
- **`PR`** — 제목·본문에 **`EVIDENCE-20260426-353`** 또는 **`353+`**; 항목별 **작은 `PR`** 권장  

## 6. 검증

- **`src/**` 변경 시:** `npm run verify:349-12` 및 팀 CI (`tsc`·`lint`·`test` 등)  
- **문서만 변경 시:** `npm run verify:canonical-sources`  
- 상태 관련 완료 판정 시: `verify:canonical-sources` + (해당 시) `check-status` — [IMPLEMENTATION §2–§4](IMPLEMENTATION_EVIDENCE.md)

## 7. 증빙 앵커

- 본 작업지시: 이 문서  
- 상위: [#work-instruction-347-tier3-followup-bc](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-bc) · [#work-instruction-347-tier3-followup-axes](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-axes)  
- 실행 기록: [#work-instruction-347-tier3-case-interview-gap-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-case-interview-gap-audit)  
- **B-G1(인터뷰 전용 완료 CTA):** [WORK_INSTRUCTION_347_TIER3_BG1_INTERVIEW_COMPLETE_CTA.md](WORK_INSTRUCTION_347_TIER3_BG1_INTERVIEW_COMPLETE_CTA.md) · [#b-g1-ux-pr-20260426](IMPLEMENTATION_EVIDENCE.md#b-g1-ux-pr-20260426)
- **B 잔여 심화(LC-04/05·Case-API/UI):** [WORK_INSTRUCTION_347_TIER3_B_RESIDUAL_LC_CASE_API_UI.md](WORK_INSTRUCTION_347_TIER3_B_RESIDUAL_LC_CASE_API_UI.md) · [#work-instruction-347-tier3-b-residual-lc-case-api-ui](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-b-residual-lc-case-api-ui)
