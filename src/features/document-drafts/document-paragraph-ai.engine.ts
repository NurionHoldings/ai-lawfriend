import type { DocumentTemplateType } from "@/features/question-set/question-set.types";
import type { DraftPreviewParagraph } from "./document-draft.types";
import { getOpenAIClient, getParagraphRewriteModel } from "@/lib/openai";
import {
  buildParagraphRewriteInput,
  buildParagraphRewriteInstructions,
} from "./document-paragraph-ai.prompts";

export async function rewriteParagraphWithOpenAI(params: {
  templateType: DocumentTemplateType;
  title: string;
  paragraph: DraftPreviewParagraph;
  userInstruction?: string | null;
}) {
  const client = getOpenAIClient();
  const model = getParagraphRewriteModel();

  const response = await client.responses.create({
    model,
    instructions: buildParagraphRewriteInstructions({
      templateType: params.templateType,
    }),
    input: buildParagraphRewriteInput({
      templateType: params.templateType,
      title: params.title,
      paragraph: params.paragraph,
      userInstruction: params.userInstruction,
    }),
  });

  const outputText = (response.output_text ?? "").trim();

  if (!outputText) {
    throw new Error("AI 재생성 결과가 비어 있습니다.");
  }

  return {
    model,
    text: outputText,
  };
}
