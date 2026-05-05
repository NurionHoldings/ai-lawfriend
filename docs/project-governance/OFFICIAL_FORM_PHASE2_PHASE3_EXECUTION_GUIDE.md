# AI법친 Phase 2 확정 검증 지시서 + Phase 3 실제 코드 반영 지시서

## 0. 문서 목적

본 문서는 AI법친 공식서식 기반 문서생성 보강 작업의 다음 진행 기준을 정리한다.

현재 상태는 다음과 같이 잠겨 있다.

```text
Phase 1 공식서식 원천자료 계층: 코드 기준 반영 완료
Phase 2 runtime linkage: 코드·타입·정적검증 기준 반영 완료
Phase 2 운영 완료: 실 DB migration + seed + E2E 검증 전까지 보류
```

따라서 다음 작업은 두 갈래다.

1. Phase 2 확정 검증: 실 DB 기준으로 migration/seed/E2E를 완료하고 운영 기준으로 닫는다.
2. Phase 3 실제 코드 반영: 공식서식 구조 기반 필수항목 검증과 AI 프롬프트 제한을 코드에 연결한다.

작업 순서는 원칙적으로 Phase 2 확정 검증을 먼저 수행한다. 단, 실 DB 접근이 지연될 경우 Phase 3 코드는 작성하되 운영 완료 판정은 Phase 2 확정 이후로 보류한다.

---

# PART A. Phase 2 확정 검증 지시서

## A-1. Phase 2 현재 공식 상태

공식 상태 문구:

```text
Phase 2 runtime linkage는 코드·타입·정적검증 기준으로 반영 완료.
다만 실 DB migration과 실제 generate → approve → verify E2E 검증은 아직 미실행이므로, 운영 완료 판정은 보류한다.
다음 우선 작업은 실 DB 기준 migrate/seed 실행 후 E2E 검증을 완료하고, 그 결과를 IMPLEMENTATION_EVIDENCE.md에 추가하는 것이다.
```

이 문구는 `IMPLEMENTATION_EVIDENCE.md`와 repo 메모에 잠금 처리된 기준으로 유지한다.

---

## A-2. Phase 2 확정 검증 목표

Phase 2 확정 검증의 목표는 다음을 실제 DB와 실제 런타임 흐름으로 확인하는 것이다.

1. `DocumentGenerationTrace` migration 적용
2. `internal-standard-source` seed 적용
3. INTERNAL_STANDARD 템플릿 문서 생성 성공
4. ACTIVE 공식서식 source 템플릿 문서 생성 성공
5. INACTIVE 공식서식 source 문서 생성 차단
6. ARCHIVED 공식서식 source 문서 생성 차단
7. trace 없는 문서 승인 차단
8. 정상 trace 문서 승인 시 `approvedSnapshotAt` 기록
9. 검증코드 조회 시 public-safe `sourceTrace` 반환
10. 결과를 `IMPLEMENTATION_EVIDENCE.md`에 실제 값으로 기록

---

## A-3. 사전 준비

### A-3-1. 실 DB 연결 확인

`.env.local` 또는 실행 환경의 `DATABASE_URL`이 실제 개발 DB를 가리키는지 확인한다.

확인 항목:

```text
DATABASE_URL이 더미 값이 아님
DB 접속 권한 있음
migration 적용 가능한 개발 DB임
운영 DB 직접 연결 아님
```

주의:

- 운영 DB에는 직접 `migrate dev`를 실행하지 않는다.
- 운영 반영은 별도 배포 절차에서 `migrate deploy` 기준으로 진행한다.

---

## A-4. Phase 2 확정 검증 명령

아래 순서대로 실행한다.

