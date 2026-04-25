# AI법친 API 명세 1차본

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | AIBEOPCHIN-API-V1 |
| 상태 | Draft v1 |
| 버전 | 초안 0.1 |
| 기준 문서 | [SCREEN_PRIORITY_TABLE.md](./SCREEN_PRIORITY_TABLE.md), [IO_DATA_DEFINITION.md](./IO_DATA_DEFINITION.md), [DB_DETAILED_DESIGN_DRAFT.md](./DB_DETAILED_DESIGN_DRAFT.md), [CASE_STATUS_DEFINITION.md](./CASE_STATUS_DEFINITION.md), [CASE_LIFECYCLE_DEFINITION.md](./CASE_LIFECYCLE_DEFINITION.md), [PERMISSION_DEFINITION.md](./PERMISSION_DEFINITION.md), [QUESTION_SET_DEFINITION.md](./QUESTION_SET_DEFINITION.md), [DOCUMENT_TEMPLATE_DEFINITION.md](./DOCUMENT_TEMPLATE_DEFINITION.md), [AI_OUTPUT_POLICY.md](./AI_OUTPUT_POLICY.md), [NOTICE_AND_DISCLAIMER_DEFINITION.md](./NOTICE_AND_DISCLAIMER_DEFINITION.md), [CASE_SUMMARY_OUTPUT_SPEC.md](./CASE_SUMMARY_OUTPUT_SPEC.md) |
| 후속 문서 | 정의서 대비 구현 역점검표, 파일별 재정렬 패치 지시서 |

---

## 1. 목적

본 문서는 AI법친 MVP 및 Phase 1~4 기준문서에 정렬된 서버 API의 1차 명세를 정의한다.  
목표는 다음 3가지다.

1. [화면 우선순위표](./SCREEN_PRIORITY_TABLE.md) 기준으로 필요한 API를 누락 없이 식별한다.
2. [입력·출력 데이터 정의서](./IO_DATA_DEFINITION.md)와 [DB 상세 설계 초안](./DB_DETAILED_DESIGN_DRAFT.md) 사이의 연결을 고정한다.
3. 이후 단계의 **정의서 대비 구현 역점검표**와 **파일별 재정렬 패치 지시서**의 기준점으로 사용한다.

---

## 2. 공통 원칙

### 2-1. 단일 기준 원칙

사건 상태 단일 기준은 아래 두 파일만 인정한다.

- `prisma/schema.prisma` 의 `CaseStatus`
- `src/lib/definitions/case-status.ts`

API 명세의 상태명은 위 단일 기준과 동일해야 한다.  
별칭 상태명, 임의 문자열 상태값, 화면 전용 상태 문자열은 금지한다.

### 2-2. 구현 정렬 원칙

- 새 기능 추가보다 기준문서·명세 정렬이 우선이다.
- API는 정의서에 맞춰 정렬하며, 구현이 명세보다 앞서간 경우 명세 기준으로 역정렬한다.
- `check-status` 는 휴리스틱 점검 도구이며, 경고 건수만으로 사건 상태 오류를 단정하지 않는다.

### 2-3. 인증·권한 원칙

- 모든 보호 API는 세션 기반 인증을 전제한다.
- 권한은 [권한정의서](./PERMISSION_DEFINITION.md)의 역할(`UserRole`)과 사건 단위 접근권한을 모두 통과해야 한다.
- 응답에는 필요 시 `allowedActions` 를 포함해 화면의 버튼·전이 제어 기준으로 사용한다.

### 2-4. API 스타일 원칙

- 기본 포맷은 REST JSON API로 한다.
- 성공 응답은 `success: true` 를 기본 포함한다.
- 실패 응답은 `success: false`, `error.code`, `error.message` 를 포함한다.
- 목록 응답은 `items`, `page`, `pageSize`, `total` 구조를 기본으로 한다.
- 생성·수정 시 감사로그 기록 대상을 명시한다.

### 2-5. 시간·식별자 원칙

- 시간 필드는 ISO 8601 문자열을 사용한다.
- 기본 ID는 UUID 또는 시스템 정의 식별자를 사용한다.
- 외부 검증용 코드와 내부 식별자는 분리한다.

---

## 3. 공통 응답 형식

### 3-1. 성공 응답

```json
{
  "success": true,
  "data": {}
}
```

### 3-2. 실패 응답

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "권한이 없습니다.",
    "details": {}
  }
}
```

### 3-3. 목록 응답

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 125
  }
}
```

