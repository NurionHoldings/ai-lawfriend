import { prisma } from "@/lib/prisma";
import type { DraftDocumentParagraph } from "@/features/document-drafts/document-draft.types";
import {
  CASE_DOCUMENT_DRAFT_NOTE_TYPE,
  parseDocumentDraftContent,
} from "@/features/document-drafts/document-draft.repository";
import { listDocumentParagraphsRepository } from "./document-paragraphs.repository";
import type { DocumentParagraphEntity } from "./document-paragraphs.types";
import type {
  DocumentDetailParagraphPanelPayload,
  DocumentParagraphPanelItem,
} from "./document-detail.types";

type SplitBlock = DocumentParagraphPanelItem & {
  isSectionMarker: boolean;
};

function splitDocumentBodyToParagraphs(body: string): SplitBlock[] {
  const normalized = (body ?? "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  let order = 1;
  let currentSectionTitle: string | null = null;

  return rawBlocks.map((block) => {
    const isSectionLike =
      /^\d+\.\s/.test(block) && !block.includes("\n") && block.length <= 80;

    if (isSectionLike) {
      currentSectionTitle = block;
      const idx = order;
      order += 1;
      return {
        id: `section_marker_${idx}`,
        sectionTitle: currentSectionTitle,
        label: currentSectionTitle,
        content: block,
        format: "BLOCK" as const,
        order: idx,
        sourceQuestionKey: null,
        included: false,
        locked: true,
        aiHint: "섹션 헤더",
        isSectionMarker: true,
      };
    }

    const firstLine = block.split("\n")[0]?.trim() ?? "";
    const label =
      firstLine && !firstLine.includes(":") && block.includes("\n") ? firstLine : null;

    const idx = order;
    order += 1;

    return {
      id: `paragraph_${idx}`,
      sectionTitle: currentSectionTitle,
      label,
      content: block,
      format: block.startsWith("- ") ? ("BULLET" as const) : ("BLOCK" as const),
      order: idx,
      sourceQuestionKey: null,
      included: true,
      locked: false,
      aiHint: null,
      isSectionMarker: false,
    };
  });
}

function mapStoredParagraphs(paragraphs: DraftDocumentParagraph[]): DocumentParagraphPanelItem[] {
  return [...paragraphs]
    .sort((a, b) => a.order - b.order)
    .map((p) => ({
      id: p.id,
      sectionTitle: p.sectionTitle ?? null,
      label: p.label ?? null,
      content: p.content,
      format: p.format,
      order: p.order,
      sourceQuestionKey: p.sourceQuestionKey,
      included: true,
      locked: false,
      aiHint: null,
    }));
}

function mapDbParagraphToPanel(p: DocumentParagraphEntity): DocumentParagraphPanelItem {
  return {
    id: p.id,
    sectionTitle: p.sectionTitle,
    label: p.label,
    content: p.content,
    format: p.format,
    order: p.orderIndex,
    sourceQuestionKey: p.sourceQuestionKey,
    included: p.included,
    locked: p.locked,
    aiHint: p.aiHint,
  };
}

export async function getDocumentParagraphPanelRepository(
  documentId: string,
): Promise<DocumentDetailParagraphPanelPayload | null> {
  const row = await prisma.caseTimelineMemo.findFirst({
    where: {
      id: documentId,
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
    select: {
      id: true,
      caseId: true,
      content: true,
    },
  });

  if (!row) return null;

  const parsed = parseDocumentDraftContent(row.content);
  if (!parsed) return null;

  const body = parsed.body ?? "";
  let paragraphs: DocumentParagraphPanelItem[];

  const fromDb = await listDocumentParagraphsRepository(documentId);
  if (fromDb.length > 0) {
    paragraphs = fromDb.map(mapDbParagraphToPanel);
  } else if (parsed.paragraphs && parsed.paragraphs.length > 0) {
    paragraphs = mapStoredParagraphs(parsed.paragraphs);
  } else {
    paragraphs = splitDocumentBodyToParagraphs(body)
      .filter((item) => !item.isSectionMarker)
      .map((item) => {
        const { isSectionMarker, ...rest } = item;
        void isSectionMarker;
        return rest;
      });
  }

  const recentRewriteCount = await prisma.documentParagraphRewriteHistory.count({
    where: {
      caseId: row.caseId,
      documentId: row.id,
    },
  });

  const approvalLocked = parsed.status === "APPROVED";
  const lockedParagraphCount = paragraphs.filter((p) => Boolean(p.locked)).length;
  const includedParagraphCount = paragraphs.filter((p) => p.included).length;

  return {
    documentId: row.id,
    caseId: row.caseId,
    title: parsed.title,
    paragraphs,
    approvalReview: {
      includedParagraphCount,
      lockedParagraphCount,
      paragraphCount: paragraphs.length,
      recentRewriteCount,
      approvalLocked,
    },
  };
}
