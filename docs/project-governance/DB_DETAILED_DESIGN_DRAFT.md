# DB 상세 설계 초안

## 문서 정보

| 항목 | 내용 |
|------|------|
| 버전 | 초안 0.1 |
| 기준 문서 | [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md), [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md), [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md), [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md), [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md), [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md), [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md), [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md), [ATTACHMENT_CLASSIFICATION_GUIDELINE.md](./ATTACHMENT_CLASSIFICATION_GUIDELINE.md) |
| 적용 범위 | 사용자·권한, 사건, 인터뷰, 질문셋, 답변, 요약, 문서, 문단, 승인, 첨부, 감사로그, 검증코드, 관리자 운영 데이터 |
| 후속 문서 | [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md)(초안 0.1), [API_SPEC_V1.md](./API_SPEC_V1.md)(초안 0.1), [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md)(초안 0.1), [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md)(초안 0.1) |

본 문서는 AI법친의 주요 도메인을 DB 관점에서 정리한 **상세 설계 초안**이다.

이 문서는 실제 Prisma·PostgreSQL 구현과 1:1로 고정된 최종 스키마가 아니라,  
현재까지 잠근 정의서들을 기준으로 **핵심 엔터티, 관계, 필수 필드, 상태값, 버전 구조**를 정리하는 문서다.

---

## 1. 목적

이 문서의 목적은 다음과 같다.

1. 핵심 엔터티를 도메인별로 정리한다.  
2. 각 엔터티 간 관계를 명확히 한다.  
3. 상태값과 버전 구조가 어디에 걸리는지 정의한다.  
4. 질문셋 → 인터뷰 → 요약 → 문서 → 승인·출력의 연결 구조를 고정한다.  
5. 이후 Prisma 스키마·마이그레이션·API 명세와 대조할 기준을 만든다.  

---

## 2. 설계 원칙

### 2-1. 상태 이름은 단일 기준만 사용

사건 상태는 반드시 현행 `CaseStatus` 기준만 사용한다.

### 2-2. 질문셋·템플릿은 버전 관리 대상이다

질문셋과 문서 템플릿은 덮어쓰기보다 버전 증가를 우선한다.

### 2-3. 문서는 문단 단위 영속화를 기본으로 본다

문서 전체 `body`만 저장하는 방식보다, 문단 단위 구조 저장을 우선 기준으로 본다.

### 2-4. 승인 전과 승인 후는 별도 추적이 가능해야 한다

승인본, 승인 시점 버전, 검증코드는 추적 가능해야 한다.

### 2-5. 감사 가능성이 있어야 한다

상태 전이, 승인, 잠금, 전달, 관리자 변경은 감사로그로 추적할 수 있어야 한다.

---

## 3. 핵심 도메인 묶음

DB는 아래 10개 묶음으로 본다.

1. 사용자·권한  
2. 사건  
3. 인터뷰·질문셋  
4. 질문 응답  
5. 사건 요약  
6. 문서·문단·버전  
7. 승인·전달·검증  
8. 첨부자료  
9. 감사로그·이력  
10. 관리자 운영·설정  

---

## 4. 사용자·권한 도메인

### 4-1. `users`

사용자 기본 정보.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `email` | 로그인 계정 |
| `passwordHash` | 비밀번호 해시 |
| `name` | 사용자명 |
| `role` | 역할(`USER`, `LAWYER`, `STAFF`, `ADMIN`, `SUPER_ADMIN`) |
| `phone` | 연락처 |
| `isActive` | 활성 여부 |
| `approvedAt` | 승인 시각 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

**설명**

- 인증과 권한의 기본 엔터티  
- 역할은 권한정의서와 연결  
- `LAWYER`, `STAFF`, `ADMIN` 계열은 승인 워크플로우 필요 가능  

### 4-2. `user_profiles` (선택)

사용자 상세 프로필.

| 필드 | 설명 |
|------|------|
| `userId` | FK → `users.id` |
| `organizationName` | 소속 |
| `department` | 부서 |
| `position` | 직책 |
| `metadataJson` | 기타 확장 정보 |