---

## 4. 역할 범주

본 명세에서 사용하는 역할 범주는 [권한정의서](./PERMISSION_DEFINITION.md) 및 구현 `UserRole` 과 정합시킨다.

| 코드(구현) | 비고 |
|------------|------|
| `USER` | 일반·의뢰인 성격 계정 |
| `LAWYER` | 담당 변호사 |
| `STAFF` | 실무 보조 |
| `ADMIN` | 운영 관리자 |
| `SUPER_ADMIN` | 최상위 관리자 |

주: 실제 enum 상수명은 `prisma/schema.prisma` 의 `UserRole` 및 권한정의서와 최종 일치시켜야 하며, 본 문서 예시의 역할 문자열은 설명용이다. 역점검 시 실제 코드 상수와 대조한다.

---

## 5. 도메인별 API 목록 개요

1. 인증 API  
2. 사건 API  
3. 인터뷰 API  
4. 사건 요약 API  
5. 문서 API  
6. 문단 API  
7. 승인 API  
8. 전달 API  
9. 검증 API  
10. 관리자 API  

---

## 6. 인증 API

### 6-1. 회원가입

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/auth/register` |
| 설명 | 사용자 신규 등록 |
| 권한 | 공개 |
| 사용 화면 | 회원가입 |
| 감사로그 | 사용자 생성 기록 |

**요청 본문**

```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "********",
  "phone": "010-1234-5678",
  "role": "USER"
}
```

**응답 데이터**

```json
{
  "user": {
    "id": "usr_123",
    "name": "홍길동",
    "email": "user@example.com",
    "role": "USER",
    "status": "ACTIVE"
  }
}
```

**검증 규칙**

- 이메일 중복 금지  
- 비밀번호 정책 준수  
- 공개 회원가입 허용 역할은 정책으로 제한 가능  

---

### 6-2. 로그인

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/auth/login` |
| 설명 | 이메일·비밀번호 로그인 |
| 권한 | 공개 |
| 사용 화면 | 로그인 |

**요청 본문**

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

**응답 데이터**

```json
{
  "user": {
    "id": "usr_123",
    "name": "홍길동",
    "email": "user@example.com",
    "role": "LAWYER"
  },
  "session": {
    "expiresAt": "2026-04-20T12:00:00.000Z"
  }
}
```

---

### 6-3. 로그아웃

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/auth/logout` |
| 설명 | 세션 종료 |
| 권한 | 인증 사용자 |

---

### 6-4. 내 세션 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/auth/me` |
| 설명 | 현재 로그인 사용자 및 권한 정보 조회 |
| 권한 | 인증 사용자 |

**응답 데이터**

```json
{
  "user": {
    "id": "usr_123",
    "name": "홍길동",
    "email": "user@example.com",
    "role": "LAWYER"
  },
  "permissions": {
    "caseCreate": true,
    "caseApprove": false,
    "adminAccess": false
  }
}
```

---

## 7. 사건 API

### 7-1. 사건 목록 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/cases` |
| 설명 | 사건 목록·검색·필터·페이지네이션 |
| 권한 | 사건 조회 가능 역할 |
| 사용 화면 | 대시보드, 사건 목록 |

**쿼리 파라미터**

`page`, `pageSize`, `status`, `assignedTo`, `clientId`, `keyword`, `sort`

**응답 데이터**

```json
{
  "items": [
    {
      "id": "case_123",
      "caseNumber": "AIC-2026-0001",
      "title": "사기 피의 사건",
      "status": "INTAKE_PENDING",
      "client": {
        "id": "usr_client_1",
        "name": "의뢰인명"
      },
      "assignee": {
        "id": "usr_lawyer_1",
        "name": "담당 변호사"
      },
      "createdAt": "2026-04-19T01:00:00.000Z",
      "updatedAt": "2026-04-19T02:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

---

### 7-2. 사건 생성

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/cases` |
| 설명 | 신규 사건 생성 |
| 권한 | `LAWYER`, `STAFF`, `ADMIN` 등 권한정의서 기준 허용 역할 |
| 사용 화면 | 사건 생성 |
| 감사로그 | 사건 생성 |

**요청 본문**

```json
{
  "title": "사기 피의 사건",
  "caseType": "CRIMINAL_DEFENSE",
  "clientId": "usr_client_1",
  "summary": "초기 상담 메모",
  "initialAttachments": []
}
```

**응답 데이터**

