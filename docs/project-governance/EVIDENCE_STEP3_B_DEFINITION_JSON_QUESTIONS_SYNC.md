# Step 3 — 333~ **2차** `QuestionSet.definitionJson` ↔ `QuestionSet.questions` **동기** (정책·시점·시드·구현 결정) {#evidence-step3-b-definition-json-questions-sync}

## 문서 정보

| 항목 | 내용 |
|------|------|
| 축 | [333~](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-333) **정의·데이터** (1차 종료 [337](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337)) |
| 공식 EVIDENCE | [EVIDENCE-20260425-338](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-338) (2차 **개설**) · [EVIDENCE-20260425-339](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-339) (§1) · [EVIDENCE-20260425-340](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-340) (§2) · [EVIDENCE-20260425-341](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-341) (§3) · [EVIDENCE-20260425-342](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-342) (§4 **구현** **잠금**) · [EVIDENCE-20260425-345](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-345) (**시** **드** **전** **용**) |
| 선행 | [EVIDENCE_STEP3_A — §7](./EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#7-2차-동기-시드) · [SPEC #step-3-싱글-소스-질문셋](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#step-3-싱글-소스-질문셋) · [330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330)·[334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334)·[335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335)·[336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336) |

**범위 선언(한 줄):** 2차는 **`definitionJson`(Zod/관리)** 과 **플랫 A안 `questions` 인터뷰/런타임** 이 **DB에서 함께** 의미 있게 쓰일 때 **어느 축이 진실**인지, **언제** 맞출지, **시드/백필**을 **어느 순서**로 물지, **코드를 짤지/절차만 둘지**를 **서로 섞지 않고** 잠그는 **문서**다. (코드 구현·API 변경은 **별** 블록·`EVIDENCE`에서 **실행**한다.)

**잠금 단위(4축, 독립 기록·판정):**

| 축 | 이 문서 절 | 다루는 질문(요지) |
|----|------------|------------------|
| **A** | [§1](#1-동기-정책) | **동기** **정책** — 단일/이중 쓰기, 우선 축, 충돌 시 |
| **B** | [§2](#2-저장-시점) | **저장** **시점** — API `PATCH`·게시·수동·일괄 |
| **C** | [§3](#3-백필시드-연계) | **백필/시드** **연계** — seed·마이·스냅 [§4.5]와 순서 |
| **D** | [§4](#4-구현-여부형태-결정) | **구현** **여부·형태** — 자동 동기 / 수동 절차 / 미구현 |

---

## 1. 동기 정책 {#1-동기-정책}

**(잠금: 축 A)** [EVIDENCE-20260425-339](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-339) — **본 절(§1.1~1.2·누적 표)로 잠근다** (`src` **변경 없음**).

**전제:** `QuestionSet.definitionJson` 과 `QuestionSet.questions` **(A안)** 을 **DB** **필드** **하나**만 **절대** **정본** **으로** **두지** **않는다.** **맥락에 따라** 정본이 갈리는 **이중 기준**이며, [330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330) · [334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) · [335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335) **와** **모순** **나지** **않게** **기록한다. ** (저장 **시점** / 백필 / **자동** 동기 = **§2~4** · **별** `EVIDENCE`.)

### 1.1 **기준(정본)과** **다른** **한** **측** **의** **성격(파생·보조)** {#11-기준-정본-파생}

| 맥락 | **정본(이 맥락에서의 기준)** | **다른 쪽(파생·보조 — 이 맥락에서의 성격)** |
|------|------------------------|----------------------------------|
| **인터뷰 런타임** — `getInterviewFlow` / `completeCaseInterviewService` 가 쓰는 **가시·필수** 질문 | **`QuestionSet.questions` (A안 플랫 JSON)** | **`definitionJson`** — Zod·섹션·관리 UI용 **구조** 표현. [330] · [QUESTION_SET_DEFINITION **§7**](./QUESTION_SET_DEFINITION.md). **이 맥락에서는** `definitionJson`을 **보조(관리/레이아웃) 데이터**로 둔다. |
| **관리·공식** `PATCH` **:** `/api/question-sets/:id` (에디터 `saveDefinition` 등 **이 경로의 쓰기**) | **`QuestionSet.definitionJson`** | A안 **`questions`** — 이 `PATCH`가 **같이 갱신하지 않음** ([334] **△**, [335] **안내**). **이 맥락에서는** A안을 **동기·백필·수동**으로 맞출 **파생(런타임/운영 측에서 우선 쓰는 A안·아직 쓰기에 묶이지 않은) 데이터**로 둔다. |

- **한 줄:** “인터뷰에 **무엇이 질문으로 나가나**” → A안 **`questions`가** 기준. “에디터 **저장**이 **무엇을** 바꾸나” → **`definitionJson`이** 기준.

### 1.2 **충돌·수렴 방향** (둘을 **같은** **사실** **로** **맞출** **때**) {#12-충돌-수렴}

| 상황(예) | 잠긴 규칙 |
|----------|-----------|
| `definitionJson` **은** **최신(공식** `PATCH` **)** **인데** A안 `questions` **가** **낡음** | **당면** **런타임**·**완료** **판정** [330] **은** A안 **을** **따** **른** **다** **( ** **가** **시** **/ ** **필** **수** **/ ** **완** **료** **)** **. ** **DB** **를** **한** **사실** **로** **맞출** **때** **의** **기** **본** **방** **향** **은** `definitionJson` **→** `questions` **투영(** [§2](#2-저장-시점) **시점** **·** **§3** **절차** **·** **동기** `EVIDENCE` **).** |
| A안 **만** **비공식** **경로로** **먼저** **바뀌어** `definitionJson` **과** **불일치** | **한** **축** **으로** **수렴** **(운영** **).** **권장:** 에디터에서 `definitionJson` **을** **맞춘** **뒤** **공식** `PATCH` **또는** **§3** **/ ** **동기** `EVIDENCE` **절차** **. ** **자동** “덮어쓰기” **동작** **은** **§4** **/ ** **별** `EVIDENCE` **에서** **다룬다** **. ** |
| B안/IO/§5.4 | [SPEC **§0**](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-320-이후-거버넌스-순서) **합의** **시** (이번 **§1** **범위** **밖**). |

| 항목 | 결정 | 근거 |
|------|------|------|
| **정본** | **이중** **: ** **런타임** = `questions` **;** **공식** **관리** **저장** = `definitionJson` | [330] [334] [335] **·** **§1.1** |
| **수렴(기본)** | **한** **사실** **로** **맞출** **때** **기본** `definitionJson` **→** `questions` **( ** **당면** **런타임** **표시** **는** A안) | **§1.2** |
| **B/IO/§5.4** | **이번** **해당** **없음** | **—** |

---

## 2. 저장 시점 {#2-저장-시점}

**(잠금: 축 B)** [EVIDENCE-20260425-340](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-340) — **본 절(§2.1~2.3·누적 표)로 잠근다** (`src` **변경 없음**).

**질(한 줄):** `definitionJson` **→** A안 `questions` **투영(동기)**을 **(가)** `PATCH` **저장 직후**에 할지, **(나)** **게시(API)** **성공** **직후(재게시** **포함** **)**에만 할지, **(다)** **자동** **없이** **수동** **백필** **전용**으로 둘지.

**현행 코드 사실(참고):** [334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) — `PATCH` **와** [게시 `PATCH` (`/publish`)](../../src/app/api/question-sets/%5BquestionSetId%5D/publish/route.ts) **모두** `questions` **를** **건너뜀**; **§2** **는** **이후** **구현** **시** **기본** **훅** **시점** **만** **잠금** (실행 = **§4** **+** **별** `EVIDENCE`).

### 2.1 **후보** **비교** (투영·자동 동기 **도입** **가정**) {#21-후보-비교}

| 후보 | 요지 | 장점 | 단점·리스크 |
|------|------|------|-------------|
| **(가) `PATCH` 직후** | 공식 `PATCH` ([§1.1](#11-기준-정본-파생)) **가** 끝날 때마다 `questions` **를** `definitionJson` **에** **맞춤** | 저장 한 번마다 **DB** **두** **필드** **가** **같이** **최신** **(수렴** **·** [§1.2](#12-충돌-수렴) **기본** **방향** **에** **가깝** **)**. | **제품** **안내( [335] · admin [§14-1**](./QUESTION_SET_DEFINITION.md#141-app-라우트--관리-ui-step-3-경계-고정) **·** [에디터](../../src/components/admin/question-set-editor.tsx) **):** “**저장**” **만** **으로** **는** A안 **이** **안** **바뀌** **는** **다**” **—** (가) **를** **자동** **으로** **쓰면** **UI**·**기대** **와** **어긋** **남** **(저장=인터뷰** **측** **에도** **즉시** **반영** **).** **초안** **단계** **잦은** **저장** **마다** **런타임** **용** A안**이** **갱신** **됨** **(미리보기/검수** **정책** **이** **없** **다면** **부담** **).** |
| **(나) 게시(재게시)** | [publish `PATCH`](../../src/app/api/question-sets/%5BquestionSetId%5D/publish/route.ts) **성공 직후**(최초 게시·이미 PUBLISHED 행의 재게시 = 동일)에만 `definitionJson` → A안 `questions` 투영 | [335]·[에디터](../../src/components/admin/question-set-editor.tsx) **안내(저장 ≠ A안)**와 정렬. 편집 `PATCH`는 `definitionJson`만 갱신**,** 게시는 “이 정의로 런타임(A안)에 반영”으로 분리. | **이미** 게시된 뒤 **저장만** 하고 **재게시**를 누르지 않으면 A안이 낡을 수 있음 → 운영 규칙으로 **“변경 후 재게시”** (UI에 게시 버튼 있음). |
| **(다) 수동** **백필** **전용** | **서버** **자동** **투영** **없** **이** **스크립트**·**RUNBOOK**·**일회** **만** | **기본** **시점** **을** **코드** **에** **박** **지** **않** **음** **;** **1차** **( ** **지금** **)** **과** **동** **일** **( ** `questions` **수동** **).** | **2차** **질( ** “** **언제** **맞** **출** **지** **” **)** **에** **답** **이** **안** **됨** **;** **정합** **이** **운영** **에** **전** **적** **( ** **실수** **·** **드** **리** **프트** **).** |

### 2.2 **잠긴** **결정(축** **B** **)**

- **채택:** **(나)** **게시** **API** **성공** **직후** **( ** **최초** **게시**·**이미** **PUBLISHED** **인** **행** **의** **재게시** **=** **동일** **취급** **)** **에** `definitionJson` **→** `QuestionSet.questions` **(A안) ** **투영** **을** **자동** **동기** **의** **기본** **시점** **으로** **둔** **다** **.**
- **비채택:** (가) **—** [§2.1](#21-후보-비교) **표** **( ** **UI**·**“** **저장** **≠** **A안** **”** **) **. **( **다** **)** **—** **기본** **시점** **으로** **는** **부** **적** **합** **( ** **보** **조**·**§3** **).**

**한 줄:** **“** **런타임** **(A안) ** **을** `definitionJson` **과** **같** **은** **시간** **에** **맞** **출** **자동** **기본**” **=** **게시** **( ** **재** **게시** **) ** **직후** **. ** `PATCH` **저장** **만** **으** **로** **는** **( ** [335] **·** **에디터** **정책** **에** **맞** **게** **)** **A안** **을** **갱신** **하** **지** **않** **는** **다** **( ** **구** **현** **전** **도** **동일** **).**

### 2.3 **수동**·**일회**·**배치(§3** **로** **이** **을** **)** {#23-수동-배치}

- **(다)** **수동** **백필**·**시드**·**이행** **은** **기본** **시점** **이** **아** **님** **. ** [§3](EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md#3-백필시드-연계) **·** **마이**·**초** **기** **데이터**·**장애** **복** **구** **에** **둔** **다** **( ** **§4** **에** **서** **자동** **과** **병** **행** **·** **대** **체** **가** **능** **).**

**결정** **누적** **표(잠** **금** **):**

| 시점(후보) | 채택 여부 | 비고 |
|------------|-----------|------|
| `PATCH` **저장** **직후** **(가)** | **—** (비채택) | [§2.1](#21-후보-비교) |
| **게시** `PATCH` **성공** **직후** **(나, ** **재** **게시** **포함** **)** | **채택** (기본 자동) | [§1.1](#11-기준-정본-파생) **투** **영** **, ** [publish route](../../src/app/api/question-sets/%5BquestionSetId%5D/publish/route.ts) **( ** **도** **입** **시** **)** |
| **수동**·**스크립트** **전용 (다)** | **—** (기본 아님) | [§2.3](#23-수동-배치) · [§3](#3-백필시드-연계) |

---

## 3. 백필/시드 연계 {#3-백필시드-연계}

**(잠금: 축 C)** [EVIDENCE-20260425-341](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-341) — **본 절(§3.1~3.3·누적 표)로 잠근다** (`src` **변경 없음**).

**전제(§2):** 일상의 `definitionJson` → A안 `questions` 투영은 [게시 `PATCH` 성공 직후](#2-저장-시점)(재게시 포함)가 기본이다. 본 절은 **이미 쌓인 기존 행**·**시드로의 최초 삽입**에 대한 **순서와 책임**만 잠근다.

**교차(참고):** A [§4.5 시드](EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#45-시드) · [스냅 / 336](EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot) · [export 스냅](../../scripts/export-active-question-set-snapshot.ts). 시드에 `QuestionSet` 없음 = 현 [334]·A §4.

### 3.1 구분·비교 (순서·책임) {#31-구분-비교}

| 대상 | 맞출 것 | §2와의 관계 |
|------|---------|------------|
| **기존 DB 행** (이미 `QuestionSet`이 있음) | [334] 갭·드리프트를 없애기 위해, 한 번(또는 필요 시) **`definitionJson` → A안 `questions` 투영** ([§1.2](#12-충돌-수렴) 기본 방향) | **백필** — 게시 API를 경유하지 않고 고정(스크립트·`UPDATE`·runbook). **§2 도입 전** 또는 **같은 배포의 선행 조건**으로 끝내는 것이 기본(§3.2). |
| **시드** (`prisma/seed.ts` 등에 `QuestionSet`을 **새로** 넣는 경우; **현행** [prisma/seed.ts](../../prisma/seed.ts) **는** `QuestionSet` **미**포함) | 빈/초기화된 DB에 대한 **최초 INSERT** | A [§4.5] — `questions` + `definitionJson` + 제약(코드·활성·카탈로그 등)을 **같은 변경·의도**로 둔다(한 PR / 같은 seed 실행 맥락). **구현·`EVIDENCE` = [EVIDENCE-20260425-345](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-345)**. **“백필이 끝난 뒤에만 시드를 넣을 수 있다”는 제약은 두지 않는다** — 빈 DB면 백필 대상 행이 없다. |

**구현·스냅(§2·§3 교차):** [§2](#2-저장-시점) **온라인** 동기 = [publish `PATCH`](../../src/app/api/question-sets/%5BquestionSetId%5D/publish/route.ts)([EVIDENCE-20260425-343](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-343)) — HTTP 스냅·예시 1건은 [route.test.ts](../../src/app/api/question-sets/%5BquestionSetId%5D/publish/route.test.ts). **백필** = [EVIDENCE-20260425-344](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-344) · [backfill 스크립트](../../src/scripts/backfill-question-set-questions.ts)(`publish` 비호출). **시드** 삽입·`prisma/seed` **경로**·`QuestionSet` **최초** **INSERT**·publish **분리** = [EVIDENCE-20260425-345](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-345) (A [§4.5]·본 표 **시드** 행 1:1; **기존** [343/344]·**온라인/백필**·**닫힘**·**이후** **시드** **독립** **축**).

- **idempotent(권고·잠금):** 기존 행 백필 스크립트는 **같은** `definitionJson`에 대해 **여러 번** 실행해도 동일 A안(또는 no-op)이 되게 할 것. 실행 형태·도구는 [§4](#4-구현-여부형태-결정) + 별 `EVIDENCE`.

### 3.2 잠긴 순서·책임(축 C) {#32-잠긴-순서책임}

1. **기존 행이 있는 환경**(로컬·스테이징·운영 등) — [§2](EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md#2-저장-시점) **(게시 직후 동기)** 를 켜기 **전**에, 또는 **같은 배포의 선행 조건**으로, 이미 저장된 `definitionJson`을 기준으로 A안 `questions`를 맞추는 **백필(또는 동등 절차)** 를 끝낸다. **방향:** `definitionJson` → `questions` **만** 기본 채택. **A안 → `definitionJson` 역투영**은 **비채택**(관리 정본은 [§1.1] `definitionJson` 경로) — [§1.2](EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md#12-충돌-수렴)와 어울리게 수렴은 정의 쪽에 맞춤. **책임:** 실행 주체(보통 운영·담당 개발) + **별** `EVIDENCE`·릴리스 노트·runbook(스크립트·idempotency 요구는 §4 + 코드 블록).
2. **시드에 `QuestionSet`을 앞으로 넣는 경우** — A [§4.5]에 따라 **삽입 시점**에 `questions` + `definitionJson` + 메타/제약을 **한꺼번에** 맞춘다. 빈 DB면 (1)에 해당하는 백필은 **스킵** 가능(대상 행 없음). **정리:** “백필 → 시드”가 **필수 순서**는 **아님** — (1)=기존 자산 정리, (2)=초기 덤프·신규 환경은 **직교**·**병행 가능**하다.
3. **스냅 / export** ([336]·스냅 [§2·§5](EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot)) — 백필·시드와 **별도** **축**으로, “활성 1행 검증” 경로 **유지**; 경로·절차를 바꾸면 **별** `EVIDENCE`.

**한 줄:** **기존** = `definitionJson` → A안 백필을 **§2 라이브와 같은 배포 이전(또는 그 릴리스의 선행 조건)** 으로 **끝낸다**; **시드** = `QuestionSet`을 **넣는 순간** A §4.5로 **둘 다** 맞춘다; **빈** DB는 백필·시드를 **섞는 선형 순서**로 묶을 필요가 없다.

### 3.3 결정 누적 표(잠금) {#33-누적-표}

| 항목 | 결정 | 비고 |
|------|------|------|
| 시드 vs 기존 백필 “순서” | (1) **필요한 환경**에서 **기존 행 백필** → (2) **시에 따라** `QuestionSet` **시드 삽입**(A [§4.5]) — **시드가 “백필 완료 뒤”에만 가능**하다는 제약은 두지 않음(빈 DB) | §3.1~3.2 |
| 백필 방향 | `definitionJson` → `questions`(A안) 기본; **역** 비채택 | §1.1·§1.2 |
| idempotent | **권고(잠금)**: 백필·재실행 시 안전 | §3.1 |
| 책임(기존 백필) | 운영/이행 + `EVIDENCE` / runbook | [§3.2](#32-잠긴-순서책임) 항목 1 |
| 책임(시드) | 시드·PR 작성자 + A §4.5 리뷰 | [§3.2](#32-잠긴-순서책임) 항목 2 |
| 책임(일상 동기) | §2 + §4·코드 `EVIDENCE` | [§2](#2-저장-시점) |

---

## 4. 구현 여부·형태 결정 {#4-구현-여부형태-결정}

**(잠금: 축 D)** [EVIDENCE-20260425-342](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-342) — **본 절(§4.1~4.3)로 잠근다.** 실제 `src/**` 수정·완료 판정은 **별** `[EVIDENCE-…]`(코드)에서 하며, **이 절만으로는** 완료로 보지 않는다. (GW-0.4(가) 등 검증은 그 블록을 따른다.)

### 4.1 후보(코드/운영 경로) {#41-후보-경로}

| 후보 | 요지 | §2~3과 |
|------|------|--------|
| **(α) 게시 `route` 안 동기** | [publish `PATCH`](../../src/app/api/question-sets/%5BquestionSetId%5D/publish/route.ts) 가 `catalogStatus` / `publishedAt` 갱신과 **같은 HTTP 요청**([§2](#2-저장-시점) 시점)에 이어 A안 `questions` 를 쓴다. | **채택(기본)** |
| **(β) 투영 전용 모듈 + (α)** | `definitionJson`(Zod `QuestionSetDefinition`) → A안 `QuestionSetQuestion`[] 를 만드는 **단일** 순수 함수(또는 `src/lib` / `src/features/question-set` 하위 작은 모듈). (α)의 라우트는 이 함수를 **호출만** — **백필/시드**도 동일 import ([§3](#3-백필시드-연계), A [§4.5](EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#45-시드)). | **권고·채택(α와 한쌍)** |
| **(γ) 질문셋 `PATCH`에 A안** | [질문셋 `PATCH`](../../src/app/api/question-sets/%5BquestionSetId%5D/route.ts) 바디에 `questions` 쓰기 추가. | **비채택** ([§2](#2-저장-시점) — 관리 저장 = `definitionJson`만) |
| **(δ) 클라만** | 게시 후 브라우저가 A안 JSON을 별도로 보냄. | **비채택** (권한·이중 쓰기·§2) |
| **(ε) runbook만** | 서버에 동기 없음. | **기본과 불일치** — [§3](#3-백필시드-연계) **보조**만 |

**투영·검증(구현 시):** `QuestionSetDefinitionSchema`·섹션 flatten — [Zod question-set](../../src/lib/definitions/question-set.ts) · [QUESTION_TYPE_MAPPING](QUESTION_TYPE_MAPPING.md)(B↔A) · 기존 [`normalizeQuestions`](../../src/features/question-set/question-set.service.ts)(A안 정렬/검증)와 맞출 것(별 EVIDENCE에서 상세).

### 4.2 잠긴 경로(온라인 / 백필 / 시드) {#42-잠긴-경로}

1. **온라인(게시·재게시)**  
   - **훅:** [`publish/route.ts`](../../src/app/api/question-sets/%5BquestionSetId%5D/publish/route.ts) 내부, `prisma.questionSet.update` 로 카탈로그·`publishedAt` 를 바꾼 **직후**(또는 **권고:** `prisma.$transaction`으로 **같은 요청**에서) `definitionJson` → A안 `questions` 를 `update` `data`에 넣는다.  
   - **책임 분리:** 투영(β)는 **domain 모듈**; 라우트는 **얇게** (인증·권한·응답·트랜잭션 경계).  
2. **백필** ([§3](#3-백필시드-연계))  
   - **경로:** `scripts/*`·`tsx` one-off·`prisma` CLI·DB 직접 — **HTTP `publish` 를 호출하지 않는다**(권한·감사·이중).  
   - **(β) 재사용** — **동일** `definitionJson` → A안 투영 함수 import.  
3. **시드**  
   - **경로:** `prisma/seed.ts` 등 — A [§4.5]대로 `QuestionSet` **create** 시 `definitionJson` + `questions` + 메타를 **같은 삽입**에 맞춤. **온라인 `publish` 와 엮지 않음** (필요 시 (β)로 검수만).  

#### 경로 경계(잠금)

| 구분 | 쓰는 경로 | 쓰지 않음 |
|------|----------|-----------|
| **온라인 동기** | (α)+ **(β)** | (γ) 질문셋 `PATCH`에 A안 덧붙이기 · (δ) 클라만 · (ε) 기본 runbook |
| **백필** | (β) + 스크립트/CLI | `publish` HTTP 호출(우회) |
| **시드** | (β) 선택(검수) + seed INSERT | `publish` 호출로 시드 대체 |

### 4.3 결정 누적 표(잠금) {#43-누적-표-implementation}

| 결정 | 잠긴 값 | 전용(코드) EVIDENCE |
|------|--------|---------------------|
| 자동 서버 동기(게시 직후) | **채택** — (α)+(β) | 별: publish route, 공유 투영, 트랜잭션·에러·테스트 |
| `PATCH` 저장(질문셋)에 A안 쓰기 | **비채택** | — |
| 클라이언트만 동기 | **비채택** | — |
| runbook만(코드 없음) | **기본 정책과 불일치** (§3 보조) | — |
| 백필·시드 | **(β) 재사용**·§3 **경로**; **API/publish와 분리** | 백필/시드 전용 EVIDENCE |

---

## 5. 다음(교차)

- [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) **최상단** [342](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-342) **·** [341](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-341) **·** [340](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-340) **·** [339](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-339) **·** [338](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-338) **·** [337](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337) **(1차 닫힘)**
- **B 2차 §1~4 잠금 완.** 이후 `definitionJson` ↔ A안 `questions` **실구현**은 **전용** `[EVIDENCE-…]`(수정 `src/**`·검증)에만 기록한다.