---

## 5. 사건 도메인

### 5-1. `cases`

사건의 최상위 엔터티.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `caseNumber` | 사건 관리 번호 |
| `title` | 사건 제목 |
| `caseType` | 사건 유형 |
| `summary` | 초기 개요 |
| `status` | `CaseStatus` |
| `priority` | 우선순위 |
| `clientUserId` | FK → `users.id` |
| `assignedLawyerId` | FK → `users.id` |
| `assignedStaffId` | FK → `users.id` |
| `createdById` | FK → `users.id` |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |
| `deletedAt` | 논리 삭제 시각(선택) |

**설명**

- 사건 상태의 기준 테이블  
- 배정, 인터뷰, 문서, 첨부, 감사로그의 중심  

### 5-2. `case_participants` (선택)

사건 참여자 연결.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `caseId` | FK |
| `userId` | FK |
| `participantRole` | 의뢰인·담당·보조·검토자 등 |
| `createdAt` | 생성 시각 |

**설명**

- 복수 담당자 구조 필요 시 사용  
- `assignedLawyerId`, `assignedStaffId` 를 보조하거나 대체 가능  

### 5-3. `case_status_history`

사건 상태 전이 이력.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `caseId` | FK |
| `fromStatus` | 이전 상태 |
| `toStatus` | 변경 상태 |
| `changedById` | FK → `users.id` |
| `reason` | 변경 사유 |
| `createdAt` | 변경 시각 |

**설명**

- 라이프사이클 정의서와 연결  
- 상태 전이 감사의 핵심  

---

## 6. 질문셋 도메인

### 6-1. `question_sets`

질문셋 상위 엔터티.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `name` | 질문셋 이름 |
| `caseType` | 연결 사건 유형 |
| `version` | 버전 |
| `status` | `draft` / `published` / `archived` |
| `description` | 설명 |
| `isActive` | 활성 여부 |
| `createdById` | FK |
| `updatedById` | FK |
| `publishedAt` | 배포 시각 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

### 6-2. `question_set_sections`

질문셋 섹션.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `questionSetId` | FK |
| `title` | 섹션 제목 |
| `description` | 설명 |
| `sortOrder` | 순서 |
| `isRequired` | 필수 여부 |

### 6-3. `question_set_questions`

질문 정의.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `questionSetId` | FK |
| `sectionId` | FK |
| `questionKey` | 안정적 저장 키 |
| `label` | 질문 문구 |
| `helpText` | 도움말 |
| `type` | 질문 유형 |
| `isRequired` | 필수 여부 |
| `sortOrder` | 순서 |
| `placeholder` | 입력 예시 |
| `validationRuleJson` | 검증 규칙 |
| `visibilityRuleJson` | 노출 규칙 |
| `branchRuleJson` | 분기 규칙 |
| `mappingTargetsJson` | 문단 매핑 대상 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

### 6-4. `question_options` (선택)

선택형 질문 옵션.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `questionId` | FK |
| `value` | 실제 값 |
| `label` | 표시명 |
| `sortOrder` | 순서 |

---

## 7. 인터뷰 도메인

### 7-1. `interview_sessions`

사건별 인터뷰 세션.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `caseId` | FK |
| `questionSetId` | FK |
| `questionSetVersion` | 질문셋 버전 스냅샷 |
| `status` | 인터뷰 상태 |
| `startedById` | FK |
| `completedById` | FK |
| `startedAt` | 시작 시각 |
| `completedAt` | 완료 시각 |
| `completionNote` | 완료 메모 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

**설명**

- 사건과 질문셋의 실행 시점 연결 엔터티  
- `INTERVIEW_DONE` 판정과 연결  

### 7-2. `interview_answers`

질문 응답 저장.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `interviewSessionId` | FK |
| `caseId` | FK |
| `questionId` | FK |
| `questionKey` | 저장 키 |
| `valueJson` | 답변 값 |
| `answeredById` | FK |
| `answeredAt` | 답변 시각 |
| `version` | 질문셋 버전 참조 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