```json
{
  "case": {
    "id": "case_123",
    "caseNumber": "AIC-2026-0001",
    "status": "INTAKE_PENDING"
  },
  "allowedActions": ["EDIT_CASE", "START_INTERVIEW"]
}
```

---

### 7-3. 사건 상세 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/cases/{caseId}` |
| 설명 | 사건 헤더, 상태, 요약, 인터뷰 진행도, 문서 현황, 첨부 요약 포함 |
| 권한 | 사건 접근 권한 필요 |
| 사용 화면 | 사건 상세 |

**응답 데이터**

```json
{
  "case": {
    "id": "case_123",
    "caseNumber": "AIC-2026-0001",
    "title": "사기 피의 사건",
    "status": "IN_INTERVIEW",
    "client": {
      "id": "usr_client_1",
      "name": "의뢰인명"
    },
    "assignee": {
      "id": "usr_lawyer_1",
      "name": "담당 변호사"
    },
    "summaryCard": {
      "interviewCompletion": 72,
      "latestCaseSummaryId": "summary_1",
      "documentCount": 2,
      "attachmentCount": 4
    },
    "allowedActions": [
      "EDIT_CASE",
      "COMPLETE_INTERVIEW",
      "GENERATE_DOCUMENT_DRAFT"
    ]
  }
}
```

---

### 7-4. 사건 수정

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `PATCH /api/cases/{caseId}` |
| 설명 | 사건 기본정보 수정 |
| 권한 | 사건 수정 가능 역할 |
| 감사로그 | 사건 수정 |

**요청 본문**

```json
{
  "title": "사기 피의 사건(수정)",
  "assigneeId": "usr_lawyer_2"
}
```

---

### 7-5. 사건 상태 전이

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/cases/{caseId}/transition` |
| 설명 | [사건 라이프사이클 정의서](./CASE_LIFECYCLE_DEFINITION.md) 기준 상태 전이 수행 |
| 권한 | 전이 권한 보유 역할 |
| 감사로그 | 상태 변경 |

**요청 본문**

```json
{
  "action": "COMPLETE_INTERVIEW",
  "reason": "인터뷰 답변 입력 완료"
}
```

**응답 데이터**

```json
{
  "case": {
    "id": "case_123",
    "status": "INTERVIEW_DONE"
  },
  "allowedActions": ["GENERATE_CASE_SUMMARY", "CREATE_DOCUMENT_DRAFT"]
}
```

**규칙**

- `action` 기반 전이만 허용  
- 임의 `status` 직접 지정 금지  
- 전이 가능 여부는 라이프사이클 정의서와 권한정의서를 동시에 통과해야 함  
- 응답의 `case.status` 값은 항상 [CaseStatus](./CASE_STATUS_DEFINITION.md) 열거값과 일치  

---

## 8. 인터뷰 API

### 8-1. 사건 질문셋 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/cases/{caseId}/question-set` |
| 설명 | 사건에 연결된 질문셋과 현재 인터뷰 상태 조회 |
| 권한 | 사건 접근 권한 필요 |
| 사용 화면 | 인터뷰 화면 |

**응답 데이터**

```json
{
  "questionSet": {
    "id": "qs_1",
    "version": 3,
    "title": "형사사건 기본 인터뷰",
    "questions": [
      {
        "id": "q_1",
        "code": "incident_date",
        "type": "date",
        "label": "사건 발생일",
        "required": true,
        "branchRules": []
      }
    ]
  },
  "interview": {
    "status": "IN_PROGRESS",
    "completion": 30,
    "lastAnsweredQuestionId": "q_1"
  }
}
```

`interview.status` 는 `InterviewStatus`(`NOT_STARTED` | `IN_PROGRESS` | `COMPLETED` | `REOPENED`) 를 사용한다.

---

### 8-2. 인터뷰 답변 저장

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/cases/{caseId}/interview` |
| 설명 | 질문 답변 저장 및 분기 계산 |
| 권한 | 사건 인터뷰 입력 가능 역할 |
| 감사로그 | 인터뷰 답변 저장 |

**요청 본문**

```json
{
  "answers": [
    {
      "questionId": "q_1",
      "value": "2026-04-10"
    },
    {
      "questionId": "q_2",
      "value": "서울 강남구"
    }
  ],
  "saveMode": "DRAFT"
}
```

**응답 데이터**

```json
{
  "interview": {
    "status": "IN_PROGRESS",
    "completion": 45,
    "nextQuestionIds": ["q_3", "q_4"]
  }
}
```

---

### 8-3. 인터뷰 완료 처리

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/cases/{caseId}/interview/complete` |
| 설명 | 인터뷰 완료 판정 후 사건 상태 전이 |
| 권한 | 인터뷰 완료 권한 보유 역할 |
| 감사로그 | 인터뷰 완료 |

