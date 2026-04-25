import type { DocumentParagraphRewriteHistory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ParagraphRewriteHistoryItem } from "./document-draft.types";

function mapHistory(row: DocumentParagraphRewriteHistory): ParagraphRewriteHistoryItem {
  return {
    id: row.id,
    caseId: row.caseId,
    documentId: row.documentId ?? null,
    paragraphId: row.paragraphId,
    sourceQuestionKey: row.sourceQuestionKey ?? null,
    templateType: row.templateType,
    title: row.title ?? null,
    beforeContent: row.beforeContent,
    afterContent: row.afterContent,
    instruction: row.instruction ?? null,
    aiModel: row.aiModel ?? null,
    status: row.status,
    actorUserId: row.actorUserId,
    createdAt: row.createdAt,
  };
}

export async function createParagraphRewriteHistoryRepository(input: {
  caseId: string;
  documentId?: string | null;
  paragraphId: string;
  sourceQuestionKey?: string | null;
  templateType: string;
  title?: string | null;
  beforeContent: string;
  afterContent: string;
  instruction?: string | null;
  aiModel?: string | null;
  status?: string;
  actorUserId: string;
}) {
  const row = await prisma.documentParagraphRewriteHistory.create({
    data: {
      caseId: input.caseId,
      documentId: input.documentId ?? null,
      paragraphId: input.paragraphId,
      sourceQuestionKey: input.sourceQuestionKey ?? null,
      templateType: input.templateType,
      title: input.title ?? null,
      beforeContent: input.beforeContent,
      afterContent: input.afterContent,
      instruction: input.instruction ?? null,
      aiModel: input.aiModel ?? null,
      status: input.status ?? "SUCCEEDED",
      actorUserId: input.actorUserId,
    },
  });

  return mapHistory(row);
}

export async function listParagraphRewriteHistoryRepository(params: {
  caseId: string;
  paragraphId?: string;
  documentId?: string | null;
  limit?: number;
}) {
  const rows = await prisma.documentParagraphRewriteHistory.findMany({
    where: {
      caseId: params.caseId,
      ...(params.paragraphId ? { paragraphId: params.paragraphId } : {}),
      ...(params.documentId != null && String(params.documentId).trim() !== ""
        ? { documentId: String(params.documentId) }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: params.limit ?? 100,
  });

  return rows.map(mapHistory);
}

export async function findParagraphRewriteHistoryById(id: string) {
  const row = await prisma.documentParagraphRewriteHistory.findUnique({
    where: { id },
  });
  return row ? mapHistory(row) : null;
}
