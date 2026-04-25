# 질문 유형 매핑표 (Step 3 · 싱글 소스)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 목적 | 인터뷰 런타임·`QuestionSet.questions` · Zod `inputType` · [질문셋 정의서 §7](QUESTION_SET_DEFINITION.md#7-질문-유형-정의) 표기의 **3층 대응**을 **한곳**에 고정한다. |
| 전제 | [EVIDENCE-20260423-330](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330) — 인터뷰 **필수·완료** 판정은 `QuestionSet.questions`(A안) 기준. `definitionJson`은 동 차수에서 **런타임 필수**에 쓰지 않을 수 있으나, **관리/카탈로그**·Zod **입력 스키마**는 `inputType`으로 남는다. |
| 본 문서의 역할 | **의미(한 줄)**마다 **세 축의 허용 문자열**을 잠근다. 이후 `getInterviewFlow` / `completeCaseInterviewService` / 관리자 편집기 / (향후) `definitionJson` 동기는 **이 표를 바꾸는 변경과 동일**하게 취급한다(별도 EVIDENCE 권장). |

---

## 1. Canonical(기준) 축 — 세 가지 이름 체계

| 축 | 코드 위치 | 식별자 스타일 | 용도 |
|----|-----------|---------------|------|
| **A. 인터뷰·플랫 JSON** | `QuestionSetQuestionType` — [`question-set.types.ts`](../../src/features/question-set/question-set.types.ts) | `UPPER_SNAKE` (단, `TEXT`·`TEXTAREA`·`SELECT`는 단어 그대로) | `QuestionSet.questions[].type`, 인터뷰 UI, [case-interview-client](../../src/components/cases/case-interview-client.tsx) |
| **B. 질문셋 정의 Zod** | `QuestionInputType` / `QuestionInputTypeEnum` — [`common.ts`](../../src/lib/definitions/common.ts) | `UPPER_SNAKE` (스키마·DB 메타) | `definitionJson`·섹션 질문의 `inputType`, [question-set `QuestionSetQuestion`](../../src/lib/definitions/question-set.ts) |
| **C. 정의서(문서)** | [질문셋 정의서 §7](QUESTION_SET_DEFINITION.md#7-질문-유형-정의) | `lower_snake_case` | 스펙·기획·표·비개발자 합의 |

**이번 착수에서 잠그는 결정:**  
동일 **의미**에 대해 **A / B / C** 열이 **아래 표**로만 대응한다. 새 유형·이름 바꾸기는 **본 표 개정** 없이 **코드만** 바꾸지 않는다.

---

## 2. 기본 질문 유형 — 3층 매핑 (고정)

**기준 열(의미):** §7 `lower_snake_case` **slug**를 “의미 키”로 쓴다(문서·검색·교차 ID).

| 의미 키 (§7) | 인터뷰·`questions[].type` (A) | Zod `inputType` (B) | §7 문서 표기 (C) | 비고 |
|--------------|------------------------------|----------------------|------------------|------|
| `short_text` | `TEXT` | `SHORT_TEXT` | `short_text` | 짧은 한 줄 |
| `long_text` | `TEXTAREA` | `LONG_TEXT` | `long_text` | 장문 |
| `single_select` | `SELECT` | `SINGLE_SELECT` | `single_select` | `options` 필요 |
| `multi_select` | `MULTI_SELECT` | `MULTI_SELECT` | `multi_select` | 값: 문자열 배열 |
| `boolean` | `BOOLEAN` | `BOOLEAN` | `boolean` | `true` / `false` |
| `date` | `DATE` | `DATE` | `date` | HTML `type="date"` 저장 형식 |
| `number` | `NUMBER` | `NUMBER` | `number` | |
| `datetime` | — *(미구현)* | `DATETIME` | `datetime` | 런타입·`QuestionSetQuestionType` **에 없음** — 추후 A축 식별자·UI 확정 시 본 표에 **행 추가** |
| `file` | — *(미구현)* | `FILE` | `file` | 동일 |
| `person` | — *(미구현)* | — *(Zod enum 미포함)* | `person` | §7·기획용; A/B **미연결** — 도입 시 enum·표 **동시** 갱신 |
| `address` | — | — | `address` | 동일 |
| `timeline` | — | — | `timeline` | 동일 |
| `reference_list` | — | — | `reference_list` | 동일 |
| `statement_block` | — | — | `statement_block` | 동일 |

**구현된 A안 타입(현행 코드·DB에 쓰일 수 있는 값):**  
`TEXT` · `TEXTAREA` · `NUMBER` · `DATE` · `SELECT` · `MULTI_SELECT` · `BOOLEAN` (7개) — [인터뷰 클라이언트](../../src/components/cases/case-interview-client.tsx) 분기와 일치. (카탈로그 `definitionJson` **섹션 질문**의 Zod `inputType` 셀렉트: [question-item-editor](../../src/components/admin/question-item-editor.tsx).) [EVIDENCE-332](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332): 고아 `question-set-admin-client` **삭제**. 공식 **질문셋** **admin** **App** **경계**·플랫 `questions` **대** **정의** `definitionJson` **구분**은 [질문셋 정의서 **§14-1**](./QUESTION_SET_DEFINITION.md#141-app-라우트--관리-ui-step-3-경계-고정) **참고**。

---

## 3. 변환·운영 규칙 (요약)

1. **같은 의미** = 표의 **같은 행**. A·B·C 중 하나만 바꾸는 “번역”은 **이 표를 통해서만** 정한다.  
2. **인터뷰 A안** 식별자는 **항상 (A) 열** — [EVIDENCE-330](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330) **런타임** 기준.  
3. **정의·카탈로그** JSON에서 질문 입력 종류는 **(B) 열** (`QuestionInputTypeEnum`).  
4. **정의서·요구사항**에서 타입을 말할 때 **(C) slug** 권장; 코드 리뷰 시 (A) 또는 (B)로 내려 **본 표**와 대조한다.  
5. **§7에만 있고 (A)(B)가 비어 있는 유형**은 “예약/미구현” — **단일 소스**를 깨는 임의 문자열을 DB·코드에 넣지 않는다.  
6. **Zod에만 있고 (A)가 없는** (`DATETIME`, `FILE`) — **인터뷰 경로**에 쓰려면: `QuestionSetQuestionType` 확장 + UI + 본 표 **행 잠금** + EVIDENCE.

---

## 4. 상호참조

- [질문셋 정의서 §7](QUESTION_SET_DEFINITION.md#7-질문-유형-정의) — 유형 **목록**; **기계적 대응**은 **본 문서 §2 표**를 따른다.  
- [SPEC Step 3 싱글 소스](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#step-3-싱글-소스-질문셋)  
- [IMPLEMENTATION_EVIDENCE — 331](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-331) (이 매핑표 **고정** 기록)

---

## 5. (축 D) Zod `visibility` / A안 `audience` / 런타임

| 의미(정책) | `QuestionDefinitionSchema.visibility` (Zod) | `QuestionSet.questions[].audience` (A) | `getInterviewFlow` / `complete` |
|------------|---------------------------------------------|----------------------------------------|----------------------------------|
| 전체(기본) | `ALL` | `ALL` (또는 투영 생략 시 동일 취급) | `CaseAccessContext`만으로 추가 필터 없음 |
| 내부(관리) | `ADMIN_ONLY` | `ADMIN_ONLY` | 플랫폼 관리자만 **해당 질문** 가시 |
| 담당 변호사 | `LAWYER_ONLY` | `LAWYER_ONLY` | 사건 배정 변호사·관리자 |
| 담당 스태프 | `STAFF_ONLY` | `STAFF_ONLY` | 사건 배정 STAFF·관리자 |
| 의뢰인(본인) | `CLIENT_ONLY` | `CLIENT_ONLY` | 사건 소유자(의뢰인)·관리자 |

- **질문셋** 메타: `visibleToRoles` — Prisma `USER` ↔ Zod/정의 `CLIENT` 매핑, [`interview-catalog-visibility.ts`](../../src/features/case-interview/interview-catalog-visibility.ts) 참고.  
- [346 / PR-346-A](IMPLEMENTATION_EVIDENCE.md#evidence-20260425-346) **증빙** (조건·분기 `visibilityRule`은 **별** 축, 기존과 동일).

---

## 6. 개정

| 날짜 | 내용 |
|------|------|
| 2026-04-25 | **§5 (축 D)** `visibility` / `audience` / `visibleToRoles` / 인터뷰 경로(346-A). |
| 2026-04-23 | 최초: 7개 A안·Zod·§7 3층 대응, `datetime`/`file`/§7 전용 유형 **미구현** 명시. |