```bash
npx prisma migrate dev --name add-document-generation-trace
npx prisma db seed
npx prisma validate
npx prisma generate
npx tsc --noEmit --pretty false
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

### A-4-1. 성공 기준

| 명령 | 성공 기준 |
| --- | --- |
| `migrate dev` | `DocumentGenerationTrace` migration 적용 |
| `db seed` | `internal-standard-source` 존재 확인 |
| `prisma validate` | schema 유효성 통과 |
| `prisma generate` | Prisma Client 생성 통과 |
| `tsc` | TypeScript 오류 없음 |
| `lint` | 신규 lint 오류 없음 |
| `verify:canonical-sources` | canonical source 검증 통과 |
| `py_compile` | navigator 문법 오류 없음 |

---

## A-5. DB 직접 확인 SQL

실 DB에서 아래를 확인한다.

```sql
SELECT id, provider, "sourceName", "sourceUrl", "documentType", status
FROM "LegalFormSource"
WHERE id = 'internal-standard-source';
```

예상:

```text
id = internal-standard-source
provider = INTERNAL_STANDARD
status = ACTIVE
```

`DocumentGenerationTrace` 테이블 존재 확인:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'DocumentGenerationTrace';
```

---

## A-6. E2E 검증 시나리오

### A-6-1. INTERNAL_STANDARD 템플릿 문서 생성

절차:

1. `sourceProvider = INTERNAL_STANDARD`인 게시 템플릿을 준비한다.
2. 해당 템플릿으로 문서 생성을 실행한다.
3. `LegalDocument`가 생성되는지 확인한다.
4. `DocumentGenerationTrace`가 함께 생성되는지 확인한다.

확인 SQL:

```sql
SELECT "legalDocumentId", "templateCode", "templateVersion", "sourceProvider", "sourceId", "generatedSnapshotAt"
FROM "DocumentGenerationTrace"
ORDER BY "createdAt" DESC
LIMIT 5;
```

기대 결과:

```text
sourceProvider = INTERNAL_STANDARD
trace 생성됨
generatedSnapshotAt 존재
```

---

### A-6-2. ACTIVE 공식서식 source 템플릿 문서 생성

절차:

1. `LegalFormSource.status = ACTIVE`인 공식기관 source를 생성한다.
2. `DocumentTemplate.sourceId`에 해당 source를 연결한다.
3. 템플릿을 게시한다.
4. 문서를 생성한다.
5. trace에 source 정보가 저장되는지 확인한다.

기대 결과:

```text
sourceProvider = SCOURT 또는 POLICE 등 공식기관 provider
sourceName 저장
sourceUrl 저장
sourceHash 저장 가능
문서 생성 성공
trace 생성 성공
```

---

### A-6-3. INACTIVE source 생성 차단

절차:

1. 연결된 `LegalFormSource.status`를 `INACTIVE`로 변경한다.
2. 해당 source가 연결된 템플릿으로 문서 생성을 요청한다.

기대 결과:

```text
HTTP 409
문서 생성을 막았습니다: 연결된 공식서식 출처가 비활성(INACTIVE) 상태입니다.
```

---

### A-6-4. ARCHIVED source 생성 차단

절차:

1. 연결된 `LegalFormSource.status`를 `ARCHIVED`로 변경한다.
2. 해당 source가 연결된 템플릿으로 문서 생성을 요청한다.

기대 결과:

```text
HTTP 409
문서 생성을 막았습니다: 연결된 공식서식 출처가 보관(ARCHIVED) 상태입니다.
```

---

### A-6-5. trace 없는 문서 승인 차단

절차:

1. 기존 문서 또는 테스트용 문서 중 `DocumentGenerationTrace`가 없는 문서를 준비한다.
2. 승인 API를 호출한다.

기대 결과:

```text
HTTP 422
문서 승인 전 출처 추적 정보가 없습니다. 문서를 다시 생성하거나 관리자에게 문의하세요.
```

주의:

- 기존 레거시 문서가 이미 존재하는 경우, trace 없는 문서 승인 차단으로 인해 운영상 이슈가 생길 수 있다.
- 레거시 문서가 있으면 별도 backfill 정책이 필요하다.

---

### A-6-6. 정상 trace 문서 승인 및 approvedSnapshotAt 확인

절차:

1. 정상 문서 생성
2. trace 생성 확인
3. 승인 API 호출
4. `approvedSnapshotAt` 기록 확인

확인 SQL:

```sql
SELECT "legalDocumentId", "approvedSnapshotAt"
FROM "DocumentGenerationTrace"
WHERE "legalDocumentId" = '<문서ID>';
```

기대 결과:

```text
approvedSnapshotAt IS NOT NULL
```

---

### A-6-7. 검증코드 public-safe sourceTrace 확인

절차:

