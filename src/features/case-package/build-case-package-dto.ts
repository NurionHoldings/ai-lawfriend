import type {
  CasePackageAttachmentItem,
  CasePackageDocumentItem,
  CasePackageDto,
  CasePackageFollowUpItem,
} from "./case-package-dto";

export type BuildCasePackageInput = {
  caseRecord: {
    id: string;
    title?: string | null;
    caseType?: string | null;
    status: string;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
    clientDisplayName?: string | null;
    opponentDisplayName?: string | null;
    summary?: string | null;
    detailedSummary?: string | null;
  };
  interview?: {
    completed?: boolean;
    answers?: Array<{
      questionKey: string;
      questionLabel: string;
      answer: string | null;
    }>;
  } | null;
  attachments?: Array<{
    id: string;
    filename: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
    category?: string | null;
    uploadedAt?: Date | string | null;
  }>;
  documents?: Array<{
    id: string;
    title: string;
    status: string;
    latestVersionLabel?: string | null;
    approved?: boolean;
    printable?: boolean;
    guardrailSummary?: CasePackageDocumentItem["guardrailSummary"];
  }>;
  generatedAt?: Date;
};

const DEFAULT_NOTICE =
  "본 사건 패키지는 변호사 검토를 위한 사건 정리 자료입니다. AI가 정리한 요약과 문서 초안의 기초는 법률 자문이나 최종 문서가 아니며, 최종 법률 판단과 문서 사용 여부는 반드시 변호사 또는 적법한 전문가의 검토를 거쳐야 합니다.";

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

function buildTitle(input: BuildCasePackageInput): string {
  const title = input.caseRecord.title?.trim();
  if (title) {
    return title;
  }
  const caseType = input.caseRecord.caseType?.trim();
  if (caseType) {
    return `${caseType} 사건 패키지`;
  }
  return "AI법친 사건 패키지";
}

function maskDisplayName(
  value: string | null | undefined,
): {
  displayName: string;
  isMasked: boolean;
} {
  const trimmed = value?.trim();
  if (!trimmed) {
    return {
      displayName: "미확인",
      isMasked: true,
    };
  }
  if (trimmed.length <= 1) {
    return {
      displayName: "*",
      isMasked: true,
    };
  }
  return {
    displayName: `${trimmed[0]}${"*".repeat(Math.max(trimmed.length - 1, 1))}`,
    isMasked: true,
  };
}

function previewAnswer(answer: string | null): string {
  const trimmed = answer?.trim();
  if (!trimmed) {
    return "답변 없음";
  }
  if (trimmed.length <= 120) {
    return trimmed;
  }
  return `${trimmed.slice(0, 120)}...`;
}

function buildAttachments(
  attachments: BuildCasePackageInput["attachments"] = [],
): CasePackageAttachmentItem[] {
  return attachments.map((attachment) => ({
    attachmentId: attachment.id,
    filename: attachment.filename,
    mimeType: attachment.mimeType ?? null,
    sizeBytes: attachment.sizeBytes ?? null,
    category: attachment.category ?? null,
    uploadedAt: toIsoString(attachment.uploadedAt),
    downloadable: false,
  }));
}

function buildDocuments(
  documents: BuildCasePackageInput["documents"] = [],
): CasePackageDocumentItem[] {
  return documents.map((document) => ({
    documentId: document.id,
    title: document.title,
    status: document.status,
    latestVersionLabel: document.latestVersionLabel ?? null,
    approved: document.approved ?? false,
    printable: document.printable ?? false,
    guardrailSummary: document.guardrailSummary ?? null,
  }));
}

function buildFollowUp(input: BuildCasePackageInput): CasePackageFollowUpItem[] {
  const followUp: CasePackageFollowUpItem[] = [];

  if (!input.caseRecord.summary?.trim()) {
    followUp.push({
      fieldKey: "case.summary",
      label: "사건 요약",
      reason: "사건 요약이 아직 생성되지 않았습니다.",
      suggestedQuestion: "사건의 핵심 경위와 피해 내용을 추가로 정리할까요?",
      severity: "WARNING",
    });
  }

  if (!input.attachments || input.attachments.length === 0) {
    followUp.push({
      fieldKey: "case.attachments",
      label: "첨부자료",
      reason: "첨부자료가 등록되어 있지 않습니다.",
      suggestedQuestion: "계약서, 문자, 계좌이체 내역, 사진 등 증거자료가 있나요?",
      severity: "INFO",
    });
  }

  if (!input.documents || input.documents.length === 0) {
    followUp.push({
      fieldKey: "case.documents",
      label: "문서 초안",
      reason: "문서 초안 또는 승인본이 아직 없습니다.",
      suggestedQuestion: "변호사 검토 전에 문서 초안의 기초를 생성할까요?",
      severity: "INFO",
    });
  }

  if (!input.caseRecord.opponentDisplayName?.trim()) {
    followUp.push({
      fieldKey: "case.opponent",
      label: "상대방 정보",
      reason: "상대방 정보가 불명확합니다.",
      suggestedQuestion: "상대방의 이름, 연락처, 주소 등 알고 있는 정보가 있나요?",
      severity: "WARNING",
    });
  }

  return followUp;
}

function buildSummaryText(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (trimmed) {
    return trimmed;
  }
  return "사건 요약이 아직 생성되지 않았습니다.";
}

export function buildCasePackageDto(input: BuildCasePackageInput): CasePackageDto {
  if (!input.caseRecord.id?.trim()) {
    throw new Error("caseRecord.id is required");
  }

  const generatedAt = input.generatedAt ?? new Date();
  const title = buildTitle(input);

  return {
    packageMeta: {
      caseId: input.caseRecord.id,
      packageTitle: title,
      generatedAt: generatedAt.toISOString(),
      packageVersion: "6.1",
      source: "CASE_PACKAGE_DRAFT",
    },
    caseInfo: {
      title,
      caseType: input.caseRecord.caseType ?? null,
      status: input.caseRecord.status,
      createdAt: toIsoString(input.caseRecord.createdAt),
      updatedAt: toIsoString(input.caseRecord.updatedAt),
      keyDates: [],
      keyAmounts: [],
    },
    parties: {
      client: maskDisplayName(input.caseRecord.clientDisplayName),
      opponents: input.caseRecord.opponentDisplayName
        ? [
            {
              ...maskDisplayName(input.caseRecord.opponentDisplayName),
              role: "상대방",
            },
          ]
        : [],
    },
    summary: {
      shortSummary: buildSummaryText(input.caseRecord.summary),
      detailedSummary: input.caseRecord.detailedSummary ?? null,
      issueCandidates: [],
      riskNotes: [],
    },
    interview: {
      answerCount: input.interview?.answers?.length ?? 0,
      completed: input.interview?.completed ?? false,
      publicSafeAnswers:
        input.interview?.answers?.map((answer) => ({
          questionKey: answer.questionKey,
          questionLabel: answer.questionLabel,
          answerPreview: previewAnswer(answer.answer),
        })) ?? [],
    },
    attachments: buildAttachments(input.attachments),
    documents: buildDocuments(input.documents),
    followUp: buildFollowUp(input),
    safety: {
      includesLegalAdvice: false,
      requiresLawyerReview: true,
      publicSafeOnly: true,
      notice: DEFAULT_NOTICE,
    },
    sharingDefaults: {
      allowSummary: true,
      allowInterview: true,
      allowAttachmentList: true,
      allowAttachmentDownload: false,
      allowDocumentDraft: false,
      allowPackagePdf: false,
      defaultExpiresInDays: 7,
    },
  };
}
