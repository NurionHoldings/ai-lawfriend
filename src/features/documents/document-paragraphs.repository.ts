import type { CaseTimelineMemoParagraph } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DraftDocumentParagraph } from "@/features/document-drafts/document-draft.types";
import type {
  DocumentApprovalReviewEntity,
  DocumentParagraphEntity,
  UpsertDocumentParagraphInput,
} from "./document-paragraphs.types";

function mapParagraph(row: CaseTimelineMemoParagraph): DocumentParagraphEntity {
  const format = row.format;
  const safeFormat =
    format === "INLINE" || format === "BLOCK" || format === "BULLET" ? format : "BLOCK";
  return {
    id: row.id,
    documentId: row.documentId,
    caseId: row.caseId,
    sectionTitle: row.sectionTitle ?? null,
    label: row.label ?? null,
    content: row.content,
    format: safeFormat,
    orderIndex: row.orderIndex,
    included: Boolean(row.included),
    locked: Boolean(row.locked),
    aiHint: row.aiHint ?? null,
    sourceQuestionKey: row.sourceQuestionKey ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapApprovalReview(row: {
  id: string;
  documentId: string;
  caseId: string;
  reviewChecked: boolean;
  diffReviewed: boolean;
  checklistConfirmed: boolean;
  reviewerUserId: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): DocumentApprovalReviewEntity {
  return {
    id: row.id,
    documentId: row.documentId,
    caseId: row.caseId,
    reviewChecked: Boolean(row.reviewChecked),
    diffReviewed: Boolean(row.diffReviewed),
    checklistConfirmed: Boolean(row.checklistConfirmed),
    reviewerUserId: row.reviewerUserId ?? null,
    reviewedAt: row.reviewedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listDocumentParagraphsRepository(documentId: string) {
  const rows = await prisma.caseTimelineMemoParagraph.findMany({
    where: { documentId },
    orderBy: { orderIndex: "asc" },
  });

  return rows.map(mapParagraph);
}

export async function replaceDocumentParagraphsRepository(params: {
  documentId: string;
  caseId: string;
  paragraphs: UpsertDocumentParagraphInput[];
}) {
  await prisma.$transaction(async (tx) => {
    await tx.caseTimelineMemoParagraph.deleteMany({
      where: { documentId: params.documentId },
    });

    if (params.paragraphs.length > 0) {
      await tx.caseTimelineMemoParagraph.createMany({
        data: params.paragraphs.map((paragraph, index) => ({
          documentId: params.documentId,
          caseId: params.caseId,
          sectionTitle: paragraph.sectionTitle ?? null,
          label: paragraph.label ?? null,
          content: paragraph.content,
          format: paragraph.format,
          orderIndex: paragraph.orderIndex ?? index + 1,
          included: paragraph.included,
          locked: paragraph.locked,
          aiHint: paragraph.aiHint ?? null,
          sourceQuestionKey: paragraph.sourceQuestionKey ?? null,
        })),
      });
    }
  });

  return listDocumentParagraphsRepository(params.documentId);
}

export async function getDocumentApprovalReviewRepository(documentId: string) {
  const row = await prisma.documentApprovalReview.findUnique({
    where: {
      documentId,
    },
  });

  return row ? mapApprovalReview(row) : null;
}

export async function upsertDocumentApprovalReviewRepository(input: {
  documentId: string;
  caseId: string;
  reviewChecked?: boolean;
  diffReviewed?: boolean;
  checklistConfirmed?: boolean;
  reviewerUserId?: string | null;
  reviewedAt?: Date | null;
}) {
  const row = await prisma.documentApprovalReview.upsert({
    where: { documentId: input.documentId },
    update: {
      ...(typeof input.reviewChecked === "boolean"
        ? { reviewChecked: input.reviewChecked }
        : {}),
      ...(typeof input.diffReviewed === "boolean"
        ? { diffReviewed: input.diffReviewed }
        : {}),
      ...(typeof input.checklistConfirmed === "boolean"
        ? { checklistConfirmed: input.checklistConfirmed }
        : {}),
      ...(input.reviewerUserId !== undefined
        ? { reviewerUserId: input.reviewerUserId }
        : {}),
      ...(input.reviewedAt !== undefined ? { reviewedAt: input.reviewedAt } : {}),
    },
    create: {
      documentId: input.documentId,
      caseId: input.caseId,
      reviewChecked: input.reviewChecked ?? false,
      diffReviewed: input.diffReviewed ?? false,
      checklistConfirmed: input.checklistConfirmed ?? false,
      reviewerUserId: input.reviewerUserId ?? null,
      reviewedAt: input.reviewedAt ?? null,
    },
  });

  return mapApprovalReview(row);
}

/** 초안 JSON의 paragraphs 배열 → DB 시드용 입력 */
export function buildParagraphInputsFromDraftJson(
  documentId: string,
  caseId: string,
  paragraphs: DraftDocumentParagraph[],
): UpsertDocumentParagraphInput[] {
  return [...paragraphs]
    .sort((a, b) => a.order - b.order)
    .map((p, index) => ({
      documentId,
      caseId,
      sectionTitle: p.sectionTitle ?? null,
      label: p.label ?? null,
      content: p.content,
      format: p.format,
      orderIndex: index + 1,
      included: true,
      locked: false,
      aiHint: null,
      sourceQuestionKey: p.sourceQuestionKey,
    }));
}

type SplitState = {
  order: number;
  currentSectionTitle: string | null;
};

/** 본문만 있을 때 역파싱하여 시드용 입력 생성 */
export function buildParagraphInputsFromBodySplit(
  documentId: string,
  caseId: string,
  body: string,
): UpsertDocumentParagraphInput[] {
  const normalized = (body ?? "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const out: UpsertDocumentParagraphInput[] = [];
  const state: SplitState = { order: 1, currentSectionTitle: null };

  for (const block of rawBlocks) {
    const isSectionLike =
      /^\d+\.\s/.test(block) && !block.includes("\n") && block.length <= 80;

    if (isSectionLike) {
      state.currentSectionTitle = block;
      continue;
    }

    const firstLine = block.split("\n")[0]?.trim() ?? "";
    const label =
      firstLine && !firstLine.includes(":") && block.includes("\n") ? firstLine : null;

    const format: "BLOCK" | "BULLET" = block.startsWith("- ") ? "BULLET" : "BLOCK";
    const idx = state.order;
    state.order += 1;

    out.push({
      documentId,
      caseId,
      sectionTitle: state.currentSectionTitle,
      label,
      content: block,
      format,
      orderIndex: idx,
      included: true,
      locked: false,
      aiHint: null,
      sourceQuestionKey: null,
    });
  }

  return out;
}
