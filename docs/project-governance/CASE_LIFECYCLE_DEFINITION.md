# 사건 라이프사이클 정의서 (초안)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | 초안 0.1 |
| 기준 시점 | `CaseStatus` 현행 목록 기준 |
| 선행 문서 | [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md) |
| 후속 문서 | [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) |
| 단일 진실 원칙 | 상태 이름은 `prisma/schema.prisma` 의 `CaseStatus`, `src/lib/definitions/case-status.ts` 기준 |

본 문서는 **사건 상태값 정의서에서 확정한 상태들을 실제 업무 흐름(허용 전이 / 금지 전이 / 예외 흐름)** 으로 연결하기 위한 문서이다.  
상태의 의미·라벨은 `CASE_STATUS_DEFINITION.md` 가 기준이며, 본 문서는 **전이 규칙**을 단일하게 관리한다.

---

## 1. 목적

이 문서의 목적은 다음과 같다.

1. 사건 상태 간 **허용 전이**를 정의한다.
2. 사건 상태 간 **금지 전이**를 정의한다.
3. 예외 흐름(보류, 반려, 삭제, 재개)을 정리한다.
4. 이후 작성될 **권한정의서**가 상태 전이 권한을 붙일 수 있는 기준선을 제공한다.
5. 구현 코드와 문서 간 전이 불일치 여부를 점검할 기준을 만든다.

---

## 2. 선행 원칙

### 2-1. 상태 이름 기준

상태 이름은 아래 두 기준만 인정한다.

- `prisma/schema.prisma` 의 `CaseStatus`
- `src/lib/definitions/case-status.ts`

옛 메모의 `OPEN`, `IN_PROGRESS` 등은 직접 사용하지 않는다.

### 2-2. 문서 역할 분리

- `CASE_STATUS_DEFINITION.md` → 상태의 의미와 경계
- `CASE_LIFECYCLE_DEFINITION.md` → 상태 간 전이 규칙
- 권한정의서 → 누가 어떤 전이를 실행할 수 있는지

### 2-3. MVP 우선 흐름

본 문서는 아래 MVP 흐름을 우선 기준으로 삼는다.

1. 변호사 가입/승인  
2. 로그인  
3. 대시보드  
4. 의뢰인 초대/가입  
5. 사건 생성  
6. AI 인터뷰  
7. 사건 요약  
8. 문서 생성  
9. 사건 상세  
10. 보완 요청  
11. 관리자 승인  

---

## 3. 상태 목록 재확인

본 문서에서 다루는 상태는 다음과 같다.

- `CREATED`
- `INTAKE_PENDING`
- `IN_INTERVIEW`
- `INTERVIEW_DONE`
- `DRAFTING`
- `REVIEW_PENDING`
- `APPROVED`
- `DELIVERED`
- `CLOSED`
- `HOLD`
- `REJECTED`
- `DELETED`

---

## 4. 기본 주경로(정상 흐름)

기본 정상 흐름은 아래를 기준으로 한다.

```text
CREATED
→ INTAKE_PENDING (필요 시)
→ IN_INTERVIEW
→ INTERVIEW_DONE
→ DRAFTING
→ REVIEW_PENDING
→ APPROVED
→ DELIVERED
→ CLOSED
```

**해설**

- `CREATED` 는 사건이 생성된 직후 상태다.  
- 접수 정보가 미비하면 `INTAKE_PENDING` 으로 간다.  
- 인터뷰를 시작하면 `IN_INTERVIEW` 로 간다.  
- 인터뷰 완료 후 `INTERVIEW_DONE`  
- 문서 작업 시작 후 `DRAFTING`  
- 검토 요청 후 `REVIEW_PENDING`  
- 승인 완료 후 `APPROVED`  
- 실제 결과 전달 후 `DELIVERED`  
- 업무 종결 처리 후 `CLOSED`  

---

## 5. 허용 전이 규칙 (초안)

아래 표는 **대표 허용 전이** 초안이다. 세부 역할 권한은 후속 권한정의서에서 확정한다.