**요청 본문**

```json
{
  "confirm": true
}
```

**응답 데이터**

```json
{
  "interview": {
    "status": "COMPLETED",
    "completedAt": "2026-04-19T03:00:00.000Z"
  },
  "case": {
    "status": "INTERVIEW_DONE"
  },
  "allowedActions": ["GENERATE_CASE_SUMMARY", "CREATE_DOCUMENT_DRAFT"]
}
```

**규칙**

- 필수 질문 미응답 시 완료 불가  
- 완료 시 사건 `CaseStatus` 전이는 `POST .../transition` 과 동일 기준(라이프사이클·권한) 적용  

---

## 9. 사건 요약 API

### 9-1. 사건 요약 생성

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/cases/{caseId}/summary/generate` |
| 설명 | 인터뷰 답변과 첨부자료를 바탕으로 사건 요약 생성 |
| 권한 | 요약 생성 권한 보유 역할 |
| 사용 화면 | 사건 상세, 사건 요약 카드 |
| 감사로그 | 사건 요약 생성 |

**요청 본문**

```json
{
  "regenerate": false,
  "includeAttachmentAnalysis": true
}
```

**응답 데이터**

```json
{
  "summary": {
    "id": "summary_1",
    "version": 1,
    "status": "GENERATED",
    "content": {
      "caseOverview": "...",
      "timeline": [],
      "issues": [],
      "riskNotes": []
    },
    "disclaimerApplied": true
  }
}
```

**규칙**

- [사건 요약 출력 명세서](./CASE_SUMMARY_OUTPUT_SPEC.md) 구조를 준수해야 함  
- [고지문·면책문구 정의서](./NOTICE_AND_DISCLAIMER_DEFINITION.md) 의 필수 문구를 누락할 수 없음  

---

### 9-2. 사건 요약 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/cases/{caseId}/summary` |
| 설명 | 최신 사건 요약 조회 |
| 권한 | 사건 접근 권한 필요 |

---

### 9-3. 사건 요약 재생성

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/cases/{caseId}/summary/regenerate` |
| 설명 | 사건 요약 재생성 |
| 권한 | 재생성 권한 보유 역할 |
| 감사로그 | 사건 요약 재생성 |

**요청 본문**

```json
{
  "reason": "첨부자료 추가 반영 필요"
}
```

---

## 10. 문서 API

### 10-1. 문서 초안 생성

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/cases/{caseId}/documents` |
| 설명 | 문서 템플릿 기반 초안 생성 |
| 권한 | 문서 생성 권한 보유 역할 |
| 사용 화면 | 사건 상세, 문서 생성 엔트리 |
| 감사로그 | 문서 생성 |

**요청 본문**

```json
{
  "templateId": "tpl_opinion_1",
  "sourceSummaryId": "summary_1",
  "title": "변호인의견서 초안"
}
```

**응답 데이터**

```json
{
  "document": {
    "id": "doc_1",
    "title": "변호인의견서 초안",
    "status": "DRAFT",
    "templateId": "tpl_opinion_1",
    "paragraphCount": 8
  }
}
```

`document.status` 는 구현 `LegalDocumentStatus` 와 정합한다.

---

### 10-2. 문서 목록 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/cases/{caseId}/documents` |
| 설명 | 사건 내 문서 목록 조회 |
| 권한 | 사건 접근 권한 필요 |

---

### 10-3. 문서 상세 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/documents/{documentId}` |
| 설명 | 문서 헤더, 상태, 템플릿, 문단 구조, 승인 상태, 버전 요약 조회 |
| 권한 | 문서 접근 권한 필요 |

**응답 데이터**

```json
{
  "document": {
    "id": "doc_1",
    "caseId": "case_123",
    "title": "변호인의견서 초안",
    "status": "REVIEW_REQUIRED",
    "template": {
      "id": "tpl_opinion_1",
      "name": "변호인의견서"
    },
    "approvedVersionId": null,
    "allowedActions": [
      "REGENERATE_PARAGRAPH",
      "REORDER_PARAGRAPH",
      "REQUEST_APPROVAL"
    ]
  }
}
```

---

