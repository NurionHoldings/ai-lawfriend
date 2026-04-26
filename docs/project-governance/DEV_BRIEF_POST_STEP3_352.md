# 개발자 작업지시 — Step 3 / Phase 종료 후 ([352]·[347] 3순)

**현재 기준:** [343]~[352] Step 3 / Phase 종료 점검은 문서·증빙 기준으로 완료 상태입니다. ([STEP3_PHASE_CLOSURE_CHECKLIST_343_352.md](STEP3_PHASE_CLOSURE_CHECKLIST_343_352.md))

---

## 1. [349] 후보 4 ①+②

- `src/**`, `package.json`, `scripts/*`, `verify:349-12` 로컬 게이트는 완료 처리됨.
- `npm run verify:349-12` exit 0 기록 완료.
- 앞으로 ①+② 관련 누적은 [349] 본절에만 기록.

## 2. [350] 후보 4 ③

- CI·PR 게이트·`.github/workflows/*`·파이프라인은 [350] 전용.
- GitHub Actions에서 `verify-349-12` success 확인 완료.
- Run URL: <https://github.com/kis1000burn-netizen/ai-lawfriend/actions/runs/24934281336>
- CI·최종 기록 [x] 완료.

## 3. [351]

- Step 3 1순위 잔여 재점검 완료.
- 추가 코드·시드·워크플로 착수 후보 없음.
- 1순위 종료 판정 완료.

## 4. [352]

- GW-0.2 본 주기 마감.
- 1단계 합의 의제 완료, 2단계 (가)/(나) 판정 완료.
- 이번 주기는 (나) 경로.
- 신규 `src/**` 착수 없음, B안 전환 없음, §5.4 행별 이관/유지 변경 없음, `API_SPEC` success/ok 강제 개정 없음.
- 3단계 문서 3종 선갱신 생략, 4단계 `src/**` 변경 미실시.

## 5. Step 3 / Phase 종료 점검표

**파일:** [STEP3_PHASE_CLOSURE_CHECKLIST_343_352.md](STEP3_PHASE_CLOSURE_CHECKLIST_343_352.md)

- §1 [343]~[352] 증빙별 역할: 전부 참
- §2 횡단 6항목: 전부 참
- §3 회귀 규칙: 참. 최신 tsc/test/원격 CI 재확인은 PR·릴리스 전 운용 절차로 고정.

**PR·릴리스 전 운용 확인 절차 (§3과 동일 취지):**