**설명**

- 질문 문구가 바뀌어도 `questionKey` 기반 재구성 가능해야 함  
- 첨부형 답변은 첨부 테이블과 연결 가능  

---

## 8. 사건 요약 도메인

### 8-1. `case_summaries`

사건 요약 상위 엔터티.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `caseId` | FK |
| `interviewSessionId` | FK(선택) |
| `summaryType` | 요약 유형 |
| `audience` | 내부·외부 대상 |
| `statusSnapshot` | 생성 시점 사건 상태 |
| `version` | 요약 버전 |
| `isApprovedSnapshot` | 승인 기준 여부 |
| `noticePolicyKey` | 적용 고지 정책 |
| `generatedByType` | AI / USER / SYSTEM |
| `generatedById` | FK(선택) |
| `generatedAt` | 생성 시각 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

### 8-2. `case_summary_sections`

요약 섹션 저장.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `summaryId` | FK |
| `sectionKey` | `case_overview` 등 |
| `title` | 섹션 제목 |
| `content` | 섹션 내용 |
| `sortOrder` | 순서 |
| `isVisible` | 노출 여부 |

---

## 9. 문서 템플릿 도메인

### 9-1. `document_templates`

문서 템플릿 상위 엔터티.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `name` | 템플릿명 |
| `documentType` | 문서 유형 |
| `version` | 버전 |
| `status` | `draft` / `published` / `archived` |
| `description` | 설명 |
| `isActive` | 활성 여부 |
| `createdById` | FK |
| `updatedById` | FK |
| `publishedAt` | 배포 시각 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

### 9-2. `document_template_sections`

템플릿 섹션.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `templateId` | FK |
| `title` | 섹션 제목 |
| `description` | 설명 |
| `sortOrder` | 순서 |
| `isRequired` | 필수 여부 |

### 9-3. `document_template_paragraphs`

템플릿 문단 정의.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `templateId` | FK |
| `sectionId` | FK |
| `paragraphKey` | 안정적 문단 키 |
| `title` | 문단 제목 |
| `description` | 설명 |
| `sortOrder` | 순서 |
| `isRequired` | 필수 여부 |
| `generationMode` | 생성 방식 |
| `mappingSourcesJson` | 질문 입력 키 |
| `policyTagsJson` | 정책 태그 |
| `isEditable` | 수정 가능 여부 |
| `isLockable` | 잠금 가능 여부 |

---

## 10. 문서·문단·버전 도메인

### 10-1. `documents`

사건별 생성 문서 상위 엔터티.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `caseId` | FK |
| `templateId` | FK |
| `templateVersion` | 생성 시점 템플릿 버전 |
| `interviewSessionId` | FK(선택) |
| `summaryId` | FK(선택) |
| `title` | 문서 제목 |
| `documentType` | 문서 유형 |
| `status` | 문서 상태 |
| `generatedByType` | AI / USER / SYSTEM |
| `generatedById` | FK(선택) |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

### 10-2. `document_paragraphs`

문서 문단 영속화.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `documentId` | FK |
| `templateParagraphId` | FK(선택) |
| `paragraphKey` | 문단 키 |
| `title` | 제목 |
| `content` | 현재 본문 |
| `sortOrder` | 순서 |
| `status` | 문단 상태 |
| `generationMode` | 생성 방식 |
| `isLocked` | 잠금 여부 |
| `lockedAt` | 잠금 시각 |
| `lockedById` | FK |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

**설명**

- 현재 구현 방향과 가장 중요한 정렬 포인트  
- 문단 단위 재생성·복원·승인과 직접 연결  

### 10-3. `document_paragraph_versions`

문단 버전 이력.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `documentParagraphId` | FK |
| `versionNo` | 버전 번호 |
| `content` | 버전 본문 |
| `diffSummary` | 변경 요약 |
| `generatedByType` | AI / USER / SYSTEM |
| `generatedById` | FK |
| `reason` | 재생성·수정 사유 |
| `createdAt` | 생성 시각 |

