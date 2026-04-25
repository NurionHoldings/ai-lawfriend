# Step 3 — A안 `questions` · `definitionJson` · 시드 **정의·데이터 정합** (333~)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 성격 | **333~ 실착**을 위한 **전용 본문** (PATCH/저장 축과 **질접 겹치지 않게** 쓴다) |
| 상위 인덱스 | [333](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-333) · [334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) · [335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335) · [336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336) · [활성 행 스냅](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot) |
| Step 3 맥락 | [SPEC #step-3-싱글-소스-질문셋](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#step-3-싱글-소스-질문셋) |

---

## 1. 이 축을 왜 `PATCH`와 분리하는가 (한 줄)

**관리·저장** 경로(예: `QuestionSetEditor`, `PATCH /api/question-sets/:id`가 **주로** `definitionJson`에 쓰는 것)는 **“형태를 DB에 싣는”** 쪽에 가깝고, **333~**이 다루는 것은 **A안(플랫 `QuestionSet.questions`)** ↔ **`definitionJson`**(섹션·Zod) ↔ **시드/초기 데이터**의 **의미·식별자·질문 목록**이 **같은 사실**을 말하는지 **정합**이다. **같은 PR·같은 논의**에 묶이면 `definitionJson`만 고치는 패치로 “끝난 것처럼” 보이기 쉬워, **별도 EVIDENCE·별도 본문**으로 둔다.

---

## 2. 선행으로 고정된 전제 (다시 읽는 용도)

| 전제 | 증빙 / 도구 |
|------|-------------|
| 인터뷰 **런타임** 소스 = A안 `QuestionSet.questions` 플랫 JSON, `getInterviewFlow`·`complete` **동일** | [EVIDENCE-20260423-330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330) |
| 유형 3층: `QuestionSetQuestionType` · Zod `QuestionInputType` · 정의서 §7 | [EVIDENCE-20260423-331](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-331) · [QUESTION_TYPE_MAPPING.md](./QUESTION_TYPE_MAPPING.md) |
| 질문셋 admin **공식** App 경계 | [EVIDENCE-20260423-332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332) · [QUESTION_SET_DEFINITION §14-1](./QUESTION_SET_DEFINITION.md#141-app-라우트--관리-ui-step-3-경계-고정) |

**정리:** 330~332 이후 `definitionJson.sections`는 **“런타임 필수”의 유일 기준**이 아니다(330). 그래도 **관리·Zod·카탈로그**로 남는 `definitionJson`이 **A안 `questions`와 엇갈리면** 운영·검수에서 혼란이 남는다. 그 **나머지 정합**이 본 문서의 대상이다.

---

## 3. 정합 검토 시 한 번에 잡는 세 면

1. **A안 —** `QuestionSet.questions` (JSON 배열, `question-set.types`와 연결)  
2. **B/Zod 쪽 —** `definitionJson`이 `QuestionSetDefinition` / 섹션·질문 `inputType`에 담는 내용 (에디터·PATCH가 여기 **위주**인 점이 **PATCH 축**과 겹쳐 보이는 이유)  
3. **시드 —** `prisma/seed.ts` 등 **초기/개발** 데이터에 `QuestionSet`이 들어오는 경우, 위 둘과 **동시에** 맞는지 (현재 저장소 **스냅**에서는 시드에 `QuestionSet` **부재** — 시드를 추가·확장할 때 본 절 **체크리스트**를 **선행**하는 것이 안전)

---

## 4. 실작업 체크리스트 — **1차 대조 결과** ([EVIDENCE-20260425-334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334)) {#section-4-alignment-check-1}

**대조 범위(고정):** 저장소 **코드·스키마·시드** 정적 분석. **로컬 DB**에 없는 `QuestionSet` 행(실데이터)은 `.env`·DB **미구성**으로 본 착수에서 **쿼리하지 않음** — 운영/스테이징 **행 단위** 대조는 **보류(후속)**.

### 4.0 한눈표 — 일치(✓) · 갭(△) · 보류(◯)

| 항목 | A안 `QuestionSet.questions` | `definitionJson` (Zod·에디터) | 시드 `prisma/seed.ts` | 판정 | 비고 |
|------|----------------------------|------------------------------|------------------------|------|------|
| **식별·키** | 질문은 `key`(고유) + `label` + `type` | 섹션 내 질문 `key` + `title` + `inputType` | `QuestionSet` **없음** | △ (경로) | **같은 `key`**로 맞출 수 있으나, **공식 저장 경로**가 둘을 **동시에** 쓰지 않음(아래 4.1) |
| **행 개수·순서** | 플랫 `order` | `sections[].questions[]` + `order` | — | △ | **자동 합치·정렬 없음**; 수동/별 API로만 맞출 수 있음 |
| **필드 이름** | `label` | `title` (Zod `QuestionDefinition`) | — | △ | 의미 동일, **필드명 불일치** (매핑 시 주의) |
| **타입 3층** | [QUESTION_TYPE_MAPPING.md](./QUESTION_TYPE_MAPPING.md) A | 동일 문서 B (`SHORT_TEXT` 등) | — | ✓(규칙) | “한 표”로 이미 [331]·매핑표에 **잠금**; **동기화**는 **코드/데이터**가 따르나 **자동 검증** 없음 → △(실제 행) |
| **에디터 저장 → A안** | `PATCH`가 **갱신 안 함** | `QuestionSetEditor` → `definitionJson`만 저장 | — | **△ 갭** | [§4.1](#41-핵심-갭-공식-admin-질문셋-편집-경로) |
| **A안 갱신 API** | `/api/admin/question-sets/:id` `PATCH`의 `body.questions` | (별도) | — | ◯ | **다른** 라우트; UI가 공식 `QuestionSetEditor`와 **불연결**이면 “운영이 고치는” 것은 `definitionJson` **편**만 쉬움 |
| **시드** | — | — | `QuestionSet` **미삽입** | ✓(부재) | [§4.5](#45-시드) |

### 4.1 핵심 갭: 공식 admin 질문셋 **편집** 경로

- [App §14-1] **공식** 편집기: [`QuestionSetEditor`](../../src/components/admin/question-set-editor.tsx) **저장** = `fetch('/api/question-sets/${id}', PATCH)` with **`definitionJson: definition` 전체만** ([`saveDefinition`](../../src/components/admin/question-set-editor.tsx) L160~L175).
- 그 **PATCH** 구현: [`src/app/api/question-sets/[questionSetId]/route.ts`](../../src/app/api/question-sets/[questionSetId]/route.ts) — `name`·`supportedDocumentTypes`·`visibleToRoles`·**`definitionJson`** 만 갱신; **`questions` 컬럼은 건드리지 않는다.**
- **결론(갭):** 관리 UI에서 섹션·질문을 편집·저장해도 **A안** `QuestionSet.questions`는 **자동으로 따라가지 않는다** (빈 배열·구버전 **그대로** 둘 위험). 런타임은 330에 따라 **A안만** 쓰므로, **정의만 최신**이고 **인터뷰 질문은 옛** 상태가 될 수 있음(△).
- **admin 안내·정책(잠금,** [EVIDENCE-20260425-335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335)**):** `QuestionSetEditor` **상단** **안내** + [QUESTION_SET_DEFINITION §14-1](./QUESTION_SET_DEFINITION.md#141-app-라우트--관리-ui-step-3-경계-고정) **「정책(현행·UI 동기)」**. **자동** **동기**·**백필** **구현** **시점**은 **별도** `EVIDENCE` **로** **만** **다룸**.

### 4.2 식별자 (체크: 부분 달성 + 갭 기록)

- [x] **질문 키 `key`:** A안 `QuestionSetQuestion.key` ↔ Zod `QuestionDefinition.key` **의도적으로 동일 형식**을 쓰면 [330]~인터뷰·문서·매핑이 맞다. **코드**상 이중 스키마는 **공유 키** 가정이 자연스러움.
- [x] **행 `code` / 제목:** `QuestionSet.code` + `name` / `definitionJson.title`·`code` / 생성 [`POST` 질문셋](../../src/app/api/question-sets/route.ts)에서 함께 씀.
- [x] **한 표 “DB 행 1건”** 기준: [EVIDENCE-20260425-336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336) · [EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot) — **절차·대응표** **고정**; **행** **JSON** **=** `DATABASE_URL` **있는** **환경**에서 [§2](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#2-export-재현-저장소-스크립트) **로** **갱신**.

### 4.3 개수·순서

- [x] **정책(문서화):** `definitionJson.sections`의 **섹션 순서** + 각 `questions[]`의 `order`를 **끊어** 플랫으로 펼치면, A안 `questions[]`의 **전역 `order`**와 **동일한 논리 순서**로 맞출 수 있다(수동/스크립트/별 변환). **엔진이 자동 동기**하지는 않음 → **“정합 = 별 절차”** (△·인지됨).
- [x] **DB에서 검증(지표):** [§4](EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#4-행이-있을-때-채우는-지표-표-동기-점검용) **표**; **육안**·**스크립트** **로** **행** **필수** ( [336] ).

### 4.4 타입 (QUESTION_TYPE_MAPPING + 샘플)

- [x] [QUESTION_TYPE_MAPPING.md](./QUESTION_TYPE_MAPPING.md) **§2** (예: `SHORT_TEXT`↔`TEXT`, `LONG_TEXT`↔`TEXTAREA`)는 **A/B 동시** 정의.  
- [x] 샘플 Zod-only 정의: [`STATEMENT_DEFAULT_QUESTION_SET_V1`](../../src/lib/definitions/question-set.sample.ts) — 동일 key를 A안 `type`으로 **옮기는** 수작업 경로는 명시(매핑표 준수). **샘플 → DB `questions` 자동 반영 없음** (△).
- [ ] A안 배열·DB 행 1:1 `safeParse` 자동 — ◯ **보류**(후속 자동화).

### 4.5 시드

- [x] [`prisma/seed.ts`](../../prisma/seed.ts) **에 `QuestionSet` create/upsert 없음** — **갭 아님**, **초기 실데이터 없음(✓ 기록)**.  
- [x] (향후) 시드에 넣을 때: **같은 트랜잭션/같은 PR**에 `questions` + `definitionJson` + `code`·`isActive`를 맞추고, [QUESTION_TYPE_MAPPING]·`QuestionSetDefinitionSchema.safeParse`·`assertQuestionSetIntegrity` **호출** 권고 — **아직 이행 사항 아님**(◯).

### 4.6 백필·비활성·게시 (SPEC [step-3](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#step-3-싱글-소스-질문셋) 동기 규칙)

- [x] **현상:** 공식 **저장**은 `definitionJson`만 갱신 → A안 “백필” **자동** 없음 (**△ = 구현 갭**).  
- [x] **완화 수단(코드에 존재):** A안을 바꾸는 경로 = [`/api/admin/question-sets/:id`](../../src/app/api/admin/question-sets/[id]/route.ts) `PATCH` + `updateQuestionSet` (서비스가 `assertQuestionSetIntegrity` 호출). **공식** `QuestionSetEditor`는 이 API를 **쓰지 않음** → **운영 절차**로 “A안을 맞출지 / 에디터를 나중에 A안-우선으로 바꿀지” **보류(◯)** (제품 합의).

---

## 5. `PATCH` 축을 다루는 문서/코드 (참고 전용, 본 문서는 정합·시드)

- 질문셋 **저장·게시** API·클라이언트는 `definitionJson` **편**이 강하다. **API 계약**을 바꾸는 실작업은 **별 EVIDENCE**로 두고, 본 333~ 문서는 **“저장 **후** A안·시드·정의가 일치하는가”**에 집중한다.

---

## 6. 완료 판정 (1차 — [334]·[335]·[336]·[337])

- **1차(정적 정합 + 정책 + 실DB 절차/대응표):** [EVIDENCE-20260425-334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) (§4 **1차** 대조)·[EVIDENCE-20260425-335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335) (admin **정책** §14-1 **쌍**)·[EVIDENCE-20260425-336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336) (활성 **1행**·[스냅/대응표](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot)) **위** [EVIDENCE-20260425-337](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337) **로** **묶어** **닫는다.**
- **문서** **공통** **규칙:** [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) (검증·근거). §4 **1차(코드·시드** **의미** **갭** **기록** **만)** = [334] **에서** **판정** **가능** **했고**, **1차** **범위** **잠금** **선언** = [337] **(동일** **333~** **축** **).**

## 7. 2차(별도) — `definitionJson`↔`questions` **동기**·시드·백필 {#7-2차-동기-시드}

**전용** **본문** **(2차** **착수):** [EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md](./EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md) **·** [EVIDENCE-20260425-338](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-338) — §1~4 **로** **동기** **정책** **·** **저장** **시점** **·** **백필/시드** **·** **구현** **결정** **을** **분리** **잠금**.

**[337](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-337)** **1차** **닫힘** **뒤** **—** [SPEC #step-3-싱글-소스-질문셋](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#step-3-싱글-소스-질문셋) **「동기** **규칙」** **합의** **후** **권장**.

- **동기** **구현/수동** **절차** ( **자동/수동** **·** **에디터** **·** **마이그레이션** **등** ) — **B** **§4** **에** **적는다**.
- **시드** [§4.5](EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#45-시드) **·** **실DB** **◯** **가** **남은** **경우** **갱신** ( **환경** **있는** **때** [스냅 **§2·§5**](./EVIDENCE_STEP3_ACTIVE_QUESTIONSET_DB_SNAPSHOT.md#evidence-step3-active-db-snapshot) ) **—** **B** [§3](./EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md#3-백필시드-연계) **.**
- **(선택)** B안/IO/§5.4·[GW-0.4 (가)](./IMPLEMENTATION_EVIDENCE.md#4-상태-관련-추가-강제-규칙) **—** [SPEC §0 이후](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#spec-320-이후-거버넌스-순서) **분기**
