# AI법친 6.1 — 사건 패키지 데이터 구조 / 생성 기준 설계

## 1. 목적

본 문서는 AI법친 6.1의 기준문서다.
6.0에서 정의한 사건 패키지 / 고유번호 공유 / 변호사 열람 연계 기획을 바탕으로,
기존 사건 데이터를 변호사 검토용 사건 패키지로 조합하는 데이터 구조와 생성 기준을 정의한다.

이번 단계는 실제 DB 모델 생성이나 API 구현이 아니라,
기존 Case / Attachment / Interview / Summary / LegalDocument / TimelineMemo 데이터를
어떤 기준으로 사건 패키지 DTO로 묶을지 확정하는 단계다.

---

## 2. 전제

현재 AI법친은 다음 기반을 이미 갖추고 있다.

- Case
- CaseAttachment
- CaseTimelineMemo
- LegalDocument
- LegalDocumentParagraph
- LegalDocumentVersion
- AI 인터뷰 답변
- 사건 요약
- 문서 생성/승인/검증 흐름
- public-safe guardrailTrace
- PDF/출력 요약
- 보완 요청 흐름

6.1에서는 이 데이터를 직접 새 테이블에 저장하지 않고,
우선 사건 패키지 DTO로 조합하는 기준을 정의한다.

---

## 3. 사건 패키지 데이터 구성 원칙

사건 패키지는 법률 판단 자동화 결과물이 아니라, 변호사 검토를 위한 사건 정리 묶음이다.

### 포함 가능 데이터

- 사건 기본 정보
- 사건 상태
- 사건 유형
- 의뢰인 표시 정보
- 상대방 표시 정보
- 사건 요약
- 주요 날짜
- 주요 금액
- AI 인터뷰 답변 요약
- 첨부자료 목록
- 문서 초안/승인본 요약
- 추가 확인 필요 항목
- public-safe guardrailTrace 요약
- 공유 범위 설정 후보
- 다운로드 허용 후보

### 포함 금지 또는 제한 데이터

- 인증 secret
- 내부 prompt 원문
- 모델 raw response
- 첨부파일 직접 URL
- snapshotJson 전체
- accessToken 원문
- optionalPin 원문
- 비공개 내부 감사 데이터 전체
- 권한 없는 첨부파일 원문

---

## 4. 사건 패키지 DTO 구조

```ts
type CasePackageDto = {
  packageMeta: CasePackageMeta;
  caseInfo: CasePackageCaseInfo;
  parties: CasePackageParties;
  summary: CasePackageSummary;
  interview: CasePackageInterview;
  attachments: CasePackageAttachmentItem[];
  documents: CasePackageDocumentItem[];
  followUp: CasePackageFollowUpItem[];
  safety: CasePackageSafetyInfo;
  sharingDefaults: CasePackageSharingDefaults;
};
```

## 5. packageMeta

```ts
type CasePackageMeta = {
  caseId: string;
  packageTitle: string;
  generatedAt: string;
  packageVersion: "6.1";
  source: "CASE_PACKAGE_DRAFT";
};
```

생성 기준:

- caseId는 기존 Case id를 사용한다.
- packageTitle은 사건 제목 또는 사건 유형을 기반으로 생성한다.
- generatedAt은 DTO 생성 시각이다.
- packageVersion은 6.1 기준으로 고정한다.
- source는 실제 공유 전 초안 패키지임을 나타낸다.

## 6. caseInfo

```ts
type CasePackageCaseInfo = {
  title: string;
  caseType?: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  keyDates: Array<{
    label: string;
    value: string;
  }>;
  keyAmounts: Array<{
    label: string;
    amount: number | null;
    currency: "KRW";
  }>;
};
```

생성 기준:

- 사건 제목은 반드시 포함한다.
- 사건 유형이 있으면 포함한다.
- 상태값은 현재 CaseStatus를 그대로 표시하되, 외부 공유 시 라벨 변환 가능성을 둔다.
- 주요 날짜와 금액은 인터뷰 답변 또는 사건 요약에서 추출된 값만 포함한다.
- 불명확한 날짜/금액은 followUp으로 넘긴다.

## 7. parties

```ts
type CasePackageParties = {
  client: {
    displayName: string;
    isMasked: boolean;
  };
  opponents: Array<{
    displayName: string;
    role?: string | null;
    isMasked: boolean;
  }>;
};
```

생성 기준:

- 기본 공유 단계에서는 의뢰인 이름을 비식별 또는 부분 마스킹할 수 있어야 한다.
- 상대방 정보는 사건 입력값 또는 인터뷰 답변에 근거가 있을 때만 포함한다.
- 불명확한 상대방 정보는 followUp으로 넘긴다.

## 8. summary

```ts
type CasePackageSummary = {
  shortSummary: string;
  detailedSummary?: string | null;
  issueCandidates: string[];
  riskNotes: string[];
};
```

생성 기준:

- AI 사건 요약이 있으면 우선 사용한다.
- 요약이 없으면 사건 요약이 아직 생성되지 않았습니다.로 표시한다.
- 법률 판단 단정 표현은 피한다.
- 쟁점 후보는 검토 필요 형태로 표시한다.

## 9. interview