### 10-4. `document_versions`

문서 단위 버전 스냅샷.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `documentId` | FK |
| `versionNo` | 버전 번호 |
| `snapshotJson` | 문서 전체 스냅샷 |
| `createdById` | FK |
| `createdAt` | 생성 시각 |

---

## 11. 승인·전달·검증 도메인

### 11-1. `document_approvals`

문서 승인 이력.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `documentId` | FK |
| `approvedVersionId` | FK → `document_versions.id` |
| `approvedById` | FK |
| `approvalNote` | 메모 |
| `isLocked` | 승인본 잠금 여부 |
| `approvedAt` | 승인 시각 |

### 11-2. `document_deliveries`

전달 이력.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `documentId` | FK |
| `deliveredById` | FK |
| `deliveryChannel` | 전달 채널 |
| `deliveryNote` | 메모 |
| `deliveredAt` | 전달 시각 |

### 11-3. `document_verifications`

검증코드·진위 확인 정보.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `documentId` | FK |
| `approvalId` | FK |
| `verificationCode` | 검증 코드 |
| `qrPayload` | QR 데이터(선택) |
| `createdAt` | 생성 시각 |
| `expiresAt` | 만료 시각(선택) |

---

## 12. 첨부자료 도메인

### 12-1. `attachments`

첨부자료 상위 엔터티.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `caseId` | FK |
| `interviewSessionId` | FK(선택) |
| `fileName` | 파일명 |
| `storagePath` | 저장 경로 |
| `mimeType` | MIME 타입 |
| `fileSize` | 크기 |
| `categoryCode` | 분류 코드 |
| `subType` | 세부 유형 |
| `uploadedById` | FK |
| `isRequired` | 필수 여부 |
| `isSensitive` | 민감 여부 |
| `isInternalOnly` | 내부 전용 여부 |
| `canExposeToClient` | 외부 노출 가능 여부 |
| `status` | 첨부 처리 상태 |
| `uploadedAt` | 업로드 시각 |
| `createdAt` | 생성 시각 |
| `updatedAt` | 수정 시각 |

### 12-2. `attachment_links`

질문·요약·문단과의 연결.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `attachmentId` | FK |
| `linkType` | QUESTION / SUMMARY / PARAGRAPH |
| `questionKey` | 질문 연결 키 |
| `summarySectionKey` | 요약 섹션 키 |
| `paragraphKey` | 문단 키 |
| `createdAt` | 생성 시각 |

---

## 13. 감사로그·이력 도메인

### 13-1. `audit_logs`

공통 감사로그.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `actorUserId` | FK |
| `entityType` | CASE / DOCUMENT / QUESTION_SET 등 |
| `entityId` | 엔터티 ID |
| `action` | 행위명 |
| `payloadJson` | 상세 데이터 |
| `createdAt` | 시각 |

**설명**

- 상태 전이, 승인, 삭제, 잠금, 템플릿 수정, 질문셋 배포 등 공통 기록  

### 13-2. `timeline_events`

사건 상세 타임라인용 이벤트.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `caseId` | FK |
| `eventType` | 상태변경·메모·첨부·승인 등 |
| `message` | 표시 메시지 |
| `actorUserId` | FK |
| `relatedEntityType` | 관련 엔터티 타입 |
| `relatedEntityId` | 관련 엔터티 ID |
| `createdAt` | 시각 |

---

## 14. 관리자 운영·설정 도메인

### 14-1. `system_settings` (선택)

전역 설정.

| 필드 | 설명 |
|------|------|
| `key` | 설정 키 |
| `valueJson` | 설정 값 |
| `updatedById` | 수정 사용자 |
| `updatedAt` | 수정 시각 |

### 14-2. `notifications` (선택)

알림함 데이터.