### 10-4. 문서 메타 수정

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `PATCH /api/documents/{documentId}` |
| 설명 | 제목 등 메타 정보 수정 |
| 권한 | 문서 수정 가능 역할 |

---

### 10-5. 문서 승인 요청

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/documents/{documentId}/request-approval` |
| 설명 | 검토 완료 후 승인 요청 상태로 전환 |
| 권한 | 승인 요청 가능 역할 |
| 감사로그 | 승인 요청 |

---

## 11. 문단 API

### 11-1. 문단 목록 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/documents/{documentId}/paragraphs` |
| 설명 | 문단 구조, 잠금 여부, 승인 상태, 최신 버전 정보 조회 |
| 권한 | 문서 접근 권한 필요 |

**응답 데이터**

```json
{
  "items": [
    {
      "id": "para_1",
      "code": "intro",
      "order": 1,
      "status": "DRAFT",
      "locked": false,
      "approved": false,
      "content": "문단 내용",
      "lastGeneratedAt": "2026-04-19T03:10:00.000Z"
    }
  ]
}
```

---

### 11-2. 문단 순서 조정

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/documents/{documentId}/paragraphs/reorder` |
| 설명 | 문단 순서 변경 |
| 권한 | 문서 수정 가능 역할 |
| 감사로그 | 문단 순서 조정 |

**요청 본문**

```json
{
  "orders": [
    { "paragraphId": "para_1", "order": 1 },
    { "paragraphId": "para_2", "order": 2 }
  ]
}
```

---

### 11-3. 문단 재생성

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/paragraphs/{paragraphId}/regenerate` |
| 설명 | 특정 문단만 AI 재생성 |
| 권한 | 문단 재생성 가능 역할 |
| 감사로그 | 문단 재생성 |

**요청 본문**

```json
{
  "instructions": "사실관계를 더 보수적으로 정리",
  "preserveApprovedContent": true
}
```

**응답 데이터**

```json
{
  "paragraph": {
    "id": "para_1",
    "content": "재생성된 문단 내용",
    "version": 4,
    "locked": false
  }
}
```

**규칙**

- 승인 잠금 문단은 재생성 금지 또는 별도 override 정책 필요  
- [AI 출력 정책서](./AI_OUTPUT_POLICY.md) 의 문단 재생성 제한 규칙을 적용  

---

### 11-4. 문단 잠금·해제

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/paragraphs/{paragraphId}/lock` |
| 설명 | 문단 잠금 또는 잠금 해제 |
| 권한 | 잠금 권한 보유 역할 |
| 감사로그 | 문단 잠금 변경 |

**요청 본문**

```json
{
  "locked": true,
  "reason": "검토 완료 문안 고정"
}
```

---

### 11-5. 문단 버전 이력 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/paragraphs/{paragraphId}/versions` |
| 설명 | 문단 버전 이력 및 diff 조회 |
| 권한 | 문서 접근 권한 필요 |

---

### 11-6. 문단 버전 복원

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/paragraphs/{paragraphId}/versions/{versionId}/restore` |
| 설명 | 특정 버전으로 복원 |
| 권한 | 복원 권한 보유 역할 |
| 감사로그 | 문단 버전 복원 |

---

## 12. 승인 API

### 12-1. 승인 대기 목록 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/approvals` |
| 설명 | 승인 요청 문서 목록 조회 |
| 권한 | 승인권자, 관리자 |
| 사용 화면 | 승인함 |

---

### 12-2. 문서 승인 상세 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/approvals/{documentId}` |
| 설명 | 승인 전 검토용 문서·문단·diff·고지문 적용 여부 조회 |
| 권한 | 승인권자, 관리자 |

---

### 12-3. 문서 승인

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/approvals/{documentId}/approve` |
| 설명 | 문서 승인 확정 및 승인본 잠금 |
| 권한 | 승인 권한 보유 역할 |
| 감사로그 | 문서 승인 |

**요청 본문**

```json
{
  "comment": "승인합니다.",
  "lockApprovedVersion": true
}
```

**응답 데이터**

```json
{
  "document": {
    "id": "doc_1",
    "status": "APPROVED",
    "approvedVersionId": "docv_5"
  }
}
```

**규칙**

- 승인 시 승인본 기준 출력 잠금 적용  
- 승인 이후 변경은 별도 개정·재승인 흐름으로 분리 가능  

---

### 12-4. 승인 반려

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/approvals/{documentId}/reject` |
| 설명 | 승인 반려 및 반려 사유 기록 |
| 권한 | 승인 권한 보유 역할 |
| 감사로그 | 승인 반려 |