1. 승인된 문서의 검증코드를 확보한다.
2. 검증 API 또는 공개 검증 화면에서 조회한다.
3. 응답에 public-safe `sourceTrace`가 포함되는지 확인한다.

현재 코드 기준 확인 필드:

```text
templateCode
templateVersion
templateTitle
sourceProvider
sourceName
sourceUrl
sourceHash
sourceStatus
generatedSnapshotAt
approvedSnapshotAt
```

비노출 유지 대상:

```text
sourceNote
parsedText
사용자 답변 원문
사건 민감정보
내부 메모
```

주의:

- 현재 validator/service 구현은 `sourceHash`와 `sourceUrl`을 public-safe `sourceTrace`에 포함한다.
- 운영 정책상 추가 마스킹이 필요하면 별도 hardening 작업으로 분리한다.

---

## A-7. 레거시 문서 처리 기준

Phase 2 적용 전 생성된 문서는 trace가 없을 수 있다.

정책 선택이 필요하다.

| 선택지 | 설명 | 권장 여부 |
| --- | --- | --- |
| A안 | trace 없는 레거시 문서는 승인 불가 유지 | 원칙적으로 가장 안전 |
| B안 | 관리자 전용 backfill로 INTERNAL_STANDARD trace 생성 | 기존 테스트 데이터 보호에 유리 |
| C안 | 일정 기간 예외 허용 | 비권장 |

권장:

```text
개발/테스트 DB에서는 B안 backfill 가능.
운영 정책에서는 trace 없는 문서 승인 불가를 기본으로 유지.
```

Backfill이 필요할 경우 Phase 2-1 별도 작업으로 분리한다.

---

## A-8. IMPLEMENTATION_EVIDENCE 기록 양식

```md
## [EVIDENCE-YYYYMMDD-PHASE2-RUNTIME-LINKAGE-E2E]

### 목적
- Phase 2 runtime linkage의 실 DB migration/seed 및 E2E generate → approve → verify 흐름 확정.

### 선행 상태
- Phase 2 runtime linkage는 코드·타입·정적검증 기준으로 반영 완료.
- 운영 완료 판정은 실 DB/E2E 전까지 보류 상태였음.

### 실행 명령
- npx prisma migrate dev --name add-document-generation-trace
- npx prisma db seed
- npx prisma validate
- npx prisma generate
- npx tsc --noEmit --pretty false
- npm run lint
- npm run verify:canonical-sources
- py -3 -m py_compile tools/aibeopchin_navigator.py

### 실행 결과
- migrate dev: PASS/FAIL
- db seed: PASS/FAIL
- prisma validate: PASS/FAIL
- prisma generate: PASS/FAIL
- tsc: PASS/FAIL
- lint: PASS/FAIL
- verify:canonical-sources: PASS/FAIL
- py_compile: PASS/FAIL

### E2E 체크리스트
- [ ] INTERNAL_STANDARD 템플릿 문서 생성 성공
- [ ] ACTIVE 공식서식 source 템플릿 문서 생성 성공
- [ ] INACTIVE source 문서 생성 차단 확인
- [ ] ARCHIVED source 문서 생성 차단 확인
- [ ] trace 없는 문서 승인 차단 확인
- [ ] 정상 trace 문서 승인 시 approvedSnapshotAt 기록 확인
- [ ] 검증코드 조회 시 public-safe sourceTrace 반환 확인

### 판정
- Phase 2 runtime linkage 운영 기준 완료/보류.

### 이월
- 레거시 문서 trace backfill 필요 여부: 필요/불필요
- Phase 3 착수 가능 여부: 가능/보류
```

---

## A-9. Phase 2 완료 판정 기준

Phase 2는 아래가 모두 충족될 때만 운영 기준 완료로 닫는다.

```text
1. 실 DB migration 성공
2. seed 성공
3. validate/generate/tsc/lint/canonical/py_compile 통과
4. INTERNAL_STANDARD 생성 성공
5. ACTIVE 공식서식 source 생성 성공
6. INACTIVE/ARCHIVED source 생성 차단
7. trace 없는 승인 차단
8. approvedSnapshotAt 기록 확인
9. public-safe sourceTrace 검증 화면 표시
10. IMPLEMENTATION_EVIDENCE.md 실제 결과 기록
```