```ts
type CasePackageInterview = {
  answerCount: number;
  completed: boolean;
  publicSafeAnswers: Array<{
    questionKey: string;
    questionLabel: string;
    answerPreview: string;
  }>;
};
```

생성 기준:

- 인터뷰 전체 raw JSON을 그대로 노출하지 않는다.
- 질문 key, 질문 라벨, 답변 요약 preview만 포함한다.
- 민감정보나 긴 원문은 잘라서 표시한다.
- 공유 범위에서 인터뷰 공유가 꺼져 있으면 이 섹션은 제외 가능해야 한다.

## 10. attachments

```ts
type CasePackageAttachmentItem = {
  attachmentId: string;
  filename: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  category?: string | null;
  uploadedAt?: string | null;
  downloadable: boolean;
};
```

생성 기준:

- 첨부파일 직접 URL은 포함하지 않는다.
- 다운로드 가능 여부는 공유 설정에서 별도로 결정한다.
- 기본값은 목록 열람 가능 / 원본 다운로드 불가다.
- 파일명, 유형, 크기, 업로드 시각만 public-safe 목록으로 포함한다.

## 11. documents

```ts
type CasePackageDocumentItem = {
  documentId: string;
  title: string;
  status: string;
  latestVersionLabel?: string | null;
  approved: boolean;
  printable: boolean;
  guardrailSummary?: {
    generationPolicy: string;
    guardrailCheckStatusLabel: string;
    checkedAtLabel: string;
    warningMissingFieldCount: number;
  } | null;
};
```

생성 기준:

- 문서 본문 전체는 기본 패키지 DTO에 포함하지 않는다.
- 문서 제목, 상태, 승인 여부, 출력 가능 여부만 포함한다.
- 승인본이 있는 경우 public-safe guardrail 요약을 포함할 수 있다.
- 문서 초안 다운로드는 별도 권한으로 분리한다.

## 12. followUp

```ts
type CasePackageFollowUpItem = {
  fieldKey: string;
  label: string;
  reason: string;
  suggestedQuestion: string;
  severity: "INFO" | "WARNING" | "BLOCKING";
};
```

생성 기준:

- 필수항목 누락
- WARNING 보강 항목
- guardrail 보완 요청
- 불명확한 날짜/금액/당사자 정보
- 첨부자료 부족

위 항목을 변호사 검토 전 확인 필요 항목으로 구성한다.

## 13. safety

```ts
type CasePackageSafetyInfo = {
  includesLegalAdvice: false;
  requiresLawyerReview: true;
  publicSafeOnly: true;
  notice: string;
};
```

기본 고지:

본 사건 패키지는 변호사 검토를 위한 사건 정리 자료입니다.
AI가 정리한 요약과 문서 초안의 기초는 법률 자문이나 최종 문서가 아니며,
최종 법률 판단과 문서 사용 여부는 반드시 변호사 또는 적법한 전문가의 검토를 거쳐야 합니다.

## 14. sharingDefaults

```ts
type CasePackageSharingDefaults = {
  allowSummary: true;
  allowInterview: true;
  allowAttachmentList: true;
  allowAttachmentDownload: false;
  allowDocumentDraft: false;
  allowPackagePdf: false;
  defaultExpiresInDays: 7;
};
```

기본값:

- 사건 요약 열람 허용
- 인터뷰 요약 열람 허용
- 첨부자료 목록 열람 허용
- 첨부파일 다운로드 불허
- 문서 초안 다운로드 불허
- 전체 패키지 PDF 다운로드 불허
- 기본 공유 기간 7일

## 15. 생성 차단 기준

사건 패키지 DTO 생성은 아래 경우 차단한다.

| 조건 | 처리 |
|---|---|
| caseId 없음 | 차단 |
| 사건 조회 실패 | 차단 |
| 현재 사용자 권한 없음 | 차단 |
| 사건 소유자 불일치 | 차단 |
| 삭제/폐기 상태 사건 | 차단 |
| 공유 불가능한 보안 플래그 존재 | 차단 |

단, 아래 경우에는 차단하지 않고 followUp으로 넘긴다.

| 조건 | 처리 |
|---|---|
| 사건 요약 없음 | followUp |
| 첨부자료 없음 | followUp |
| 문서 초안 없음 | followUp |
| 상대방 정보 불명확 | followUp |
| 날짜/금액 일부 누락 | followUp |

## 16. 6.1 산출물

- 사건 패키지 DTO 타입
- 사건 패키지 생성 입력 타입
- 사건 패키지 생성 순수 builder
- public-safe 정규화 기준
- followUp 생성 기준
- 단위 테스트
- 기준문서
- 증빙
- navigator 등록

## 17. 6.1 완료 기준

| 항목 | 결과 |
|---|---|
| 사건 패키지 DTO 구조 정의 | 완료 |
| 생성 기준 정의 | 완료 |
| public-safe 기준 정의 | 완료 |
| followUp 기준 정의 | 완료 |
| 공유 기본값 정의 | 완료 |
| 순수 builder 추가 | 완료 |
| 단위 테스트 추가 | 완료 |
| Prisma schema 변경 없음 | 유지 |
| 신규 API 구현 없음 | 유지 |
| 신규 화면 구현 없음 | 유지 |
