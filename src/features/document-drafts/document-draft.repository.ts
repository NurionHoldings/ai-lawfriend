/**
 * Prisma에 별도 Document 모델이 없어, 스키마 변경 없이 CaseTimelineMemo에
 * noteType CASE_DOCUMENT_DRAFT + JSON content로 초안을 저장합니다.
 * (향후 전용 모델이 생기면 이 파일의 prisma 호출만 교체하면 됩니다.)
 */
import { prisma } from "@/lib/prisma";
import type { DraftDocumentParagraph } from "@/features/document-drafts/document-draft.types";
import type { DocumentDraftType } from "@/features/document-drafts/document-draft.validators";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";

export const CASE_DOCUMENT_DRAFT_NOTE_TYPE = "CASE_DOCUMENT_DRAFT";

export type StoredDocumentDraftPayload = {
  type: DocumentDraftType;
  title: string;
  body: string;
  status: string;
  reviewComment?: string;
  reviewerId?: string | null;
  /** 인터뷰 매핑 기반 생성 시 문단 메타 */
  paragraphs?: DraftDocumentParagraph[];
  /** interview_mapped 생성 시 선택한 문서 템플릿(진술서/의견서/상담기록서) */
  documentTemplateType?: DocumentTemplateType;
};

export function serializeDocumentDraftPayload(payload: StoredDocumentDraftPayload) {
  return JSON.stringify(payload);
}

export function parseDocumentDraftContent(
  content: string,
): StoredDocumentDraftPayload | null {
  try {
    const parsed = JSON.parse(content) as Partial<StoredDocumentDraftPayload>;
    if (!parsed.type || !parsed.title || typeof parsed.body !== "string") {
      return null;
    }
    const status =
      parsed.status === "generated" ? "DRAFT" : (parsed.status ?? "DRAFT");
    return {
      type: parsed.type as DocumentDraftType,
      title: parsed.title,
      body: parsed.body,
      status,
      reviewComment: parsed.reviewComment,
      reviewerId: parsed.reviewerId ?? null,
      paragraphs: Array.isArray(parsed.paragraphs) ? parsed.paragraphs : undefined,
      documentTemplateType:
        parsed.documentTemplateType === "STATEMENT" ||
        parsed.documentTemplateType === "LEGAL_OPINION" ||
        parsed.documentTemplateType === "CONSULTATION_NOTE"
          ? parsed.documentTemplateType
          : undefined,
    };
  } catch {
    return null;
  }
}

export async function createCaseDocumentDraft(data: {
  caseId: string;
  createdByUserId: string;
  type: DocumentDraftType;
  title: string;
  content: string;
  paragraphs?: DraftDocumentParagraph[];
  documentTemplateType?: DocumentTemplateType;
}) {
  const payload: StoredDocumentDraftPayload = {
    type: data.type,
    title: data.title,
    body: data.content,
    status: "DRAFT",
    paragraphs: data.paragraphs,
    documentTemplateType: data.documentTemplateType,
  };

  const row = await prisma.caseTimelineMemo.create({
    data: {
      caseId: data.caseId,
      authorUserId: data.createdByUserId,
      memoType: "USER_NOTE",
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      content: serializeDocumentDraftPayload(payload),
    },
    select: {
      id: true,
      caseId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    id: row.id,
    caseId: row.caseId,
    type: data.type,
    title: data.title,
    status: payload.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function findCaseDocuments(caseId: string) {
  const rows = await prisma.caseTimelineMemo.findMany({
    where: {
      caseId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caseId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return rows
    .map((row) => {
      const parsed = parseDocumentDraftContent(row.content);
      if (!parsed) return null;
      return {
        id: row.id,
        caseId: row.caseId,
        type: parsed.type,
        title: parsed.title,
        status: parsed.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export async function findCaseDocumentDraftById(caseId: string, memoId: string) {
  const row = await prisma.caseTimelineMemo.findFirst({
    where: {
      id: memoId,
      caseId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!row) return null;
  const parsed = parseDocumentDraftContent(row.content);
  if (!parsed) return null;

  return {
    id: row.id,
    caseId: row.caseId,
    authorUserId: row.authorUserId,
    type: parsed.type,
    title: parsed.title,
    body: parsed.body,
    status: parsed.status,
    paragraphs: parsed.paragraphs,
    documentTemplateType: parsed.documentTemplateType,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getCaseForDraftRepository(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
    },
  });
}
