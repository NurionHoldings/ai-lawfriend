import type { DraftPreviewParagraph } from "./document-draft.types";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";
import { rewriteParagraphWithOpenAI } from "./document-paragraph-ai.engine";

function normalizeLineBreaks(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function regenerateParagraphsWithAI(params: {
  paragraphs: DraftPreviewParagraph[];
  templateType: DocumentTemplateType;
  title: string;
  targetParagraphIds: string[];
  force?: boolean;
  instructionByParagraphId?: Record<string, string | null | undefined>;
}) {
  const targetSet = new Set(params.targetParagraphIds);
  const regeneratedIds: string[] = [];
  const skippedIds: string[] = [];
  const historyDrafts: Array<{
    paragraphId: string;
    sourceQuestionKey?: string | null;
    beforeContent: string;
    afterContent: string;
    instruction?: string | null;
    aiModel?: string | null;
  }> = [];

  const nextParagraphs: DraftPreviewParagraph[] = [];

  for (const paragraph of params.paragraphs) {
    const isTarget = targetSet.has(paragraph.id);

    if (!isTarget) {
      nextParagraphs.push(paragraph);
      continue;
    }

    if (paragraph.locked && !params.force) {
      skippedIds.push(paragraph.id);
      nextParagraphs.push(paragraph);
      continue;
    }

    const userInstruction = params.instructionByParagraphId?.[paragraph.id] ?? null;
    const beforeContent = paragraph.content;

    const aiResult = await rewriteParagraphWithOpenAI({
      templateType: params.templateType,
      title: params.title,
      paragraph,
      userInstruction,
    });

    const nextParagraph: DraftPreviewParagraph = {
      ...paragraph,
      content: normalizeLineBreaks(aiResult.text),
      aiHint: userInstruction?.trim() || "기본 재작성",
    };

    nextParagraphs.push(nextParagraph);
    regeneratedIds.push(paragraph.id);

    historyDrafts.push({
      paragraphId: paragraph.id,
      sourceQuestionKey: paragraph.sourceQuestionKey,
      beforeContent,
      afterContent: nextParagraph.content,
      instruction: userInstruction,
      aiModel: aiResult.model,
    });
  }

  return {
    paragraphs: nextParagraphs,
    regeneratedIds,
    skippedIds,
    historyDrafts,
  };
}
