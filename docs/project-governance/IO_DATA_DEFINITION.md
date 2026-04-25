# 입력·출력 데이터 정의서 (초안)

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | 초안 0.1 |
| 기준 문서 | [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md), [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md), [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md), [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md), [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md), [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md), [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md), [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) |
| 적용 범위 | 사건 생성 입력, 인터뷰 입력·출력, 사건 요약 출력, 문서 생성·재생성·승인 입력·출력, 상태 전이 입력·출력 |
| 후속 문서 | [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md)(초안 0.1), [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md)(초안 0.1), [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md)(초안 0.1), [API_SPEC_V1.md](./API_SPEC_V1.md)(초안 0.1), [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md)(초안 0.1), [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md)(초안 0.1) |

본 문서는 AI법친의 주요 기능에서 오가는 **입력(input)** 과 **출력(output)** 데이터 구조를 정의한다.

이 문서는 단순 API 예시가 아니라 아래를 고정하기 위한 기준 문서다.

- 어떤 기능이 어떤 입력을 받는지  
- 어떤 출력 구조를 반환하는지  
- 상태값, 권한, 질문셋, 템플릿과 어떻게 연결되는지  
- 필수 입력과 선택 입력을 어떻게 구분하는지  
- 이후 API 명세와 DB 설계가 어떤 필드 체계를 따라야 하는지  

---

## 1. 목적

이 문서의 목적은 다음과 같다.

1. 핵심 기능의 입력·출력 구조를 표준화한다.  
2. 화면, API, DB가 같은 필드 체계를 사용하게 한다.  
3. 상태값·질문셋·문서 생성 흐름 간 데이터 연결 기준을 만든다.  
4. 필수·선택 필드와 검증 포인트를 정의한다.  
5. 이후 API 명세와 실제 구현 비교의 기준이 된다.  

---

## 2. 기본 원칙

### 2-1. 코드 기준 우선

실제 enum·타입·필드명이 코드와 다르면 **코드가 우선**이며, 본 문서는 그에 맞춰 수정한다.

### 2-2. 상태값은 현행 `CaseStatus`만 사용

상태 필드는 반드시 현행 상태값만 사용한다.

### 2-3. 질문 키와 템플릿 키는 안정적이어야 한다

질문셋의 `key`, 문단의 `mappingSources`, 출력 필드의 참조 키는 쉽게 바뀌지 않아야 한다.

### 2-4. 입력과 출력은 다를 수 있다

입력 필드는 저장·처리 중심, 출력 필드는 UI·사용자 노출 중심으로 다를 수 있다.

### 2-5. 승인 전·후 출력은 구분한다

동일 문서나 요약이라도 승인 전과 승인 후 출력 구조 차이가 있을 수 있다.

---

## 3. 데이터 범주

AI법친의 입력·출력은 아래 7개 범주로 나눈다.

1. 사건 생성·수정  
2. 인터뷰 세션·질문 응답  
3. 사건 요약  
4. 문서 생성·조회  
5. 문단 재생성·잠금·복원  
6. 상태 전이·승인·전달  
7. 관리자용 질문셋·템플릿 관리  

---

## 4. 사건 생성 입력·출력

### 4-1. 사건 생성 입력

| 필드 | 타입(개념) | 필수 | 설명 |
|------|-------------|------|------|
| `caseTitle` | string | 예 | 사건 제목 |
| `caseType` | string | 예 | 사건 유형 |
| `clientName` | string | 아니오 | 의뢰인 이름 |
| `clientContact` | string | 아니오 | 연락처 |
| `summary` | string | 아니오 | 초기 사건 개요 |
| `assignedLawyerId` | string | 아니오 | 담당 변호사 |
| `assignedStaffId` | string | 아니오 | 담당 실무자 |
| `priority` | string | 아니오 | 우선순위 |
| `initialStatus` | CaseStatus | 아니오 | 기본값은 정책상 `CREATED` |
| `tags` | string[] | 아니오 | 분류 태그 |

**생성 원칙**

- `initialStatus` 가 비어 있으면 기본 상태는 `CREATED`  
- 권한 없는 사용자는 임의 상태로 생성 불가  
- 사건 생성 시 필수 필드 누락 여부를 먼저 검사  

### 4-2. 사건 생성 출력

| 필드 | 설명 |
|------|------|
| `caseId` | 생성된 사건 ID |
| `caseTitle` | 사건 제목 |
| `caseType` | 사건 유형 |
| `status` | 현재 상태 |
| `createdAt` | 생성 시각 |
| `createdBy` | 생성자 |
| `assignedLawyer` | 담당 변호사 정보 요약 |
| `assignedStaff` | 담당 실무자 정보 요약 |

---

