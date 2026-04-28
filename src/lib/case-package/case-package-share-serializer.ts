import type {
  Case,
  CaseAttachment,
  CasePackageShare,
  LegalDocument,
  User,
} from "@prisma/client";

type ShareWithCase = CasePackageShare & {
  case: Case & {
    attachments?: CaseAttachment[];
    legalDocuments?: LegalDocument[];
  };
  owner?: Pick<User, "id" | "name" | "email" | "phone">;
  lawyer?: Pick<User, "id" | "name" | "email" | "phone"> | null;
};

export function serializeCasePackageShare(share: ShareWithCase) {
  return {
    id: share.id,
    caseId: share.caseId,
    publicCode: share.publicCode,
    shareMode: share.shareMode,
    status: share.status,
    expiresAt: share.expiresAt,
    revokedAt: share.revokedAt,
    revokeReason: share.revokeReason,
    consentedAt: share.consentedAt,
    createdAt: share.createdAt,
    updatedAt: share.updatedAt,
    scope: {
      allowSummary: share.allowSummary,
      allowInterview: share.allowInterview,
      allowAttachmentList: share.allowAttachmentList,
      allowAttachmentDownload: share.allowAttachmentDownload,
      allowDocumentDraft: share.allowDocumentDraft,
      allowDocumentPdf: share.allowDocumentPdf,
      allowPackagePdf: share.allowPackagePdf,
      allowClientContact: share.allowClientContact,
      allowOpponentDetail: share.allowOpponentDetail,
    },
    case: {
      id: share.case.id,
      title: share.case.title,
      description: share.allowSummary ? share.case.description : null,
      category: share.case.category,
      opponentName: share.allowOpponentDetail ? share.case.opponentName : null,
      incidentDate: share.case.incidentDate,
      status: share.case.status,
      createdAt: share.case.createdAt,
      updatedAt: share.case.updatedAt,
    },
    owner: share.allowClientContact
      ? {
          id: share.owner?.id,
          name: share.owner?.name,
          email: share.owner?.email,
          phone: share.owner?.phone,
        }
      : {
          id: share.owner?.id,
          name: share.owner?.name ? maskName(share.owner.name) : null,
        },
    lawyer: share.lawyer
      ? {
          id: share.lawyer.id,
          name: share.lawyer.name,
          email: share.lawyer.email,
        }
      : null,
    attachments: share.allowAttachmentList
      ? (share.case.attachments ?? []).map((attachment) => ({
          id: attachment.id,
          originalName: attachment.originalName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          category: attachment.category,
          createdAt: attachment.createdAt,
          downloadAllowed: share.allowAttachmentDownload,
        }))
      : [],
    documents: share.allowDocumentDraft
      ? (share.case.legalDocuments ?? []).map((document) => ({
          id: document.id,
          title: document.title,
          type: document.type,
          status: document.status,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          pdfAllowed: share.allowDocumentPdf,
        }))
      : [],
  };
}

function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
}