---

# PART B. Phase 3 실제 코드 반영 지시서

## B-1. Phase 3 작업 제목

```text
Phase 3 — 공식서식 구조 기반 필수항목 검증 및 AI 프롬프트 제한 강화
```

---

## B-2. Phase 3 목적

Phase 1과 Phase 2는 “출처를 등록하고, 생성·승인·검증까지 추적”하는 단계였다.

Phase 3는 여기서 한 단계 더 나아가 다음을 구현한다.

1. 문서유형별 필수항목 정의
2. 질문셋 답변 key와 문서 필드 key 매핑
3. 필수항목 누락 시 문서 생성 차단
4. 누락항목을 보완질문으로 변환
5. AI가 없는 사실·증거·조문·판례를 만들지 못하도록 프롬프트 제한
6. AI 응답 JSON schema 고정
7. Phase 2의 `generationPolicy = NO_UNVERIFIED_FACTS`를 실제 생성 정책으로 연결

---

## B-3. Phase 3 범위 제한

이번 Phase 3에서 하지 않는 것:

```text
법령·판례 RAG 전체 구현
HWP/PDF 자동 파싱
공식기관 웹 자동수집
문서유형 enum 대량 확장
PDF 고급 출력 개편
변호사 업무 자동판단 기능
```

이번 단계는 “문서 생성 전 필수항목 검증 + AI 환각 방지”에 집중한다.

---

## B-4. 핵심 설계

문서 생성 흐름을 다음처럼 바꾼다.

기존:

```text
DocumentTemplate 선택
→ 질문셋 답변 매핑
→ 문서 생성
→ trace 저장
```

수정 후:

```text
DocumentTemplate 선택
→ 공식서식/내부표준 필수항목 로드
→ 질문셋 답변 매핑
→ 필수항목 누락 검증
→ 누락 시 생성 차단 + 보완질문 반환
→ 통과 시 문서 생성
→ trace 저장
→ AI 문단 재작성 시 NO_UNVERIFIED_FACTS 정책 적용
```

---

## B-5. 신규 정의 파일 추가

### B-5-1. 파일 생성

```text
src/lib/document-required-fields.ts
```

### B-5-2. 타입 정의

```ts
export type RequiredDocumentFieldSeverity = "BLOCKING" | "WARNING";

export type RequiredDocumentField = {
  key: string;
  label: string;
  description?: string;
  severity: RequiredDocumentFieldSeverity;
  acceptedQuestionKeys: string[];
  fallbackQuestion?: string;
};

export type DocumentRequiredFieldSet = {
  templateCode: string;
  templateVersion?: string;
  documentType: string;
  fields: RequiredDocumentField[];
};
```

### B-5-3. 기본 필수항목 세트

현재 enum이 `STATEMENT / OPINION / CONSULT_NOTE` 중심이면 Phase 3 최소 범위도 이 3종으로 시작한다.