**요청 본문**

```json
{
  "reason": "문단 3 표현 수정 필요"
}
```

---

## 13. 전달 API

### 13-1. 문서 전달 준비 정보 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/documents/{documentId}/delivery` |
| 설명 | 전달 대상, 전달 가능 상태, 검증코드 포함 여부 조회 |
| 권한 | 문서 전달 가능 역할 |

---

### 13-2. 문서 전달 실행

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/documents/{documentId}/delivery` |
| 설명 | 승인본 전달 기록 생성 |
| 권한 | 전달 권한 보유 역할 |
| 감사로그 | 문서 전달 |

**요청 본문**

```json
{
  "channel": "EMAIL",
  "recipient": {
    "name": "의뢰인명",
    "email": "client@example.com"
  },
  "message": "검토 완료된 승인본을 전달드립니다."
}
```

**응답 데이터**

```json
{
  "delivery": {
    "id": "dlv_1",
    "status": "SENT",
    "sentAt": "2026-04-19T04:00:00.000Z"
  }
}
```

**규칙**

- 승인 전 문서는 전달 불가  
- 전달 이력은 사건·문서 타임라인과 감사로그에 남겨야 함  

---

## 14. 검증 API

### 14-1. 문서 검증코드 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/documents/{documentId}/verification` |
| 설명 | 승인본의 검증코드·검증 URL·QR 생성 메타 조회 |
| 권한 | 문서 접근 권한 필요 또는 공개 범위 정책에 따름 |

---

### 14-2. 검증코드 진위 확인

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/verification/verify` |
| 설명 | 외부 검증 페이지에서 승인본 진위 확인 |
| 권한 | 공개 |
| 사용 화면 | 검증 페이지 |

**요청 본문**

```json
{
  "verificationCode": "AIB-APR-2026-000001"
}
```

**응답 데이터**

```json
{
  "valid": true,
  "document": {
    "title": "변호인의견서",
    "approvedAt": "2026-04-19T04:10:00.000Z",
    "approvedBy": "관리자명",
    "caseNumber": "AIC-2026-0001"
  }
}
```

**규칙**

- 공개 검증 응답에는 민감 개인정보를 최소화한다.  
- 내부 식별자 전체 노출 금지  

---

## 15. 관리자 API

### 15-1. 사용자 목록 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/admin/users` |
| 설명 | 사용자 목록·역할·상태 조회 |
| 권한 | `ADMIN`, `SUPER_ADMIN` |

---

### 15-2. 사용자 역할·상태 변경

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `PATCH /api/admin/users/{userId}` |
| 설명 | 역할 또는 활성 상태 변경 |
| 권한 | `SUPER_ADMIN` 또는 정책상 허용된 관리자 |
| 감사로그 | 사용자 관리 변경 |

---

### 15-3. 질문셋 목록 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/admin/question-sets` |
| 설명 | 질문셋 목록·버전·배포 상태 조회 |
| 권한 | 관리자, 질문셋 관리자 역할 |

---

### 15-4. 질문셋 생성

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/admin/question-sets` |
| 설명 | 질문셋 생성 |
| 권한 | 질문셋 관리 권한 보유 역할 |
| 감사로그 | 질문셋 생성 |

---

### 15-5. 질문셋 수정

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `PATCH /api/admin/question-sets/{questionSetId}` |
| 설명 | 질문·분기 규칙·버전 메타 수정 |
| 권한 | 질문셋 관리 권한 보유 역할 |
| 감사로그 | 질문셋 수정 |

---

### 15-6. 문서 템플릿 목록 조회

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/admin/document-templates` |
| 설명 | 문서 템플릿 목록·버전·상태 조회 |
| 권한 | 템플릿 관리 권한 보유 역할 |

---