| 현재 상태 | 허용 전이(대표) | 설명 |
|-----------|-----------------|------|
| `CREATED` | `INTAKE_PENDING`, `IN_INTERVIEW`, `HOLD`, `REJECTED`, `DELETED` | 사건 생성 후 접수 보완·인터뷰 시작·보류·반려·삭제 가능 |
| `INTAKE_PENDING` | `IN_INTERVIEW`, `HOLD`, `REJECTED`, `DELETED` | 보완 완료 후 인터뷰 시작, 또는 중단·반려 |
| `IN_INTERVIEW` | `INTERVIEW_DONE`, `HOLD`, `REJECTED` | 인터뷰 종료 또는 보류·중단 |
| `INTERVIEW_DONE` | `DRAFTING`, `HOLD`, `REJECTED` | 문서 작성 시작 전 단계 |
| `DRAFTING` | `REVIEW_PENDING`, `HOLD`, `REJECTED` | 초안 작성 후 검토로 이동 |
| `REVIEW_PENDING` | `APPROVED`, `DRAFTING`, `REJECTED`, `HOLD` | 승인, 수정 재작성, 반려, 보류 가능 |
| `APPROVED` | `DELIVERED`, `CLOSED`, `HOLD` | 전달 후 종결이 일반적이나, 운영 정책상 직접 종결 가능성은 별도 검토 대상 |
| `DELIVERED` | `CLOSED`, `HOLD` | 전달 완료 후 종결 또는 예외 보류 |
| `HOLD` | 이전 실무 단계로 복귀, `REJECTED`, `DELETED` | 보류 해제 시 직전 흐름으로 복귀(구체 상태는 운영·권한정의서) |
| `REJECTED` | `IN_INTERVIEW`, `DELETED` | **재개:** 구현상 `REOPEN_CASE` 로 **`IN_INTERVIEW`** 로만 전환한다(사유·권한은 권한정의서). 반려 후 `CREATED`·`INTAKE_PENDING` 으로의 **직접** 재진입은 본 문서 §5 표의 **대표 허용 전이**에 포함하지 않는다([175] 정합안 A). 필요 시 별도 합의·`CASE_TRANSITIONS`·§11 에서 다룬다. |
| `CLOSED` | (원칙 최종) · 예외: `IN_INTERVIEW`(재개) | **원칙:** 일반 업무 흐름 종결. **예외:** 감사·사유·권한 요건을 갖춘 **사건 재개** 시 `IN_INTERVIEW` 로의 전환을 허용한다(구현: `REOPEN_CASE`). |
| `DELETED` | (일반 흐름 제외) | 복구 정책은 별도 운영·시스템 정책 |

---

## 6. 금지 전이 규칙 (초안)

아래 전이는 원칙적으로 금지한다.

| 금지 전이 | 사유 |
|-----------|------|
| `CREATED` → `APPROVED` | 인터뷰·문서작성·검토 절차 누락 |
| `IN_INTERVIEW` → `APPROVED` | 인터뷰 완료 및 문서 작성·검토 단계 누락 |
| `INTERVIEW_DONE` → `DELIVERED` | 문서 작성·승인 없이 전달 금지 |
| `DRAFTING` → `DELIVERED` | 승인 절차 누락 |
| `REVIEW_PENDING` → `DELIVERED` | 승인 완료 없이 전달 금지 |
| `APPROVED` → `IN_INTERVIEW` | 이미 승인된 산출물을 인터뷰 단계로 직접 되돌리면 이력 왜곡 가능 |
| `CLOSED` → `DRAFTING` | 종결 후 직접 작성 단계 복귀는 일반 흐름상 부적절 |
| `DELETED` → 일반 흐름 상태 | 복구 정책 없이 업무 흐름 재진입 금지 |

---

## 7. 예외 흐름

### 7-1. 보류(`HOLD`)

- 거의 모든 실무 단계에서 진입 가능하다.  
- 보류 해제 시 원칙적으로 **직전 단계** 또는 재개 가능한 근접 단계로 복귀한다.  
- 어떤 상태로 복귀 가능한지는 운영 정책과 권한정의서에서 더 구체화한다.

### 7-2. 반려(`REJECTED`)

- 접수 반려, 문서 반려, 절차 반려를 포괄한다.  
- 반려 후 완전 종료인지, 재접수 가능한지 여부는 사건 유형과 운영 정책에 따른다.  
- 권한정의서에서 반려 가능 역할을 명시한다.

### 7-3. 삭제(`DELETED`)

- 일반 업무 흐름에서 제외한다.  
- 복구 또는 영구 삭제는 시스템 정책·관리자 정책과 연결한다.  
- 실무 단계의 정상 전이 대상으로 간주하지 않는다.

---

## 8. `APPROVED` / `DELIVERED` / `CLOSED` 운영 기준

이 구간은 가장 자주 혼동되므로 별도로 잠근다. (상세 의미는 [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md) §2·§2.1 과 정합.)