## 5. 사건 수정 입력·출력

### 5-1. 사건 수정 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `caseId` | 예 | 사건 ID |
| `caseTitle` | 아니오 | 제목 수정 |
| `summary` | 아니오 | 개요 수정 |
| `assignedLawyerId` | 아니오 | 담당 변호사 변경 |
| `assignedStaffId` | 아니오 | 담당 실무자 변경 |
| `priority` | 아니오 | 우선순위 수정 |
| `tags` | 아니오 | 태그 수정 |

### 5-2. 사건 수정 출력

- 수정된 사건 메타 정보  
- 변경 후 상태  
- `updatedAt`  
- `updatedBy`  

---

## 6. 인터뷰 세션 입력·출력

### 6-1. 인터뷰 시작 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `caseId` | 예 | 사건 ID |
| `questionSetId` | 예 | 연결할 질문셋 |
| `questionSetVersion` | 아니오 | 특정 버전 지정 |
| `startedBy` | 아니오 | 시작 사용자·담당자 |

### 6-2. 인터뷰 시작 출력

| 필드 | 설명 |
|------|------|
| `interviewSessionId` | 인터뷰 세션 ID |
| `caseId` | 사건 ID |
| `questionSetId` | 질문셋 ID |
| `questionSetVersion` | 적용 버전 |
| `status` | 인터뷰 상태 |
| `startedAt` | 시작 시각 |

---

## 7. 질문 응답 입력·출력

### 7-1. 질문 응답 저장 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `interviewSessionId` | 예 | 인터뷰 세션 ID |
| `questionKey` | 예 | 질문 저장 키 |
| `value` | 예 | 답변 값 |
| `answeredBy` | 아니오 | 답변자 |
| `sectionId` | 아니오 | 섹션 식별 |
| `questionId` | 아니오 | 질문 ID |

**입력 원칙**

- `questionKey` 는 질문셋 정의서 기준과 일치해야 한다.  
- 분기상 숨겨진 질문은 입력 대상에서 제외 가능  
- 첨부형 답변은 첨부자료 분류 기준서와 연결  

### 7-2. 질문 응답 저장 출력

| 필드 | 설명 |
|------|------|
| `answerId` | 답변 ID |
| `interviewSessionId` | 세션 ID |
| `questionKey` | 질문 키 |
| `storedValue` | 저장된 값 |
| `answeredAt` | 저장 시각 |
| `isValid` | 기본 검증 통과 여부 |

---

## 8. 인터뷰 완료 입력·출력

### 8-1. 인터뷰 완료 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `interviewSessionId` | 예 | 인터뷰 세션 ID |
| `completedBy` | 예 | 완료 처리 사용자 |
| `completionNote` | 아니오 | 완료 메모 |

### 8-2. 인터뷰 완료 출력

| 필드 | 설명 |
|------|------|
| `interviewSessionId` | 인터뷰 세션 ID |
| `interviewStatus` | 인터뷰 완료 상태 |
| `caseStatus` | 사건 상태(예: `INTERVIEW_DONE`) |
| `completedAt` | 완료 시각 |
| `completionSummary` | 완료 요약 |
| `missingRequiredFields` | 누락 필수 입력 목록 |

**완료 원칙**

- 필수 질문이 모두 답변되었는지 확인  
- 분기 질문 포함 여부를 반영  
- 누락 필드가 있으면 완료 거부 또는 경고  

---

## 9. 사건 요약 입력·출력

### 9-1. 사건 요약 생성 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `caseId` | 예 | 사건 ID |
| `summaryType` | 예 | 요약 유형 |
| `audience` | 예 | 내부·외부 대상 |
| `includeMissingInfo` | 아니오 | 누락 정보 포함 여부 |
| `generatedBy` | 아니오 | 생성 주체 |

### 9-2. 사건 요약 출력

| 필드 | 설명 |
|------|------|
| `summaryId` | 요약 ID |
| `caseId` | 사건 ID |
| `summaryType` | 요약 유형 |
| `audience` | 노출 대상 |
| `statusSnapshot` | 생성 시점 사건 상태 |
| `sections` | 요약 섹션 목록 |
| `noticePolicy` | 적용 고지 정책 |
| `generatedAt` | 생성 시각 |

**`sections` 예시 구조**

- `caseOverview`  
- `factSummary`  
- `issueSummary`  
- `statusSummary`  
- `nextStep`  
- `riskOrMissingInfo`  

---

## 10. 문서 생성 입력·출력

### 10-1. 문서 생성 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `caseId` | 예 | 사건 ID |
| `templateId` | 예 | 문서 템플릿 ID |
| `templateVersion` | 아니오 | 특정 버전 지정 |
| `documentType` | 예 | 문서 유형 |
| `generatedBy` | 아니오 | 생성 사용자 |
| `sourceSummaryId` | 아니오 | 사건 요약 참조 ID |
| `sourceInterviewSessionId` | 아니오 | 인터뷰 세션 참조 ID |