| 필드 | 설명 |
|------|------|
| `id` | PK |
| `userId` | FK |
| `type` | 알림 유형 |
| `title` | 제목 |
| `body` | 본문 |
| `isRead` | 읽음 여부 |
| `relatedEntityType` | 관련 엔터티 타입 |
| `relatedEntityId` | 관련 엔터티 ID |
| `createdAt` | 생성 시각 |

---

## 15. 핵심 관계 요약

### 사건 중심 관계

- `cases` 1 : N `interview_sessions`  
- `cases` 1 : N `case_summaries`  
- `cases` 1 : N `documents`  
- `cases` 1 : N `attachments`  
- `cases` 1 : N `case_status_history`  
- `cases` 1 : N `timeline_events`  

### 질문셋·인터뷰 관계

- `question_sets` 1 : N `question_set_sections`  
- `question_sets` 1 : N `question_set_questions`  
- `interview_sessions` 1 : N `interview_answers`  

### 문서 관계

- `document_templates` 1 : N `document_template_sections`  
- `document_templates` 1 : N `document_template_paragraphs`  
- `documents` 1 : N `document_paragraphs`  
- `document_paragraphs` 1 : N `document_paragraph_versions`  
- `documents` 1 : N `document_versions`  
- `documents` 1 : N `document_approvals`  
- `documents` 1 : N `document_deliveries`  
- `documents` 1 : N `document_verifications`  

---

## 16. 인덱스·조회 고려사항 (초안)

우선 고려할 인덱스 예시.

- `cases(status, assignedLawyerId, updatedAt)`  
- `interview_answers(interviewSessionId, questionKey)`  
- `documents(caseId, status, createdAt)`  
- `document_paragraphs(documentId, paragraphKey, sortOrder)`  
- `attachments(caseId, categoryCode, uploadedAt)`  
- `audit_logs(entityType, entityId, createdAt)`  
- `timeline_events(caseId, createdAt)`  

---

## 17. 미확정 항목

아래는 후속 확정 필요 항목이다.

1. 실제 Prisma 모델명과 문서 명칭 정렬  
2. 인터뷰 상태 별도 enum 구조  
3. 문서·문단 상태 enum 구조 상세  
4. 요약 버전 저장 필요 수준  
5. 첨부 링크 다형성 구조(`attachment_links`) 실제 구현 방식  
6. 승인본 잠금 이후 수정 허용 범위  
7. 질문셋·템플릿 관리자 draft-published 전환 이력 분리 여부  

---

## 18. 구현 대조 체크포인트

구현과 대조할 때는 아래를 본다.

- `cases.status` 가 현행 `CaseStatus` 와 일치하는가  
- 질문셋 버전과 인터뷰 세션이 연결되는가  
- 문서가 문단 단위로 영속화되는가  
- 문단 버전·복원·잠금이 실제 테이블 구조와 맞는가  
- 승인·전달·검증이 별도 엔터티로 추적 가능한가  
- 첨부자료가 분류·노출범위와 함께 저장되는가  
- 감사로그·타임라인이 핵심 행위를 추적하는가  

---

## 19. 다음 문서 작업 순서

1. **화면 우선순위표** — [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md) (초안 0.1 작성됨).  
2. **API 명세 1차본** — [API_SPEC_V1.md](./API_SPEC_V1.md) (초안 0.1 작성됨).  
3. **정의서 대비 구현 역점검표** — [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) (초안 0.1 작성됨).  
4. **파일별 재정렬 패치 지시서** — [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) (초안 0.1 작성됨).  
5. **실제 코드 패치·증빙** — [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md)  

---

## 20. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 0.1 (연동) | 2026-04-19 | 문서 정보·§19에 [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md)·[API_SPEC_V1.md](./API_SPEC_V1.md)·[ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md)·[FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) 초안 0.1 링크 반영. |
| 0.1 초안 | 2026-04-19 | 사용자, 사건, 질문셋, 인터뷰, 요약, 문서, 문단, 승인, 첨부, 감사로그, 관리자 운영 테이블 구조 초안 작성 |