### 15-7. 문서 템플릿 생성·수정

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/admin/document-templates`, `PATCH /api/admin/document-templates/{templateId}` |
| 설명 | 문서 템플릿 생성·수정 |
| 권한 | 템플릿 관리 권한 보유 역할 |
| 감사로그 | 템플릿 생성·수정 |

---

### 15-8. 사건 상태 점검 API

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `GET /api/admin/case-status-check` |
| 설명 | 상태·전이·정합성 점검 결과 조회 |
| 권한 | 관리자 |
| 주의 | 휴리스틱 점검 결과이며 단정 판정이 아님 |

**응답 데이터**

```json
{
  "summary": {
    "warningCount": 12,
    "errorCount": 0
  },
  "notes": [
    "휴리스틱 점검 결과이므로 경고 건수만으로 상태 오류를 단정할 수 없음"
  ]
}
```

---

### 15-9. 기준 소스 검증 API

| 항목 | 내용 |
|------|------|
| 메서드·경로 | `POST /api/admin/verify-canonical-sources` |
| 설명 | 상태·정의서 기준 소스 검증 실행(또는 CI·로컬의 `npm run verify:canonical-sources` 와 동등 목적) |
| 권한 | 관리자 |
| 목적 | 구현 완료 인정 전 필수 검증 |

**응답 데이터**

```json
{
  "passed": true,
  "checked": [
    "prisma/schema.prisma",
    "src/lib/definitions/case-status.ts"
  ]
}
```

주: 실제 운영에서는 CLI `npm run verify:canonical-sources` 가 본선이며, 관리자 API는 동일 검증을 HTTP로 트리거하는 선택지로 둔다.

---

## 16. 오류 코드 1차 표준

| 코드 | 의미 |
|------|------|
| `UNAUTHORIZED` | 인증 필요 |
| `FORBIDDEN` | 권한 없음 |
| `NOT_FOUND` | 대상 없음 |
| `VALIDATION_ERROR` | 입력값 검증 실패 |
| `INVALID_TRANSITION` | 허용되지 않은 상태 전이 |
| `CANONICAL_SOURCE_MISMATCH` | 상태 기준 소스 불일치 |
| `APPROVAL_REQUIRED` | 승인 필요 상태 |
| `LOCKED_PARAGRAPH` | 잠금 문단 수정 불가 |
| `CONFLICT` | 버전 충돌 또는 동시 수정 충돌 |
| `INTERNAL_ERROR` | 서버 내부 오류 |

---

## 17. 감사로그 연동 기준

아래 API는 기본적으로 감사로그 적재 대상이다.

- 회원가입  
- 사건 생성·수정·상태 전이  
- 인터뷰 답변 저장·완료  
- 사건 요약 생성·재생성  
- 문서 생성·수정·승인 요청  
- 문단 재생성·복원·잠금·순서 조정  
- 승인·반려  
- 전달 실행  
- 관리자 설정 변경  

**감사로그 기본 필드**

- `actorId`  
- `actorRole`  
- `targetType`  
- `targetId`  
- `action`  
- `beforeSnapshot`  
- `afterSnapshot`  
- `createdAt`  

---

## 18. 화면-API 매핑 1차

### 18-1. 인증

- 로그인 화면 → `POST /api/auth/login`  
- 회원가입 화면 → `POST /api/auth/register`  
- 보호 레이아웃 세션 확인 → `GET /api/auth/me`  

### 18-2. 사건

- 사건 목록 화면 → `GET /api/cases`  
- 사건 생성 화면 → `POST /api/cases`  
- 사건 상세 화면 → `GET /api/cases/{caseId}`  
- 상태 전이 버튼 → `POST /api/cases/{caseId}/transition`  

### 18-3. 인터뷰

- 인터뷰 화면 로드 → `GET /api/cases/{caseId}/question-set`  
- 답변 저장 → `POST /api/cases/{caseId}/interview`  
- 인터뷰 완료 → `POST /api/cases/{caseId}/interview/complete`  

### 18-4. 사건 요약

- 요약 생성 버튼 → `POST /api/cases/{caseId}/summary/generate`  
- 요약 카드 조회 → `GET /api/cases/{caseId}/summary`  

### 18-5. 문서·문단

- 문서 초안 생성 → `POST /api/cases/{caseId}/documents`  
- 문서 상세 → `GET /api/documents/{documentId}`  
- 문단 패널 → `GET /api/documents/{documentId}/paragraphs`  
- 문단 재생성 → `POST /api/paragraphs/{paragraphId}/regenerate`  
- 문단 복원 → `POST /api/paragraphs/{paragraphId}/versions/{versionId}/restore`  

### 18-6. 승인·전달·검증

- 승인함 → `GET /api/approvals`  
- 승인·반려 → `POST /api/approvals/{documentId}/approve`, `POST /api/approvals/{documentId}/reject`  
- 전달 → `POST /api/documents/{documentId}/delivery`  
- 검증 페이지 → `POST /api/verification/verify`  

### 18-7. 관리자

- 질문셋 관리자 → `/api/admin/question-sets*`  
- 문서 템플릿 관리자 → `/api/admin/document-templates*`  
- 상태 점검 → `GET /api/admin/case-status-check`  
- 기준 소스 검증 → `POST /api/admin/verify-canonical-sources`  

---

## 19. 구현 역점검 포인트

다음 항목은 API 명세 1차본 이후 바로 역점검 대상으로 사용한다.

1. 사건 상태 전이 API가 `status` 직접 변경 방식인지, `action` 기반 전이 방식인지 확인  
2. 인터뷰 완료 API가 필수 질문 응답 검증을 선행하는지 확인  
3. 사건 요약 API가 [사건 요약 출력 명세서](./CASE_SUMMARY_OUTPUT_SPEC.md) 구조를 정확히 따르는지 확인  
4. 문서 생성 API가 [문서 템플릿 정의서](./DOCUMENT_TEMPLATE_DEFINITION.md) 의 문단 구조와 연결되는지 확인  
5. 문단 재생성·복원·잠금 API가 문단 버전 이력 구조와 일치하는지 확인  
6. 승인 API가 승인본 잠금과 검증코드 생성 흐름을 포함하는지 확인  
7. 관리자 API가 `verify-canonical-sources` 와 `check-status` 를 분리하고 있는지 확인  
8. 응답의 `allowedActions` 가 권한정의서 및 라이프사이클 정의서와 일치하는지 확인  

---

## 20. 후속 문서 연결

본 문서 다음 단계는 아래 순서로 진행한다.

1. **정의서 대비 구현 역점검표** — [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md) (초안 0.1 작성됨).  
2. **파일별 재정렬 패치 지시서** — [FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) (초안 0.1 작성됨).  
3. [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 기준으로 실제 반영·검증·근거 기록  

---

## 21. 완료 판정 기준

API 명세 1차본 단계의 완료 인정 조건은 다음과 같다.

1. `docs/project-governance/API_SPEC_V1.md` 문서 초안이 존재할 것  
2. 인증·사건·인터뷰·사건 요약·문서·문단·승인·전달·검증·관리자 API가 모두 포함될 것  
3. [화면 우선순위표](./SCREEN_PRIORITY_TABLE.md), [입력·출력 데이터 정의서](./IO_DATA_DEFINITION.md), [DB 상세 설계 초안](./DB_DETAILED_DESIGN_DRAFT.md) 과 구조적으로 충돌하지 않을 것  
4. 상태값 표기는 단일 기준 파일과 정합성을 유지할 것  

---

## 22. 보류·미확정 항목

아래 항목은 1차 명세에서 구조만 고정하고, 상세 필드는 추후 역점검 과정에서 확정한다.

1. 실제 `UserRole` enum 명칭의 최종 코드값(본 명세는 `prisma` 기준과 정렬)  
2. `CaseStatus` 실제 enum 전체 목록과 `action` 매핑표  
3. 문서·문단 상태 enum 최종값(`LegalDocumentStatus`, `LegalParagraphStatus` 등)  
4. 첨부자료 분석 API의 공개 범위  
5. 전달 채널의 종류와 외부 연동 세부 규약  
6. 검증코드 포맷과 만료 정책  
7. 승인 후 재개정(개정판) 처리 정책  

---

## 23. 권고

구현팀은 새 기능 추가 전에 다음 순서를 따른다.

1. 본 API 명세 1차본 고정  
2. 현재 라우트·핸들러·화면과의 불일치 역점검  
3. 파일별 재정렬 패치 지시서 작성  
4. 반영 후 `npm run verify:canonical-sources` 실행  
5. 상태 관련 작업은 `check-status` 결과를 참고자료로 함께 기록  
6. [IMPLEMENTATION_EVIDENCE.md](./IMPLEMENTATION_EVIDENCE.md) 의 실제 기록 절을 채운 뒤에만 완료 판정  

---

## 24. 개정 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 0.1 (연동) | 2026-04-19 | §20에 [ALIGNMENT_AUDIT_V1.md](./ALIGNMENT_AUDIT_V1.md)·[FILE_REALIGN_PATCH_V1.md](./FILE_REALIGN_PATCH_V1.md) 초안 0.1 링크 반영. |
| 0.1 초안 | 2026-04-19 | 인증~관리자 API 1차본, 공통 응답·오류·감사·화면 매핑·역점검·미확정. `CaseStatus`·`UserRole`·문서 상태 예시를 스키마와 정합. |