1. 로컬에서 `npm run verify:349-12` 실행
2. GitHub Actions: CI 워크플로에서 `verify-349-12` 최신 run success 및 Run URL 확보
3. 문서 갱신: [IMPLEMENTATION_EVIDENCE [349]·[350] 본절](IMPLEMENTATION_EVIDENCE.md) · [점검표 §3](STEP3_PHASE_CLOSURE_CHECKLIST_343_352.md#step3-phase-s3-closure) — 필요 시 인프라 행을 부 → 참

---

## 6. 다음 작업

**[347] 3순위** — ALIGNMENT / Case·인터뷰 잔여. **전용 개설:** [EVIDENCE-20260426-353](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353) (본 문서·[352]·**[348]~[352]** `PR` **과 분리**).

**P0 잔여·P2 실착:** [WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md](WORK_INSTRUCTION_347_TIER3_P0_P2_INTEGRATED.md) · [#work-instruction-347-tier3-p0-p2-integrated-audit](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-p0-p2-integrated-audit) — **실사·검증 한 번, 증빙은 축별**. **별 PR 원칙:** [WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md](WORK_INSTRUCTION_347_TIER3_P0_REMAINING_P2_SEPARATE_PR.md) · [#work-instruction-347-tier3-p0-p2-separate-pr](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-p0-p2-separate-pr). **353+·P1·P0 첫 코드 닫힘 유지**; **canonical `CaseStatus` 변경 없음**.

**[347] 3순 후속 활성 축:** [WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md](WORK_INSTRUCTION_347_TIER3_FOLLOWUP_AXES.md) · [#work-instruction-347-tier3-followup-axes](IMPLEMENTATION_EVIDENCE.md#work-instruction-347-tier3-followup-axes) — 통합 실착 완료 전제, **A §6 / B Case·인터뷰 / C GW-0.3·SPEC** 후보표·1순위 팀 선정.

**[353-1] 첫 PR (범위 확정·요약):** [ALIGNMENT §6-1·§6-2·§6-11](ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) — **ST-01~05**, **LC-01~02**, **UI-03** 행에 **문서 중심** 판정·관찰 스냅. `src/**` **0 또는 최소**. **제외:** `IV-01`·`IV-02`·admin `question-set` **대규모 편집**·**[343]~[352] 닫힌 축**. **PR** 제목 또는 본문에 **`EVIDENCE-20260426-353`** 또는 **명시적** `353+` **필수**. (전문: [IMPLEMENTATION_EVIDENCE [353] `첫 PR 후보·범위`](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353).)

**[353-1] 완료 후 — [353] vs `353+` (팀·확정):** [IMPLEMENTATION [353] 본절](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353) **「후속 구조(팀 확정 상태·2026-04-26)」** / **「`353+` 별도 PR — UI 가용」** 절. **[353] P0~P2** = **[347] 3순** **「ALIGNMENT / Case·인터뷰 잔여」** **궤적**만. **인터뷰 완료→Case**·**IV/LC** **구현** **축**은 **이 궤적**에 포함. `getAllowedCaseActions` / `allowedLifecycleActions` **및** UI **가용** **액션** **이중** **축** = **전용** **`353+` PR**만(§6-11, [310] **예외(2)**). **두 축**은 **동일** `PR`에 **혼입하지 않는다** (팀 지시).

**[353] P0 첫 코드 PR (팀 선정·2026-04-26):** [IMPLEMENTATION_EVIDENCE·P0 첫 작업 선정](IMPLEMENTATION_EVIDENCE.md#p0-353-첫-착수) — **IV-04**·**IV-05**·**LC-03**·**ST-03**; **핵심** **인터뷰 완료 → Case 전이** **한 경로** 정합. `POST .../interview/complete`, `completeCaseInterviewService`, 클라이언트 complete, FILE_REALIGN 1-B, ALIGN §6-2·§6-4. `getAllowedCaseActions` / `allowedLifecycleActions`·UI 가용 **이중 축**은 **`353+` 전용 `PR`**만(이번 **P0** `PR` **혼입 없음**). **실 `PR`:** 제목·본문 **한 곳 이상**에 `EVIDENCE-20260426-353`·`#p0-353-첫-착수`(**필수**), `#p0-353-작업지시`(**권장**). **상세** [작업지시](IMPLEMENTATION_EVIDENCE.md#p0-353-작업지시). **구현·§8 닫힘:** [기록](IMPLEMENTATION_EVIDENCE.md#p0-353-구현-20260426) · [완료 판정](IMPLEMENTATION_EVIDENCE.md#p0-353-완료-판정-8). **후속(P0 ST-01·P1·P2·353+):** [판정](IMPLEMENTATION_EVIDENCE.md#p0-353-p0-완료-후속).**

**주의:** [343]~[346] 재오픈 금지 · [349] ①+② 재오픈 금지 · [350]은 CI 증빙 완료 상태 · [352] GW-0.2는 (나) 경로로 마감 · 향후 GW-0.2에서 `src/**` 변경이 필요하면 별도 EVIDENCE / PR에서 (가)로 재판정 후 진행.

---

**산출:** [IMPLEMENTATION_EVIDENCE [352] 마감](IMPLEMENTATION_EVIDENCE.md#gw-0-2-352-마감) · [EVIDENCE-20260426-353 (3순 개설)](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-353) · `python tools/aibeopchin_navigator.py show-plan` · `post_352_next_347_tier3_alignment`
