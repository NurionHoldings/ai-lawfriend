# 활성 `QuestionSet` 1행 — 실DB export · 333~ 대응표 (셀프컨테인) {#evidence-step3-active-db-snapshot}

## 문서 정보

| 항목 | 내용 |
|------|------|
| 상위 증빙 | [EVIDENCE-20260425-336](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-336) |
| 축 | [333~](./EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md) — A안 `questions` · `definitionJson` · [335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335) **정책** **안내** |

---

## 1. 어떤 행을 “활성 1행”으로 쓰는가 (코드 고정)

런타임·서비스가 쓰는 선택과 **동일**하게 둔다.

- **조건:** `isActive === true`
- **정렬:** `updatedAt` **내림차순** **첫** **행**
- **근거:** [`getActiveQuestionSetRepository`](../../src/features/question-set/question-set.repository.ts) (`findFirst` + `where` + `orderBy`)

인터뷰는 이 행의 **`questions`** JSON만 읽는다([330](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-330)).

---

## 2. Export 재현 (저장소 스크립트)

**명령(프로젝트 루트, `DATABASE_URL` 설정됨):**

```bash
npx tsx scripts/export-active-question-set-snapshot.ts
```

**산출:** 해당 1행 전체를 **JSON**으로 **stdout**에 출력 (필드: `id`, `name`, `code`, `questions`, `definitionJson`, `catalogStatus`, … Prisma 스키마와 동일).

**본 워크스페이스 실행(2026-04-25):** `DATABASE_URL` **미설정** → Prisma 초기화 실패 → **행 JSON은 이 문서에 붙이지 못함.** 운영·스테이징·로컬 DB가 있는 환경에서 **같은 명령**으로 **갱신**·**아래 §4 붙여넣기**를 권장한다.

---

## 3. 축별로 DB·정책이 어떻게 맞물리는가 (항상 성립하는 대응)

| 축 | DB/코드 | 의미 | [334](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-334) · [335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335) |
|----|---------|------|------------------------------------------------------------------------------------------------------------------|
| **A안** | `QuestionSet.questions` (JSON 배열) | 인터뷰 **유일** 런타임 소스(330) | 334 §4.0~4.1 — `PATCH`가 이 컬럼을 **안** 바꿈 |
| **정의(Zod)** | `QuestionSet.definitionJson` | 섹션·`inputType`·관리 구조 | 334 — 에디터 **저장** = 주로 여기 반영 |
| **정책 UI** | (코드) `QuestionSetEditor` 상단 배너 | **DB 값과 무관**하게 “저장 범위” 고지 | 335 — 혼동 방지; **행**과 **불일치**해도 **안내**는 참 |

**한 줄:** **같은 행**을 보더라도 **`questions` vs `definitionJson`의 질문 목록·개수는 다를 수 있다**(334). **335** 문구는 그 **가능성**을 **사전에** 말해 준다.

---

## 4. 행이 있을 때 채우는 지표 표 (동기 점검용)

아래는 **한 행** JSON을 손에 넣었을 때 메우는 **체크**다. (본 repo 스냅에서는 **비움**.)

| 지표 | `questions`(A안) | `definitionJson` | 판단 |
|------|------------------|-------------------|------|
| 질문 **개수** | `Array.length` | `sections.flatMap(s => s.questions).length` | 다르면 **△** (334 갭과 일치 가능) |
| 질문 **key** 집합 | `new Set(questions.map(q => q.key))` | 위와 동일 | 교집합·차집합으로 **누락/초과** 표시 |
| **라벨** 필드 | `label` | `title` | 의미 동일·이름만 다름([QUESTION_TYPE_MAPPING](./QUESTION_TYPE_MAPPING.md)) |
| **타입** | `type` (`QuestionSetQuestionType`) | `inputType` | [QUESTION_TYPE_MAPPING](./QUESTION_TYPE_MAPPING.md) **§2** **행**으로 대응 |

---

## 5. 첨부 슬롯 — 활성 1행 JSON (환경 있을 때 갱신)

```json
null
```

*(위가 `null`이면: **이 스냅**에서는 export **미첨부**. `DATABASE_URL` 있는 환경에서 §2 스크립트 출력으로 **교체**.)*
