# 권한정의서 (초안)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | 초안 0.1 |
| 기준 문서 | [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md), [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) |
| 기준 코드 | `prisma/schema.prisma`, `src/lib/definitions/case-status.ts` |
| 적용 범위 | 사건 상태 전이, 화면 접근, API 수행, 문서 승인·잠금·전달 관련 권한 |
| 후속 점검 | 실제 구현 코드와 역할명·권한 분기 로직 대조 필요 |

본 문서는 **누가 어떤 작업을 할 수 있는지**를 정리한다.  
상태의 의미는 `CASE_STATUS_DEFINITION.md`, 상태 간 허용 전이는 `CASE_LIFECYCLE_DEFINITION.md` 가 기준이며, 본 문서는 **그 전이와 기능을 어떤 역할이 실행 가능한지**를 정의한다.

---

## 1. 목적

이 문서의 목적은 다음과 같다.

1. 역할별 접근 가능 화면을 정의한다.
2. 역할별 수행 가능 API·행위를 정의한다.
3. 상태 전이별 권한 주체를 정의한다.
4. 승인, 전달, 종결, 삭제 같은 민감 작업의 권한을 잠근다.
5. 후속 구현과 문서 간 권한 불일치를 점검할 기준을 만든다.

---

## 2. 역할 기준

현행 기준 역할은 아래를 사용한다.

- `USER`
- `LAWYER`
- `STAFF`
- `ADMIN`
- `SUPER_ADMIN`

### 2-1. 역할 의미(초안)

| 역할 | 의미(초안) |
|------|------------|
| `USER` | 일반 사용자·의뢰인 성격의 계정. 자기 사건 열람 및 제한된 참여만 허용 |
| `LAWYER` | 사건 실무 담당 변호사. 인터뷰 검토, 문서 작성·검토·승인 중심 |
| `STAFF` | 실무 보조 담당자. 사건 등록, 자료 정리, 인터뷰 진행 보조, 문서 작성 보조 |
| `ADMIN` | 운영 관리자. 승인 흐름 관리, 계정·운영 설정, 예외 처리 가능 |
| `SUPER_ADMIN` | 최상위 관리자. 시스템 전역 관리 및 관리자 권한 포함 |

> 실제 역할명이 코드와 다르면 **코드가 우선**이며, 본 문서는 그에 맞춰 수정한다.

---

## 3. 권한 분류

권한은 아래 4갈래로 나눈다.

1. **화면 접근 권한**
2. **API·행위 권한**
3. **상태 전이 권한**
4. **문서·승인·전달 권한**

---

## 4. 화면 접근 권한 (초안)

| 화면·영역 | USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN |
|-----------|------|--------|-------|-------|-------------|
| 로그인·기본 인증 화면 | O | O | O | O | O |
| 사용자용 대시보드·내 사건 보기 | O | O | O | O | O |
| 사건 생성 화면 | △ | O | O | O | O |
| 사건 상세 화면 | 자기 사건만 | O | O | O | O |
| AI 인터뷰 화면 | 자기 참여 범위만 | O | O | O | O |
| 사건 요약 보기 | 자기 사건 제한 | O | O | O | O |
| 문서 생성·편집 화면 | X | O | O(보조) | O | O |
| 문서 승인·잠금 화면 | X | O | X | O | O |
| 질문셋 관리자 | X | X | X | O | O |
| 문서 템플릿 관리자 | X | X | X | O | O |
| 운영·감사·알림 대시보드 | X | 제한적 | 제한적 | O | O |
| 계정·권한 관리 | X | X | X | O | O |

### 표시 규칙

- `O`: 허용  
- `X`: 금지  
- `△`: 제한적 허용 또는 정책 확정 필요  

---

## 5. API·행위 권한 (초안)

| 행위 | USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN |
|------|------|--------|-------|-------|-------------|
| 사건 생성 | △ | O | O | O | O |
| 사건 수정 | 자기 사건 제한 | O | O | O | O |
| 사건 삭제(논리 삭제) | △ | X | X | O | O |
| 인터뷰 시작 | 제한적 | O | O | O | O |
| 인터뷰 응답 저장 | 자기 인터뷰 범위 | O | O | O | O |
| 인터뷰 완료 처리 | X | O | O | O | O |
| 사건 요약 생성 | X | O | O | O | O |
| 문서 초안 생성 | X | O | O(보조) | O | O |
| 문단 재생성 | X | O | O(보조) | O | O |
| 문단 잠금·복원 | X | O | X | O | O |
| 문서 승인 | X | O | X | O | O |
| 문서 전달 처리 | X | O | X | O | O |
| 사건 종결 처리 | X | O(정책 확인 필요) | X | O | O |
| 질문셋 편집 | X | X | X | O | O |
| 템플릿 편집 | X | X | X | O | O |

