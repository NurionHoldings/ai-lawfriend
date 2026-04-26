# [347] 3순 P0 잔여·P2 팀 선정 및 PR 분리 작업지시서

## 0. 작업명

[347] 3순(ALIGNMENT / Case·인터뷰 잔여) — **P0 잔여**·**P2** 실착. **항목마다 별도 `PR`**.

**통합 실착(한 번에 실사·증빙만 축별):** 개발팀이 **단일 문서**로 진행할 때는 [WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md](WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md) · 증빙 [#work-instruction-347-tier3-p0-p2-integrated-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-p0-p2-integrated-audit) — **본 문서의 닫힘 유지·별 PR 원칙은 그대로 적용**한다.

## 1. 기준 근거

- **Evidence:** `EVIDENCE-20260426-353`
- **증빙 앵커** ([IMPLEMENTATION_EVIDENCE.md](IMPLEMENTATION_EVIDENCE.md)):
  - [#evidence-20260426-353](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353)
  - [#p0-353-p0-완료-후속](IMPLEMENTATION_EVIDENCE.md#p0-353-p0-완료-후속) — P0 첫 코드 묶음 **닫힘**
  - [#p0-353-p1p2-next](IMPLEMENTATION_EVIDENCE.md#p0-353-p1p2-next) — P1·353+ **닫힘**·다음 활성
  - [#p0-353-p1p2](IMPLEMENTATION_EVIDENCE.md#p0-353-p1p2) — P2 권장 순서(표)
  - [#p0-353-st01](IMPLEMENTATION_EVIDENCE.md#p0-353-st01) — ST-01 문서 절(참고)
  - [310 남은 예외](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310) — 특히 **(1)**·**(3)**
- **내비:** `tools/aibeopchin_navigator.py` → `PROJECT_PLAN["post_352_next_347_tier3_alignment"]`
- **SPEC·ALIGNMENT:** [SPEC #spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정) · [ALIGNMENT §6-1](ALIGNMENT_AUDIT_V1.md#6-1-상태값-정합성) · [§4-1 check-status 해석](IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지)

## 2. 닫힘 유지 (재오픈·동일 PR 혼입 금지)

아래는 **닫힌 상태로 유지**한다. 후속 `PR`에서 **재오픈**하거나, 아래 **제외 목록을 끼워 넣지 않는다**.

| 축 | 증빙(예) |
|----|----------|
| **P0 첫 코드** | IV-04·IV-05·LC-03·ST-03·`interview/complete` — [#p0-353-구현-20260426](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426) |
| **P1** | RB-01 ~ RB-05 — `#p0-353-p1-rb01` ~ `#p0-353-p1-rb05` |
| **IO-05** | [#p0-353-p1-io05](IMPLEMENTATION_EVIDENCE.md#p0-353-p1-io05) |
| **353+** | UI 가용 액션 이중 축 — [#p0-353-plus-dual-axis-real](IMPLEMENTATION_EVIDENCE.md#p0-353-plus-dual-axis-real) |

## 3. 다음 활성 — P0 잔여 (ST-01·[310] 예외 축)

**범위(요지):**

- **ST-01 잔여:** 저장소·휴리스틱 **레거시** `CaseStatus` 문자열 정리, `prisma/schema.prisma`·`src/lib/definitions/case-status.ts` **canonical 2파일** 유지. [310 **(1)**](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-310)·[§4-1](IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지)와 정합.
- **[310] (3):** `check-status`·휴리스틱 — **도메인 단정 금지**; 문서·메시지·스코프 정리만 필요하면 **별 PR**로 한정.

**PR 규칙:** 위 **주제를 한 PR에 합치지 않는 것을 원칙**으로 한다. 예: ST-01 코드 정리 PR과 “운영 메시지·문서만” PR은 **분리** 가능.

**PR 본문(필수/권장):** `EVIDENCE-20260426-353` · `#p0-353-p0-완료-후속` 또는 `#p0-353-st01` · (해당 시) `#evidence-20260423-310`

## 4. 다음 활성 — P2 (ST-02 · ST-05 · 운영)

[353-P1P2 표 — P2 묶음](IMPLEMENTATION_EVIDENCE.md#p0-353-p1p2) 권장 순서를 참고한다.

| ID | 한 줄 | PR |
|----|--------|-----|
| **ST-02** | 상태 **표시 레이블** vs canonical — **label map** 일원화 | **별도 PR** |
| **ST-05** | `check-status`·**운영 메시지** — §4-1 취지 | **별도 PR** |
| **운영** | 내비·증빙 루틴 등 P2 잔여 | **별도 PR** (필요 시 행 단위로 쪼갬) |

**PR 본문(필수/권장):** `EVIDENCE-20260426-353` · `#p0-353-p1p2`

## 5. PR 분리 규칙 (필수)

1. **P0 잔여** / **P2 ST-02** / **P2 ST-05** / **P2 운영** — 서로 **다른 `PR`**. (한 PR에 두 행 ID를 넣지 않는다.)
2. **닫힌 축**(§2)과 **동일 `PR` 혼입 금지**.
3. **[343]~[352]**·질문셋 1·2순 **재오픈 금지**; **GW-0.2** `src/**`는 [352]·SPEC 분기대로 **별 EVIDENCE**.
4. `CaseStatus` **canonical** 변경이 필요하면 **즉시 중단**·팀·SPEC 판단 후 전용 작업.

## 6. 검증

- 문서·설정만: `npm run verify:canonical-sources`
- `src/**` 변경: `npm run verify:349-12` (팀 표준)
- 사건 상태 스캔: `python tools/aibeopchin_navigator.py check-status --scope case` — 결과는 [§4-1](IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지)대로 해석

## 7. 증빙 기록

실착 후 `IMPLEMENTATION_EVIDENCE.md` 해당 도메인 절·또는 신규 소절에 **수정 파일·검증 exit**를 한 줄 이상 남긴다.

**본 작업지시 앵커(증빙):** [#work-instruction-347-tier3-p0-p2-separate-pr](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-p0-p2-separate-pr)