```ts
export const DEFAULT_REQUIRED_DOCUMENT_FIELDS: DocumentRequiredFieldSet[] = [
  {
    templateCode: "STATEMENT",
    documentType: "STATEMENT",
    fields: [
      {
        key: "statement.actorName",
        label: "진술인 성명",
        severity: "BLOCKING",
        acceptedQuestionKeys: ["actor.name", "client.name", "statement.actorName"],
        fallbackQuestion: "진술인의 성명을 입력해 주세요.",
      },
      {
        key: "statement.incidentDate",
        label: "사건 발생일",
        severity: "BLOCKING",
        acceptedQuestionKeys: ["incident.date", "case.incidentDate"],
        fallbackQuestion: "사건이 발생한 날짜를 입력해 주세요.",
      },
      {
        key: "statement.facts",
        label: "주요 사실관계",
        severity: "BLOCKING",
        acceptedQuestionKeys: ["incident.facts", "case.facts", "statement.facts"],
        fallbackQuestion: "문서에 들어갈 주요 사실관계를 구체적으로 입력해 주세요.",
      },
      {
        key: "statement.evidence",
        label: "증거자료",
        severity: "WARNING",
        acceptedQuestionKeys: ["evidence.list", "case.evidence"],
        fallbackQuestion: "관련 증거자료가 있다면 입력해 주세요.",
      },
    ],
  },
  {
    templateCode: "OPINION",
    documentType: "OPINION",
    fields: [
      {
        key: "opinion.issue",
        label: "검토 쟁점",
        severity: "BLOCKING",
        acceptedQuestionKeys: ["legal.issue", "case.issue", "opinion.issue"],
        fallbackQuestion: "검토가 필요한 핵심 쟁점을 입력해 주세요.",
      },
      {
        key: "opinion.facts",
        label: "기초 사실관계",
        severity: "BLOCKING",
        acceptedQuestionKeys: ["incident.facts", "case.facts", "opinion.facts"],
        fallbackQuestion: "의견서의 기초가 되는 사실관계를 입력해 주세요.",
      },
      {
        key: "opinion.requestedConclusion",
        label: "요청 취지",
        severity: "WARNING",
        acceptedQuestionKeys: ["request.conclusion", "client.request"],
        fallbackQuestion: "원하는 결론 또는 요청 취지를 입력해 주세요.",
      },
    ],
  },
  {
    templateCode: "CONSULT_NOTE",
    documentType: "CONSULT_NOTE",
    fields: [
      {
        key: "consult.summary",
        label: "상담 요약",
        severity: "BLOCKING",
        acceptedQuestionKeys: ["consult.summary", "case.summary", "incident.facts"],
        fallbackQuestion: "상담 내용을 요약해 주세요.",
      },
      {
        key: "consult.nextAction",
        label: "후속 조치",
        severity: "WARNING",
        acceptedQuestionKeys: ["next.action", "case.nextAction"],
        fallbackQuestion: "다음에 진행해야 할 조치가 있다면 입력해 주세요.",
      },
    ],
  },
];
```

주의:

- Phase 3 최소 기반에서는 현재 문서유형 3종만 먼저 처리한다.
- 고소장/소장/답변서 등은 Phase 3-1 또는 Phase 4에서 enum 확장과 함께 추가한다.

---

## B-6. 필수항목 검증 유틸 추가

### B-6-1. 신규 파일

```text
src/lib/document-required-field-validator.ts
```

### B-6-2. 구현 방향

```ts
import { DEFAULT_REQUIRED_DOCUMENT_FIELDS, type RequiredDocumentField } from "@/lib/document-required-fields";

export type AnswerMap = Record<string, unknown>;

export type MissingDocumentField = {
  key: string;
  label: string;
  severity: "BLOCKING" | "WARNING";
  fallbackQuestion?: string;
  acceptedQuestionKeys: string[];
};

function hasUsableAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function fieldHasAnswer(field: RequiredDocumentField, answers: AnswerMap): boolean {
  return field.acceptedQuestionKeys.some((key) => hasUsableAnswer(answers[key]));
}

export function validateRequiredDocumentFields(params: {
  templateCode: string;
  documentType: string;
  answers: AnswerMap;
}): {
  missingBlockingFields: MissingDocumentField[];
  missingWarningFields: MissingDocumentField[];
} {
  const fieldSet = DEFAULT_REQUIRED_DOCUMENT_FIELDS.find(
    (item) => item.templateCode === params.templateCode || item.documentType === params.documentType,
  );

  if (!fieldSet) {
    return { missingBlockingFields: [], missingWarningFields: [] };
  }

  const missing = fieldSet.fields
    .filter((field) => !fieldHasAnswer(field, params.answers))
    .map((field) => ({
      key: field.key,
      label: field.label,
      severity: field.severity,
      fallbackQuestion: field.fallbackQuestion,
      acceptedQuestionKeys: field.acceptedQuestionKeys,
    }));

  return {
    missingBlockingFields: missing.filter((field) => field.severity === "BLOCKING"),
    missingWarningFields: missing.filter((field) => field.severity === "WARNING"),
  };
}
```

---

## B-7. 질문셋 답변 AnswerMap 변환 유틸

현재 인터뷰 답변 구조가 배열/JSON/DB row 중 무엇인지 파일별로 다를 수 있으므로, 문서 생성 API 근처에 변환 유틸을 둔다.

### B-7-1. 신규 파일 후보

```text
src/lib/question-answer-map.ts
```