**생성 원칙**

- 사건 상태가 생성 가능 구간이어야 한다.  
- 템플릿이 활성화되어 있어야 한다.  
- 권한정의서 기준 생성 권한이 있어야 한다.  

### 10-2. 문서 생성 출력

| 필드 | 설명 |
|------|------|
| `documentId` | 문서 ID |
| `caseId` | 사건 ID |
| `templateId` | 사용 템플릿 ID |
| `templateVersion` | 템플릿 버전 |
| `documentType` | 문서 유형 |
| `documentStatus` | 문서 상태 |
| `paragraphs` | 문단 목록 |
| `generatedAt` | 생성 시각 |
| `generatedBy` | 생성 주체 |

---

## 11. 문서 조회 출력

문서 상세 조회 시 최소 아래 구조를 포함한다.

| 필드 | 설명 |
|------|------|
| `documentId` | 문서 ID |
| `caseId` | 사건 ID |
| `title` | 문서 제목 |
| `documentType` | 문서 유형 |
| `documentStatus` | 문서 상태 |
| `paragraphs` | 문단 목록 |
| `approvalInfo` | 승인 정보 |
| `versionInfo` | 버전 정보 |
| `outputPolicy` | 출력 정책 요약 |

### 문단 목록 구조 예시

| 필드 | 설명 |
|------|------|
| `paragraphId` | 문단 ID |
| `paragraphKey` | 문단 키 |
| `title` | 문단 제목 |
| `content` | 문단 내용 |
| `status` | 문단 상태 |
| `isLocked` | 잠금 여부 |
| `generationMode` | 생성 방식 |
| `lastGeneratedAt` | 마지막 생성 시각 |

---

## 12. 문단 재생성 입력·출력

### 12-1. 문단 재생성 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `documentId` | 예 | 문서 ID |
| `paragraphId` | 예 | 대상 문단 ID |
| `regenerateReason` | 아니오 | 재생성 사유 |
| `requestedBy` | 예 | 요청 사용자 |
| `mode` | 아니오 | 재생성 방식(간결화·정식화 등) |

### 12-2. 문단 재생성 출력

| 필드 | 설명 |
|------|------|
| `documentId` | 문서 ID |
| `paragraphId` | 대상 문단 ID |
| `previousContent` | 이전 본문 |
| `newContent` | 새 본문 |
| `diffSummary` | 변경 요약 |
| `generatedAt` | 재생성 시각 |
| `generatedBy` | 요청자 |
| `canApply` | 적용 가능 여부 |

---

## 13. 문단 잠금·해제 입력·출력

### 13-1. 문단 잠금 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `documentId` | 예 | 문서 ID |
| `paragraphId` | 예 | 문단 ID |
| `lockedBy` | 예 | 잠금 사용자 |
| `lockReason` | 아니오 | 잠금 사유 |

### 13-2. 문단 잠금 출력

- `documentId`  
- `paragraphId`  
- `isLocked`  
- `lockedAt`  
- `lockedBy`  
- `lockReason`  

### 13-3. 문단 잠금 해제 입력

- `documentId`  
- `paragraphId`  
- `unlockedBy`  
- `unlockReason`  

---

## 14. 문서 승인 입력·출력

### 14-1. 문서 승인 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `documentId` | 예 | 문서 ID |
| `approvedBy` | 예 | 승인 사용자 |
| `approvalNote` | 아니오 | 승인 메모 |
| `lockApprovedVersion` | 아니오 | 승인본 잠금 여부 |

### 14-2. 문서 승인 출력

| 필드 | 설명 |
|------|------|
| `documentId` | 문서 ID |
| `documentStatus` | 승인 후 상태 |
| `approvedAt` | 승인 시각 |
| `approvedBy` | 승인자 |
| `approvedVersionId` | 승인 버전 ID |
| `isLocked` | 승인본 잠금 여부 |

---

## 15. 전달 처리 입력·출력

### 15-1. 전달 처리 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `documentId` | 예 | 문서 ID |
| `deliveredBy` | 예 | 전달 처리 사용자 |
| `deliveryChannel` | 아니오 | 이메일·출력물·직접전달 등 |
| `deliveryNote` | 아니오 | 전달 메모 |

### 15-2. 전달 처리 출력

| 필드 | 설명 |
|------|------|
| `documentId` | 문서 ID |
| `caseStatus` | 전달 후 사건 상태 |
| `deliveredAt` | 전달 시각 |
| `deliveredBy` | 전달 처리자 |
| `deliveryChannel` | 전달 채널 |