### 5-1. 논리삭제·API·구현 기준 (R3)

`DELETE /api/cases/:caseId`·`softDeleteCaseService` (`getCaseAccessContext` → `canSoftDeleteCase`)는 **사건 소유자**이거나 **플랫폼 관리자**(`ADMIN`·`SUPER_ADMIN`)인 경우에만 성공한다. 위 표 **USER** 열 `△`는 “**본인 소유** 사건이면 O·**비소유**면 X”로 읽는다. 상세의 **사건 삭제** 노출은 `src/features/cases/case.permissions`의 `canRequestSoftDelete`로 서버와 동일 기준이다. ([SPEC R3-004](./SPEC_IMPLEMENTATION_REAUDIT_ROWS_V1.md#r3--사건-casestatus))

---

## 6. 상태 전이 권한 (초안)

본 절은 [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md) 의 허용 전이를 전제로 하며,  
**허용 전이 자체를 바꾸지 않고 “누가 그 전이를 실행 가능한지”만 정의한다.**

| 전이 | USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN | 비고 |
|------|------|--------|-------|-------|-------------|------|
| `CREATED` → `INTAKE_PENDING` | X | O | O | O | O | 접수 보완 요청 |
| `CREATED` → `IN_INTERVIEW` | X | O | O | O | O | 인터뷰 시작 |
| `CREATED` → `HOLD` | X | O | X | O | O | 예외 중단 |
| `CREATED` → `REJECTED` | X | O | X | O | O | 반려 |
| `CREATED` → `DELETED` | △ | X | X | O | O | `softDelete`: 소유자 또는 관리자 계열 — §5-1 |
| `INTAKE_PENDING` → `IN_INTERVIEW` | X | O | O | O | O | 보완 완료 후 진행 |
| `INTAKE_PENDING` → `HOLD` | X | O | X | O | O | |
| `INTAKE_PENDING` → `REJECTED` | X | O | X | O | O | |
| `IN_INTERVIEW` → `INTERVIEW_DONE` | X | O | O | O | O | 인터뷰 종료 |
| `IN_INTERVIEW` → `HOLD` | X | O | O | O | O | |
| `IN_INTERVIEW` → `REJECTED` | X | O | X | O | O | |
| `INTERVIEW_DONE` → `DRAFTING` | X | O | O | O | O | 문서 작성 시작 |
| `INTERVIEW_DONE` → `HOLD` | X | O | X | O | O | |
| `DRAFTING` → `REVIEW_PENDING` | X | O | O | O | O | 검토 요청 |
| `DRAFTING` → `HOLD` | X | O | X | O | O | |
| `DRAFTING` → `REJECTED` | X | O | X | O | O | |
| `REVIEW_PENDING` → `APPROVED` | X | O | X | O | O | 승인 권한 핵심 |
| `REVIEW_PENDING` → `DRAFTING` | X | O | O | O | O | 수정 재작성 |
| `REVIEW_PENDING` → `REJECTED` | X | O | X | O | O | 반려 |
| `REVIEW_PENDING` → `HOLD` | X | O | X | O | O | |
| `APPROVED` → `DELIVERED` | X | O | X | O | O | 전달 처리 |
| `APPROVED` → `CLOSED` | X | △ | X | O | O | 직접 종결은 정책 확정 필요 |
| `APPROVED` → `HOLD` | X | O | X | O | O | |
| `DELIVERED` → `CLOSED` | X | O | X | O | O | 종결 |
| `DELIVERED` → `HOLD` | X | O | X | O | O | 예외 처리 |
| `HOLD` → 실무 재개 상태 | X | O | O | O | O | 복귀 상태는 운영 정책 참조 |
| `REJECTED` → `CREATED` / `INTAKE_PENDING` | X | O | X | O | O | 재접수 정책 필요 |
| `REJECTED` → `DELETED` | X | X | X | O | O | 관리자 계열 |
| `DELETED` → 복구 | X | X | X | O | O | 복구 정책 확정 필요 |

---

## 7. 문서 권한 (초안)

### 7-1. 문서 생성·편집

| 행위 | USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN |
|------|------|--------|-------|-------|-------------|
| 문서 초안 생성 | X | O | O(보조) | O | O |
| 문단 수정 | X | O | O(보조) | O | O |
| 문단 재생성 | X | O | O(보조) | O | O |
| 문단 순서 조정 | X | O | O | O | O |

### 7-2. 문서 잠금·승인

| 행위 | USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN |
|------|------|--------|-------|-------|-------------|
| 문단 잠금 | X | O | X | O | O |
| 문단 잠금 해제 | X | O | X | O | O |
| 승인 요청 | X | O | O | O | O |
| 문서 승인 | X | O | X | O | O |
| 승인본 잠금 | X | O | X | O | O |
| 승인본 출력 | X | O | X | O | O |

### 7-3. 전달·검증

| 행위 | USER | LAWYER | STAFF | ADMIN | SUPER_ADMIN |
|------|------|--------|-------|-------|-------------|
| 전달 처리 | X | O | X | O | O |
| 검증코드 조회 | 제한 | O | O | O | O |
| 검증 페이지 운영 | X | X | X | O | O |

---

## 8. 민감 권한 (별도 주의)

아래 행위는 민감 권한으로 분류한다.

- 사건 삭제(`DELETED`)
- 문서 승인
- 승인본 잠금·해제
- 전달 완료 처리
- 사건 종결(`CLOSED`)
- 질문셋 관리자 편집
- 문서 템플릿 관리자 편집
- 계정·권한 변경

### 원칙

- `USER` 는 민감 권한을 가지지 않는다.
- `STAFF` 는 문서 작성 보조와 인터뷰 보조 중심이며, 승인·삭제·종결은 원칙적으로 불가
- `LAWYER` 는 사건 실무와 승인 중심 권한
- `ADMIN`, `SUPER_ADMIN` 은 운영·예외 처리 권한 포함

---

## 9. 미확정 항목

아래는 후속 확정 필요 항목이다.

1. `USER` 의 사건 생성 허용 여부  
2. `LAWYER` 의 `APPROVED` → `CLOSED` 직접 수행 허용 여부  
3. `STAFF` 의 인터뷰 완료 처리 범위  
4. `REJECTED` → `CREATED` 재접수 시 승인 필요 여부  
5. `DELETED` 복구 절차의 권한 주체  
6. 질문셋·템플릿 관리자에 `LAWYER` 제한 편집권을 줄지 여부  

---

## 10. 구현 대조 체크포인트

실제 코드와 대조할 때는 아래를 본다.

- 역할 enum·타입이 문서와 일치하는가  
- 사건 상태 전이 API가 역할별로 제한되는가  
- UI 버튼 노출이 역할별로 분기되는가  
- `STAFF` 에게 승인·종결·삭제가 열려 있지 않은가  
- `USER` 가 내부 관리자 화면에 접근하지 못하는가  
- 관리자 도구(질문셋·템플릿·운영 대시보드)가 `ADMIN` 이상으로 잠겨 있는가  

---

## 11. 다음 문서 작업 순서

1. **질문셋 정의서** — [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md) (초안 0.1 작성됨). 미확정은 해당 문서 §16.  
2. **문서 템플릿 정의서** — [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md) (초안 0.1 작성됨). 미확정은 해당 문서 §17.  
3. **AI 출력 정책서** — [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md) (초안 0.1 작성됨). 미확정은 해당 문서 §17.  
4. **고지문·면책문구 정의서** — [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md) (초안 0.1 작성됨). 미확정은 해당 문서 §15.  
5. **사건 요약 출력 명세서** — [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) (초안 0.1 작성됨). 미확정은 해당 문서 §17.  
6. **입력·출력 데이터 정의서** — [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md) (초안 0.1 작성됨). 미확정은 해당 문서 §20.  
7. **첨부자료 분류 기준서** — [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) (초안 0.1 작성됨). 미확정은 해당 문서 §18.  
8. **DB 상세 설계 초안** — [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md) (초안 0.1 작성됨). 미확정은 해당 문서 §17.  
9. **화면 우선순위표** — [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) (초안 0.1 작성됨). 미확정은 해당 문서 §10.  
10. **API 명세 1차본** — [API_SPEC_V1.md](./API_SPEC_V1.md) (초안 0.1 작성됨). 미확정은 해당 문서 §22.  
11. **정의서 대비 구현 역점검표** — [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) (초안 0.1 작성됨). 미확정은 역점검 실제 판정으로 닫음.  
12. **파일별 재정렬 패치 지시서** — [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) (초안 0.1 작성됨).  
13. 이후 상태·권한·질문셋·템플릿·AI 출력·고지문·사건 요약·입출력·첨부·DB·화면·API·역점검·패치 간 불일치 역점검

---

## 12. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 0.1 초안 | 2026-04-19 | 라이프사이클 기준 역할별 화면·API·상태 전이·문서 권한 초안. §11 에 [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md)·[DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md)·[AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md)·[NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md)·[CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md)·[IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md)·[ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md)·[DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md)·[SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md)·[API_SPEC_V1.md](./API_SPEC_V1.md)·[ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md)·[FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) 연동. |