### B-7-2. 역할

```ts
export function buildAnswerMapFromInterviewAnswers(
  answers: Array<{ questionKey?: string | null; key?: string | null; value?: unknown; answer?: unknown }>,
): Record<string, unknown> {
  return answers.reduce<Record<string, unknown>>((acc, item) => {
    const key = item.questionKey ?? item.key;
    if (!key) return acc;
    acc[key] = item.value ?? item.answer ?? null;
    return acc;
  }, {});
}
```

주의:

- 실제 DB 필드명이 `questionKey`, `answerJson`, `valueJson`, `answerText` 등 다를 수 있으므로 실제 모델 기준으로 조정한다.
- 임의 추정 필드명을 고정하지 말고 기존 문서 생성 API가 이미 사용하는 답변 매핑 로직을 우선 재사용한다.

---

## B-8. 문서 생성 API 수정

### B-8-1. 대상 파일 후보

```text
src/app/api/cases/[caseId]/documents/generate/route.ts
src/app/api/cases/[caseId]/documents/route.ts
src/app/api/legal-documents/route.ts
```

실제 `LegalDocument` 생성과 `DocumentGenerationTrace` 생성을 수행하는 파일을 대상으로 한다.

### B-8-2. 생성 전 필수항목 검증 추가

문서 생성 직전, trace 생성 이전에 추가한다.

```ts
const requiredFieldResult = validateRequiredDocumentFields({
  templateCode: template.code,
  documentType: template.type,
  answers: answerMap,
});

if (requiredFieldResult.missingBlockingFields.length > 0) {
  return Response.json(
    {
      ok: false,
      code: "MISSING_REQUIRED_DOCUMENT_FIELDS",
      message: "문서 생성에 필요한 필수항목이 부족합니다.",
      missingFields: requiredFieldResult.missingBlockingFields,
      suggestedQuestions: requiredFieldResult.missingBlockingFields
        .map((field) => field.fallbackQuestion)
        .filter(Boolean),
    },
    { status: 422 },
  );
}
```

### B-8-3. warning 필드는 trace 또는 응답에 남김

필수는 아니지만 부족한 warning 항목은 생성은 허용하되 trace나 응답에 남긴다.

```ts
const warningFields = requiredFieldResult.missingWarningFields;
```

Phase 3 최소 구현에서는 warning을 DB에 저장하지 않고 response metadata에만 포함해도 된다.

---

## B-9. AI 프롬프트 제한 강화

### B-9-1. 대상 파일 후보

```text
src/lib/document-paragraph-ai.prompts.ts
src/features/document-drafts/document-draft-ai.ts
src/features/document-drafts/document-draft-ai.prompts.ts
src/lib/document-ai.ts
```

현재 실제 AI 호출 경로가 있는 파일을 확인하고, 최소한 다음 정책을 공통 프롬프트에 넣는다.

### B-9-2. 추가할 정책 문구

```text
당신은 법률문서 최종 작성자가 아니라 초안 정리 보조자입니다.
다음 원칙을 반드시 지키세요.

1. 사용자가 제공하지 않은 사실을 추가하지 마세요.
2. 사용자가 제공하지 않은 증거자료를 만들어내지 마세요.
3. 제공된 근거자료가 없으면 법령 조문번호, 판례번호, 사건번호를 생성하지 마세요.
4. 공식서식 또는 내부표준 템플릿의 구조를 벗어나지 마세요.
5. 법률 판단을 단정하지 말고 검토 필요 또는 주장 취지 수준으로 표현하세요.
6. 필수항목이 부족하면 문장을 지어내지 말고 missingFields로 반환하세요.
7. 변호사 또는 승인 권한자의 검토 전 문서는 제출용 확정문서가 아닙니다.
```

---

## B-10. AI 응답 JSON schema 고정

AI 문단 재생성 또는 초안 정리 응답은 가능하면 아래 구조로 제한한다.

```ts
export const DocumentAiResponseSchema = z.object({
  content: z.string(),
  usedQuestionKeys: z.array(z.string()).default([]),
  missingFields: z.array(z.object({
    key: z.string(),
    label: z.string(),
    reason: z.string().optional(),
  })).default([]),
  riskFlags: z.array(z.object({
    code: z.string(),
    message: z.string(),
  })).default([]),
});
```