---

## 16. 상태 전이 입력·출력

### 16-1. 상태 전이 입력

| 필드 | 필수 | 설명 |
|------|------|------|
| `caseId` | 예 | 사건 ID |
| `fromStatus` | 예 | 기존 상태 |
| `toStatus` | 예 | 변경 상태 |
| `changedBy` | 예 | 변경 사용자 |
| `reason` | 아니오 | 변경 사유 |

### 16-2. 상태 전이 출력

| 필드 | 설명 |
|------|------|
| `caseId` | 사건 ID |
| `previousStatus` | 이전 상태 |
| `currentStatus` | 현재 상태 |
| `changedAt` | 변경 시각 |
| `changedBy` | 변경 사용자 |
| `timelineEventId` | 상태 전이 이력 참조 |

**전이 원칙**

- 허용 전이는 라이프사이클 정의서 기준  
- 권한 검사는 권한정의서 기준  
- 금지 전이는 입력 수락 전에 차단  

---

## 17. 질문셋 관리자 입력·출력

### 17-1. 질문셋 생성·수정 입력

| 필드 | 설명 |
|------|------|
| `questionSetId` | 수정 시 필요 |
| `name` | 질문셋 이름 |
| `version` | 버전 |
| `caseType` | 사건 유형 |
| `description` | 설명 |
| `sections` | 섹션 구조 |
| `isActive` | 활성 여부 |

### 17-2. 질문셋 관리자 출력

- `questionSetId`  
- `name`  
- `version`  
- `status`  
- `caseType`  
- `sections`  
- `publishedAt`  

---

## 18. 템플릿 관리자 입력·출력

### 18-1. 템플릿 생성·수정 입력

| 필드 | 설명 |
|------|------|
| `templateId` | 수정 시 필요 |
| `name` | 템플릿명 |
| `documentType` | 문서 유형 |
| `version` | 버전 |
| `sections` | 템플릿 섹션 |
| `isActive` | 활성 여부 |

### 18-2. 템플릿 관리자 출력

- `templateId`  
- `name`  
- `documentType`  
- `version`  
- `sections`  
- `publishedAt`  

---

## 19. 공통 메타 필드

주요 출력 구조는 아래 공통 메타 필드를 가질 수 있다.

| 필드 | 설명 |
|------|------|
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |
| `createdBy` | 생성자 |
| `updatedBy` | 수정자 |
| `version` | 버전 |
| `status` | 상태 |
| `noticePolicy` | 고지 정책 식별 |
| `auditRef` | 감사로그 참조 |

---

## 20. 미확정 항목

아래는 후속 확정이 필요하다.

1. 실제 코드의 DTO·스키마 필드명과 문서 필드명 차이  
2. 첨부형 답변의 저장 구조([ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) 와 정합)  
3. 문단 diff 구조 상세  
4. 승인본 출력 응답 구조  
5. 요약·문서·문단 버전 저장 필드 표준화  
6. 외부 공개용 출력 구조 분리 여부  

---

## 21. 구현 대조 체크포인트

구현과 대조할 때는 아래를 본다.

- 입력 필드가 화면·UI와 일치하는가  
- 출력 필드가 실제 컴포넌트 요구사항과 맞는가  
- 상태 전이 입력이 라이프사이클 정의서와 충돌하지 않는가  
- 문서·문단 구조가 템플릿 정의서와 맞는가  
- 질문 응답 구조가 질문셋 정의서와 맞는가  
- 승인 전·후 출력 구조가 구분되는가  

---

## 22. 다음 문서 작업 순서

1. **첨부자료 분류 기준서** — [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) (초안 0.1 작성됨).  
2. **DB 상세 설계 초안** — [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md) (초안 0.1 작성됨).  
3. **화면 우선순위표** — [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) (초안 0.1 작성됨).  
4. **API 명세 1차본** — [API_SPEC_V1.md](./API_SPEC_V1.md) (초안 0.1 작성됨).  
5. **정의서 대비 구현 역점검표** — [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) (초안 0.1 작성됨).  
6. **파일별 재정렬 패치 지시서** — [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) (초안 0.1 작성됨).  
7. **이후**  
   - 실제 코드 패치 적용 및 [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 기록  

---

## 23. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 0.1 (연동) | 2026-04-19 | 후속 문서·§20·§22에 [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md)·[DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md)·[SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md)·[API_SPEC_V1.md](./API_SPEC_V1.md)·[ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md)·[FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) 초안 0.1 링크 반영. |
| 0.1 초안 | 2026-04-19 | 사건, 인터뷰, 요약, 문서, 문단, 승인, 상태 전이, 관리자 입력·출력 구조 초안 작성 |
