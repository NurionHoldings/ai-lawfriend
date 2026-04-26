# Step 3 / Phase — 전체 종료 점검표 **[343]~[352]** {#step3-phase-closure-343-352}

**기준일(증빙·마감):** 2026-04-26 — **[352] GW-0.2 본 주기 [마감](IMPLEMENTATION_EVIDENCE.md#gw-0-2-352-마감)**.  
**범위:** [IMPLEMENTATION_EVIDENCE](IMPLEMENTATION_EVIDENCE.md) **EVIDENCE-20260425-343** ~ **EVIDENCE-20260426-352** (질문셋 2차 구현~백필·시드~346~347 후속~348/349/350~351~**GW-0.2 [352] 마감**).  
**전제(읽는 순서):** [SPEC #spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정) · [SPEC #step-3-싱글-소스-질문셋](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#step-3-싱글-소스-질문셋) · [CASE_STATUS_DEFINITION §7 Step 3](CASE_STATUS_DEFINITION.md#7-다음-문서-작업-순서-프로젝트-기준) · `python tools/aibeopchin_navigator.py show-plan`

**채움 기준 (2026-04-26, 팀/운용·문서권):** 아래 **참/부** 는 **IMPLEMENTATION_EVIDENCE** 각 절·[352] **마감**·`aibeopchin_navigator.py` **문자열**·본 표 **대조** 결과다. **로컬에서 `tsc`·`test`·원격 CI를 이 세션에 재실행하지 않음** — **최신 바이너리 검증**은 §3·각 증빙 **본절 표**·**CI** 를 **운용 주기**에서 **재실행**해 **갱신**한다.

---

## 1. Evidence별 종료·점검 (343 → 352)

| ID | 증빙 (앵커) | 한 줄 (역할) | 점검 (끝났을 때) | **참/부** |
|----|-------------|-------------|-----------------|-----------|
| **[343]** | [EVIDENCE-20260425-343](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-343) | `definitionJson` → A안 `questions` (β) + 게시 `PATCH` 트랜잭션 | (β) 공용 투영·`publish` 경로·본 절 `검증`·테스트·문서(§14-1) **기록·통과** | **참** — 본절 `검증`·`목적`·산출 **완** 기록 |
| **[344]** | [EVIDENCE-20260425-344](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-344) | B §3 백필 (publish HTTP 없이 멱등 `UPDATE` + 스크립트) | `backfill-question-set-questions`·(β) 재사용·본 절 `검증` **기록** | **참** — 백필·절·검증 **기록** |
| **[345]** | [EVIDENCE-20260425-345](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-345) | 시드 전용: `prisma/seed`·`QuestionSet`·publish **분리** | `seed-question-sets`·멱등·publish 미호출·**[345] 잠금(완료)** **본절** | **참** — **잠금·완료**·선택 2b **본절** |
| **[346]** | [EVIDENCE-20260425-346](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-346) | **종료:** A(`visibility`)·B(`documentMapping`) **완** · C·D **스킵** | PR-346-A·B **완** · C·D **스킵** 판정·**[347]+** **로** **넘어갈** **상태** | **참** — 종료 판정 **본절** |
| **[347]** | [EVIDENCE-20260425-347](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-347) | 후보 1/2/3 **선정** (1순 Step 3 잔여 · 2순 **GW-0.2** · 3순 ALIGNMENT/Case) | [SPEC #spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정)·후속 단위·**[343]~[346] 재오픈 없음** **유지** | **참** — 후보·금지·SPEC 앵커 **기록** |
| **[348]** | [EVIDENCE-20260425-348](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-348) | 1순: **문서·스냅·운용 로그·회귀** (코드 `src` 없이 회귀만) | `tsc` / `lint` / `verify:canonical-sources` / `test` **회귀·표**·**[349]·[350]과 혼재 없음** | **참** — **2026-04-25** 표·exit 0 **기록**; **최신** **재실행**은 §3·운용 |
| **[349]** | [EVIDENCE-20260425-349](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-349) | 1순: **코드·시드·자동검·런타임** (349+; 348·350과 **분리** PR) | [349] **본절** **완료**·`safeParse`·`verify:349-12`·**③** [350] **쌍** **기록**·**[343]~[346] 재오픈 없음** | **참** — **완료**·쌍 [350]·재오픈 **없음** **본절** |
| **[350]** | [EVIDENCE-20260425-350](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-350) | 후보 4 **③** CI / PR / workflows (349와 **쌍**; 349 **혼입 금지**) | `ci`·**원격**·workflows·본 절 **성공 기록** | **참** — **2026-04-25** CI·쌍 349·**혼입 금지** **본절** |
| **[351]** | [EVIDENCE-20260426-351](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-351) | **1순(347) 종료**·추가 착수 후보 없음 → **2순 GW-0.2** | 1순 **종료 판정**·**2순** 문서·합의·**`src` 합의 전 금지** **전제** **확인** | **참** — **1순 없음**·2순·금지 **본절** |
| **[352]** | [EVIDENCE-20260426-352](IMPLEMENTATION_EVIDENCE.md#evidence-20260426-352) | **GW-0.2 본 주기 [마감](IMPLEMENTATION_EVIDENCE.md#gw-0-2-352-마감)** (비기본·문서) | **1)·2) 완료**·**이번 주기 (나)**·**3) 문서 3종 생략**·**4) 이번 `src` 없음**·향후 **별** EVIDENCE/PR·**(가) 재판정** **본절** | **참** — [§「마감」](IMPLEMENTATION_EVIDENCE.md#gw-0-2-352-마감)·1)2) 표·(나) **기록** |

---

## 2. Step 3 / Phase (347 후속) 전체·횡단 점검

다음을 **한 번**에 **참(Yes)** 으로 두면, **[343]~[352] 기록 주기** 기준 **Step 3(333~) 잔여 + 2순 GW-0.2** **문서 궤적**이 **닫힌 것**으로 본다 (코드 **신규 착수**·**2·3순** **혼재** **금지**는 기존 증빙과 동일).

| # | 점검 항목 | 참/부 | 비고 (2026-04-26) |
|---|-----------|-------|-------------------|
| 1 | **[347]** 후보 **1(Step 3 잔여)** 는 **[348]·[349]·[350]** 에 **누적**되고, **2·3순([GW-0.2], ALIGNMENT/Case)** 와 **혼재 PR/EVIDENCE 없음** | **참** | [347] `혼재 금지`·[348/349] `판정 규칙`·[352] **별도** EVIDENCE **기록** |
| 2 | **[351]** **1순 종료**·**2순 GW-0.2** **전환** **기록** **있음** | **참** | [351] **본절** **한 줄 결론**·1순 없음·2순 |
| 3 | **[352]** **1) A·B·C** + **2) (가)/(나)** = **(나)** + **[352] 본 주기 [마감](IMPLEMENTATION_EVIDENCE.md#gw-0-2-352-마감)** **기록** **있음** | **참** | 1) 표·2) 표·[§「마감」](IMPLEMENTATION_EVIDENCE.md#gw-0-2-352-마감) |
| 4 | **이번 [352] 흐름**에서 **신규 `src/**`·B안 전환·§5.4 행 이관/유지·`API_SPEC` success/ok 강제** **없음** (마감 절 **일치**) | **참** | [352] **검증**·**마감** **문장**; **이번** **커밋** **=** **거버넌스·내비** ( §3) |
| 5 | **`show-plan` · `governance_321_work_units[1]` (GW-0.2)** 가 [SPEC #gw-0-2-범위-완료](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-2-범위-완료)·**[352] `post_352`** **취지** **와** **1:1** (문서·내비) | **참** | `PROJECT_PLAN` GW-0.2·`post_352`·(나)·마감·SPEC **70행 (4)** **문서 정합**; **`show-plan` 콘솔** **가시 확인**은 **운용** (선택) |
| 6 | **향후** GW-0.2 **`src`·B안·§5.4** 등은 **별** `EVIDENCE` / `PR` + **(가) 재판정** **전제** **문서** **확인** (마감 절) | **참** | [352] **마감** **마지막** **절**·고정 **4)**·**1:1** **순서** |

---

## 3. 재현·운용: 회귀 재실행 규칙 {#step3-phase-s3-closure}

| 규칙 | **참/부** | 설명 |
|------|-----------|------|
| **[348] 본절** 표·명령 ( `tsc` / `lint` / `verify:canonical-sources` / `test` ) 를 **회귀 재실행**할 때 **준수** | **참** (규칙 채택) | **최신** `exit 0` **갱신**은 **CI·로컬** **운용**; **이 점검**은 **기록** **기준 2026-04-25** **둠** |
| **[349] 본절** ( `tsc`·`lint`·`verify`·`test` / `verify:349-12` ) **쌍**·**[350] CI** **재실행** **준수** | **참** (규칙 채택) | 동일·**최신** **바이너리** = **PR/운용** **시** each |
| **원격** `CI` ( [350] ) **`verify-349-12` success** (Run URL·EVIDENCE) | **참** (기록) | [350] [CI run](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-350-ci-run) `https://github.com/kis1000burn-netizen/ai-lawfriend/actions/runs/24934281336` . 이후 **최신** 확인은 **PR·릴리스** **전** §3 **절차**·[349]/[350] **갱신** |

**PR·릴리스 전 (권장 순서, §3·[348]/[349]/[350] 쌍):**

1. 로컬 **`npm run verify:349-12`** 실행 → **exit**·**실행 일시(날짜)** 기록 (내부: `tsc`·`lint`·`verify:canonical-sources`·`test` — [349] 본절·[`package.json`](../../package.json) 와 동일).
2. **GitHub Actions** (저장소 **Actions** UI) · workflow **`CI`** ([`ci.yml`](../../.github/workflows/ci.yml)) **job** **`verify-349-12`** **최신** run **= success** 확인 → **Run URL** 기록.
3. [IMPLEMENTATION_EVIDENCE [349]](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-349)·[[350] CI run](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-350-ci-run) 본절(로컬·CI)에 **날짜·exit·Run URL** 갱신. **최신** 배포·릴리스 **전** 동일 **§3** 절차로 표를 다시 맞춘다(원격 **행** = **참(기록) 유지**).

---

**산출:** [IMPLEMENTATION_EVIDENCE [352] 마감](IMPLEMENTATION_EVIDENCE.md#gw-0-2-352-마감) (점검표 **링크** ) · [개발자 작업지시(3순)](DEV_BRIEF_POST_STEP3_352.md) · [SPEC #spec-347-후속-고정](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-347-후속-고정) · [`aibeopchin_navigator.py` `show-plan`](../../tools/aibeopchin_navigator.py) · 본 `STEP3_PHASE_CLOSURE_CHECKLIST_343_352.md` **#step3-phase-closure-343-352**

