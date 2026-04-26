# 질문셋 정의서 (초안)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | 초안 0.1 |
| 기준 문서 | [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md), [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md), [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) |
| 적용 범위 | 사건 인터뷰용 질문셋, 조건 분기, 답변 저장, 문서 문단 매핑 |
| 후속 문서 | [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md)(초안 0.1), 입력·출력 데이터 정의서 |
| 거버넌스 직교 | [SPEC GW-0.3 범위·완료](SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#gw-0-3-범위-완료) · [347] 3순 C **문서·정렬 1차 (A)** [#c-gw03-a-tier3-20260426](IMPLEMENTATION_EVIDENCE.md#c-gw03-a-tier3-20260426) — **본착수·런타임 대규모 변경은 (가) 별 PR**; [343]~[350] **재오픈 없음** |

본 문서는 AI법친의 **질문셋(question set)** 이 무엇으로 구성되고,  
어떻게 사건 인터뷰 흐름과 연결되며,  
답변이 어떤 기준으로 문서 생성에 연결되는지를 정의한다.

질문셋은 단순 질문 목록이 아니라 다음을 포함하는 **업무 구조체**로 본다.

- 질문 기본 정보  
- 표시 조건  
- 분기 조건  
- 답변 저장 규칙  
- 문서 문단 매핑 규칙  
- 인터뷰 완료 판정 규칙  

---

## 1. 목적

이 문서의 목적은 다음과 같다.

1. 질문셋의 기본 구조를 고정한다.  
2. 질문의 유형과 필수 속성을 정의한다.  
3. 조건 분기 규칙을 정의한다.  
4. 인터뷰 답변이 문서 문단으로 연결되는 기준을 정한다.  
5. 질문셋 관리자 화면과 실제 인터뷰 화면이 같은 기준을 따르게 한다.  
6. 후속 문서 생성·요약·출력 구조의 입력 기준을 만든다.  

---

## 2. 질문셋의 위치

질문셋은 사건 라이프사이클상 아래 구간에 직접 연결된다.

```text
CREATED / INTAKE_PENDING
→ IN_INTERVIEW
→ INTERVIEW_DONE
→ DRAFTING
```

**의미**

- 사건이 인터뷰 단계(`IN_INTERVIEW`)에 들어가면 질문셋이 구동된다.  
- 질문셋 답변이 충분히 수집되면 `INTERVIEW_DONE` 판정 근거가 된다.  
- 이후 문서 초안 생성(`DRAFTING`)의 입력값으로 사용된다.  

즉, 질문셋은 인터뷰 단계의 핵심 기준 구조이며, 문서 생성 이전 단계의 공식 입력 체계다.

---

## 3. 질문셋 구성 단위

질문셋은 아래 단위로 본다.

### 3-1. 질문셋(Set)

하나의 사건 유형 또는 인터뷰 목적에 맞는 전체 질문 묶음.

**예**

- 형사 사건 기본 질문셋  
- 민사 분쟁 질문셋  
- 행정 대응 질문셋  
- 공통 초기 접수 질문셋  

### 3-2. 섹션(Section)

질문셋 안에서 질문을 묶는 상위 그룹.

**예**

- 기본 정보  
- 사건 개요  
- 상대방 정보  
- 시간 순서 정리  
- 증거 자료  
- 요청 사항  

### 3-3. 질문(Question)

실제로 사용자나 담당자가 답하는 최소 단위.

### 3-4. 선택지·규칙(Option / Rule)

질문에 따라 보이거나 숨겨지는 분기 조건.

---

## 4. 질문셋 기본 구조 (초안)

질문셋 1개는 최소 아래 정보를 가진다.

| 필드 | 설명 |
|------|------|
| `questionSetId` | 질문셋 고유 ID |
| `name` | 질문셋 이름 |
| `version` | 질문셋 버전 |
| `status` | 초안·배포·중지 등 운영 상태 |
| `caseType` | 연결되는 사건 유형 |
| `description` | 질문셋 설명 |
| `sections` | 섹션 목록 |
| `isActive` | 현재 사용 여부 |
| `createdBy` | 생성자 |
| `updatedBy` | 수정자 |
| `publishedAt` | 배포 시각 |

---

## 5. 섹션 구조 (초안)

섹션 1개는 최소 아래 정보를 가진다.

| 필드 | 설명 |
|------|------|
| `sectionId` | 섹션 고유 ID |
| `title` | 섹션 제목 |
| `description` | 섹션 설명 |
| `order` | 노출 순서 |
| `questions` | 포함 질문 목록 |
| `required` | 섹션 필수 여부 |

**섹션 예시**

- 기본 정보  
- 사건 배경  
- 주요 사실관계  
- 시간 순서  
- 증거·첨부자료  
- 상대방 주장  
- 의뢰인 요청사항  
- 추가 특이사항  

---

## 6. 질문 구조 (초안)

질문 1개는 최소 아래 정보를 가진다.

| 필드 | 설명 |
|------|------|
| `questionId` | 질문 고유 ID |
| `key` | 저장·매핑용 키 |
| `label` | 화면에 보이는 질문 문구 |
| `helpText` | 보조 설명 |
| `type` | 질문 유형 |
| `required` | 필수 여부 |
| `order` | 순서 |
| `placeholder` | 입력 예시 |
| `options` | 선택지 목록 |
| `visibilityRule` | 노출 조건 |
| `branchRule` | 다음 질문·섹션 분기 조건 |
| `mappingTargets` | 문서 문단 연결 대상 |
| `validationRule` | 입력 검증 규칙 |

---

## 7. 질문 유형 정의

아래 유형을 기본 질문 유형으로 정의한다.

| 유형 | 설명 |
|------|------|
| `short_text` | 짧은 텍스트 |
| `long_text` | 긴 서술형 답변 |
| `single_select` | 단일 선택 |
| `multi_select` | 다중 선택 |
| `boolean` | 예·아니오 |
| `date` | 날짜 |
| `datetime` | 일시 |
| `number` | 숫자 |
| `file` | 첨부 업로드 |
| `person` | 인물 정보 입력 |
| `address` | 주소 입력 |
| `timeline` | 시간순 사건 배열 |
| `reference_list` | 증거·자료 목록 |
| `statement_block` | 장문 진술 블록 |

**三층 매핑(인터뷰 `type`·Zod `inputType`·본 절 `lower_snake_case`):** [QUESTION_TYPE_MAPPING.md](QUESTION_TYPE_MAPPING.md) — **의미별 허용 문자열**·미구현 유형은 그 문서 §2·§3이 단일 기준이다. (Step 3 싱글 소스; [EVIDENCE-20260423-331](IMPLEMENTATION_EVIDENCE.md#evidence-20260423-331).)

**운영 원칙**

- 질문 유형은 UI 렌더링과 저장 구조를 함께 결정한다.  
- 동일한 질문 유형은 질문셋 관리자와 실제 인터뷰 화면에서 동일하게 해석되어야 한다.  
- 질문 유형 추가 시 이 문서와 관리자 화면 정의를 함께 수정한다.  

---

## 8. 필수 질문 속성

모든 질문은 최소 아래 속성을 가져야 한다.

- `questionId`  
- `key`  
- `label`  
- `type`  
- `required`  
- `order`  

아래는 필요 시 선택 속성이다.

- `helpText`  
- `placeholder`  
- `options`  
- `visibilityRule`  
- `branchRule`  
- `mappingTargets`  
- `validationRule`  

---

## 9. 조건 분기 규칙

질문셋은 정적 목록이 아니라 조건 분기형 흐름을 지원한다.

### 9-1. `visibilityRule`

질문이 화면에 보일지 결정하는 규칙.

**예**

- 이전 질문이 “예”일 때만 보임  
- 특정 사건 유형일 때만 보임  
- 특정 역할일 때만 보임  

**예시 표현**

```json
{
  "dependsOn": "has_opponent",
  "operator": "equals",
  "value": true
}
```

### 9-2. `branchRule`

답변에 따라 다음 질문 또는 섹션 이동을 다르게 하는 규칙.

**예**

- “형사 고소 진행 중”이면 형사 절차 섹션으로 이동  
- “계약서 있음”이면 계약 증거 섹션 추가 노출  

**예시 표현**

```json
{
  "when": {
    "questionKey": "case_category",
    "operator": "equals",
    "value": "criminal"
  },
  "goToSection": "criminal_process"
}
```

### 9-3. 분기 원칙

- 분기 규칙은 질문셋 관리자와 인터뷰 실행 화면에서 **동일하게** 해석되어야 한다.  
- 숨겨진 질문은 기본적으로 인터뷰 완료 판정 대상에서 **제외**한다.  
- 분기 결과가 문서 생성에 영향을 주는 경우 `mappingTargets` 와 함께 관리한다.  

---

## 10. 답변 저장 규칙

질문 답변은 아래 원칙으로 저장한다.

### 10-1. 저장 단위

- 사건 기준  
- 인터뷰 세션 기준  
- 질문 기준  

### 10-2. 저장 원칙

- 질문 `key` 를 기준으로 저장 가능해야 한다.  
- 질문 문구가 바뀌어도 저장 키는 안정적으로 유지되어야 한다.  
- 필수 질문 답변 여부를 기준으로 인터뷰 완료 가능 여부를 판정할 수 있어야 한다.  

### 10-3. 저장 예시

| 필드 | 설명 |
|------|------|
| `caseId` | 사건 ID |
| `interviewSessionId` | 인터뷰 세션 ID |
| `questionKey` | 질문 저장 키 |
| `value` | 답변 값 |
| `answeredAt` | 답변 시각 |
| `answeredBy` | 답변자 |
| `version` | 질문셋 버전 |

---

## 11. 문서 문단 매핑 규칙

질문셋 답변은 이후 문서 템플릿의 문단 생성 입력으로 연결된다.

### 11-1. `mappingTargets`

각 질문은 하나 이상의 문단 대상으로 연결될 수 있다.

**예**

- `fact_summary` → 사건 개요 문단  
- `issue_list` → 주요 쟁점 문단  
- `timeline` → 경위 정리 문단  
- `requested_outcome` → 요청사항 문단  

### 11-2. 매핑 방식

| 방식 | 설명 |
|------|------|
| `direct` | 답변을 거의 그대로 사용 |
| `summary` | 여러 답변을 요약해 사용 |
| `merge` | 복수 질문을 병합 |
| `conditional` | 특정 답변일 때만 문단 생성 |
| `evidence_linked` | 첨부자료와 연결해 문단 생성 |

### 11-3. 원칙

- 질문셋 정의서와 **문서 템플릿 정의서**는 같은 `mappingTargets` 체계를 공유해야 한다.  
- 질문 `key` 는 문단 생성 로직의 입력 키로 재사용 가능해야 한다.  
- 질문 변경 시 문단 매핑 영향도를 반드시 검토한다.  

---

## 12. 인터뷰 완료 판정 규칙

인터뷰 완료(`INTERVIEW_DONE`)는 단순히 마지막 질문까지 갔다고 끝나지 않는다.

**완료 판정 기본 조건**

- 현재 노출된 필수 질문이 모두 답변됨  
- 분기상 필요한 섹션이 모두 완료됨  
- 필수 첨부 질문이 있다면 최소 조건 충족  
- 저장 오류 없음  
- 담당자 확인 또는 완료 버튼 처리됨  

**완료 불가 예시**

- 필수 질문 미응답  
- 필수 첨부 누락  
- 분기상 나타난 질문이 비어 있음  
- 저장 실패 상태  

---

## 13. 질문셋 버전 정책

질문셋은 버전 관리 대상이다.

**원칙**

- 배포 후 질문 문구를 바로 덮어쓰기보다 버전 갱신을 우선 고려한다.  
- 기존 사건은 원칙적으로 당시 연결된 질문셋 버전을 참조할 수 있어야 한다.  
- 새 버전 배포 시 기존 사건 영향 범위를 확인한다.  

**운영 상태 예시**

- `draft`  
- `published`  
- `archived`  

---

## 14. 질문셋 관리자 기준

질문셋 관리자 화면은 최소 아래 기능을 가져야 한다.

- 질문셋 생성  
- 섹션 추가·정렬  
- 질문 추가·수정·삭제  
- 질문 유형 선택  
- 필수 여부 설정  
- 분기 규칙 설정  
- 문단 매핑 대상 설정  
- 버전·배포 관리  

**권한 기준**

- 질문셋 관리자 편집 권한은 [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) 기준으로 `ADMIN`, `SUPER_ADMIN` 중심  
- 제한적 편집권을 `LAWYER` 에게 줄지는 추후 확정  

### 14-1. App 라우트 ↔ 관리 UI (Step 3 경계 고정)

**원칙:** 질문셋 **관리자** 화면은 아래 **한 세트**만 본문·스펙에서 “공식 질문셋 admin UI”로 본다. ( [EVIDENCE-20260423-332](./IMPLEMENTATION_EVIDENCE.md#evidence-20260423-332) )

| App 경로 | 컴포넌트(요지) | 서버/저장 |
|----------|----------------|-----------|
| `/admin/question-sets` | `app/(protected)/admin/question-sets/page.tsx` + `QuestionSetListClient` | 목록은 **SSR** `prisma.questionSet.findMany` |
| `/admin/question-sets/new` | `QuestionSetCreateClient` | `POST /api/question-sets` |
| `/admin/question-sets/[questionSetId]` | `QuestionSetEditor` | **저장:** `PATCH /api/question-sets/:id` → `definitionJson`·메타만. **게시:** `PATCH /api/question-sets/:id/publish` → 성공 시 **같은 HTTP 요청**에서 `definitionJson` → A안 `QuestionSet.questions` 투영·저장·`PUBLISHED` ([B §2](EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md#2-저장-시점)·[343](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-343)). |

**구분(싱글 소스):** [QUESTION_TYPE_MAPPING.md](./QUESTION_TYPE_MAPPING.md) — 인터뷰 **런타임**은 DB `QuestionSet.questions`(플랫 JSON)이며, 본 관리 편집기는 **우선** `definitionJson`(섹션·Zod)을 다룬다. **플랫 `questions` 필드**를 화면에서 직접 편집하는 별도 클라이언트는 **연결하지 않음**; **저장** 직후가 아닌 **게시 직후**에 일상 동기가 이루어지며, **기존 DB 행만** 보정할 때는 백필( [B §3](EVIDENCE_STEP3_B_DEFINITION_JSON_QUESTIONS_SYNC.md#3-백필시드-연계)·[EVIDENCE-20260425-344](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-344) )·시드( [A §4.5](EVIDENCE_STEP3_A_DEFINITION_DATA_ALIGN.md#45-시드) ) 경로를 본다.

**정책(현행·UI·서버, [EVIDENCE-20260425-335](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-335)·[EVIDENCE-20260425-343](./IMPLEMENTATION_EVIDENCE.md#evidence-20260425-343)):** 공식 편집기 `QuestionSetEditor`의 **저장**(`PATCH /api/question-sets/:id`)은 **`definitionJson`·메타만** 갱신하고 **`QuestionSet.questions`는 건드리지 않는다.** **게시**(`PATCH /api/question-sets/:id/publish`)에 **성공하면** (초회·**재게시** 동일) **해당 정의**가 A안 `questions`에 투영된다. 동일 화면 상단에 위 내용에 맞는 관리자 안내를 둔다. 334 **§4.1** 시점의「저장/게시와의 갭」은 [343] 구현·[335] UI 문구로 **운영 기준**에 맞게 정리되었다(잔여: 백필/시드·[344]·A §4.5).

**삭제(332):** `src/components/admin/question-set-admin-client.tsx` 는 **어느 라우트에도 import되지 않은** 고아 모듈이었으므로 **제거**했다(라우트 “연결”이 아닌 **정리**).

---

## 15. 질문셋과 권한정의서의 연결

권한정의서 기준으로 질문셋 관련 권한은 아래처럼 본다.

| 행위 | USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN |
|------|------|--------|-------|-------|-------------|
| 질문 응답 참여 | 제한 | O | O | O | O |
| 인터뷰 진행 보조 | X | O | O | O | O |
| 질문셋 열람 | 제한 | O | O | O | O |
| 질문셋 생성·수정 | X | X | X | O | O |
| 질문셋 배포 | X | X | X | O | O |

---

## 16. 미확정 항목

아래는 후속 확정이 필요하다.

1. 질문셋별 사건 유형 매핑 방식  
2. 질문 유형 `timeline`, `statement_block` 의 저장 상세 구조  
3. 첨부 질문(`file`)의 필수 판정 규칙  
4. 질문셋 버전 변경 시 기존 사건 자동 연결 여부  
5. `LAWYER` 제한 편집권 허용 여부  
6. 질문셋과 템플릿 간 `mappingTargets` 명명 규칙 고정  

---

## 17. 구현 대조 체크포인트

구현과 대조할 때는 아래를 본다.

- 질문셋 관리자와 인터뷰 실행 화면이 같은 질문 구조를 쓰는가  
- 분기 규칙이 관리자·실행 화면에서 동일하게 작동하는가  
- 필수 질문 누락 시 인터뷰 완료가 막히는가  
- 질문 답변이 문서 문단 생성 입력으로 연결되는가  
- 질문셋 버전 정보가 보존되는가  

---

## 18. 다음 문서 작업 순서

1. **문서 템플릿 정의서** — [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) (초안 0.1 작성됨).  
2. 이후  
   - 질문셋 정의서 ↔ 문서 템플릿 정의서 매핑 대조  
   - 입력·출력 데이터 정의서  
   - DB 상세 설계 초안  

---

## 19. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 0.1 (연동) | 2026-04-19 | 후속 문서·§18에 [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) 초안 0.1 링크 반영. |
| 0.1 초안 | 2026-04-19 | 질문셋 구조, 질문 유형, 조건 분기, 답변 저장, 문단 매핑, 인터뷰 완료 판정 기준 초안 작성 |