Phase 3 최소 구현에서는 AI 호출 결과가 아직 plain text이면 다음 방식으로 감싼다.

```ts
{
  content: generatedText,
  usedQuestionKeys: [],
  missingFields: [],
  riskFlags: []
}
```

---

## B-11. generationPolicy와 실제 정책 연결

Phase 2 trace에는 다음 값이 들어간다.

```text
generationPolicy = NO_UNVERIFIED_FACTS
```

Phase 3에서는 이 값이 단순 기록이 아니라 실제 정책으로 작동해야 한다.

구현 방향:

```ts
export const DOCUMENT_GENERATION_POLICIES = {
  NO_UNVERIFIED_FACTS: {
    requireSourceTrace: true,
    blockMissingRequiredFields: true,
    allowUnverifiedLegalCitations: false,
    allowInventedEvidence: false,
    requireHumanReview: true,
  },
} as const;
```

신규 파일 후보:

```text
src/lib/document-generation-policy.ts
```

---

## B-12. 화면 보강

### B-12-1. 문서 생성 전 누락항목 표시

문서 생성 버튼 또는 미리보기 화면에서 422 응답의 `missingFields`를 표시한다.

표시 예:

```text
문서 생성에 필요한 필수항목이 부족합니다.
- 진술인 성명
- 사건 발생일
- 주요 사실관계

보완 질문:
1. 진술인의 성명을 입력해 주세요.
2. 사건이 발생한 날짜를 입력해 주세요.
3. 문서에 들어갈 주요 사실관계를 구체적으로 입력해 주세요.
```

### B-12-2. warning 항목 표시

생성은 가능하지만 보강이 필요한 항목은 다음처럼 표시한다.

```text
보강하면 좋은 항목
- 증거자료
- 요청 취지
- 후속 조치
```

---

## B-13. 테스트 시나리오

### B-13-1. 필수항목이 모두 있는 경우

1. 필수 질문 답변을 모두 입력한다.
2. 문서 생성을 실행한다.
3. 생성 성공 확인
4. trace 생성 확인

기대:

```text
HTTP 200 또는 201
LegalDocument 생성
DocumentGenerationTrace 생성
```

### B-13-2. BLOCKING 필수항목 누락

1. 사건 발생일 또는 주요 사실관계를 비운다.
2. 문서 생성을 실행한다.

기대:

```text
HTTP 422
code = MISSING_REQUIRED_DOCUMENT_FIELDS
missingFields 포함
suggestedQuestions 포함
LegalDocument 생성 안 됨
DocumentGenerationTrace 생성 안 됨
```

### B-13-3. WARNING 항목 누락

1. 증거자료만 비운다.
2. 문서 생성을 실행한다.

기대:

```text
문서 생성 성공
warning 항목 표시
AI가 증거자료를 임의 생성하지 않음
```

### B-13-4. AI 조문/판례 임의 생성 방지

1. 법령/판례 근거자료 없이 AI 재작성 요청
2. 결과에 임의 조문번호/판례번호가 없는지 확인

기대:

```text
없는 법령 조문번호 생성 안 함
없는 판례번호 생성 안 함
검토 필요 표현 사용
```

---

## B-14. 검증 명령

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit --pretty false
npm run lint
npm run verify:canonical-sources
py -3 -m py_compile tools/aibeopchin_navigator.py
```

Phase 3에서 DB schema 변경이 없다면 migration은 필요 없다.

단, `DocumentGenerationPolicy`나 required fields를 DB 테이블로 만들 경우 별도 migration이 필요하다. Phase 3 최소 구현은 코드 정의 파일 기반으로 시작한다.

---

## B-15. IMPLEMENTATION_EVIDENCE 기록 양식

```md
## [EVIDENCE-YYYYMMDD-PHASE3-REQUIRED-FIELDS-AI-GUARDRAILS]

### 목적
- 공식서식/내부표준 템플릿 구조에 따른 필수항목 검증 추가.
- 질문셋 답변 key와 문서 필드 key 매핑 기반으로 누락항목 차단.
- AI 문서 생성/재작성 시 없는 사실·증거·조문·판례 생성을 금지하는 정책 반영.

