import { prisma } from "@/lib/prisma";
import {
  CASE_DOCUMENT_DRAFT_NOTE_TYPE,
  parseDocumentDraftContent,
} from "@/features/document-drafts/document-draft.repository";
import { splitBodyToParagraphSeeds } from "@/features/documents/document-paragraphs-backfill.utils";
import { buildParagraphInputsFromDraftJson } from "@/features/documents/document-paragraphs.repository";

async function main() {
  const memos = await prisma.caseTimelineMemo.findMany({
    where: {
      noteType: CASE_DOCUMENT_DRAFT_NOTE_TYPE,
      deletedAt: null,
    },
    select: {
      id: true,
      caseId: true,
      content: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let processed = 0;
  let skipped = 0;

  for (const memo of memos) {
    const existingCount = await prisma.caseTimelineMemoParagraph.count({
      where: {
        documentId: memo.id,
      },
    });

    if (existingCount > 0) {
      skipped += 1;
      continue;
    }

    const parsed = parseDocumentDraftContent(memo.content);
    if (!parsed) {
      skipped += 1;
      continue;
    }

    let seeds = splitBodyToParagraphSeeds({
      documentId: memo.id,
      caseId: memo.caseId,
      body: parsed.body ?? "",
    });

    if (seeds.length === 0 && parsed.paragraphs && parsed.paragraphs.length > 0) {
      seeds = buildParagraphInputsFromDraftJson(memo.id, memo.caseId, parsed.paragraphs);
    }

    if (seeds.length === 0) {
      skipped += 1;
      continue;
    }

    await prisma.caseTimelineMemoParagraph.createMany({
      data: seeds.map((paragraph) => ({
        documentId: paragraph.documentId,
        caseId: paragraph.caseId,
        sectionTitle: paragraph.sectionTitle ?? null,
        label: paragraph.label ?? null,
        content: paragraph.content,
        format: paragraph.format,
        orderIndex: paragraph.orderIndex,
        included: paragraph.included,
        locked: paragraph.locked,
        aiHint: paragraph.aiHint ?? null,
        sourceQuestionKey: paragraph.sourceQuestionKey ?? null,
      })),
    });

    processed += 1;
    console.log(`[backfill] document=${memo.id} paragraphs=${seeds.length}`);
  }

  console.log(`[done] processed=${processed} skipped=${skipped} total=${memos.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
