# 정의서 대비 구현 역점검 — R1~R9 **행** 누적 (v1)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | AIBEOPCHIN-SPEC-IMPL-REAUDIT-ROWS-V1 |
| 상태 | v1 **누적** — **역점검 본맥**·**핵심 축(R3·R4·R5·R6·R8) 1차** **종료** 선언 ([EVIDENCE-20260423-313](./IMPLEMENTATION_EVIDENCE.md)) |
| 차기 착수 | **Step 3** [343](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-343)·[344](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-344) **(게** **시** **투** **영** **+** `publish` **·** **B** **§3** **백** **필** **·** **절** **차` **첫` **배` **치` **완` **)** **—** **다** **음** **단위** : `visibility`·`documentMapping`·A안 **확** **장** = **별** EVIDENCE **·** [342](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-342) **(B** **§4** **·** [본문](./EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md#4-구현-여부형태-결정)) **·** [341](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-341) **(B** **§3** **잠** **금** **완` **·` **[344` **는` **코` **드` **·` **runbook` **)** **·** [340](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-340) **(§2` **)` **·** [339](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-339) **(§1` **)` **·** [338](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-338) **(2차** **EVIDENCE**·[전체](./EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md) **§1~4` **)` **—** [337](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337) **(1차** **종료` **)` **.** **이후** **배포` **=` **시드** [§4.5](./EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#45-시드) **·` **별` **단` **위` **EVIDENCE` **.** [336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336)·[335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335)·[334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334)·[333](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-333) **·** [#step-3-싱글-소스-질문셋](#step-3-싱글-소스-질문셋) **.** [332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332) **(§14-1` **)` **완` **.** **(참고` **잠` **금` **)** [327](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-327) **.** **(후순` **)** B안/IO/§5.4·[GW-0.4 (가)](#gw-0-4-범위-완료) **.** §5 **닫` **힘` ** [320] **·` ** [314]·[§7.1](./CASE_STATUS_DEFINITION.md#71-phase-1-첫-실작업--기준선-고정-2026-04-23) **. |
| 기준 | [SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) **§1·§3** — **R1~R9** |
| 상위·교차 | [POST_278_API_CLIENT_ENVELOPE_V1.md](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§16** |
| R9(전역) | [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) **§6** 본문(축 1~12) — **화면·도메인 세부**는 여기 **우선** 누적, 본 문서 R와 **교차 ID**로 연결 |
| 증빙 | [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **…(283~343)** — 본문 [EVIDENCE_STEP3_A…](./EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md) · [EVIDENCE_STEP3 B…](./EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md) (333~ **정합** · [334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) · [335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335) · [336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336)·[스냅](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot) · [337](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337) **1차** **종료**·**동기** **분리** · [338](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-338) **2차** **동기** **착수** · [339](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-339) **B** **§1** **이중** **정본** · [340](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-340) **B** **§2** **게시** **시점** · [341](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-341) **B** **§3** · [342](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-342) **B** **§4** **구** **현** **형** **태** · [343](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-343) **투** **영** ) — **[EVIDENCE-20260423-299]** (ALIGNMENT **§6** 교차) — **[EVIDENCE-20260423-300]** (R6·R8 **대표**·**본맥 1차**) — **[EVIDENCE-20260423-302]** (§4.2 **4칸** **동일군**) — **[EVIDENCE-20260423-303]** (§5.3 **4칸** **동일군**) — **[EVIDENCE-20260423-304]** (§8.3 R8-301~307 **4칸** **동일군**) — **[EVIDENCE-20260423-305](./IMPLEMENTATION_EVIDENCE.md)** ( **본맥 1차 완료 선언** ) — **[EVIDENCE-20260423-306](./IMPLEMENTATION_EVIDENCE.md)** ( **C(R6) A안** 잠금 ) — **[EVIDENCE-20260423-307](./IMPLEMENTATION_EVIDENCE.md)** ( **R3·R9(ST) 2차 심화** ) — **[EVIDENCE-20260423-308](./IMPLEMENTATION_EVIDENCE.md)** ( **§3.1(a)** soft delete **DTO** ) — **[EVIDENCE-20260423-309](./IMPLEMENTATION_EVIDENCE.md)** ( **§3.1(b)** 액션 UI·RB ) — **[EVIDENCE-20260423-310](./IMPLEMENTATION_EVIDENCE.md)** ( **§3.1(c)** 2차 **마감** ) — **[EVIDENCE-20260423-311](./IMPLEMENTATION_EVIDENCE.md)** ( **본맥 바깥 분기** ) — **[EVIDENCE-20260423-312](./IMPLEMENTATION_EVIDENCE.md)** ( **C(R6) A안 후속** **마감** ) — **[EVIDENCE-20260423-313](./IMPLEMENTATION_EVIDENCE.md)** ( **1차·핵심 축** **종료**·**Phase** **전환** **고정** ) — **[EVIDENCE-20260423-314](./IMPLEMENTATION_EVIDENCE.md)** ( **§7.1** **Phase1** **첫** **실작업**·**FILE_REALIGN**·`show-plan` **기준선** ) — **[EVIDENCE-20260423-315](./IMPLEMENTATION_EVIDENCE.md)** ( **FILE_REALIGN** **Batch** **1-A/1-B** **확정** ) — **[EVIDENCE-20260423-316](./IMPLEMENTATION_EVIDENCE.md)** ( **Batch** **1-A** **실행**·**판정**·**완료** ) — **[EVIDENCE-20260423-317](./IMPLEMENTATION_EVIDENCE.md)** ( **Batch** **1-B** **인터뷰**·**완료**·`allowedLifecycleActions` ) — **[EVIDENCE-20260423-318](./IMPLEMENTATION_EVIDENCE.md)** ( **FILE_REALIGN** **§5** **Batch** **A** **실행**·**판정** ) — **[EVIDENCE-20260423-319](./IMPLEMENTATION_EVIDENCE.md)** ( **FILE_REALIGN** **§5** **Batch** **B** **실행**·**판정** ) — **[EVIDENCE-20260423-320](./IMPLEMENTATION_EVIDENCE.md)** ( **FILE_REALIGN** **§5** **Batch** **C** **실행**·**판정** ) — **[EVIDENCE-20260423-321](./IMPLEMENTATION_EVIDENCE.md)** ( **SPEC** **§0**·**거버넌스**·**[320]** **이후** **문구·내비** **정렬** ) — **[EVIDENCE-20260423-322](./IMPLEMENTATION_EVIDENCE.md)** ( **GW-0.1~0.4**·`show-plan` **동기** ) — **[EVIDENCE-20260423-323](./IMPLEMENTATION_EVIDENCE.md)** ( **GW-0.1** **완료**·`#gw-0-1-범위-완료` ) — **[EVIDENCE-20260423-324](./IMPLEMENTATION_EVIDENCE.md)** ( **GW-0.2**·**비기본**·`#gw-0-2-범위-완료` ) — **[EVIDENCE-20260423-325](./IMPLEMENTATION_EVIDENCE.md)** ( **GW-0.3**·**비기본**·`#gw-0-3-범위-완료` ) — **[EVIDENCE-20260423-326](./IMPLEMENTATION_EVIDENCE.md)** ( **GW-0.4**·`#gw-0-4-범위-완료` ) — **[EVIDENCE-20260423-327](./IMPLEMENTATION_EVIDENCE.md)** ( **GW-0.1~0.4** **정렬 주기** **1차** **완료**·`#gw-0-정렬-주기-1차-완료` ) — **[EVIDENCE-20260423-328](./IMPLEMENTATION_EVIDENCE.md)** ( **Step 3** **질문셋** **본착수**·`#step-3-질문셋-본착수` ) — **[EVIDENCE-20260423-329](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-329)** ( **질문셋** **싱글소스** **1차** **스캔** **·** **로드맵** **·** `#step-3-싱글-소스-질문셋` ) — **[EVIDENCE-20260423-330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330)** ( **A안(questions** **JSON)** **런타임** **잠금** **·** **getInterviewFlow+complete** **동일** **기준** ) — **[EVIDENCE-20260423-331](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-331)** ( **질문** **유형** **3층** **매핑**·[QUESTION_TYPE_MAPPING](QUESTION_TYPE_MAPPING.md) ) — **[EVIDENCE-20260423-332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332)** ( **질문셋** **admin** **UI** **경계**·**고아** **client** **삭제** ) — **[EVIDENCE-20260425-333](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-333)** ( **333~** **A안·definitionJson·시드** **정의·데이터** **정합** **착수**·[EVIDENCE_STEP3_A…](./EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md) ) — **[EVIDENCE-20260425-334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334)** ( **§4** **1차** **대조**·**정적** ) — **[EVIDENCE-20260425-335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335)** ( **admin** **안내·정책** **문구** ) — **[EVIDENCE-20260425-336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336)** ( **활성** **1행**·[스냅](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot) ) — **[EVIDENCE-20260425-337](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337)** ( **333~** **1차** **종료**·**동기** **분리** ) — **[EVIDENCE-20260425-338](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-338)** ( **2차** **동기** ) |

**스냅샷(코드) 기준일:** 2026-04-23 — `src` 정적 조사·`npx tsc --noEmit` 통과(문서 작업) 시점.

## §0 — 차기 착수·역점검 본맥

### [346] 종료 · [347]+ **후속 (고정 앵커)** {#spec-347-후속-고정}

**전제 (한 줄):** [EVIDENCE-20260425-346](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-346) — [346] **종료** (PR-346-A `visibility`·PR-346-B `documentMapping` **완**; PR-346-C/D **스** **킵**). **[343]·[345] 재오픈 없음** ([345](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-345) **잠금** **유** **지**).

**새 착수 (읽는 순서):** (1) **본** **절** (2) [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md) **최상단** [EVIDENCE-20260425-347](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-347) (3) `python tools/aibeopchin_navigator.py` `show-plan` **→** `[346]`·`[347]+` (4) 아래 [320] 이후 [읽는 순서](#spec-320-이후-거버넌스-순서) (고정 항·GW·Step 3 궤적).

**후속 작업 단위 (기록):** [347]+에서 **다음** **PR/EVIDENCE** **번호**·**범위** **(B안** **/** **IO** **/** **§5.4,** **Step 3** **잔** **여,** **기** **타** **)** **를** [EVIDENCE-20260425-347](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-347) **본** **절** **에** **채** **운** **다.** **(** **2026-04-25** **:** **선** **정** **됨** **—** **후** **보** **1~3** **·** **우** **선** **순** **위** **/ 배** **제** **·** [343][345][346] **비** **재** **오** **픈** **=** **본** **절** **.)**

**[348]·[349]·2·3순 (고정, 2026-04-25~):** [EVIDENCE-20260425-348](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-348) = [347] **1순** **Step 3** **잔** **여**·**운** **용** **—** **문** **서**·**스** **냅**·**운** **용** **로** **그**·**회** **귀** **재** **실** **행** **은** [348] **에** **만** **누** **적** **(** **초** **기** **회** **귀** **=** **코** **드** **변** **경** **없** **음** **확** **정** **). ** [EVIDENCE-20260425-349](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-349) **(349+** **,** **전** **용** **)** **=** `src/**` **변** **경**·**시** **드** **변** **경**·**자** **동** **검**·**런** **타** **임** **—** [343]~[346] **비** **재** **오** **픈** **. ** **GW-0.2**·**ALIGNMENT/Case** **(2**·**3** **순** **)** **=** [320] **이** **후** [읽는 순서](#spec-320-이후-거버넌스-순서) **따** **라** **별** **도** `EVIDENCE` **/** `PR` **,** **[348]·[349]** **와** **혼** **재** **금** **지** **.**

### [320] 이후 — SPEC·거버넌스 **읽는 순서 (고정)** {#spec-320-이후-거버넌스-순서}

**고정점:** [EVIDENCE-20260423-320](./IMPLEMENTATION_EVIDENCE.md) — [FILE_REALIGN **§5** A/B/C](./FILE_REALIGN_PATCH_V1.md#5-최소-반영-배치-세트) (316~320; [Batch **C**](./FILE_REALIGN_PATCH_V1.md#file-batch-c-실행)로 마감). 이후 문서·증빙·내비는 **아래 순서**로 맞춘다.

1. **본 문서** — §0(상단 [#spec-347-후속-고정](#spec-347-후속-고정) · 아래 `이후 분기`·C(R6)·B안/IO·ROWS 비기본).  
2. **증빙** — [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 최상단 `[EVIDENCE-…-347]`·`[EVIDENCE-…-346]`~`[EVIDENCE-…-343]` (누적) · [EVIDENCE_STEP3_A…](./EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md) · [EVIDENCE_STEP3 B…](./EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md) · [EVIDENCE_STEP3_ACTIVE…](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot) ( **336** · [337 1차 종료](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337) · [338 2차 동기](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-338) · [339 B §1](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-339) · [340 B §2](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-340) · [341 B §3](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-341) · [342 B §4](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-342) · [343 투영](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-343) ).  
3. **내비** — `python tools/aibeopchin_navigator.py show-plan` **→** `[320] 이후` / `[321] 기준` / `governance_321_work_units`.  
4. (참고) [CASE_STATUS_DEFINITION **§7~§7.1**](./CASE_STATUS_DEFINITION.md#7-다음-문서-작업-순서-프로젝트-기준) · [FILE_REALIGN](./FILE_REALIGN_PATCH_V1.md) — **Phase 1~§5** 실작업·재정렬은 320 **이전**에 닫힌다; 320 **이후** B안·IO·§5.4·ROWS **미세**·질문셋 Step 3 = **§0「이후 분기」**·[313](./IMPLEMENTATION_EVIDENCE.md) **와 직교** (개별 축 = **낮은 우선**·별도 증빙).

### [321] 기준 **거버넌스 실작업 단위 (GW-0.1~0.4)** {#spec-320-거버넌스-작업-단위}

**전제(고정점):** [FILE_REALIGN §5 A/B/C](./FILE_REALIGN_PATCH_V1.md#5-최소-반영-배치-세트) [320](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-320) **닫힘** · [321](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-321) (§0·내비) · [322](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-322) (GW 표·`show-plan`) · [323](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-323) (GW-0.1) · [324](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-324) (GW-0.2·**비기본**) · [325](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-325) (GW-0.3·**비기본**) · [326](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-326) (GW-0.4·**검증·조건부**) · [327](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-327) (**GW-0.1~0.4** **정렬 주기** **1차** **잠금**) · [328](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-328) (**Step 3** **질문셋** **본착수** **개설**) · [329](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-329) (**질문셋** **싱글소스** **1차** **스캔** **·** **로드맵**·[#step-3-싱글-소스-질문셋](#step-3-싱글-소스-질문셋)) · [330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330) (**A안(questions** **JSON)** **런타임** **잠금**·**getInterviewFlow+complete** **동일** **기준**) · [331](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-331) (**질문** **유형** **3층** **매핑**·[QUESTION_TYPE_MAPPING](QUESTION_TYPE_MAPPING.md)) · [332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332) (**질문셋** **admin** **UI** **§14-1**·**고아** **제거**) · [333](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-333) (**A안·definitionJson·시드** **정합** **축** **개설**) · [334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) (**§4** **1차** **대조**·[전용](./EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#section-4-alignment-check-1)) · [335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335) (**admin** **안내**·[§14-1](./QUESTION_SET_DEFINITION.md#141-app-라우트--관리-ui-step-3-경계-고정) **정책**) · [336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336) (**활성** **행**·[스냅](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot)**) · [337](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337) (**1차** **종료**·**334~336** **묶음**·**동기=별도** `EVIDENCE` **) · [338](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-338) (**2차** **동기**·[B](./EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md) **) · [339](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-339) (**B** **§1** **이중** **정본** ) · [340](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-340) (**B** **§2** **저장** **시점** ) · [341](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-341) (**B** **§3** **백** **필/시** **드** **) · [342](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-342) (**B** **§4** **구** **현** **형** **태** **) · [343](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-343) (**투** **영**+**게** **시** **동** **기** **)**

| 단위 | 실작업(산출) | `show-plan` / 증빙 (동일 순서) |
|------|----------------|------------------------------|
| **GW-0.1** | §0 **훑기** — [이후 분기 (고정)](#이후-분기-고정) · [C(R6)](#c6-userssearch-예외군--a안-잠금) (닫힘, 참조만) · B안/IO/ROWS **비기본** **표시** **([범위·완료](#gw-0-1-범위-완료))** | (1) 본 **§0** (2) [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md) **최상단** (3) `show-plan` — 착수 시 `EVIDENCE` **한 블록** (예: [323](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-323)) |
| **GW-0.2** | (선택·**비기본**) **B안**·[IO](./IO_DATA_DEFINITION.md)·[§5.4](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#54--서버명세-합의-체크리스트) **합의** ([범위·완료](#gw-0-2-범위-완료)) | 합의 **전** `src/**` **변경** **금지** (§5.4). 착수 시: 별도 `EVIDENCE` (예: [324](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-324)) + [POST_278](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§6.3** **직교** |
| **GW-0.3** | (선택·**비기본**) [CASE **§7**](./CASE_STATUS_DEFINITION.md#7-다음-문서-작업-순서-프로젝트-기준) **Step 3** **질문셋** — [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) **([범위·완료](#gw-0-3-범위-완료))** | §5/320 **이후** **궤도**; 착수 시 **별도** `EVIDENCE` (예: [325](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-325)); **IMPLEMENTATION** **최상단** · `show-plan` **셋째** bullet **1:1** |
| **GW-0.4** | **(조건부·검증)** 상태·`CaseStatus`·스키마(예: `prisma`)·정의서 **실수정** **시** — `verify` + `check-status` ([범위·완료](#gw-0-4-범위-완료)) | **수정 있을 때:** `npm run verify:canonical-sources` **+** `py -3 tools/aibeopchin_navigator.py check-status --scope case` (해석: [IMPLEMENTATION **§4-1**](./IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지) ). 착수·정렬: **별도** `EVIDENCE` (예: [326](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-326)); `show-plan` **넷째** bullet **1:1** |

#### GW-0.1 **범위·완료 판정 (실행 기준)** {#gw-0-1-범위-완료}

**GW-0.1은 [320] 완료 이후 SPEC §0와 거버넌스 작업 단위를 실제 실행 단위로 잠그는 첫 단계다. 이번 단위에서 기준 문구, 증빙 연결, `show-plan` 순서를 동일하게 유지하는지 확인하고 완료 판정을 남긴다.** (새 도메인 구현 없음.)

**GW-0.1 범위 (문서·파일):**

- **포함:** 본 `SPEC` §0 ([읽는 순서](#spec-320-이후-거버넌스-순서) · [이후 분기 (고정)](#이후-분기-고정) · [C(R6)](#c6-userssearch-예외군--a안-잠금) 참조) · 상기 **GW-0.1** 표(두 열) · [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) (GW-0.1 전용 `EVIDENCE` 블록) · [`aibeopchin_navigator.py`](../../tools/aibeopchin_navigator.py) `governance_321_work_units` 첫 항(본 표·본 절과 1:1).
- **제외:** [GW-0.2] B안·IO·§5.4 본 착수 · [GW-0.3] `QUESTION_SET_DEFINITION` 본 착수 · [GW-0.4] 상태/스키마를 바꾸지 않는데 `verify`/`check-status`만 강제 실행 · `src/**` 기능 구현 · R1~R9 대량 행 추가 ([322](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-322)의 비기본 경계와 동일).
- **완료 판정 (셋):** (1) 위 `GW-0.1` 표 + 본 절이 **실행 기준**으로 읽힌다. (2) [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-323)에 `EVIDENCE-20260423-323` (또는 동일 취지 블록)이 있다. (3) `show-plan`의 `GW-0.1` bullet이 (1)과 **같은 뜻(1:1)** 이다.

`show-plan` **「[321] 기준 - 거버넌스 실작업 단위」**의 첫 bullet(`GW-0.1`)은 `PROJECT_PLAN['governance_321_work_units'][0]`이며, 상기 `GW-0.1` 표·본 절([#gw-0-1-범위-완료](#gw-0-1-범위-완료))과 **같은 뜻(1:1)** 이어야 한다.

#### GW-0.2 **범위·완료 판정 (비기본, 실행 기준)** {#gw-0-2-범위-완료}

**GW-0.2**는 B안(서버 `ok`·envelope), [IO](./IO_DATA_DEFINITION.md), [POST_278 **§6.3**](./POST_278_API_CLIENT_ENVELOPE_V1.md), [§5.4 서버명세 합의](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#54--서버명세-합의-체크리스트) **비기본** 축이다. [§0 이후 분기 (고정)](#이후-분기-고정)과 [313]에서 말한 대로, **같은 우선의 기본 궤도는 아님** — **합의·증빙** 후에만 `src` 반영.

**GW-0.2 범위 (문서·파일):**

- **포함:** 상기 **GW-0.2** 표(두 열) · [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) · [POST_278](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§6.3** · [§5.4](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#54--서버명세-합의-체크리스트) · [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) (GW-0.2 전용 `EVIDENCE` 블록) · [`aibeopchin_navigator.py`](../../tools/aibeopchin_navigator.py) `governance_321_work_units` **둘째** **항** (본 표·본 절과 1:1).
- **제외:** [GW-0.1] §0 훑기만(323 닫힘) · [GW-0.3] 질문셋 본 착수 · [GW-0.4] 정의/스키마 수정이 아닐 때 검증만 강제 · **합의 전** 임의 `src/**` B안/IO 반영(§5.4).

**완료 판정 (넷, 비기본 분기 필수):** (1) 위 `GW-0.2` 표 + 본 절이 **실행 기준**으로 읽힌다. (2) [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-324)에 `EVIDENCE-20260423-324` (또는 동일 취지)가 있다. (3) `show-plan`의 `GW-0.2` **둘째** bullet이 (1)과 **같은 뜻(1:1)** 이다. (4) **비기본 분기**를 한 줄로 남긴다 — **(가)** 합의 후 `src` 착수 **있음** / **(나)** **이번 기록 주기**에서 합의·코드 **없음** (미착수·대기).

`show-plan` **「[321] 기준」**의 `GW-0.2` bullet = `PROJECT_PLAN['governance_321_work_units'][1]` = 본 `GW-0.2` 표·[#gw-0-2-범위-완료](#gw-0-2-범위-완료)와 **같은 뜻(1:1)** 이어야 한다.

#### GW-0.3 **범위·완료 판정 (비기본, 실행 기준)** {#gw-0-3-범위-완료}

**GW-0.3**은 [CASE_STATUS_DEFINITION **§7**](./CASE_STATUS_DEFINITION.md#7-다음-문서-작업-순서-프로젝트-기준) **Step 3** (질문셋), [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md), [320](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-320) **이후** 궤도의 **비기본** 축이다. §0 [이후 분기 (고정)](#이후-분기-고정)과 같이 **기본 일정과 동일 우선이 아님** — **증빙·분기** 후 **질문셋 본 착수**·`src/**` 반영.

**GW-0.3 범위 (문서·파일):**

- **포함:** 상기 **GW-0.3** 표(두 열) · [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md) **§7** (Step 3 맥락) · [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) (축·참조) · [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) (GW-0.3 전용 `EVIDENCE` 블록) · [`aibeopchin_navigator.py`](../../tools/aibeopchin_navigator.py) `governance_321_work_units` **셋째** **항** (본 표·본 절과 1:1).
- **제외:** [GW-0.1]·[GW-0.2] 단위 **재실행** (323·324 닫힘) · [GW-0.4] 상태/스키마 수정이 아닐 때 검증만 강제 · **분기 (나)** 인데 `QUESTION_SET_DEFINITION`·질문셋 **관련** `src/**` **임의** 대량 변경.

**이번 주기 실착수 범위 (기록 필수):** **(A)** SPEC·`#gw-0-3-범위-완료`·`EVIDENCE-20260423-325`·`show-plan` **셋째** bullet **정렬만** / **(B)** `QUESTION_SET_DEFINITION`·질문셋 **코드/정의 본 착수** **포함**. — 이번 기록에서는 **(A)** 를 실착수로 둔다.

**완료 판정 (다섯, 실착수·비기본 분기 필수):** (1) 위 `GW-0.3` 표 + 본 절이 **실행 기준**으로 읽힌다. (2) [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-325)에 `EVIDENCE-20260423-325` (또는 동일 취지)가 있다. (3) `show-plan`의 `GW-0.3` **셋째** bullet이 (1)과 **같은 뜻(1:1)** 이다. (4) **이번 주기 실착수 범위**를 한 줄로 남긴다 — 위 **(A)/(B)** 중 **어느 층**까지 착수했는지. (5) **비기본 분기**를 한 줄로 남긴다 — **(가)** Step 3·질문셋 **본 착수**·관련 **산출** **있음** / **(나)** **이번 기록 주기**에서 질문셋 **본 착수·코드 없음** (정렬·대기만).

`show-plan` **「[321] 기준」**의 `GW-0.3` bullet = `PROJECT_PLAN['governance_321_work_units'][2]` = 본 `GW-0.3` 표·[#gw-0-3-범위-완료](#gw-0-3-범위-완료)와 **같은 뜻(1:1)** 이어야 한다.

#### GW-0.4 **범위·완료 판정 (검증·조건부, 실행 기준)** {#gw-0-4-범위-완료}

**GW-0.4**는 상태·`CaseStatus`·스키마(예: `prisma/schema.prisma`)·기준 **정의서**를 **실제로 수정한 작업**에 대해 [IMPLEMENTATION_EVIDENCE **§4**](./IMPLEMENTATION_EVIDENCE.md#4-상태-관련-추가-강제-규칙)(`verify` + `check-status --scope case`·[§4-1](./IMPLEMENTATION_EVIDENCE.md#4-1-check-status-결과-해석-오해-방지))을 묶는 **조건부 검증** 축이다. [GW-0.1 **제외**](#gw-0-1-범위-완료)와 같이, **수정이 없는데** 위 명령만 **GW-0.4 완료**의 필수로 **강제하지 않는다**.

**GW-0.4 범위 (문서·파일):**

- **포함:** 상기 **GW-0.4** 표(두 열) · [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md)·[CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) 등 **상태**·라이프사이클 **정의서** (참조) · [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **§4**·**§4-1** · (GW-0.4 전용 `EVIDENCE` 블록) · [`aibeopchin_navigator.py`](../../tools/aibeopchin_navigator.py) `governance_321_work_units` **넷째** **항** (본 표·본 절과 1:1).
- **제외:** [GW-0.1]~[GW-0.3] 단위 **재실행** (323~325 닫힘) **전제 위반** · **스키마·정의서 미수정**인데 **검증만** `GW-0.4` **필수**로 **꾸밈** (본 절·GW-0.1 **제외**와 **모순**).

**이번 주기 실착수 범위 (기록 필수):** **(A)** SPEC·`#gw-0-4-범위-완료`·`EVIDENCE-20260423-326`·`show-plan` **넷째** bullet **정렬만** / **(B)** 정의서·스키마 **실수정** + **필수** `npm run verify:canonical-sources`·`check-status --scope case` **실행·로그** **본 EVIDENCE에 포함**. — 이번 기록에서는 **(A)** 를 실착수로 둔다.

**완료 판정 (다섯, 실착수·비기본 분기 필수):** (1) 위 `GW-0.4` 표 + 본 절이 **실행 기준**으로 읽힌다. (2) [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-326)에 `EVIDENCE-20260423-326` (또는 동일 취지)가 있다. (3) `show-plan`의 `GW-0.4` **넷째** bullet이 (1)과 **같은 뜻(1:1)** 이다. (4) **이번 주기 실착수 범위**를 한 줄로 남긴다 — 위 **(A)/(B)** 중 **어느 층**까지 착수했는지. (5) **비기본 분기**를 한 줄로 남긴다 — **(가)** 정의서·스키마 **수정**·`verify`/`check-status` **필수 루틴** **수행** (해당 EVIDENCE) / **(나)** **이번 기록 주기**에서 **수정·필수 검증 루틴 없음** (정렬·대기; **(B)** **해당 없음**).

`show-plan` **「[321] 기준」**의 `GW-0.4` bullet = `PROJECT_PLAN['governance_321_work_units'][3]` = 본 `GW-0.4` 표·[#gw-0-4-범위-완료](#gw-0-4-범위-완료)와 **같은 뜻(1:1)** 이어야 한다.

#### GW-0.1~0.4 **정렬 주기 1차 완료 (잠금)** {#gw-0-정렬-주기-1차-완료}

**선언(한 줄):** [323](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-323)~[326](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-326)·상기 **GW-0.1~0.4** 표·[#gw-0-1-범위-완료](#gw-0-1-범위-완료)~[#gw-0-4-범위-완료](#gw-0-4-범위-완료)·`governance_321_work_units`·`show-plan` **문서·증빙·내비 정렬 주기** **1차**를 **완료**한다 ([327](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-327)).

**잠금:** **동일 축**의 **반복 정렬·동기화 전용 주기**를 **기본 일정으로 재개하지 않는다.**

**이후 착수:** 실제 **정의서·스키마·코드** 변경, **B안/IO/§5.4** 합의·반영, **Step 3** 질문셋 **본 착수**, **정의서·스키마 실수정**에 따른 `verify`/`check-status`([#gw-0-4-범위-완료](#gw-0-4-범위-완료) **(가)**) 등 — **필요가 생긴 항목만** **별도 착수 단위**로 연다. 각각 **전용 `EVIDENCE`**·해당 **GW-0.x (가)**·[이후 분기 (고정)](#이후-분기-고정)를 따른다. **우선**으로 열 **새 착수 단위**는 [#step-3-질문셋-본착수](#step-3-질문셋-본착수)·[328](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-328) (아래).

### [CASE §7] Step 3 **질문셋 본착수 (새 착수 단위)** {#step-3-질문셋-본착수}

**한 줄(고정):** 다음 **새 착수 단위**는 **Step 3 질문셋 본착수**다. [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md)을 **기준**으로, 질문셋 **관련 route**와 **관리자/생성/편집 UI**를 **1차 범위**로 **고정**하고, [CASE_STATUS_DEFINITION **§7** **Step 3**](./CASE_STATUS_DEFINITION.md#7-다음-문서-작업-순서-프로젝트-기준) 궤를 담는다.

**왜 이 단위를 지금 열는가 (세 가지):**

1. [정렬 주기 1차 **잠금**](#gw-0-정렬-주기-1차-완료) ([327](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-327)) **이후** → **문서 정렬**이 아니라 **산출**이 붙는 **정의/스키마/코드** 쪽으로 **넘어갈 시점**이다.
2. **B안 / IO / §5.4** **합의**는 **대기·합의 의존**이 커 **다시 멈출** 수 있어 **질문셋**보다 **후순**으로 두는 편이 낫다.
3. **GW-0.4 (가)** `verify`/`check-status` **강제 검증**은 중요하나, **검증 대상** **실체**가 (질문셋·저장·UI) **한층** 생긴 **뒤** 묶는 것이 **효율**적이다. ([#gw-0-4-범위-완료](#gw-0-4-범위-완료)와 **병행·후순**)

**1차 범위 (이 묶음):**

- [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) **기준** **확인**·**잠금**
- 질문셋 **관련** `route` **대상 1차** **목록** **고정**
- 질문셋 **관리자 / 생성 / 편집** **UI 1차** **목록** **고정**
- 질문셋 **정의서**와 **실제 저장** **구조**의 **1차 정합** (어긋남 **표시**)
- (본 단위) **질문셋 전부 완성**이 **목표는 아님** — [아래 1차 목표](#step-3-1차-목표-배치) 참조

**첫 실작업 (배치):** **새 착수**를 **Step 3 질문셋 본착수**로 연다. **질문셋 정의서** 기준으로 **관련 route**와 **관리자/생성/편집** UI를 **1차**로 **고정**하고, **정의·스키마·코드**에서 **실제로 바꿀 최소** **파일**만 **떼어** **첫** **전용** `EVIDENCE` **블록**([328](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-328))에 **담는다** (구현·스캔은 **후속** **세션**).

**잠긴 흐름과의 이음:** [FILE Batch A/B/C](./FILE_REALIGN_PATCH_V1.md#5-최소-반영-배치-세트) [316]~[320] **완료** **→** [GW-0.1~0.4](#gw-0-정렬-주기-1차-완료) [327] **정렬** **완료** **→** (본 절) **정의/스키마/코드** **첫** **대상** = **질문셋** **→** 이후 **템플릿**·[§7](./CASE_STATUS_DEFINITION.md#7-다음-문서-작업-순서-프로젝트-기준) **Step 3** **확장** **용이**하다.

#### **싱글 소스 (인터뷰 런타임)** — **첫** **실변경** **착수** **축** {#step-3-싱글-소스-질문셋}

**한 줄(고정):** **Step 3** **질문셋** **본착수**의 **첫** **코드** **정렬**은 **질문셋** **“단일** **기준”** **선택** **→** `getInterviewFlow`·`completeCaseInterviewService`가 **동일** **기준**만 **쓰게** **맞추는** **범위**로 **연다** (B안/IO/§5.4·**스키마** **대수술** **아님**).

**후보(런타임·저장):**

|  | **A안: `QuestionSet.questions` (플랫 JSON)** | **B안: `definitionJson.sections` (Zod** **`QuestionSetDefinition`**) |
|---|----------------------------------------------|---------------------------------------------------------------------|
| **현** **인터뷰** **UI** **흐름** | `getActiveQuestionSet()` → **이** **배열만** | 별도 **가공** **없이** **직접** **쓰지** **않음** |
| **완료** **필수** **검증** | `resolveInterviewQuestions`·**visible** / **필수** | 329 **까지** `definitionJson.sections`·`getVisibleQuestions` **로** **이중** **가능** — **이후** [330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330) **=** A안+`getInterviewFlowInternal` `flow`·`complete` **만** **동기**; **`definitionJson.sections`는** **이** **잠금** **차수** **필수** **아님** |

**이번** **차수** **결론** **(문서+증빙** [329](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-329)**):** **질문셋** **단일** **기준** **부재** **확인** — `questions` **플랫**·`definitionJson.sections`·`question-set.types` **vs** **정의서** `QuestionInputType` **가** **동시** **존재**; **같은** **사건** **인터뷰**에 **이중** **검증** **경로** **가능**.

**330** **완** **(증빙** [330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330)**):** **A안(questions** **JSON)** **런타임** **잠금** — `getInterviewFlow`·`completeCaseInterviewService` **=** **동일** **질문** **소스**·**동일** **완료** **판정**; **`definitionJson.sections`는** **관리·Zod** **용** **(이번** **차수** **필수** **검증** **배제**).

**331** **완** **(증빙** [331](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-331)**):** [QUESTION_TYPE_MAPPING.md](QUESTION_TYPE_MAPPING.md) — `QuestionSetQuestionType`·Zod `QuestionInputType`·[정의서 §7](./QUESTION_SET_DEFINITION.md#7-질문-유형-정의) **3층** **행** **잠금**; **이후(332~):** **§14-1**·**고아** **client** ( **아래** **3** **번** )。

**332** **완** **(증빙** [332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332)**):** [QUESTION_SET_DEFINITION **§14-1**](./QUESTION_SET_DEFINITION.md#141-app-라우트--관리-ui-step-3-경계-고정) **—** `question-set-admin-client` **삭제**·**공식** **3** **App** **경로**; **이후(333~334):** [333](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-333) **(축** **개설)** · [334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) **(§4** **1차** **대조**)**;** **잔여** [EVIDENCE_STEP3](EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#section-4-alignment-check-1) **·** **「다음** **착수** **4」** (실DB·동기 **등**)**。**

**정렬** **범위** **(다음** **실변경** **차수** **에** **한** **번에** **고정):**

- `getInterviewFlow` / `getInterviewFlowInternal` **읽는** **소스**
- `completeCaseInterviewService` **필수** **누락** **판정** **소스** (**조건부** **분기** **제거**·**또는** **단일** **화**)
- (명시) **admin** `QuestionSetEditor` / `api/question-sets` **가** **쓰는** `definitionJson` **와** **인터뷰** **동기** **규칙** (**A안** **잠금** **시** **백필**·**또는** **비활성** **표기**)

**다음** **착수** **순서** **(고정):**

1. **(330** **완)** [EVIDENCE-20260423-330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330) — **런타임** **A안(questions** **JSON)** **잠금**; `complete` **=** `getInterviewFlowInternal` `flow` **동일**; **`definitionJson.sections`는** **이** **잠금** **차수** **필수** **기준** **배제**.
2. **(331** **완)** [EVIDENCE-20260423-331](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-331) — [QUESTION_TYPE_MAPPING.md](QUESTION_TYPE_MAPPING.md) (§7·`QuestionInputType`·`QuestionSetQuestionType`·인터뷰 **3층**).
3. **(332** **완)** [EVIDENCE-20260423-332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332) — [§14-1](QUESTION_SET_DEFINITION.md#141-app-라우트--관리-ui-step-3-경계-고정) **admin** **UI** **경계**·`question-set-admin-client` **삭제** (**미연결** **고아**).
4. **(334** **완)** [EVIDENCE-20260425-334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) — [EVIDENCE_STEP3_A…](./EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#section-4-alignment-check-1) **§4** **1차** **대조** (**정적**). **잔여(333~** **계열):** **실DB**·**에디터-A안** **동기**·**시드** (**PATCH** **축** **과** **분리**).

#### 1차 목표 (이번 착수의 넷, “전부 완성” 아님) {#step-3-1차-목표-배치}

1. **질문셋** **정의서** **기준선** **확인**
2. **실제** `route` / `UI` / **저장** **구조**가 **어디까지** **맞는지** (불일치 **표**·**망**)
3. **실** **변경**이 **필요한** **최소** **파일** **묶음** **확정**
4. **전용** `EVIDENCE` **새** **번호**([328](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-328))로 **착수** **블록** **개설** (이 **선언**)

**추천 순서 (문서·스캔):**

1. [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) **기준** **잠금**·**읽힘** **확인**
2. 질문셋 **route** **1차** **목록** **고정** (`app` / `api` / `src` **일점**)
3. 질문셋 **관리자/생성/편집** **UI 1차** **목록** **고정**
4. “**이번** **착수**에서 **실제로** **바꿀** **파일**” **만** **별도** **묶음** **확정**
5. **다음** **EVIDENCE** (배치 **실** **반영** **시** **신규** **번호**)

([EVIDENCE-20260423-297](./IMPLEMENTATION_EVIDENCE.md))에 따라 **C(R6)** `GET …/admin/users/search`·R6-001~002·EXC-C **보다 앞서**, [BASELINE §1·§3](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md), 본 문서 **R1~R9** 행( `역점검`·`호환층 축소` ), [ALIGNMENT §2·§6](./ALIGNMENT_AUDIT_V1.md)을 기준으로 **일치·불일치·선행 구현·잠금 필요**를 누적한다. E(R8) 축은 **§8.6**에서 문서상 마감([EVIDENCE-20260423-296]) — **이후** 본 §0 순서·**§8.6**「이후 전환」을 따른다.

### 역점검 본맥 1차 **완료** 선언

[BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) **§1.1** · 본 문서 **§0** · [ALIGNMENT **§6**](./ALIGNMENT_AUDIT_V1.md#6-역점검표-본문)을 기준으로 한 **역점검 본맥 1차** 구조 보강을 **완료**한다. ([EVIDENCE-20260423-305](./IMPLEMENTATION_EVIDENCE.md))

**이번 1차 완료 범위**는 다음을 포함한다.

1. **본맥 행 구조 고정** — R3, R4, R5, R9에 **일치** / **불일치** / **선행 구현** / **잠금 필요** 4열을 반영했다. R6, R8 **대표행**에 [ALIGNMENT **§6**](./ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) 교차 축 ID를 보강했다. ([EVIDENCE-20260423-300](./IMPLEMENTATION_EVIDENCE.md)·[EVIDENCE-20260423-299](./IMPLEMENTATION_EVIDENCE.md))
2. **세부 행 누적 고정** — [§4.2](#42--requireokdata-호출--도메인-route-대응-클라-파일-단위) R4-101~127 = **동일군** 기준 4칸 누적([EVIDENCE-20260423-302](./IMPLEMENTATION_EVIDENCE.md)). [§5.3](#53--클라-파일--b-api-행-누적-2026-04-23) R5-201~253 = **대표행**·**예외행**·**잠금행** 기준 4칸 누적([EVIDENCE-20260423-303](./IMPLEMENTATION_EVIDENCE.md)). [§8.3](#83--파일호출-단위-행--unwrapdeliveryverify-잔여-) R8-301~307 = **동일군** 기준 4칸 누적 + **감쇠** 열([EVIDENCE-20260423-304](./IMPLEMENTATION_EVIDENCE.md)).
3. **교차·증빙 고정** — 본맥 행·세부 행 **비고**에 [ALIGNMENT **§6**](./ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) 기준 **축** ID를 연결했다. 최신 기준 증빙은 [EVIDENCE-20260423-300]·[EVIDENCE-20260423-303]·[EVIDENCE-20260423-304]를 포함한 누적 체인(및 [EVIDENCE-20260423-302]·[EVIDENCE-20260423-299])으로 본다.
4. **현재 판정** — 본맥 1차 구조 보강과 핵심 세부 누적은 **완료** 상태로 본다. (이후 **기본** 궤도는 **아래「이후 분기 (고정)」** — [313](./IMPLEMENTATION_EVIDENCE.md).)
5. **(과거·닫힘)** **C(R6)** A안 [306]·후속 [312] — **4열**·EXC-C **마감** ([§0·C(R6)](#c6-userssearch-예외군--a안-잠금) ).

**한 줄(305):** R3·R4·R5·R9 본맥 4열, R6·R8 대표행 교차, §4.2·§5.3·§8.3 세부 행 누적까지 **역점검 본맥 1차** **구조** **완료** ([EVIDENCE-20260423-305](./IMPLEMENTATION_EVIDENCE.md)).

### 핵심 축·예외군 1차 종료 범위 (짧게) — [EVIDENCE-20260423-313](./IMPLEMENTATION_EVIDENCE.md)

| 대상 | 1차에서 **끊는 것**(증빙) |
|------|------------------------|
| **역점검 본맥(ROWS)** | R1~R9 **행 테이블**·4열·§4.2·§5.3·§8.3 **누적** — 305~304·[297] **체인**; **「표 구조 보강」** 1차 **종료** |
| **R3** | §3.1 2차 — [310]; R3-001~005; ST 세부·§6-1·§6-11 **잔여** = **R9·ALIGNMENT** (별도) |
| **R4** | §4.2 R4-101~127 **4칸** 동일군 — [302] |
| **R5** | §5.3 R5-201~253 + **EXC** (C·혼합·수동) — [303]·[312] |
| **R6** | C(R6) A안 306 + 후속 312 (R6-001/002·R5-222 C leg) |
| **R8 (E)** | E 축·§8.3 R8-301~307·§8.6 **문서** **마감** — [296]·[304] |

**한 줄(313):** [ROWS 1차] + [R3~R6·R8 **핵심**] **1차** **종료**; **B안·IO·§5.4**·ROWS **미세** **누적** = **기본** 일정 **아님** ([313](./IMPLEMENTATION_EVIDENCE.md)).

### 이후 분기 (고정) {#이후-분기-고정}

**하나로 고정:** **다음 Phase 전환** — [CASE_STATUS_DEFINITION **§7**](./CASE_STATUS_DEFINITION.md#7-다음-문서-작업-순서-프로젝트-기준) (문서 1~14 선행) · **첫** **실작업** = [**§7.1**](./CASE_STATUS_DEFINITION.md#71-phase-1-첫-실작업--기준선-고정-2026-04-23) ([314](./IMPLEMENTATION_EVIDENCE.md)) · [FILE_REALIGN_PATCH_V1](./FILE_REALIGN_PATCH_V1.md) (Batch·FILE-xxx) · `python tools/aibeopchin_navigator.py show-plan` (`phase1_start_baseline`). **(선택·비기본)** [ALIGNMENT §6](./ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) 보감·B안·R4/R5/§5.3 **소규모** **행** **추가** = **별도** **합의**·증빙 — **「개별 축 추가 누적」** 을 **이** **궤도**와 **동일** **우선**으로 **두지** **않는다** ([EVIDENCE-20260423-313](./IMPLEMENTATION_EVIDENCE.md)).

### C(R6) users/search 예외군 — A안 잠금

C(R6) `GET /api/admin/users/search` **A안** 은 [306](./IMPLEMENTATION_EVIDENCE.md)·[312](./IMPLEMENTATION_EVIDENCE.md)로 **잠금** **완**; **참조**용 **기준**은 다음과 같다.

- **서버** — `src/app/api/admin/users/search/route.ts` 가 **평면** `{ users }` 만 반환하는 현행을 공식으로 유지한다 (**R6-001**).
- **클라** — `requireOkData`·`requireOkResponseBody` **미적용**·HTTP 성공 후 `users` **배열** 확인에 한하는 방식을 **EXC-C** **공식 예외**로 둔다. **대상:** `src/components/admin/alerts/assignee-user-picker.tsx` ( [§5.2 **EXC-C-1**](#52--예외군-r5-표-바깥교차) ) · `src/components/admin/alerts/ops-queue/OpsQueueAssigneeSelect.tsx` 내 `GET …/users/search` ( [§5.2 **EXC-C-2**](#52--예외군-r5-표-바깥교차) · **R5-222** [§5.3] **혼합** 파일의 C leg ) — [EVIDENCE-20260423-312](./IMPLEMENTATION_EVIDENCE.md) **4열·클라 검증** **완**.

**B안** — 서버 `ok({ users })`(또는 동등) + 명세·[IO](./IO_DATA_DEFINITION.md) 잠금 후 `requireOkData` 등 **envelope** 정렬. **필요 시** 별도 합의·전환·증빙으로 **분기**; A안 잠금은 B안의 **필수 선행**이 **아님** ([BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) R6·[POST_278](./POST_278_API_CLIENT_ENVELOPE_V1.md) **§6.3** 참고).

**한 줄:** 평면 `{ users }` + 클라 `users` 배열 확인(EXC-C)이 **현행** **공식**이며, B안·`ok` 정렬은 **§0「이후 분기 (고정)」** 궤도(다음 Phase) **밖**에서 **필요 시** [§5.4](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#54--서버명세-합의-체크리스트) **별도** 합의.

### 본맥 바깥 분기 (R3 2차 [310] 이후, 2026-04-23)

R3 [§3.1 2차](./IMPLEMENTATION_EVIDENCE.md)는 [310](./IMPLEMENTATION_EVIDENCE.md)로 마감했으므로, **R3 행·§3.1 범위를 늘리지 않고** 이후 실작업을 **본맥(1차·ROWS 구조)** 밖 **분기**로 잡는다.

- **완료(2026-04-23):** **C(R6) A안 후속** — R6-001·R6-002·R5-222 C leg **4열** [EVIDENCE-20260423-312](./IMPLEMENTATION_EVIDENCE.md) **마감** (선행: [306](./IMPLEMENTATION_EVIDENCE.md)·분기: [311](./IMPLEMENTATION_EVIDENCE.md)).
- **이후(고정, [313](./IMPLEMENTATION_EVIDENCE.md)):** **다음 Phase 전환** — §0 **「이후 분기 (고정)」**. **(비기본)** [ALIGNMENT §6](./ALIGNMENT_AUDIT_V1.md#6-역점검표-본문)·R4·R5·B안·[§5.4](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#54--서버명세-합의-체크리스트)·IO — **선택**·소규모·**별도** 증빙.

---

## 열 정의(공통)

| 열 | 설명 |
|----|------|
| **행 ID** | `RX-nnn` — 본 문서 **고정 키** (R9 교차는 `→ ALIGNMENT: ST-01` 같이) |
| **R** | 기준선 **R1~R9** |
| **점검 대상** | API 경로, 파일, 심볼(함수) 등 **한 단위** |
| **잠근·참조** | [BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) **§1·§3** 해당 R 요약·외부 절 |
| **관찰** | 런타임/코드 **현재** 상태 |
| **역점검** | [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) **§2** 용어(일치·부분일치·불일치·누락·선행구현·판정보류) |
| **호환층 축소** | **가능** / **부분** / **불가(의도·유지)** / **해당없음** / **보류** + 한 줄 이유 (BASELINE R8·§4·§3 **기준선** 열과 맞출 것) |
| **비고** | 다음 액션·교차 ID·추가 스캔 |

**R3·R4·R5·R9** 절 **요약 표(및 §4.2·§5.3 세부 표)** — `관찰` **뒤**·`역점검` **앞**에 **일치** / **불일치** / **선행 구현** / **잠금 필요** **4**열을 **둔다** (본맥 **선**; **ALIGNMENT** `ST-…`·`→` **교**차·`비고` **정리** **는** **후**행**).

**누적 규칙:** 동일 R 아래 `nnn` 은 **시간순** 또는 **같은 팀**에서 **빈 번호**에만 추가. `그룹` 행(대표 1행 + 파일 수)은 **축소·호출맵**에서 **하위 전개**할 때 쪼갠다.

---

## R1 — API 성공 키·래핑 (`success` vs `ok`)

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | 역점검 | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|--------|------------|------|
| R1-001 | R1 | 전역(문서) | [API_SPEC_V1](./API_SPEC_V1.md) **§2-4, §3** | 명세 `success: true` + `data` | **불일치(명세 vs 코드)** | **보류** — [API_SPEC](./API_SPEC_V1.md) `ok` **공표** 또는 **「구현 표준 = `ok`」** 부록 → 그 후 `success` 문구·이중 기술 **제거** 시 축소 | **§1.1~§1.5**·BASELINE R1 |
| R1-002 | R1 | `src/app/api` JSON 성공 | 동일 | `success:` 리터럴 **0건**; `ok()` from `@/lib/domain-api-response` | **불일치(문서-only)**; 런타임은 `ok` | **해당없음**(코드 쪽은 일원화됨) | **§1.2** R1-105·**§1.3~§1.5**·**§4.1** |

### §1.1 — **성공 envelope** (구현) **↔** R4·R5·R8

| 축 | 성공 JSON(구현) | 서버 | 클라(성공) | 본문 **세분** (절) | R1 **연결** |
|----|-----------------|------|------------|--------------------|------------|
| **A** | `{ ok: true, data }` | `ok()` | `requireOkData` | **§4.1~§4.2**·R4-001·002 | **R1-101** — **표준**; 키=`ok` — **R1-002**·**R4** **정합** |
| **B** | `{ ok: true, …필드 }` (`data` **없음**) | `NextResponse.json` (alerts/ops) | `requireOkResponseBody` | **§5.1~§5.3**·R5-201~253 | **R1-102** — **동일** `ok`; **데이터** 위치**만** B ( **명세** `success`·**와** **별** ) |
| **C** | `{ users }` only | **R6** (`GET …/users/search`) | `requireOk*` **미사용** | **§5.2** EXC-C | **R1-103** — **envelope** **아님** |
| **E** (R8) | `ok+data` **또는** 평면 **혼합** (delivery·verify) | domain + **§8.1** | `unwrap` / `parse*` / **수동** `ok` | **§8.3** R8-301~307 | **R1-104** — **A** **§4.2** **이후** **파싱** **한** **겹**; **R8** **감쇠** **순** |

> **R1(문서) vs R4/5/8(코드):** [API_SPEC](./API_SPEC_V1.md) **`success`** = **R1-001/105**; **런타임** **성공 키** = **`ok` 또는** **C** **예외** — **§4.3** (R4 **대비** R5·R8) **와** **직교** 유지.

### §1.2 — R1 **행** ( **세부** + **R4·R5·R8** **교차** )

| 행 ID | **요지** | **연결** |
|-------|----------|----------|
| R1-101 | **A** — `{ ok, data }` | **§4.1~4.2**·R4-101~127·**§1.5** **실행** **우선** |
| R1-102 | **B** — `{ ok, …평면 }` | **§5.3** R5-201~253·**§1.6** **실행** **우선** |
| R1-103 | **C** — `users` **only** | **R6**·**§5.2** |
| R1-104 | **E** — `unwrap`·**수동** `ok` (delivery/verify) | **§8.1~8.5**·R8-301~307 |
| R1-105 | **문서** — `success`+`data` (코드 0) | **R1-001**·[API_SPEC](./API_SPEC_V1.md) **개정·부록** |

### §1.3 — R1 **행** **누적 고정** ( **성공** envelope — **분포** · **예외** · **감쇠** )

**스냅샷:** `src` 정적 `grep` · **2026-04-23** (본 절·**§4.1**·R4-001 **동일** run). **감쇠** 열 = [BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) **§3**·본문 **R4·R5·R8** **세분**과 **정합**.

| 행 ID | **분포(사실)** | **예외·교차** | **감쇠** (가능·부분·불가·보류) |
|-------|----------------|---------------|----------------------------------|
| R1-101 | **A** — domain `ok()` route **60** 파일 (**§4.1**); `requireOkData` **소비** **30** 파일 (`requireOkData<` / `requireOkData(`); **§4.2** 클라·API 쌍 **27**행 (R4-101~127) | **없음** — R4 **A 0불일치** | **해당없음**(표준) — **호출** **개수**만 R5·R8·도메인 **합의** **후** **자연** **감소** |
| R1-102 | **B** — `requireOkResponseBody` **소비** **55** 파일 ( `api-error.ts` **정의** **제외**; `requireOkResponseBody(` **1**회 이상); **§5.3** R5-201~253 **누적** | **EXC-C** / **EXC-혼합** / **EXC-수동** / **EXC-사건** — **§5.2** | **부분** — (1) 서버 B→`ok(mergedTopLevel)` **한** 층 (2) [API_SPEC](./API_SPEC_V1.md)·**내부** **B** **잠금** [BASELINE R5] — `requireOkData`·`requireOkResponseBody` **2**종 **병행** **전** |
| R1-103 | **C** — `GET …/admin/users/search` **만** `{ users }` (envelope **아님**); **소비** **다리** **2** ( **EXC-C-1** `assignee-user-picker` · **EXC-C-2** `OpsQueueAssigneeSelect` **내** **leg** ) — **§5.2** | **B**·`requireOk*` **와** **직교**; **R6-001~002** | **조건부(가능)** — `ok({ users })`+명세·IO **잠금** **후** **C** **전용** 분기·주석 **제거** [BASELINE R6] |
| R1-104 | **E** (R8) — **lib** **2** (`post-document-delivery.ts`·`parse-document-verification-response.ts`) + **UI** `case-detail-client` (`postDocumentDelivery`)·`document-verification-client` ( **assert** ); delivery·verify **route** **는** **§4.1** **domain** `ok` | **A** `requireOkData` **쌍** **이후** **추가** **한** **겹**; **R8-301~307** | **부분~가능** — (1) delivery·verify **성공** **1형**+클라 **단일** **파이프** (2) **§8.4** **우선** **순** [BASELINE R8] |
| R1-105 | [API_SPEC](./API_SPEC_V1.md) **문서** `success`+`data` — **런타임** **리터럴** `success:` **0** (**R1-002**) | **R1-001** (명세 vs 코드) | **보류** — **API_SPEC** `ok` **공표**·부록 **또는** **「구현 표준=ok」** **확정** **후** **문서** **정리** |

### §1.4 — R1 **행·행군** **↔** R4·R5·R8 **판정 확정** ( **§1.3** **요약** )

**용어(§8.2·BASELINE·정합):** **감쇠** = 호환층·분기·이중 **줄이기**; **선행** = 명세·IO·**타 축** **합의** **선**; **유지/예외** = **냅두는** 것 vs **EXC**·**문서** **별** **규칙**.

| **대상** | **감쇠** | **선행 필요** | **유지 / 예외** | **R4** | **R5** | **R8** |
|----------|----------|---------------|----------------|--------|--------|--------|
| **R1-101** (A) | **해당없음** — A는 **감쇠** **대상** **아님** (기준 **축**) | **없음** (이미 0불일치) | **유지(기준)** | **핵심** — **§4.1~§4.2**·R4-101~127·**§4.3** (A) | **직교** (B **와** **무관**) | E **잔여**·**A** **만**으로는 **소멸** **안** 함 |
| **R1-102** (B) | **부분** — B route·클라 **한** 층 **잠금** **후** **분기** **감소** | (1) [API_SPEC](./API_SPEC_V1.md)·**내부** B **부록/개정** (2) **per-route** **일치** [§5.3] | **유지** + **EXC** [§5.2] | **직교** | **핵심** — **§5.1~§5.4**·R5-201~253·R5-001 | **독립** **합의**; **R8** **과** **병행** **시** **순서** [§4.3] |
| **R1-103** (C) | **조건부(가능)** — C **전용** **분기** **제거** | (1) **R6-001** `users/search`·[IO](./IO_DATA_DEFINITION.md) **성공 1형** (2) **§5.4** 3~4 ( **R6** **잠금** ) | **예외** — **EXC-C**; **B**·`requireOk*` **직교** | **—** (C route **는** **§4.1** **비**포함) | **EXC** **교차** [§5.2] | **—** |
| **R1-104** (E) | **부분~가능** — `unwrap`·`parse*`·**이중** **경로** | **§8.4** 1~4 ( **IO**·[API_SPEC](./API_SPEC_V1.md) **delivery/verify** **1형** + **R1-105**·R2·**R6** **선택** **병행** ) | **선행** **전** **유지** ( **기능** **필수** ) | **쌍** **정합** [§4.2] ( **route** = domain `ok` ) | **B**·**C** **와** **공존** **가능** ( **직교** ) | **핵심** — **§8.3** R8-301~307·**§8.4** |
| **R1-105** (문서) | **보류** — **문구** **감소** **만** | **R1-001** **합의** ( `success` **표기** **철** ) | **예외(문서-only)** | **—** | **—** (명세 `data` **와** B **이중** **서술** **시** **R5** **와** **연동**) | **—** ( **성공** **키** **문서** = **E** **선행** [§8.4-1] **와** **한** **꾸러미** ) |

**행군(참고):** **R1-101+102** = **A·B** **병행** ( **2**종 **클라** ) — **감쇠** = **R5**·**B** **잠금** **후** **가능**; **R4** **A** **완성** **만**으로는 **B** **불** **소** [§4.3]. **R1-104+** **R2-104** = **동일** **이중** **축** — **R8** **우선** [§8.4] **> R2-104** **감쇠**.

### §1.5 — R1-101 + R2-101 (**A**축) **실행** **우선순위** ( **1**장 )

**목적:** **domain** `ok({ data })` + **`requireOkData`** **정합** [§4.2·R4-001] **이** **확인된** **범위** **안**에서, **남은** **호환** **흔적**( **이중** `readJson`·**불필요** **분기** ) **제거** **가능** **항목**만 **추리고**, **없거나** **선택** **미** **실시** **시** **유지** **기준** **확정** **후** **B**축 ( **§1.6**·§1.4 R1-102·**§5** ) **로** **넘어간다**. **A**·**B** **직교** [§4.3] — 본 절 **은** **A** **만** **다룸**.

| 우선 | 내용 |
|------|------|
| **0. 전제(잠금)** | `src/lib/client/api-error.ts` `requireOkData` = HTTP **+** 본문 `{ ok: true, data }` **엄격** 확인; **실패** **시** **내부** `readJsonApiErrorMessage` ( **R2-102** = **R2-101** **재사용** ). **서버** = **§4.1** domain `ok` **route** ( **§4.2** 쌍 **0** **불일치** ). **범위** = **A**·**E**·**B**·**C**·**D** **혼입** **없이** `requireOkData<` / `requireOkData(` **만** **보는** **30** **소비** **파일** ( **R4-002** ). |
| **1. 제거** **가능** **후보** ( **P1** ) | `document-template-editor.tsx` **`publishTemplate`**: `if (!res.ok) { readJsonApiErrorMessage(…) … return; }` **이후** `try { requireOkData(…) }` — `requireOkData` **는** `!res.ok` **에서** **이미** `readJsonApiErrorMessage` **호출** [ `api-error.ts` L31–32 ]. **흔적** = **동일** **의미** **메시지** **추출** **2** **경로** ( **HTTP** **선행** **분기** + **래퍼** ). **제거** **방향** = `try { requireOkData(…) }` **단일** **진입** **후** `catch` **에서** `res.status === 422` **이면** **기존** **다줄** `alert` ( **UI** ) **만** **유지** — **동작** **동일**·**R2-101** **내부** **호출** **1** **경로** **로** **수렴** ( **선택** **초소형** **리팩터** ). |
| **2.** **A** **유지** **·** **예외** ( **P1** **미** **적용** **또는** **보류** **시** **확정** ) | (1) **나머지** **29** **파일** — **선행** `!res.ok` + `readJsonApiErrorMessage` **+** `requireOkData` **병기** **패턴** **0** ( **정적** **조사** 2026-04-23: `!res\.ok` `grep` **대비** `requireOkData` **집합** **교차** = **`document-template-editor` publish** **만** ). (2) `case-form` — **A**·**R2-105** [§2.1]: `requireOkData` **throw** **후** `raw` **fieldErrors**; **`readJsonApiErrorMessage` 직접** **없음** — **검증** **예외**·**의도** **유지**. (3) `document-verification-client`·`case-detail-client` **등** — **R1-104**·**E**·**R8** **이면** **§8.4** **선** ( **본** **1**장 **A**·**B**·**C**·**D** **스코프** **외** **명시** ). |
| **3. A축** **닫힘** | **제거** **후보** = **1** **건(선택)**. **미** **착수** **시** **에도** **A** = **「정합** **0**·**흔적** = **1** **파일** **선택** **수준**·**B**·**C**·**D**·**E** **와** **무관** **분리**」**로** **유지** **기준** **확정**·**B**축 **이동** **허용**. **착수** **시** **상기** **P1** **만** **PR**·**회귀** ( **document-templates** `publish` **422** **문구** ) **스코프** **권고**. |
| **4. B축** **전환** | **§1.6** ( **R1-102+ R2-103** ) · [§1.4] **R1-102** · [§2.4] **R2-103** · **§5.1~§5.4** · **R5-201~253** — **「** **성공** **평면** **`requireOkResponseBody`** **+** **실패** **R2-101** **공유** **」** **(본** **v1** **R5** **세분** ) **. |

**근거(코드):** `readJsonApiErrorMessage` — `api-error.ts` L11; `requireOkData` `!res.ok` — **동일** **파일** L30–32.

### §1.6 — R1-102 + R2-103 ( **B**축) **·** R2-102~103 **실행** **우선순위** ( **1**장 )

**범위:** **성공** **평면** [§1.1·**R1-102**] + **`requireOkResponseBody`** + **실패** **R2-103** ( **동일** `readJsonApiErrorMessage` [ **R2-101** ] — `api-error.ts` L48–64 ). **R2-102** = **A** **실패** [§1.5] — **본** **절** **과** **직교**; **같은** **공용** **함수** **만** **공유**. **대상** = **R5-001**·**§5.3** R5-201~253 ( **55** **소비** **파일** ) + **EXC** [§5.2] + **R5-253** ( **EXC-수동** ).

| 구분 | **항목** ( **다음** **착수** **기준** ) |
|------|----------------------------------------|
| **1. 제거** **·** **단순화** **가능** ( **코드**·**UI** ) | (1) **R5-253** `run-bulk-queue-pipeline` — `requireOkResponseBody` **미사용**·**수동** `ok` [§5.2 EXC-수동] — **「** **이관** **vs** **유지** **」** **단일** **결정** **후** **한** **쪽** [§5.4-3] **=** **분기** **1**·**팀** **합의** **필수**. (2) **R5-240**·**R5-241** ( **recommended** / **failed-items** ) — **성공** `requireOkResponseBody` **+** **실패** **catch** `readJsonApiErrorMessage` [R5 **표**] — **패턴** **유지** **이나** **UI**·**setMessage** **중복** **정리** **가능** ( **기능** **동일**·**P2** ). (3) **§5.3** **「** **전** **route** **대비** **클라** **일치** **」** **후속** **스캔** — **라인** **제거** **가능** **항** **은** **없음**; **체크리스트** **완료** = **B** **합의** **신뢰** **강화** ( **§5.1** **일치** **정의** **재** **확인** ). |
| **2. 예외** **유지** ( **당분간** **감쇠** **안** **함** ) | (1) **EXC-C-1**·**EXC-C-2** [§5.2] — `users/search` **=** **C**·**R6**; **`requireOkResponseBody` 미적용** — A안 [312](./IMPLEMENTATION_EVIDENCE.md) **4열** **확정**. (2) **EXC-혼합** **R5-222** `OpsQueueAssigneeSelect` — **한** **파일** **내** B **PATCH** + **C** `GET` **—** C leg = [312](./IMPLEMENTATION_EVIDENCE.md) **A안** **잠금** **완** (B·IO·**§5.4-4** **전환** = **차기**). (3) **EXC-사건** R5-209·R5-210 — **사건** **UI** **가** **admin** **B** **API** **—** **경로**·**권한** **의도** [§5.1 **예외군**]. (4) **R5-240/241/…** `readJson` **보조** — **B** **실패** **는** **R2-103**; **직접** `readJson` **은** **catch**·**setState** = **R2-106**·**A**·**B** **직교** [§4.3]. |
| **3. 서버**·**명세** **합의** **필수** ( **문서**·**PR** ) | (1) [API_SPEC](./API_SPEC_V1.md) **응답** `success`/`data` **서술** **vs** **런** **타임** **B** **평면** [§5.1] — **관리/OPS** **부록** **또는** **개정** [§5.4-1]·[ **R1-001** ]·[ **R1-102** ] **열만** **인용** **가능**. (2) **내부** **B** **확정** ( **POST_278** **사실** ) — **부록** **잠글지** **팀** **결정** [§5.1]. (3) **C** `users/search` [ **R6-001** ] — **EXC-혼합** **해소** [§5.4-4] **(선** **C** **감쇠** **와** **병행** **가능** ) **선행**. |
| **4. B축** **닫힘**·**다음** | **P0** = **§5.3** **누적** **0** **불일치** [§5.3 **끝**] + **R5-003** **고정** — **스냅샷** **잠금**. **P1** = **§1.6** **행** **3** **중** **1** **이상** **기록** **또는** **보류** **명시**. **P2** = **R5-253**·**R5-240/241** **(선** **0**~**1+** ) **정리**. E(**§8.5**·R8) **마감** **뒤** **다음** **축:** [EVIDENCE-20260423-297] **역점검** **본맥** (BASELINE·R1~R9·ALIGNMENT) **→** C (R6·R1-103 [§1.4]) **—** §8.5·§8.6 **권장** **순**; B **와** **독립**. |

**R2-102~103** **행** **읽는** **법:** **R2-103** **만** **B** **전용** **실패**; **R2-102** **는** **§1.5** **에서** **감쇠**·**잠금**; **R2-101** **는** **두** **절** **공통** **수입** ( **B**·**A**·**C**·**D** ).

---

## R2 — API 실패 형식 (`error` 객체 vs top-level `message`/`code`)

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | 역점검 | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|--------|------------|------|
| R2-001 | R2 | `src/lib/client/api-error.ts` `readJsonApiErrorMessage` | [API_SPEC_V1](./API_SPEC_V1.md) **§3-2** | `error` string / `error.message` object / `message` top-level **모두** 처리 | **부분일치** (수신 측 **단일** 함수) | **부분** — 서버 **발신** 1형 **후** **분기** 축소 | **§2.1~§2.4**·**§1.3**·**§1.5 (A** **직교** **조사**)**·BASELINE R2 |
| R2-002 | R2 | `src/lib/client/api-error.ts` `requireOkData` / `requireOkResponseBody` | domain envelope·평면 | 둘 다 `readJsonApiErrorMessage` **공유** | **부분일치** | **부분** — **R2-101~103** + **R1**·R5 | **§2.2~§2.4**·**§1.3~§1.6** |

### §2.1 — **공용 오류** `readJsonApiErrorMessage` **↔** **발신**·**래퍼**

| 구분 | 내용 | **본문** (절·행) |
|------|------|------------------|
| **수신(단일)** | `readJsonApiErrorMessage` | `api-error.ts` — **R2-101** |
| **+ `requireOkData`** (실패) | 동일 `raw` | **§4.2** R4-101~127·**A**·**R2-102** |
| **+ `requireOkResponseBody`** (실패) | 동일 | **§5.3** R5-201~253·**B**·**R2-103** |
| **+ `postDocumentDelivery`** | `readJson` + **수동** `ok` **검** | **§8.3** R8-303·**R2-104** ( **이중**·**감쇠** **대상** ) |
| **`case-form` catch** | `raw` **fieldErrors** + **메시지** ( **R2-101** ) | R4-108·**R2-105** |
| **`readJson` 보조** | bulk **등** ( **R2-101** ) | **§5.3** R5-240·241·**R2-106** |
| **D** (첨부) | **실패** JSON **만** | R7-002·**R2-107** |
| **발신 A** | `fail()` / `toErrorResponse` (top-level `message`+`code` **등**) | **§4.1** domain route·**R4** |
| **발신 B** | `ok: false` + `error` / `message` **혼재** | **§5.3** **R5** |

> **R2 ↔ R1:** **성공** = **§1.1** (A/B/C/E); **실패** = **본 절** — **R8-303** [§8.4] **끝** **단계** **후** **R2-104** **감쇠**.

### §2.2 — R2 **행** ( **헬퍼**·**경로** + **R4·R5·R8** )

| 행 ID | **요지** | **연결** |
|-------|----------|----------|
| R2-101 | `readJsonApiErrorMessage` **(공용)** | `api-error.ts` |
| R2-102 | `requireOkData` **실패** | **§4.2**·**A** |
| R2-103 | `requireOkResponseBody` **실패** | **§5.3**·**B** |
| R2-104 | `postDocumentDelivery` | **§8.3**·**R1-104** **동시** ( **이중** ) |
| R2-105 | `case-form` **fieldErrors** | R4-108 |
| R2-106 | `readJson` + `requireOk` **보조** (bulk) | R5-240·241 |
| R2-107 | 첨부 **D** | R7-002 |

### §2.3 — R2 **행** **누적 고정** ( **공용 오류** / **래퍼** — **분포** · **예외** · **감쇠** )

**스냅샷:** `src` 정적 `grep` · **2026-04-23** ( **§1.3** **와** **동일** run). **`readJsonApiErrorMessage` 직접** = `api-error.ts` **이외** 소스 **11** 파일 ( **총** **12** 파일 **참조** — **정의** **6** **매칭** **내** **보디**+**re-export** ).

| 행 ID | **분포(사실)** | **예외** | **감쇠** (가능·부분·불가·보류) |
|-------|----------------|----------|----------------------------------|
| R2-101 | **정의** `readJsonApiErrorMessage` **1** (`api-error.ts`); **직접** 호출 **11** 파일: `post-document-delivery`·`use-auth-form`·`document-template-editor`·`attachment-download-link`·`alert-rule-list`·`filter-preset-bar`·bulk **6** (`recommended-action-buttons` … `ScheduleActionControls`) | `error` **string** / `error.message` **object** / top-level `message` **병용** ( **R2-001** ) | **부분** — 서버 **발신** **A**(`fail`/`toErrorResponse`) **vs** **B**(`ok:false`+`error`/`message`) **1**형 **합의** **후** **클라** **분기** **감소** |
| R2-102 | **A** **실패** — **30** `requireOkData` **소비** 파일 **전부** `raw` **동일** 경로 → `readJsonApiErrorMessage` ( **정의** **내** **공유** ) | — | **R2-101** **과** **동시** — **envelope** **불** **변** **시** **래퍼** **유지** |
| R2-103 | **B** **실패** — **55** `requireOkResponseBody` **소비** 파일 **동일** | `OpsQueueAssigneeSelect` **류** **EXC-혼합** — **§5.2** | **R2-101** **과** **동시**; B **서버** **합의** **선행** |
| R2-104 | **이중** — `postDocumentDelivery`·`readJson`+**수동** `ok`+`unwrap` / **parse**; UI **1** (`case-detail-client`) + **lib** + **test** | **R1-104**·**R8-303**·**§8.4** | **부분~가능** — **응답** **1**형+**단일** **클라** **경로** **후** **R2-104** **단순**화 |
| R2-105 | `case-form` **catch** — `raw` **fieldErrors** + `readJsonApiErrorMessage` ( **R4-108** ) | **422**·검증 **스키마** | **부분** — **서버**·**클라** **필드** **에러** **형** **정렬** **후** **특수** **분기** **축소** |
| R2-106 | `readJson` + `requireOk*` **보조** — **§5.3** R5-240·241·bulk **교차** | **EXC-수동** `run-bulk-queue-pipeline` **등** | **B**·**EXC** **안정** **후** `requireOkResponseBody` **이관** **여부** [BASELINE R5] |
| R2-107 | **D** (첨부 **다운로드**) — **실패** JSON **만** `read…` ( **R7-002**·`attachment-download-link` ) | **blob** **성공** 경로 | **해당없음**~**부분** — **바이너리**·**D** **유지** [BASELINE R7] |

### §2.4 — R2 **행·행군** **↔** R4·R5·R8 **판정 확정** ( **§2.3** **요약** )

**§1.4** **용어** **동일**. **실패** **경로** = **R2**; **성공** **축** = **§1.1** — **직교** **유지** [§4.3].

| **대상** | **감쇠** | **선행 필요** | **유지 / 예외** | **R4** | **R5** | **R8** |
|----------|----------|---------------|----------------|--------|--------|--------|
| **R2-101** (공용) | **부분** — **수신** **분기** **축소** ( **발신** **1형** **후** ) | **R2-001** **대비** [API_SPEC](./API_SPEC_V1.md) **§3-2** + **서버** A **vs** B **잠금** ( **R4** `fail` **vs** **R5** B **실패** ) | **유지(필수)** — **정의** **삭제** **불가** | **발신** **A** **§4.1** | **발신** **B** **§5.3** | `postDocumentDelivery`·**parse** **실패** [§8.3] |
| **R2-102** (A 실패) | **부분** — **R2-101** **과** **동시** | **R4** **A** **성공** **형** **고정** [§4.2] ( **R1-101** ) | **유지** — `requireOkData` **내부** `read…` | **직접** **연결** R4-002·§4.2 | **—** | **—** |
| **R2-103** (B 실패) | **부분** — **R2-101** **과** **동시** | **R5-001**·**§5.3** **B** **응답** **고정** ( **R1-102** ) | **유지** + **EXC-혼합** [§5.2] | **—** | **직접** R5-201~253 | **—** |
| **R2-104** (delivery **이중**) | **부분~가능** — **R1-104** **와** **동시** | **§8.4** **전** **단계**; **R8-303** **리팩터** | **선행** **전** **유지** ( **이중** ) | R4 **route** [§4.2] ( **쌍** ) | **—** | **핵심** R8-303·**§8.4-2** |
| **R2-105** (case-form) | **부분** — **fieldErrors** **전용** **분기** | **서버** **422**·**스키마** [R4-108] | **유지+예외** ( **폼** ) | R4-108 | **—** | **—** |
| **R2-106** (bulk·보조) | **부분** — `readJson` **보조** **감소** | **B** [§5.2 EXC-수동]·R5-253 | **EXC-수동**·**이관** **보류** | **—** | R5-240·241·**§5.4-3** | **—** |
| **R2-107** (D) | **해당없음**~**부분** | **R7-001** **바이너리** **전제** | **예외** [BASELINE R7] | **—** | **—** | **—** |

> **행군(동시 감쇠):** (1) **R2-102+103** = **A/B** **래퍼** **실패** **쌍** — **감쇠** **선** = **§1.4** **R1-101**·**R1-102** **각** **해당** [§4.3] ( **A** **정합** **만**으로 **B** **감쇠** **불가** ). (2) **R2-104** = **R1-104**·**R8-303** **일체** — **§8.4** **순** **종료** **후** **단순**화 ( **§2.1** > **R2↔R1** ). (3) **R2-101** **직접** **11** = **A**·**B**·**E**·**D** **밖** **소비** — **서버** **발행**·**EXC** [§5.2] **안정** **후** **감소**.

---

## R3 — 사건 `CaseStatus`

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | **일치** | **불일치** | **선행 구현** | **잠금 필요** | **역점검** | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|----------|------------|---------------|--------------|--------|------------|------|
| R3-001 | R3 | `prisma/schema.prisma` `CaseStatus` + `src/lib/definitions/case-status.ts` | [CASE_STATUS_DEFINITION](./CASE_STATUS_DEFINITION.md) · ALIGNMENT **기계 파일** | **단일** 기준(ALIGNMENT) | `CaseStatus`·`schema`·`case-status.ts`·정의서 **한 축** | — | — | enum·전이·검증 **일괄** (변경 시 정의+코드+verify 동시) | **일치(의도)** | **해당없음** | `verify:canonical-sources`·navigator `check-status` — BASELINE R3 — **→ ALIGNMENT: ST-01** (기계 P0)·**ST-04**·**ST-05** — **R9-001과** 쌍 — [§3.1](#31--r3r9st-2차-심화-점검)·[EVIDENCE-20260423-307](./IMPLEMENTATION_EVIDENCE.md)~[EVIDENCE-20260423-310](./IMPLEMENTATION_EVIDENCE.md) **(2차 마감)** |
| R3-002 | R3 | `ST-01`~`ST-05` **교차** | [ALIGNMENT](./ALIGNMENT_AUDIT_V1.md) **6-1** | (세부 ST·화면) | — (각 ST 행) | — | — | `CaseStatus`·ST 동기·갱신 절차 (정의+코드) | **R9**·6-1 위임 | **해당없음**~**보류** | R3-001·6-1 — **→ ALIGNMENT: ST-01, ST-02, ST-03, ST-04, ST-05** ([§6-1](./ALIGNMENT_AUDIT_V1.md#6-1-상태값-정합성)) — [310 **남은 예외** (ST 세부)](./IMPLEMENTATION_EVIDENCE.md) |
| R3-003 | R3 | `softDeleteCaseService` · `DELETE /api/cases/[caseId]` | §3.1 **(a)** · `src/features/cases/case.service.ts` | `DELETE` **성공** `ok` 본문에 **타 case API** **와** **같은** DTO **키** 필요 | `allowedLifecycleActions` **부착** · `getAllowedLifecycleActionsForCase` (**DELETED** → `[]` ) | — | — | — | **일치(308)** | **해당없음** | [EVIDENCE-20260423-308](./IMPLEMENTATION_EVIDENCE.md) — `GET` 상세·**DELETED**·**NotFound** 는 **변경 없음** ( R3-003 **범위 밖** ) |
| R3-004 | R3 | `getAllowedCaseActions` · `canRequestSoftDelete` · `src/app/(protected)/cases/[caseId]/page.tsx` | §3.1 **(b)** · [PERMISSION **§5-1**](./PERMISSION_DEFINITION.md) | **DELETED** = 진행 액션 **전부** false · **사건 삭제** = `softDelete` **와** **동일** RB (소유자·관리자) | `PUT_ON_HOLD` **등** `DELETED` **오표시** **제거** | — | — | — | **일치(309)** | **해당없음** | [EVIDENCE-20260423-309](./IMPLEMENTATION_EVIDENCE.md) — [SCREEN_PRIORITY](./SCREEN_PRIORITY_TABLE.md) / [§6-11](./ALIGNMENT_AUDIT_V1.md#6-11-화면-우선순위-및-화면-api-연결-정합성) **화면·API** 축 |
| R3-005 | R3 | §3.1 (c) [307]~[309]·R3-001~004 누적 | [EVIDENCE-20260423-310](./IMPLEMENTATION_EVIDENCE.md) | 2차 심화 절차 잠금 — (a)(b)(c) 완료 | 310: 완료 범주·남은 예외·교차 ID | — | — | — | **일치(310)** | **해당없음** | ST-01~05 · [§6-1](./ALIGNMENT_AUDIT_V1.md#6-1-상태값-정합성) · [§6-11](./ALIGNMENT_AUDIT_V1.md#6-11-화면-우선순위-및-화면-api-연결-정합성) · R9-001 · [PERM §5-1](./PERMISSION_DEFINITION.md) · [SCREEN](./SCREEN_PRIORITY_TABLE.md) — §3.1 하단 [마감](#31--r3r9st-2차-심화-점검) |

### §3.1 — R3·R9(ST) 2차 심화 점검

**기준(앵커):** [R3-001](#r3--사건-casestatus) · [R9-001](#r9--alignment-전-항교차) (ST-01는 CaseStatus와 동일 축) · [ALIGNMENT §6-1, ST-01~05](./ALIGNMENT_AUDIT_V1.md#6-1-상태값-정합성) · [EVIDENCE-20260423-277](./IMPLEMENTATION_EVIDENCE.md). [277]은 B축(OPS·감사, post-278 `requireOkResponseBody` 4지점) 마감 증빙으로 R3·상태·ST와는 직교이며, 공통 절차로는 [IMPLEMENTATION_EVIDENCE](./IMPLEMENTATION_EVIDENCE.md) §4의 `verify:canonical-sources`·`check-status`를 참고한다.

**2차 점검(재정렬):** (1) 기계적 canonical: `prisma` `CaseStatus` ↔ `case-status.ts` ↔ [CASE_STATUS_DEFINITION](./CASE_STATUS_DEFINITION.md) · [CASE_LIFECYCLE](./CASE_LIFECYCLE_DEFINITION.md) 전이. (2) 전이: `status` 직접 body 거부, `applyCaseStatusTransition` / `CASE_TRANSITIONS`만 (ST-03). (3) 응답 `allowedLifecycleActions` — 상세·status 응답 부착과 `getAllowedCaseActions`·상위 `AllowedCaseActions` 혼재 (§6-11). (4) `verify:canonical-sources` + `check-status` 로그 (ST-04/05).

**§3.1 2차 심화 — 마감 (2026-04-23, [R3-005](#r3--사건-casestatus)·[EVIDENCE-20260423-310](./IMPLEMENTATION_EVIDENCE.md) ) :** (a) 완료 — [R3-003](#r3--사건-casestatus)·[EVIDENCE-20260423-308](./IMPLEMENTATION_EVIDENCE.md). (b) 완료 — [R3-004](#r3--사건-casestatus)·[EVIDENCE-20260423-309](./IMPLEMENTATION_EVIDENCE.md). (c) 완료 — [EVIDENCE-20260423-307](./IMPLEMENTATION_EVIDENCE.md)~[EVIDENCE-20260423-310](./IMPLEMENTATION_EVIDENCE.md)와 R3-001~005 누적. 상세(완료 범주·남은 예외·교차 ID)는 310 본문. R3·§3.1 2차 절차는 310으로 종료 — 차기는 본 문서 상단 **문서 정보** 표 **차기 착수** 셀과 동일.

---

## R4 — Domain 라우트 `ok(data)` (축 A) + 도메인 클라 `requireOkData`

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | **일치** | **불일치** | **선행 구현** | **잠금 필요** | **역점검** | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|----------|------------|---------------|--------------|--------|------------|------|
| R4-001 | R4 | `src/app/api/**/route.ts` + `from "@/lib/domain-api-response"` | [IO_DATA](./IO_DATA_DEFINITION.md) · [API_SPEC](./API_SPEC_V1.md) | **60** route 파일(스냅샷) | `ok()`·`{ ok, data }` **A**축·IO 범위 내 **정합** | — | — | 신규 route **층** (A/B/C) **PR** 한 줄; per-path IO **부록** (선) | **일치(프로젝트 도메인 표준)** | **가능(방향)** — **B·C** 축 **감**할수록 A가 **기준**으로 남아 호환 **단순화** | [BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) R4 — **→ ALIGNMENT: IO-01, IO-04, IO-05, RB-02** (DTO·에러·allowedActions·서버 권한) — [§6-9](./ALIGNMENT_AUDIT_V1.md#6-9-입력출력-데이터-정합성)·[§6-3](./ALIGNMENT_AUDIT_V1.md#6-3-권한-정합성) |
| R4-002 | R4 | `requireOkData` import **클라** ( `api-error` 정의 제외 ) | `requireOkData` = `{ ok, data }` | **30** 파일이 `requireOkData<` / `requireOkData(` **호출**(스냅샷); `assignee-user-picker.tsx` **1**는 import·문자열만·**호출** **없음** | fetch·domain `ok` **쌍** 0 **불일치** (§4.2) | — | — | §4.2·IO 경로 (변경 시) | **일치(의도)** | **해당없음** — A를 **쓰는** 정상 경로; 축소는 **R5·R6·R8** 수렴 후 **호출** 감소 | **§4.2**·**§1.3** R1-101 — **→ ALIGNMENT: IO-01, IO-05, RB-02, UI-02~UI-06(해당시)** (클라↔API 쌍) — [§6-9](./ALIGNMENT_AUDIT_V1.md#6-9-입력출력-데이터-정합성)·[§6-11](./ALIGNMENT_AUDIT_V1.md#6-11-화면-우선순위-및-화면-api-연결-정합성) |

### §4.1 — Domain `ok` **라우트** 인벤토리(파일 단위, 축 A)

`src/app/api/**/route.ts` 중 `import … from "@/lib/domain-api-response"` **총 60개(파일 1:1, 중복·누락 없음)** (2026-04-23 정적 `grep`).

| 구간(`src/app/api/…`) | 비고 |
|------------------------|------|
| `cases/` | draft·interview·attachments·`detail`·`status`·`transition`·`assignments`·`…` — `ok`/`fail` |
| `documents/` | `versions`·`paragraphs`·`review`·`delivery`·`paragraph-versions`·`…` |
| `legal-documents/` | `approve`·`lock`·`delivery`·문단 `regenerate`·`histories`·`restore`·`lock` |
| `admin/` | `question-sets`·`audit-logs`·`users/…/approval`·`verify-canonical-sources` ( **§R6** `users/search` **는** `domain` **import 없음** ) |
| `auth/` | `login`·`logout`·`signup`·`me` |
| `document-templates/` | `GET/POST` + `[templateId]`·`publish`·`archive` |
| `question-sets/` | 공개 API (`/api/question-sets/…`) |
| `document-verification/` | 단일 `route` |
| `staff/lawyers` | 단일 `route` |

---

### §4.2 — `requireOkData` **호출** ↔ **도메인 route** **대응** (클라 파일 단위)

**원칙:** 각 `requireOkData(res,raw,…)` 쌍이 가리키는 `fetch` URL(또는 `case-form` 의 `/api/cases`·`/api/cases/:id`)에 대응하는 **핸들러**가 [§4.1](#41--domain-ok-라우트-인벤토리파일-단위-축-a) **목록**에 **포함**되면 **「일치」** ( `{ ok: true, data }` = `ok()` ).

**비고** 열: [ALIGNMENT **§6**](./ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) 역점검 ID(`ST-…` `IO-…` `LC-…` 등)를 문구 **→ ALIGNMENT: …** 로 **교차** (행마다 주요 축만 나열).

**§4.2·동일군(4칸) 누적:** **일치·불일치·선행 구현·잠금 필요** 네 열은 아래 **군 대표행**의 판정을 **한 세트**로 쓴다. **비대표** 행은 `〃` = 대표 4칸 **전부 동일**이며(셀 4개 모두), **「일치」** 셀에 **군**·**`R4-xxx` 同** 를 같이 쓰는 행은 `〃` 대신 그 한 줄로 **대표 4칸**을 **가리킨다**. **→ ALIGNMENT** 는 **행·화면**마다 **다를 수 있음** (군 **밖**에서도 **비고**는 **가변** ).

| 군 ID | 대표행 | 멤버(4칸=대표와 동일) | 비고(ALIGNMENT) |
|-------|--------|------------------------|-----------------|
| **G-auth** | R4-101(자체) | (단독) | 독자 |
| **G-admin** | R4-102 | R4-103~107 | 멤버마다 상이(관리·템플릿·질문셋 축) |
| **G-case-핵심** | R4-108 | (단독) | 사건 폼·422 **대표 5행** |
| **G-case-서브** | R4-109 | R4-110~115 | 멤버마다 상이(배정·TL·DC 등) |
| **G-E·verify** | R4-116 | (단독) | verify·E·§8.3·**대표 5행** |
| **G-문단·DC** | R4-117 | R4-118, 120~121, 123~126 — **R4-122(요약)** **제외** (일치 셀에 `R4-117` **同**·그 외 〃) | 멤버마다 상이(문단·버전·초안·DC UI) |
| **G-요약** | R4-122 | (단독) | 요약·SM 축 **대표** |
| **G-상세·복합** | R4-119 | (단독) | **대표 5행** (detail·delivery·E) |
| **G-인터뷰** | R4-127 | (단독) | **대표 5행** (IV) |

| 행 ID | 클라(소스) | `fetch` **대상 API**(패턴) | 대응 `route` (스냅샷) | **일치** | **불일치** | **선행 구현** | **잠금 필요** | 비고 |
|-------|------------|-----------------------------|------------------------|----------|------------|---------------|--------------|------|
| R4-101 | `components/auth/logout-button.tsx` | `POST /api/auth/logout` | `auth/logout/route.ts` | `POST /api/auth/logout`·`domain` `ok`·`requireOkData` A쌍 **정합** ( **G-auth** ·단일 군) | — | — | [IO](./IO_DATA_DEFINITION.md) per-path(해당 시)·auth [RB-01/02](./PERMISSION_DEFINITION.md) | **→ ALIGNMENT: IO-01, RB-01, RB-02** |
| R4-102 | `components/admin/pending-users-table.tsx` | `…/api/admin/users/:id/approval` | `admin/users/…/approval/route.ts` | **admin** API·`domain` `ok`·`requireOkData` A쌍 **정합** ( **G-admin** ) | — | (선) [API_SPEC](./API_SPEC_V1.md)·[QUESTION_SET](./QUESTION_SET_DEFINITION.md)·[DOCUMENT_TEMPLATE](./DOCUMENT_TEMPLATE_DEFINITION.md) **path**·정의 **개정** **시** **선** **잠금** | [RB-04]·[IO] per-path·**해당** **PR** (템플릿·질문셋 **다** **건** **동**시·**해**당 **시** ) | **→ ALIGNMENT: IO-01, RB-04, RB-02** |
| R4-103 | `components/admin/document-template-create-client.tsx` | `POST /api/document-templates` | `document-templates/route.ts` | 〃 **(G-admin, R4-102 同 4칸)** | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, RB-04, UI-06, DC-01** |
| R4-104 | `components/admin/document-template-editor.tsx` | `PATCH/POST …/document-templates/:id` , `…/publish` , `…/archive` | `document-templates/…/route.ts` 등 | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, RB-04, UI-06, DC-01** |
| R4-105 | `components/admin/question-set-create-client.tsx` | `POST /api/question-sets` | `question-sets/route.ts` | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, RB-04, UI-06, IV-01** |
| R4-106 | `components/admin/question-set-editor.tsx` | `…/question-sets/:id` , `…/publish` , `…/archive` | `question-sets/…/route.ts` | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, RB-04, UI-06, IV-01** |
| R4-107 | `components/admin/question-set-list-client.tsx` + `app/(protected)/admin/question-sets/page.tsx` | — (질문셋 **목록**·클라 `requireOkData` **없음**·SSR) | `admin/question-sets/page.tsx` | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, RB-04, UI-06, IV-01** · [332] **admin-client** **삭제**·**行**=**목록** **경계** |
| R4-108 | `components/cases/case-form.tsx` | `POST /api/cases` · `PATCH /api/cases/:id` | `cases/route.ts` , `cases/[caseId]/route.ts` | `POST`/`PATCH` 사건·`domain` `ok`·`requireOkData` A쌍 **정합**; 422 `fieldErrors`·**R2-105** (의도) ( **G-case-핵심** · **대표 5행** ) | — (스냅샷 A·route-대조 **0** **불일치**) | (선) [CASE_LIFECYCLE](./CASE_LIFECYCLE_DEFINITION.md)·[CASE_STATUS](./CASE_STATUS_DEFINITION.md)·폼·Zod·[IO](./IO_DATA_DEFINITION.md) **동**기 **또는** **정의** **앞** **잠금** | 사건·`CaseStatus`·**전이**·`case-form`·`schema`·**동** **시** `verify:canonical-sources` / `check-status` (변경 **시**); **per-path** [IO](./IO_DATA_DEFINITION.md) | **→ ALIGNMENT: IO-01, LC-01, ST-03, RB-02, RB-03** ( **대표** A·사건) |
| R4-109 | `components/cases/end-assignment-button.tsx` | `DELETE …/api/cases/:c/assignments/:a` | `…/assignments/[assignmentId]/route.ts` | 사건 하위(배정·타임라인·첨부·문서초안 등)·`domain` `ok`·`requireOkData` A쌍 **정합** ( **G-case-서브** ) | — | (선) [CASE_LIFECYCLE](./CASE_LIFECYCLE_DEFINITION.md)·[IO](./IO_DATA_DEFINITION.md)·해당 **action** / **권한** **path** **Draft** **시** | [IO](./IO_DATA_DEFINITION.md) per-path·[RB-03]·**해당** **PR** | **→ ALIGNMENT: IO-01, LC-02, LC-04, RB-03** |
| R4-110 | `components/cases/timeline-memo-form.tsx` | `POST/… /api/cases/:c/timeline` | `…/timeline/route.ts` | 〃 **(G-case-서브, R4-109 同 4칸)** | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, LC-05, RB-03** |
| R4-111 | `components/cases/delete-case-button.tsx` | `DELETE /api/cases/:id` | `cases/[caseId]/route.ts` | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, LC-02, RB-03** |
| R4-112 | `components/cases/delete-timeline-memo-button.tsx` | `DELETE …/timeline/:memoId` | `…/timeline/[memoId]/route.ts` | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, LC-05, RB-03** |
| R4-113 | `components/cases/delete-attachment-button.tsx` | `DELETE …/attachments/:aid` | `…/attachments/[attachmentId]/route.ts` | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, RB-03, SM-05(해당시)** |
| R4-114 | `components/cases/assignment-form.tsx` | `POST …/assignments` | `…/assignments/route.ts` | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, LC-02, LC-04, RB-03** |
| R4-115 | `components/cases/document-create-modal.tsx` | `POST …/documents/generate` | `…/documents/generate/route.ts` | 〃 | 〃 | 〃 | 〃 | **→ ALIGNMENT: IO-01, DC-01, LC-03, RB-03** |
| R4-116 | `components/cases/document-verification-client.tsx` | `POST /api/document-verification` | `document-verification/route.ts` | `POST` **document-verification**·`ok(data)`·`requireOkData` **정합**; 이후 `assert`/Zod·[§8.3](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#83--파일호출-단위-행--unwrapdeliveryverify-잔여-)·R8-304/305·[EVIDENCE-295](./IMPLEMENTATION_EVIDENCE.md) (E 겹, R8-003) ( **G-E·verify** · **대표 5행** ) | — | (선) verify **성공** 본문·[API_SPEC](./API_SPEC_V1.md)·[IO](./IO_DATA_DEFINITION.md)·부록/스키마 | [IO](./IO_DATA_DEFINITION.md) verify `data` 1형·부록(선); R8·명세 **동**축 | **→ ALIGNMENT: DL-03, DL-04, DL-05, IO-01** (예외·verify) |
| R4-117 | `components/cases/paragraph-structure-panel.tsx` | `…/legal-documents/…/paragraphs/…/regenerate` , `…/lock` | `…/regenerate/route.ts` , `lock/route.ts` | 문단 `regenerate` / `lock`·`domain` `ok`·`requireOkData` A쌍 **정합** ( **G-문단·DC** **4칸 대표** · **대표 5행** ) | — | (선) [DOCUMENT_TEMPLATE](./DOCUMENT_TEMPLATE_DEFINITION.md)·[AI_OUTPUT](./AI_OUTPUT_POLICY.md)·승인·잠금 **DC/AP** **Draft** | 승인·잠금·재생성·**API+UI**·**정책** **동**시 **PR**; **per-path** [IO](./IO_DATA_DEFINITION.md) | **→ ALIGNMENT: DC-04, DC-05, AP-02, IO-01** (잠금·재생성) |
| R4-118 | `components/cases/paragraph-history-modal.tsx` | `GET …/histories` , `POST …/restore` | `…/histories/route.ts` , `…/restore/route.ts` | 〃 (G-문단·DC·버전, R4-117 同 4칸) | 〃 | 〃 | 〃 | **→ ALIGNMENT: DC-06, IO-01, DB-04(해당시)** |
| R4-119 | `components/cases/case-detail-client.tsx` | `…/detail` , `interview/complete` , `status` , `legal-documents/…/approve`·`lock` | 각 해당 `route.ts` | 사건 상세·복합 (detail·`interview/complete`·`status`·approve·lock)·`domain` `ok`·`requireOkData` A쌍 **정합**; `delivery`·E·[§8.3](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#83--파일호출-단위-행--unwrapdeliveryverify-잔여-)·R8-303 (겹) ( **G-상세·복합** · **대표 5행** ) | — | (선) **per-path** [IO](./IO_DATA_DEFINITION.md)·[SCREEN_PRIORITY](./SCREEN_PRIORITY_TABLE.md)·delivery 1형 | 다 경로 [IO](./IO_DATA_DEFINITION.md)·E( **§8.6** R8 마감 )·팀 **합**의 | **→ ALIGNMENT: LC-04, ST-02, UI-02, AP-01, AP-02, AP-05, DL-01** (대표·상세·전달) |
| R4-120 | `components/cases/document-draft-client.tsx` | `…/draft/preview`·`regenerate`·`draft`·`history` | `…/draft/…/route.ts` | 〃 (G-문단·DC, R4-117 同 4칸) | 〃 | 〃 | 〃 | **→ ALIGNMENT: DC-01, DC-04, SM-01, IO-01** |
| R4-121 | `components/cases/document-version-panel.tsx` | `…/documents/:id/versions`·`diff`·`snapshot`·`restore` | `documents/…/versions/…/route.ts` | 〃 (G-문단·DC, R4-117 同 4칸) | 〃 | 〃 | 〃 | **→ ALIGNMENT: DC-06, IO-01, DB-04, AP-03** |
| R4-122 | `components/cases/case-summary-panel.tsx` | `…/summary/generate` | `…/summary/generate/route.ts` | `…/summary/generate`·`domain` `ok`·`requireOkData` A쌍 **정합** ( **G-요약** · **4칸 대표** ) | — | (선) [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md)·[IO](./IO_DATA_DEFINITION.md) **초안** **시** | [IO](./IO_DATA_DEFINITION.md) per-path·summary **API**·**PR** (해당 시) | **→ ALIGNMENT: SM-01, SM-02, SM-03, IO-01** |
| R4-123 | `components/cases/document-paragraph-editor-panel.tsx` | `…/paragraphs`·`…/approval-review` | `documents/…/paragraphs` , `approval-review` | 〃 (G-문단·DC, R4-117 同 4칸) | 〃 | 〃 | 〃 | **→ ALIGNMENT: DC-03, DC-07, AP-01, IO-01** |
| R4-124 | `components/cases/document-paragraph-version-panel.tsx` | `…/paragraph-versions`·`restore` | `paragraph-versions/…/route.ts` | 〃 (G-문단·DC, R4-117 同 4칸) | 〃 | 〃 | 〃 | **→ ALIGNMENT: DC-06, IO-01, DB-04** |
| R4-125 | `components/cases/document-paragraph-panel.tsx` | `…/paragraph-panel` , `…/draft/history` , `diff` | 각 `route.ts` | 〃 (G-문단·DC, R4-117 同 4칸) | 〃 | 〃 | 〃 | **→ ALIGNMENT: DC-03, DC-04, DC-06, IO-01** |
| R4-126 | `components/cases/document-detail-client.tsx` | `…/documents/:id/paragraphs`·`PATCH` 문서·`…/review` | `documents/…/route.ts` 등 | 〃 (G-문단·DC, R4-117 同 4칸) | 〃 | 〃 | 〃 | **→ ALIGNMENT: DC-01, UI-05, AP-01, IO-01** |
| R4-127 | `components/cases/case-interview-client.tsx` | `GET/PATCH /api/cases/…/interview` | `…/interview/route.ts` | `GET`/`PATCH` **인터뷰**·`domain` `ok`·`requireOkData` A쌍 **정합** ( **G-인터뷰** · **대표 5행** ) | — | (선) [QUESTION_SET](./QUESTION_SET_DEFINITION.md)·[CASE_LIFECYCLE](./CASE_LIFECYCLE_DEFINITION.md)·IV-04/05·**인터뷰** **완료**·**상태** **순서** | **인터뷰** **완료**·**사건** **LC**·[IO](./IO_DATA_DEFINITION.md)·**동시** **PR** | **→ ALIGNMENT: IV-01, IV-04, IV-05, UI-03, IO-01** ( **잠금**·**인터뷰** ) |

**`assignee-user-picker`:** (아래 **R6-002**) — `requireOkData` **호출 없음** (§4.2 비대상).

**누적(4칸·세부):** 위 **「§4.2·동일군(4칸) 누적」** 표·각 행 **「일치」** 셀 **군 ID** = **4칸 판정** **한 벌**로 **끝** — **대표 5행** (R4-108, 116, 117, 119, 127) + **G-admin**·**G-case-서브**·**G-문단·DC**·**G-요약**·**G-auth**·**G-E·verify** (위 표). **비고(→ ALIGNMENT)** 만 **행마다** **가변**. **스냅샷** **A**쌍 **0** **불일치** (§4.2 **원칙** + **R4-001/002**); **per-path** [IO](./IO_DATA_DEFINITION.md)·**E** / **R8** (116·119) = **§8.6** **이후**·**팀** **합**의 **에** **따름** ([EVIDENCE-20260423-302](./IMPLEMENTATION_EVIDENCE.md)).

---

### §4.3 — R4(세분) **결과**로 본 **R5**·**R8** **호환층 축소** 판정

| R | 판정 요지 | R4와의 관계 | 호환층 축소 |
|---|-----------|---------------|------------|
| **R5** | `requireOkResponseBody` **전용** 경로( `/api/admin/alerts/**` 등)는 **§4.1** **목록**에 **없음** — **B평면** `NextResponse.json({ ok: true, …필드 })` 직조립( **A**·`{ ok, data }` **와** 별개). | **직교(무관).** **§4.2** R4 **일치(0불일치)** 는 **A축**만 **증명**. **B** 축소는 **A** **완성**과 **무관**하게 **별도** 합의. | **부분(유효)** — (1) 서버 B를 `ok(mergedTopLevel)` **한 층** (2) 명세 “평면” **잠금** [BASELINE R5]. `requireOkData`·`requireOkResponseBody` **2종** 유지 **전**; **R4**·**독립** 합의. |
| **R8** | `unwrap` / `parseDelivery*` / `parseDocument*` **잔여** = delivery·verify **이중** 대비 — **§4.2** `requireOkData`·`fetch` **전** **쌍**은 **B 없이** `ok+data` **일치** → `unwrap` **필수** **아님** (이론). | **A**=100% **여도** `post-document-delivery`·`parse-document-*` **등** **남음**; **B**·`unwrap` **공존** 시 **감쇠** [BASELINE R8] 순. | **부분~가능** — (1) delivery **1형**+클라 **단일** (2) 검증 **파서** **한 단계** **후** R8-001~004 ( **R1·R2**·명세·선) |

---

## R5 — 관리 평면 `{ ok, fields… }` (축 B) + `requireOkResponseBody`

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | **일치** | **불일치** | **선행 구현** | **잠금 필요** | **역점검** | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|----------|------------|---------------|--------------|--------|------------|------|
| R5-001 | R5 | **그룹** `src/components/admin/**` + `src/app/(protected)/admin/**` (alerts·ops·bulk·cron·kpi) + `case-alert-*` | [API_SPEC](./API_SPEC_V1.md) `data` 래핑 · POST_278 **§6.x** | `requireOkResponseBody` **55** [소비, `api-error` **제외**; **§1.3** R1-102 **동일**] + **EXC-수동**·**기타** **§5.2**·**§5.3**; `assignee` **제외** | B 클라·서버 평면 **정합** (§5.3·0 **불일치**) | [API_SPEC](./API_SPEC_V1.md) `data` **래핑** 중심 서술 **vs** B | — | B **부록**·내부 B·EXC(수동·혼합·C) (§5.4) | **불일치/이중 패턴**(B vs **명세**) | **부분** — (선택) **§5.4** | [BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) R5 — **→ ALIGNMENT: IO-01, IO-03, IO-04, RB-04** (B·목록/에러·admin 경계) — [§6-9](./ALIGNMENT_AUDIT_V1.md#6-9-입력출력-데이터-정합성)·[§6-3](./ALIGNMENT_AUDIT_V1.md#6-3-권한-정합성) |
| R5-002 | R5 | `case-alert-summary-banner.tsx` / `case-alert-widget.tsx` | 사건+알람 | `requireOkResponseBody` | B·EXC-사건·서버 **일치** (§5.3 R5-209~210) | 명세 **vs** B (R5-001 **과** 동일) | — | R5-001 **과** 동일 **잠**금·EXC-사건 인지 | **불일치(동일 B vs 명세)** | **부분** — **§5.3** R5-209·210·**§5.2** EXC-사건 | **→ ALIGNMENT: RB-03, RB-04, UI-02** (사건 UI→admin B 경로) — **§5.3** R5-209~210 · [§6-3](./ALIGNMENT_AUDIT_V1.md#6-3-권한-정합성) |
| R5-003 | R5 | `src/lib/client/api-error.ts` `requireOkResponseBody` 정의 | POST_278 | HTTP OK + `ok===true` + **전체** 본문 반환 | `requireOkResponseBody` **의**도·**구**현 **일**치 | — | — | — | **일치(의도 B)** | **해당없음** (공용 **정의** 자체) | **→ ALIGNMENT: IO-01, IO-04** (B 성공·에러 **계약** 앵커) — [§6-9](./ALIGNMENT_AUDIT_V1.md#6-9-입력출력-데이터-정합성) |

### §5.1 — **B 평면**·`requireOkResponseBody` **대응 규칙** (세분)

| 용어 | 정의 |
|------|------|
| **B 평면** | 성공 JSON이 `ok(d)` 가 아니라 `NextResponse.json({ ok: true, …필드 })` — **payload가 `data` 안에 없음** ([BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) R5). |
| **일치** | `requireOkResponseBody` 가 **기대**하는 `ok === true` + **본문 객체**를, **해당** `fetch` 의 **서버 route** 가 **동일** 형태로 **내보냄** (샘플: `ops-dashboard/summary`·`users/options`·`alert-events/by-case/.../summary`). |
| **서버 합의** | (1) **[API_SPEC](./API_SPEC_V1.md)** 상 `success`/`data` 만 서술된 경우 **문서·구현** 어느 쪽을 기준으로 할지 **합의** — **필요**. (2) **POST_278**·코드 **사실상 B** 로 운영 중이면 **내부 B 확정** — **명세 부록** 또는 **개정**으로 **따로** 잠글지 **선택**. |
| **예외군** | **EXC-C** — (아래 **R6** 절) `users/search` — `{ users }` **only**. **EXC-혼합** — **한 파일**에 `requireOkResponseBody` **+** EXC-C `fetch` **병존**. **EXC-수동** — `requireOkResponseBody` **미사용**·`ok` **수동** 분기 (`run-bulk-queue-pipeline.ts` ). **EXC-사건** — `components/cases/**` 가 **admin** B API **소비** (경로는 admin). |

---

### §5.2 — **예외군** (R5 표 **바깥**·**교차**)

| ID | 대상 | 관찰 | R5 **행**과의 관계 |
|----|------|------|---------------------|
| EXC-C-1 | `src/components/admin/alerts/assignee-user-picker.tsx` | `GET …/users/search` — `{ users }` **만**; `requireOkResponseBody` **미사용** (주석·§6.3) | **R6-002** — R5 **호출 축** **아님** — [312](./IMPLEMENTATION_EVIDENCE.md) |
| EXC-C-2 | `OpsQueueAssigneeSelect.tsx` **내** `users/search` **leg** | 직접 `res.json()` → `users` — **R6** | **R5-222** **혼합** — **PATCH** `ops-queue/:id` 만 `requireOkResponseBody` |
| EXC-수동 | `run-bulk-queue-pipeline.ts` | `create`·`run`·`GET job` — `ok` **수동**; **공용 래퍼 없음** | **R5-253** — **감쇠** 시 `requireOkResponseBody` **이관** 또는 **유지** **합의** |

---

### §5.3 — **클라 파일** ↔ **B API** (행 누적, 2026-04-23)

**범위:** `import { requireOkResponseBody }` **+** 실제 `requireOkResponseBody(` **호출** 이 **1회 이상**인 소스 — `api-error.ts`(정의)·`assignee-user-picker`(EXC-C) **제외**. **서버** 형태는 **대표 route** 샘플·패턴으로 **일치** 판정( **전 route** 단위 검증은 **후속** ).

**4열(본맥):** `평면 ↔ 클라` = 스냅샷(일치/혼합/EXC-수동), 그 오른쪽 **4열** = **일치**·**불일치**·**선행 구현**·**잠금 필요**. **R5-201** 잠금 열 = 팀·문서·§5.4 기준(이하 **〃 (R5-201과 동일)** = 동일 잠금 범주 — **G-B** **4칸** **대표** ).

**§5.3·동일군(4칸) 누적:** **일치·불일치·선행·잠금** 네 열을 **군**으로 묶는다. **G-B·표준(대표+잠금행):** **R5-201** = B **정합**·**잠금** **범주** **앵커**; 멤버는 R5-202~208, 211~221, 223~252 **중** `평면↔` **일치**·**4칸=201** ( **R5-222**·**R5-253** **제외** ) **+** R5-209~210( **4칸=201** ·**예외행** = **EXC-사건**·**비고** **만** ). **G-EXC-혼합(예외행):** R5-222 **단독** ( **PATCH** B + **GET** C [§5.2] ). **G-EXC-수동(잠금행):** R5-253 **단독** ( `requireOkResponseBody` **미사용**·§5.4-3 ) — [EVIDENCE-20260423-303](./IMPLEMENTATION_EVIDENCE.md). **서버** **합**의·**예외**·`→ ALIGNMENT` **는** **행** **가변**.

| 군 ID | 역할 | 대표행 | 멤버(4칸=대표) | 잠금·특이 |
|-------|------|--------|----------------|----------|
| **G-B** | **B**·스냅샷 **0** **불일치** (일반) | R5-201 ( **잠금행** ) | R5-202~208, 211~221, 223~252 ( **222**·**253** **제외** ) + R5-209, 210 ( **4칸=201** ) | 209~210: **EXC-사건** = **비고** **열만** |
| **G-EXC-혼합** | B+C **한** **파일** | R5-222 ( **예외행** ) | (단독) | C leg A안 [312](./IMPLEMENTATION_EVIDENCE.md) **잠금** **완**; B·**§5.4-4** = **차기** |
| **G-EXC-수동** | `ok` **수**동·래퍼 **없**음 | R5-253 ( **잠금행**·EXC-수동) | (단독) | §5.4-3·EXC-수동 |

| 행 ID | 클라(소스) | `requireOkResponseBody`·`fetch`(B) | 평면 ↔ 클라 | **일치** | **불일치** | **선행 구현** | **잠금 필요** | 서버 합의 | 예외·비고 |
|-------|------------|-----------------------------------|-------------|----------|------------|---------------|--------------|----------|----------|
| R5-201 | `admin/escalations/escalation-detail-drawer.tsx` | `…/alert-escalations/:id/unified` **1** | **일치** | 「평면 ↔ 클라」열과 동일 (B정합) ( **G-B** **4칸·잠금 대표** ) | — | — | [API_SPEC](./API_SPEC_V1.md) B 부록·내부 B (§5.4) | 명세 정렬 **선택** | **→ ALIGNMENT: IO-01, IO-04, RB-04** (B **§5.3** **대표** 행) |
| R5-202 | `admin/audit-log-alert-quick-actions.tsx` | `POST …/alert-events/scan` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-203 | `admin/audit/AuditLogDetailPanel.tsx` | `…/audit-logs/:id` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-204 | `admin/audit/OpsQueueMoveAuditPanel.tsx` | `…/audit-logs/ops-queue-moves` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-205 | `app/(protected)/admin/cron-runs/.../cron-retry-button.tsx` | `…/cron/logs/:runId/retry` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-206 | `app/(protected)/admin/alerts/kpi/.../alert-kpi-api-dashboard.tsx` | `…/alerts/kpi?...` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-207 | `app/.../bulk-jobs/recover-stale-locks-button.tsx` | `POST …/bulk-jobs/recover-stale-locks` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-208 | `app/.../bulk-action-job-list-client.tsx` | `…/bulk-jobs/:id/retry`·`…/cancel` **2** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-209 | `components/cases/case-alert-summary-banner.tsx` | `…/alert-events/by-case/:caseId/summary` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) **·** **EXC-사건** ( **예외행** ) | 〃 | 〃 | 〃 | **〃** | **EXC-사건** (경로 admin) — **→ ALIGNMENT: RB-03, RB-04, IO-01, IO-04** (사건·admin B) |
| R5-210 | `components/cases/case-alert-widget.tsx` | `…/alert-events/by-case/:caseId` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) **·** **EXC-사건** ( **예외행** ) | 〃 | 〃 | 〃 | **〃** | **〃** — **→ ALIGNMENT: RB-03, RB-04, IO-01, IO-04** |
| R5-211 | `admin/alerts/bulk-jobs/bulk-job-anomaly-widget.tsx` | `…/bulk-jobs/dashboard` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-212 | `.../worker-health-panel.tsx` | `…/admin/system/workers/health` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-213 | `.../bulk-job-charts.tsx` | `…/bulk-jobs/metrics` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-214 | `.../bulk-job-compare-panel.tsx` | `…/bulk-jobs/compare` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-215 | `.../bulk-action-job-status-modal.tsx` | `…/bulk-jobs/:jobId` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-216 | `.../admin-notification-panel.tsx` | `…/notifications`·`…/read`·`read-all` **3** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-217 | `.../header-notification-dropdown.tsx` | `unread-count`·`notifications`·`read` **4** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-218 | `.../alert-performance-dashboard.tsx` | `…/alert-events/performance` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-219 | `.../alert-kpi-widget.tsx` | `…/alert-events/kpi` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-220 | `.../ops-dashboard/OpsDashboardOverview.tsx` | `…/alerts/ops-dashboard/summary` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | 샘플 route **검증** |
| R5-221 | `.../ops-queue/OpsQueueBulkEditToolbar.tsx` | `…/users/options`·`…/ops-queue/bulk-edit` **2** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | `options` → `{ ok, items }` |
| R5-222 | `.../ops-queue/OpsQueueAssigneeSelect.tsx` | `PATCH …/ops-queue/:id` **1** = `requireOkResponseBody` / `GET …/users/search` = **EXC-C** (§5.2) | **혼합** | PATCH = B **일치**; GET C = **A안** **일치** [312] | — | C leg = R6-001/002·§0 **동일** ( **완** ) | **A안** C leg [312] **잠금** **완**; B·IO·**§5.4-4** = **차기** | search=C **합의**·**PATCH**=B | **EXC-혼합** — **→ ALIGNMENT: IO-01, IO-04, RB-02** (B+C 동일 파일; **R6** 분리) — search **C** = [§0 **A**안](#c6-userssearch-예외군--a안-잠금)·[306](./IMPLEMENTATION_EVIDENCE.md)·[312](./IMPLEMENTATION_EVIDENCE.md) |
| R5-223 | `.../alert-task-board.tsx` | `…/alerts/board`·`reorder`·`sla-scan`·`escalation-scan` **4** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-224 | `.../AssigneeWorkloadCharts.tsx` | `…/ops-queue/workload` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-225 | `.../OpsQueueDetailTabs.tsx` | `…/ops-queue/:id/timeline`·`…/notifications` **2** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-226 | `.../OpsQueueDueAtQuickActions.tsx` | `…/due-at` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-227 | `.../OpsQueueDetailSlideOver.tsx` | `ops-queue/:id`·`users/options`·`.../edit` **3** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-228 | `.../OpsQueueRebalanceRecommendationCard.tsx` | `rebalance-recommendations`·`rebalance-apply` **2** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-229 | `.../OpsQueueWipSettingsCard.tsx` | `…/settings/wip-limit` **2** (GET+PATCH) | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-230 | `.../OpsQueueCardQuickActions.tsx` | `users/options`·`quick-update` **2** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-231 | `.../OpsQueueMoveCommentModal.tsx` | `…/ops-queue/board/reorder` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-232 | `.../OpsQueueKanbanBoard.tsx` | `…/ops-queue` (보드) **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-233 | `.../alert-history-table.tsx` | `alert-events?`·`scan`·`…/status` **3** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-234 | `.../related-audit-logs-panel.tsx` | `…/related-audit-logs` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-235 | `.../alert-rule-sla-form.tsx` | `PATCH …/alert-rules/:id` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-236 | `.../alert-rule-escalation-target-form.tsx` | `PATCH …/alert-rules/:id` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-237 | `.../alert-rule-form.tsx` | `POST …/alert-rules` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-238 | `.../alert-detail-modal.tsx` | `…/alert-events/:id`·`assign`·`create-action-draft`·`status` **4** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-239 | `.../filter-preset-save-dialog.tsx` | `…/filter-presets` **3** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-240 | `.../bulk-jobs/recommended-action-buttons.tsx` | `…/recommended-actions` **1** ( `readJsonApiErrorMessage` **보조** ) | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | 실패 **메시지** **보조** |
| R5-241 | `.../failed-items-toolbar.tsx` | **〃** **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | **〃** |
| R5-242 | `.../bulk-job-admin-settings-form.tsx` | `PUT …/bulk-jobs/:id` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-243 | `.../BulkRetrySchedulePresetBar.tsx` | `…/retry-schedule/bulk-move` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-244 | `.../BulkScheduleControls.tsx` | `…/schedules/bulk` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-245 | `.../ScheduleActionControls.tsx` | `…/schedules/:id` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-246 | `.../failed-job-items-table.tsx` | `failed-items`·`retry-failed` **2** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-247 | `.../alert-rule-list.tsx` | `GET/DELETE …/alert-rules` **2** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-248 | `.../escalations/release-escalation-button.tsx` | `…/alert-escalations/:id/release` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-249 | `.../alert-card-quick-actions.tsx` | `…/alerts/:id/quick-action` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-250 | `admin/cron/cron-logs-table.tsx` | `…/cron/logs/:runId/retry` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | R5-205·**경로** 동일 **패턴** |
| R5-251 | `admin/cron/manual-cron-runner.tsx` | `POST …/admin/cron/run` **1** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-252 | `.../filter-preset-bar.tsx` | `filter-presets`·`default` **3** | **일치** | 〃 (G-B, R5-201 同 4칸) | 〃 | 〃 | 〃 | **〃** | — |
| R5-253 | `admin/alerts/run-bulk-queue-pipeline.ts` | bulk-jobs `POST`·`…/run`·`GET` **3** — **`requireOkResponseBody` 없음** | **EXC-수동** (§5.2) | 수동 `ok`·B 형태 가정·운용 ( **G-EXC-수동** **4칸** **대표**·**잠금행** ) | — | `requireOkResponseBody` 미도입(의도·EXC-수동) | 이관·유지 단일(§5.4-3) | B **형태** **가정**·**래퍼** **합의** | **R4·R5** **이중** 감쇠 **후보** — **→ ALIGNMENT: IO-01, IO-04, RB-04, EV-01** (EXC-수동·잠금·합의 기록) |

**누적(4칸·세부):** **「§5.3·동일군(4칸) 누적」** 표 = **G-B** ( **R5-201** **잠금행** + 멤버 **4칸** `〃` ) + **G-EXC-혼합** ( **R5-222** ) + **G-EXC-수동** ( **R5-253** **잠금행** ); **G-B** **내** **R5-209~210** = **EXC-사건** **(예외행)** = **4칸=201**·**구분** = **비고** — [EVIDENCE-20260423-303](./IMPLEMENTATION_EVIDENCE.md). **스냅샷** **카운트:** `requireOkResponseBody` **사용** **50** + **EXC-수동** **1** + (assignee **제외**·R6) **1** — **B↔클라** **0** **불일치** ( **EXC-혼합·EXC-수동** = **형태**·**정책**·**not 오류** ).

---

### §5.4 — **서버·명세 합의** (체크리스트)

1. [API_SPEC_V1.md](./API_SPEC_V1.md) **응답** 절이 **`data` 래핑** **만** 규정하면 **vs** B **평면** — **문서** **개정** 또는 **「관리/OPS 평면」** **부록** ( **R1**·R5 **연동** ).  
2. **신규** admin route — **B** / **A** / **C** [R6] **중** 어느 층인지 **PR·스캐폴드** 에 **한 줄** ( **불일치** 예방 ).  
3. **EXC-수동** (`R5-253`) — Job **파이프라인** **안정** 후 `requireOkResponseBody` **이관** **여부** **단일** 결정.  
4. **EXC-혼합** (`R5-222`) — `users/search` **GET** = C·A안 [306](./IMPLEMENTATION_EVIDENCE.md)·**후속** [312](./IMPLEMENTATION_EVIDENCE.md) **잠금** **완**; **B**안·`requireOkData`·C/B **혼용** **해소** = **IO·§5.4** **차기** **합의** (선).

---

## R6 — `GET …/users/search` (축 C)

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | **일치** | **불일치** | **선행 구현** | **잠금 필요** | 역점검 | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|----------|------------|---------------|--------------|--------|------------|------|
| R6-001 | R6 | `GET /api/admin/users/search` — `src/app/api/admin/users/search/route.ts` | [API_SPEC](./API_SPEC_V1.md) / IO / POST_278 **§6.3** | `return NextResponse.json({ users })` only — **envelope 없음** | **A**안·평면 `{ users }`·`requireAdminApi` | — | **route** = 현행 ( **312** **확인** ) | **A**안 C(R6) [312] **잠금** **완**; B·IO = **차기** | **일치** (A안 [312] **확정**) | **가능(조건부)** — B안 전환 시 `ok`+명·IO·`requireOkData` | [BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) R6 — **→ ALIGNMENT: IO-01, IO-04, RB-02, RB-04** (C·`{ users }`·admin) — **EXC-C** [§5.2](#52--예외군-r5-표-바깥교차) · [§6-9](./ALIGNMENT_AUDIT_V1.md#6-9-입력출력-데이터-정합성) — **[306](./IMPLEMENTATION_EVIDENCE.md)·[312](./IMPLEMENTATION_EVIDENCE.md)** |
| R6-002 | R6 | `src/components/admin/alerts/assignee-user-picker.tsx` | **§6.3** | `fetch` → `res.json` → `users` **배열**; `res.ok`·객체·`Array.isArray`; `requireOk*` **미적용(의도)** | **EXC-C-1**·HTTP+`users`·주석=§6.3 | — | **클라** 패턴 = [§0](#c6-userssearch-예외군--a안-잠금)·`assignee` ( **312** **확인** ) | **A**안 [312] **잠금** **완**; B·강제 `requireOk*` = **차기** | **일치(의도·EXC-C-1)** | **해당없음** (A고정; B=선) | POST_278 **§6.3**·슬라이스 12 — **→ ALIGNMENT: IO-01, RB-04, UI-06(해당시)** · **R1-103** **직교** — [§6-11](./ALIGNMENT_AUDIT_V1.md#6-11-화면-우선순위-및-화면-api-연결-정합성) — **[306](./IMPLEMENTATION_EVIDENCE.md)·[312](./IMPLEMENTATION_EVIDENCE.md)** |

---

## R7 — 첨부·비 JSON (축 D)

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | 역점검 | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|--------|------------|------|
| R7-001 | R7 | `…/attachments/[attachmentId]/download` route | IO·바이너리 | blob `Response` | **일치(의도 예외)** | **불가(의도·유지)** | envelope **불필요** — BASELINE R7 |
| R7-002 | R7 | `attachment-download-link.tsx` | POST_278 **§14.4** | 실패 시 JSON + `readJsonApiErrorMessage` | **일치(의도)** | **해당없음** (실패 **만** JSON) | 성공= blob |

---

## R8 — `unwrap`·특수 파서 (축 E)

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | 역점검 | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|--------|------------|------|
| R8-001 | R8 | ~~`unwrap-domain-api-response.ts`~~ **삭제** ( **R8-301** ) | — | `unwrap` **0** **소비** | **감쇠** | **R8-301** | [EVIDENCE-20260423-294] — **→ ALIGNMENT: EV-01, IO-01** (래퍼 제거·응답 DTO·증빙 일원화) [§6-12](./ALIGNMENT_AUDIT_V1.md#6-12-구현-증빙검증-체계-정합성) ( **E** **마감**·`unwrap` ) |
| R8-002 | R8 | `parse-document-verification-response.ts` `assertDocumentVerificationResult` | document verification | `data` **shape** ( **R8-304** ) | **정합** | **§8.3** R8-304 | **§8** — **→ ALIGNMENT: DL-03, DL-04, IO-01** (Zod·verify **payload** ) [§6-8](./ALIGNMENT_AUDIT_V1.md#6-8-전달검증-정합성) ( **verify** **파서** ) |
| R8-003 | R8 | `document-verification-client.tsx` | — | `requireOkData` **→** `assert…` ( **R8-305** ) | **정합** | **§8.3** R8-305 | R4-116·**§8** — **→ ALIGNMENT: DL-04, DL-05, IO-01, UI-05(해당시)** (공개·검토 UI ) [§6-8](./ALIGNMENT_AUDIT_V1.md#6-8-전달검증-정합성)·[§6-11](./ALIGNMENT_AUDIT_V1.md#6-11-화면-우선순위-및-화면-api-연결-정합성) ( **verify** **클라** ) |
| R8-004 | R8 | `src/lib/client/post-document-delivery.ts` | delivery | `requireOkData` ( **R8-303** ) | **정합** | **§8.3** R8-303 | **§8**·**§4.3** — **→ ALIGNMENT: DL-01, DL-02, AP-05, IO-01** (전달·이력·승인본 연동) [§6-7](./ALIGNMENT_AUDIT_V1.md#6-7-승인잠금버전-정합성)·[§6-8](./ALIGNMENT_AUDIT_V1.md#6-8-전달검증-정합성) ( **delivery** **클라** ) |

### §8.1 — **범위**·**호출 그래프** ( `unwrap`·delivery·verify, 2026-04-23 )

| 범위 | 내용 |
|------|------|
| **포함** | `parse-document-verification-response.ts` · `post-document-delivery.ts` · `document-verification-client.tsx` · `case-detail-client` 내 `postDocumentDelivery` · `post-document-delivery.test.ts` |
| **제외** | `parseDocumentDraftContent` 등 **문서 본문 JSON** 파서 — **envelope·전달·검증** **아님** (별 축). |

**의존(정적 `grep` — 2026-04-23 갱신, [EVIDENCE-20260423-294]):**

```
postDocumentDelivery (requireOkData)  → case-detail-client
assertDocumentVerificationResult  → document-verification-client ( requireOkData 뒤 data )
( unwrap-domain-api-response.ts / unwrapDomainApiData·parseDeliverySuccessPayload — 삭제 )
```

**대응 API (이미 domain `ok` — 본 문서 §4.1·§4.2):** `POST …/documents/:id/delivery` · `…/legal-documents/:id/delivery` · `POST /api/document-verification` (**R4-116**).

---

### §8.2 — **감쇠 판정** 열 (이 문서 **공통**)

| 판정 | 의미 |
|------|------|
| **즉시(가능)** | **추가** 합의·**API** **개정** **없이** **한 PR** 내 **제거·단순화** 가능 ( **남은** 건 **테스트**·**타입** **정리** 수준). |
| **즉시(부분)** | **일부** 라인·**중복**만 **당장** 줄일 수 있음; **완전 삭제**는 **불가**. |
| **선행 필요** | **명세 잠금**·**응답 1형**·**R1/R2**·**다른 축(R5/R6)** **등** **선** **충족** **후** **감쇠**. |
| **유지** | **기능**·**레거시 대비** **필요** — **문서화** **수준**에서 **잔존** **정당화**. |

---

### §8.3 — **파일·호출** 단위 행 ( `unwrap`·delivery·verify **잔여** )

**4칸(본 R8·E):** [열 정의(공통)](#열-정의공통) **일치**·**불일치**·**선행 구현**·**잠금 필요** 열명은 §4.2·§5.3과 **동일**하다. **E(§8)** = `unwrap`·`parseDelivery*`·verify **클라** **겹**; **감쇠(§8.2)** 열은 [§8.2](#82--감쇠-판정-열-이-문서-공통) **용어**와 **짝**을 맞춘다. **「일치」** = [EVIDENCE-20260423-292]~[295] **기록**·**스냅** **기**준 **정합** / **또**는 **감쇠** **완료** — [EVIDENCE-20260423-304](./IMPLEMENTATION_EVIDENCE.md).

**§8.3·동일군(4칸) 누적:** **일치·불일치·선행·잠금** 네 열을 **군**으로 묶는다. **G-E1(전달):** **R8-303** = **4칸** **대표**; **R8-306** = `〃` (동일 4칸 = G-E1, R8-303 同 4칸). **G-E2(검증):** **R8-304** = **대표**; **R8-305** = `〃` (G-E2, R8-304 同 4칸). **G-E3(래퍼, 선행 필요):** **R8-301** = **대표**; **R8-302** = `〃` (G-E3, R8-301 同 4칸) — R8-303 `requireOkData`·[§8.4](#84--우선순위-감쇠-권장-순) **권장** **순** **뒤** `unwrap` / `parseDeliverySuccessPayload` **삭제·0소비**. **G-E4(스냅, 부분 가능):** **R8-307** = **대표**·**단독**; [§8.2](#82--감쇠-판정-열-이-문서-공통) **즉시(부분)**·**회**귀 취지. — [EVIDENCE-20260423-304](./IMPLEMENTATION_EVIDENCE.md).

| 군 ID | 구분 | 대표행 | 멤버(4칸=대표) | 감쇠(§8.2) 요약 |
|-------|------|--------|----------------|-----------------|
| **G-E1** | **대표(전달)** | R8-303 | R8-306 | **정합** |
| **G-E2** | **대표(검증)** | R8-304 | R8-305 | **정합** |
| **G-E3** | **선행 필요(래퍼)** | R8-301 | R8-302 | **삭제(0소비)** |
| **G-E4** | **부분 가능(스냅)** | R8-307 | (단독) | **정합**·**스냅** (즉시 **부분**) |

| 행 ID | 위치(심볼·호출) | 역할 | **일치** | **불일치** | **선행 구현** | **잠금 필요** | **감쇠(§8.2)** | **비고(증빙·→ ALIGNMENT)** |
|-------|-----------------|------|----------|------------|---------------|--------------|----------------|----------------------------|
| R8-301 | ~~`unwrap-domain-api-response`~~ `unwrapDomainApiData` | `ok+data`·평면 호환(삭제) | [EVIDENCE-20260423-294] 감쇠·파일 삭제·0소비 ( **G-E3** **4칸** **대표** ) | — | (선) [§8.4](#84--우선순위-감쇠-권장-순)·R8-303 `requireOkData` 경로 | (선) [IO](./IO_DATA_DEFINITION.md) 응답 1형·[§4.2](#42--requireokdata-호출--도메인-route-대응-클라-파일-단위) A쌍 (E 겹) | **삭제(0소비)** | [EVIDENCE-20260423-294] — R8-001·**→ ALIGNMENT: EV-01, IO-01** |
| R8-302 | `parseDeliverySuccessPayload` (unwrap과 동일 파일계) | delivery `data` | 〃 (G-E3, R8-301 同 4칸) | 〃 | 〃 | 〃 | **삭제(0소비)** | R8-303 `requireOkData`로 대체 [EVIDENCE-20260423-293]·[EVIDENCE-20260423-294] |
| R8-303 | `post-document-delivery` `postDocumentDelivery` | `requireOkData` | `postDocumentDelivery`·[§4.1](#41--domain-ok-라우트-인벤토리파일-단위-축-a)·[IO](./IO_DATA_DEFINITION.md) `data` 1형 **정합** ( **G-E1** **4칸** **대표** ) | — | (선) [API_SPEC](./API_SPEC_V1.md)·[IO](./IO_DATA_DEFINITION.md) delivery 부록 | (선) per-path [IO](./IO_DATA_DEFINITION.md)·[§8.4](#84--우선순위-감쇠-권장-순) | **정합** | [EVIDENCE-20260423-293] — **→ ALIGNMENT: DL-01, DL-02, AP-05, IO-01** (R8-004·[§4.3](#43--r4세부-결과로-본-r5r8-호환층-축소-판정) ) |
| R8-304 | `parse-document-verification` `assertDocumentVerificationResult` | `documentVerificationResultSchema` (Zod) | `assert*`, Zod·[IO](./IO_DATA_DEFINITION.md) verify `data` 1형 **정합** ( **G-E2** **4칸** **대표** ) | — | (선) [API_SPEC](./API_SPEC_V1.md)·[IO](./IO_DATA_DEFINITION.md) verify `data` | (선) Zod `documentVerificationResultSchema` [EVIDENCE-20260423-295] | **정합** | [EVIDENCE-20260423-294]·[EVIDENCE-20260423-295] — R8-002·**→ ALIGNMENT: DL-03, DL-04, IO-01** |
| R8-305 | `document-verification-client` | `requireOkData` → `assert…` (동일 스키마) | 〃 (G-E2, R8-304 同 4칸) | 〃 | 〃 | 〃 | **정합** | [EVIDENCE-20260423-294]·[EVIDENCE-20260423-295] — R8-003·R4-116 |
| R8-306 | `case-detail-client` `postDocumentDelivery(` | 유일 호출(전달) | 〃 (G-E1, R8-303 同 4칸) | 〃 | 〃 | 〃 | **정합** | R8-303·E·A `requireOkData` 동일 패밀리 |
| R8-307 | `post-document-delivery.test.ts` | **스냅** (회귀) | R8-303·A·E ( **G-E4** **4칸**·**스냅** ) | — | (선) R8-303 시그니처 / 응답 1형 (유지 시) | — | **정합** ( **§8.2** **즉시(부분)** ) | R8-303·[EVIDENCE-20260423-293] — [§8.1](#81--범위호출-그래프--unwrapdeliveryverify-2026-04-23) **스냅** |

**누적(4칸·세부):** [§8.1](#81--범위호출-그래프--unwrapdeliveryverify-2026-04-23) **·** **G-E1~E4** = R8-301~307 **4**칸 **끝** — `unwrap` / `parseDeliverySuccessPayload` **삭제**; verify `parse*` **→** `assert*`+`requireOkData` **전달** — [EVIDENCE-20260423-304](./IMPLEMENTATION_EVIDENCE.md).

**누적 요약(갱신):** `unwrap`·`parseDeliverySuccessPayload` **삭제**; verify `parse*` **→** `assert*`+`requireOkData` **전달**; R8-301~305 [EVIDENCE-20260423-294]·R8-303 [EVIDENCE-20260423-293].

---

### §8.4 — **우선순위** (감쇠 **권장 순**)

1. **선행:** [API_SPEC](./API_SPEC_V1.md)·[IO](./IO_DATA_DEFINITION.md) **delivery·verify** **성공 본문** **1형** ( **R1**·**BASELINE R2** **와** **한 번에** 잠그면 **유리** ).  
2. **`postDocumentDelivery` → `requireOkData` + 좁은 타입** ( **R8-303** ) — **`parseDeliverySuccessPayload`** **삭제** ( **R8-302** ) — [EVIDENCE-20260423-293]·[EVIDENCE-20260423-294].  
3. **verify: `assertDocumentVerificationResult` + `documentVerificationResultSchema` (Zod) + `document-verification-client` 단일 경로** ( **R8-304/305** ) — [EVIDENCE-20260423-294]·[EVIDENCE-20260423-295].  
4. **`unwrapDomainApiData` / `unwrap-domain-api-response.ts` 파일 삭제** ( **R8-301** ) — [EVIDENCE-20260423-294].

### §8.5 — C(R6)보다 E(§8.4·R8) **우선** · **감쇠** **실행** **준비** **표** ( **고정** )

**차기 실작업 순(선택):** **E** ( `delivery` / `verify` / `unwrap` **호환층** ) **를** **C** ( `users/search` · **R6** ) **앞**에 **둔다**.

**이유(짧게):** (1) B·C **교차** ( **R5-222** · **EXC-혼합** ) [§5.4-4] **해소**는 **R6-001**·[IO] **C** **스키마** **잠금**이 **선행**이므로, **E** **감쇠** ( **R1-104**·**R2-104** ) [§4.3] **와** **겹치지** **않고** **진행** **가능**. (2) **E** **는** **§4.2** **domain** `ok` + `requireOkData` **쌍** **확인** **뒤** **클라** **추가** **한** **겹** **만** **대상** — A/B **닫힘** **없이**, **0** **단** ( [API_SPEC](./API_SPEC_V1.md)·[IO](./IO_DATA_DEFINITION.md) **합의** ) **만** **선행** **하면** **시작** **가능**. (3) **감쇠** **권장** **순** **은** **이미** **§8.4** **—** **아래** **표** **는** **「** **실행** **준비** **」** **체크** **만** **고정** ( **코드** **착수** **전** ).

| **순** | **하는** **일** ( **권장** **감쇠** ) | **R8** / **심볼** | **다음** **행** **전** **준비** ( **완** ) |
|--------|--------------------------------------|----------------|----------------------------------|
| **0** | [API_SPEC](./API_SPEC_V1.md)·[IO](./IO_DATA_DEFINITION.md) **delivery·verify** **성공** **본문** **1형** ( **부록** / **스키마** ) | **—** ( **R1-105**·**R1-104** **선행** ) | **§8.4** **1~4** **와** **같은** **합의** **기록** **또는** **DRAFT** / **PR** **초안** |
| **1** | `postDocumentDelivery` **→** `requireOkData` + **좁은** **타입**; `parseDeliverySuccessPayload` **삭제** | R8-303·R8-302 | [293]·[294] **완료** |
| **2** | **`assertDocumentVerificationResult` +** `document-verification-client` **단일** **경로** | R8-304·R8-305 | [294] **완료** |
| **3** | `unwrap` **모듈** **삭제** ( R8-301 ) | R8-301 | [294] **완료** |
| **(후행)** | **C** ( `users/search` **·** **R6-001~002** ) [§1.4 R1-103] — **B** / **E** / **R5-222** [§5.4-4] **와** **독립** | R6-001~002 | **E** ( **0~3** )·**B** ( **§1.6** ) **정리** **뒤** ( **또** **는** **C** **전용** **슬라이스** ) **.**

**예외:** R5-222 [§5.4-4] **처럼** **C** **잠금**이 **B·E** **보다** **먼저** **이면** **C** **스키마** **합의** **를** **끼워** **넣는다** **—** **기본** **권장** ( **E** **선** ) **은** **유지** **.**

### §8.6 — E(R8) **축** **마**감** ( **[EVIDENCE-20260423-295]** · **[EVIDENCE-20260423-296]** )

**선언(요지):** E( delivery / verify / 제거된 unwrap ) 호환층 감쇠 **라**운**드** **를** **이** **절**·[IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **[EVIDENCE-20260423-296]** **로** **문** **서** **상** **마**감**한다. 기술 **최**종** **앵**커** **는** [EVIDENCE-20260423-295] ( `documentVerificationResultSchema` ) **이** **며** , [293]·[294]·[292]·[295] **는** **동** **일** **라**운**드** **전** **후** **맥**락** **이** **다** . ( **선** **택** ) R2-104 / API_SPEC verify **부**록** **는** E 코드 **마**감** **과** **분** **리**·**R2** / **문** **서** **후** **행** **궤** **다** .

**이후 전환 (권장 순): (1) 정의서 대비 구현 역점검 본맥** — [BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) **§1**·본 문서 R1~R9·[ALIGNMENT](./ALIGNMENT_AUDIT_V1.md) (R9 병행 가능)·[EVIDENCE-20260423-297] **. (2) C(R6)** `GET …/admin/users/search` **예외군** (R6-001~002·EXC-C·R5-222 [§5.4-4]·R1-103) **.**

---

## R9 — ALIGNMENT 전 항·교차

| 행 ID | R | 점검 대상 | 잠근·참조 | 관찰 | **일치** | **불일치** | **선행 구현** | **잠금 필요** | **역점검** | 호환층 축소 | 비고 |
|-------|---|-----------|-----------|------|----------|------------|---------------|--------------|--------|------------|------|
| R9-000 | R9 | [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) **§6** 전表 `ST-01`…`AP-05`…`IO`… (12 축) | [BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) R9 | 본 v1 **스냅샷**; 세부 **판정보류/판정**은 **ALIGNMENT** | R1~R8(envelope) **과** **직**교; **갭**·**화면**·**권한** 세부 = [ALIGNMENT **§6**](./ALIGNMENT_AUDIT_V1.md) **본**표 **우**선 | 세부(불·선) = §6 **개별** 행 — **본** 행은 **맥락** | 기준·정의 없이 **ST**·**AP**·**IO**만 망취 = 선행 구현 (ALIGNMENT **§2**·**§6** 위반) | §6 **ID**·**축**·**FILE** 갱신·증빙 **절**차 | **(별도)** | **보류/축마다** — **R1~R8** (envelope/데이터)과 **독립** | **→ ALIGNMENT:** [§6 본문](./ALIGNMENT_AUDIT_V1.md#6-역점검표-본문) 12축 **인덱스** — **R3-001**·**R9-001** (**ST-01**) · R4·§4.2 (**IO·RB** + **LC·DC·IV·DL·AP** **해당** 행) · R5·§5.3 (**IO·RB**·**EXC** ) |
| R9-001 | R9 | *교차 예* **ST-01** `CaseStatus` | ALIGNMENT 6-1 | **R3-001**(`prisma`·`case-status.ts`)과 **동일** 기계 파일 | R3-001 + **ST-01** = **CaseStatus** 동축 | — | — | R3-001 변경 시 **ST-01**·**§6-1** 동기 (한쪽만 완료 금지) | **일치** (R3-001 align) | **해당없음** | **→ ALIGNMENT: ST-01** ([§6-1](./ALIGNMENT_AUDIT_V1.md#6-1-상태값-정합성)) — [R3-001](#r3--사건-casestatus) **동축** · **DB-01** (schema enum) **교차** — [§3.1](#31--r3r9st-2차-심화-점검)·[EVIDENCE-20260423-307](./IMPLEMENTATION_EVIDENCE.md)~[EVIDENCE-20260423-310](./IMPLEMENTATION_EVIDENCE.md) **(R3 2차 마감)** |

---

## 사용법 (공용 호환층 축소)

1. **우선** [BASELINE](./SPEC_IMPLEMENTATION_REAUDIT_BASELINE_V1.md) **§3·§4** ID**(R1·R5·R6·R8)** 합의.  
2. **§1.3~§2.3** — **R1·R2** **행** **누적** (**성공** envelope / **오류**·**래퍼**) **분포·예외·감쇠** **고정** — **R4~R8** **세분**·BASELINE **과** **함께** 읽는다.  
3. **§1.4~§2.4** — **감쇠**·**선행**·**유지/예외** **확정** + **R4·R5·R8** **열** ( **§1.3**·**§2.3** **다음** **단계** ).  
4. **§1.5** — **R1-101+ R2-101 (A축)** **실행** **우선** — **정합** **잠금** **후** **남은** **흔적**·**B** **전환**.  
5. **§1.6** — **R1-102+ R2-103 (B축)**·**R2-102~103** **실행** **우선** — **제거/예외/합의**·**B** **닫힘**·**C·E** **다음**.  
6. **§4.2~§4.3** — **A(`requireOkData`)** = **0 불일치**; **A**·**B** **분리** 판정.  
7. **§5.1~§5.4** — **B** `requireOkResponseBody`·**R5-201~253**·**§5.4**.  
8. **§8.1~§8.4** — **`unwrap`·delivery·verify**·**R8-301~307**·**감쇠 권장 순(§8.4)**.  
9. **§8.5~§8.6** — [EVIDENCE-20260423-292] **§8.5** **실**행** **준**비** **표**·[EVIDENCE-20260423-295]·[EVIDENCE-20260423-296] **§8.6** **E** **마**감** .  
10. **R9/ALIGNMENT** — [ALIGNMENT](./ALIGNMENT_AUDIT_V1.md) **§6**·교차.

---

## 다음 (문서)

- **(1차 이후)** 세부 **행 누적** (§4.2·§5.3 **전 행**·§8.3 **R8-301~307** **등**)·ALIGNMENT `→` **필요 시** 보강 — 본맥 [EVIDENCE-20260423-300]  
- **B** `route` per-route (**§5.3**)·명세/내부 B **잠금** (미완 **행**)  
- **C(R6)** `users/search`·IO·**EXC-C**·R5-222 [§5.4-4]·R1-103 **스키마·합의** ( **§5.2** [예외](#52--예외군-r5-표-바깥교차) )  
- **E(R8)** [EVIDENCE-20260423-296] **이후** — 선택 R2-104 / API_SPEC verify **부록**  
- **R5-253**·**R5-222** (**§5.4**) (B / C / E **교차** **시** )