### 수정 파일
- src/lib/document-required-fields.ts
- src/lib/document-required-field-validator.ts
- src/lib/question-answer-map.ts
- src/lib/document-generation-policy.ts
- src/lib/document-paragraph-ai.prompts.ts
- src/app/api/cases/[caseId]/documents/generate/route.ts
- 관련 UI 파일
- docs/project-governance/IMPLEMENTATION_EVIDENCE.md

### 검증 명령
- npx prisma validate
- npx prisma generate
- npx tsc --noEmit --pretty false
- npm run lint
- npm run verify:canonical-sources
- py -3 -m py_compile tools/aibeopchin_navigator.py

### 검증 결과
- prisma validate: PASS/FAIL
- prisma generate: PASS/FAIL
- tsc: PASS/FAIL
- lint: PASS/FAIL
- verify:canonical-sources: PASS/FAIL
- py_compile: PASS/FAIL

### 기능 검증
- [ ] 필수항목 모두 존재 시 문서 생성 성공
- [ ] BLOCKING 필수항목 누락 시 생성 차단
- [ ] missingFields와 suggestedQuestions 반환
- [ ] WARNING 항목 누락 시 생성은 허용하되 보강 안내
- [ ] AI가 없는 사실을 추가하지 않음
- [ ] AI가 없는 증거를 추가하지 않음
- [ ] AI가 없는 법령 조문번호를 생성하지 않음
- [ ] AI가 없는 판례번호를 생성하지 않음

### 판정
- Phase 3 최소 기반 완료/보류.

### 이월
- 고소장/소장/답변서 등 문서유형 확장
- 법령·판례 RAG
- 공식서식 HWP/PDF 파싱
- 보완질문을 실제 인터뷰 플로우에 자동 삽입하는 기능
```

---

## B-16. Phase 3 완료 판정 기준

Phase 3 최소 기반은 아래가 충족되면 완료로 판정한다.

```text
1. 문서유형별 필수항목 정의 파일 존재
2. 질문셋 답변 key와 필수항목 acceptedQuestionKeys 매핑
3. BLOCKING 누락 시 문서 생성 차단
4. missingFields와 suggestedQuestions 반환
5. WARNING 누락 시 생성 허용 + 보강 안내
6. AI 프롬프트에 NO_UNVERIFIED_FACTS 원칙 반영
7. AI 응답 schema 또는 wrapper 적용
8. tsc/lint/canonical/navigator 통과
9. IMPLEMENTATION_EVIDENCE 실제 결과 기록
```

---

# PART C. 최종 권장 진행 순서

## C-1. 권장 순서

```text
1. Phase 2 확정 검증 먼저 수행
2. 실 DB migration/seed/E2E 결과를 IMPLEMENTATION_EVIDENCE에 기록
3. Phase 2 운영 완료 또는 보류 판정 확정
4. Phase 3 코드 반영 착수
5. Phase 3 정적 검증과 기능 검증 수행
6. Phase 3 결과 기록
```

## C-2. 실 DB 접근이 지연될 경우

```text
1. Phase 2 상태는 “운영 완료 보류”로 유지
2. Phase 3 코드는 별도 브랜치에서 착수 가능
3. Phase 3도 운영 완료 판정은 Phase 2 확정 후로 보류
4. IMPLEMENTATION_EVIDENCE에 선행조건 미충족을 명시
```

## C-3. 다음 채팅 이어받기 문구

```text
AI법친 공식서식 기반 보강은 Phase 1과 Phase 2 runtime linkage까지 코드 기준 반영 완료 상태다.
Phase 2는 실 DB migration과 실제 generate → approve → verify E2E 검증이 아직 미실행이므로 운영 완료 판정은 보류되어 있다.
다음 작업은 먼저 Phase 2 확정 검증 지시서에 따라 실 DB migrate/seed/E2E를 수행하고, 결과를 IMPLEMENTATION_EVIDENCE.md에 기록하는 것이다.
실 DB 접근이 지연되면 Phase 3 공식서식 구조 기반 필수항목 검증 및 AI 프롬프트 제한 강화 코드를 별도 브랜치에서 진행하되, 운영 완료 판정은 Phase 2 확정 이후로 미룬다.
```