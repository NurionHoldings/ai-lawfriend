import {
  CASE_PACKAGE_AI_LAWYER_ACT_NOTICE,
  CASE_PACKAGE_OUTPUT_EXCLUDED_NOTICE,
} from "./case-package-privacy-security-policy";

type PdfAttachmentItem = {
  id: string;
  originalName?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt?: Date | string | null;
};

type PdfDocumentItem = {
  id: string;
  title: string;
  status: string;
  updatedAt?: Date | string | null;
};

export type CasePackagePdfSummaryInput = {
  share: {
    id: string;
    publicCode: string;
    expiresAt?: Date | string | null;
    allowSummary: boolean;
    allowAttachmentList: boolean;
    allowDocumentDraft: boolean;
    allowPackagePdf: boolean;
  };
  case: {
    id: string;
    title: string;
    status: string;
    caseType?: string | null;
    summary?: string | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
  };
  owner: {
    id: string;
    name?: string | null;
  };
  attachments: PdfAttachmentItem[];
  documents: PdfDocumentItem[];
};

export type CasePackagePdfSummary = {
  title: string;
  generatedAt: string;
  publicCode: string;
  expiresAt: string | null;
  caseInfo: {
    id: string;
    title: string;
    status: string;
    caseType: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  owner: {
    id: string;
    displayName: string;
  };
  summary: string;
  attachments: Array<{
    id: string;
    filename: string;
    mimeType: string | null;
    sizeBytes: number | null;
    createdAt: string | null;
  }>;
  documents: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: string | null;
  }>;
  safetyNotice: string;
  excludedNotice: string;
};

const SAFETY_NOTICE = CASE_PACKAGE_AI_LAWYER_ACT_NOTICE;

const EXCLUDED_NOTICE = CASE_PACKAGE_OUTPUT_EXCLUDED_NOTICE;

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function getAttachmentFilename(attachment: PdfAttachmentItem): string {
  return attachment.originalName ?? attachment.filename ?? "이름 없는 첨부파일";
}

function maskOwnerName(name?: string | null): string {
  const trimmed = name?.trim();

  if (!trimmed) {
    return "의뢰인";
  }

  if (trimmed.length <= 1) {
    return "*";
  }

  return `${trimmed[0]}${"*".repeat(Math.max(trimmed.length - 1, 1))}`;
}

export function buildCasePackagePdfSummary(
  input: CasePackagePdfSummaryInput,
): CasePackagePdfSummary {
  const generatedAt = new Date().toISOString();

  return {
    title: `${input.case.title} 사건 패키지 요약본`,
    generatedAt,
    publicCode: input.share.publicCode,
    expiresAt: toIsoString(input.share.expiresAt),
    caseInfo: {
      id: input.case.id,
      title: input.case.title,
      status: input.case.status,
      caseType: input.case.caseType ?? null,
      createdAt: toIsoString(input.case.createdAt),
      updatedAt: toIsoString(input.case.updatedAt),
    },
    owner: {
      id: input.owner.id,
      displayName: maskOwnerName(input.owner.name),
    },
    summary: input.share.allowSummary
      ? input.case.summary?.trim() || "공유된 사건 요약이 없습니다."
      : "의뢰인이 사건 요약 열람을 허용하지 않았습니다.",
    attachments: input.share.allowAttachmentList
      ? input.attachments.map((attachment) => ({
          id: attachment.id,
          filename: getAttachmentFilename(attachment),
          mimeType: attachment.mimeType ?? null,
          sizeBytes: attachment.sizeBytes ?? null,
          createdAt: toIsoString(attachment.createdAt),
        }))
      : [],
    documents: input.share.allowDocumentDraft
      ? input.documents.map((document) => ({
          id: document.id,
          title: document.title,
          status: document.status,
          updatedAt: toIsoString(document.updatedAt),
        }))
      : [],
    safetyNotice: SAFETY_NOTICE,
    excludedNotice: EXCLUDED_NOTICE,
  };
}