### 8-1. `APPROVED`

- 내부 기준상 산출물 또는 절차가 승인됨.  
- 아직 외부 전달을 의미하지는 않음.

### 8-2. `DELIVERED`

- 외부 수신처(의뢰인 등)에 결과물 또는 통지가 전달됨.  
- 승인 이후에 오는 것이 일반적임.

### 8-3. `CLOSED`

- 사건 자체를 업무적으로 닫는 상태.  
- `DELIVERED` 이후가 일반적이다.  
- 다만 전달 없이 종결 가능한 특수 흐름이 있는지는 운영 정책과 실제 구현을 대조해 확정한다.

---

## 9. 권한정의서와의 연결 포인트

다음 문서인 [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) 에서 아래를 확정한다(초안 0.1 작성됨).

- 누가 `CREATED` → `IN_INTERVIEW` 를 실행할 수 있는가  
- 누가 `REVIEW_PENDING` → `APPROVED` 를 실행할 수 있는가  
- 누가 `APPROVED` → `DELIVERED` 를 실행할 수 있는가  
- 누가 `HOLD`, `REJECTED`, `DELETED` 로 전환할 수 있는가  
- 누가 `CLOSED` 처리할 수 있는가  

즉, 본 문서는 “가능한 흐름”, 권한정의서는 “그 흐름을 누가 실행하는가”를 다룬다.

---

## 10. 구현 대조 시 체크포인트

구현 코드와 대조할 때는 아래를 확인한다.

- 상태 전이 API가 본 문서 허용 전이와 일치하는가  
- UI 버튼·드롭다운이 금지 전이를 노출하지 않는가  
- 승인 후 전달 전 단계가 분리되어 있는가  
- `HOLD`, `REJECTED`, `DELETED` 예외 흐름이 별도 처리되는가  
- `CLOSED` 이후 **원칙적으로 일반 흐름 재진입은 없다.** 다만 **재개 예외**는 `REOPEN_CASE` 에 따라 **`IN_INTERVIEW`** 로만 허용되는가(감사·사유·권한 요건과 UI/API 정합).  

---

## 11. 미확정 항목

아래는 후속 확정이 필요한 항목이다.

- `APPROVED` → `CLOSED` 를 허용할지 여부  
- `REJECTED` / `CLOSED` → `IN_INTERVIEW` **재개** 외, `CREATED`·`INTAKE_PENDING` 으로의 **직접** 재진입이 정책상 필요한지(현행 구현은 `REOPEN_CASE` → `IN_INTERVIEW` 단일).  
- `HOLD` 복귀 시 정확한 이전 단계 복원 규칙  
- `DELETED` 복구 가능 여부  
- 사건 유형별 예외 흐름 분리 필요성  

---

## 12. 다음 문서 작업 순서

1. **권한정의서** — [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md) (초안 0.1 작성됨). 미확정·구현 대조는 해당 문서 §9·§10 및 §12.  
2. 이후 (Phase 1 나머지)  
   - **질문셋 정의서** — [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) (초안 0.1 작성됨)  
   - **문서 템플릿 정의서** — [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) (초안 0.1 작성됨)  
   - **AI 출력 정책서** — [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md) (초안 0.1 작성됨)  
   - **고지문·면책문구 정의서** — [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md) (초안 0.1 작성됨)  
   - **사건 요약 출력 명세서** — [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) (초안 0.1 작성됨)  
   - **입력·출력 데이터 정의서** — [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) (초안 0.1 작성됨)  
   - **첨부자료 분류 기준서** — [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) (초안 0.1 작성됨)  
   - **DB 상세 설계 초안** — [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md) (초안 0.1 작성됨)  
   - **화면 우선순위표** — [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) (초안 0.1 작성됨)  
   - **API 명세 1차본** — [API_SPEC_V1.md](./API_SPEC_V1.md) (초안 0.1 작성됨)  
   - **정의서 대비 구현 역점검표** — [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) (초안 0.1 작성됨)  
   - **파일별 재정렬 패치 지시서** — [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) (초안 0.1 작성됨)  

---

## 13. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 0.1 초안 | 2026-04-19 | 상태값 정의서 기준 주경로·허용·금지 전이·예외 초안. 후속·§9·§12 에 [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md)·[QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md)·[DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md)·[AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md)·[NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md)·[CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md)·[IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md)·[ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md)·[DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md)·[SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md)·[API_SPEC_V1.md](./API_SPEC_V1.md)·[ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md)·[FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) 연동. |
