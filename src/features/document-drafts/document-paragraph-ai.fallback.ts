import type { DraftPreviewParagraph } from "./document-draft.types";
import type { DocumentTemplateType } from "@/features/question-set/question-set.types";

function trimSafe(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeLineBreaks(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function extractLabelAndBody(content: string) {
  const normalized = normalizeLineBreaks(content);

  if (normalized.startsWith("- ")) {
    return {
      prefix: "- ",
      body: normalized.slice(2).trim(),
    };
  }

  return {
    prefix: "",
    body: normalized,
  };
}

function rewriteInlineParagraph(label: string, body: string) {
  const safeBody = body.replace(/\s+/g, " ").trim();
  return `${label}: ${safeBody}`.trim();
}

function rewriteBlockParagraph(label: string, body: string) {
  const safeBody = normalizeLineBreaks(body);
  return `${label}\n${safeBody}`.trim();
}

function rewriteBulletParagraph(label: string, body: string) {
  const safeBody = body.replace(/\s+/g, " ").trim();
  return `- ${label}: ${safeBody}`.trim();
}

function buildTemplateHint(templateType: DocumentTemplateType) {
  switch (templateType) {
    case "STATEMENT":
      return "진술 중심으로 간결하고 사실 위주로 정리";
    case "LEGAL_OPINION":
      return "법률 검토용 문체로 정리";
    case "CONSULTATION_NOTE":
      return "상담 기록용 요약 문체로 정리";
    default:
      return "문서형 문체로 정리";
  }
}

export function regenerateSingleParagraphFallback(params: {
  paragraph: DraftPreviewParagraph;
  templateType: DocumentTemplateType;
  customInstruction?: string | null;
}) {
  const { paragraph, templateType, customInstruction } = params;

  const label = trimSafe(paragraph.label) || "문단";
  const content = trimSafe(paragraph.content);
  const { body } = extractLabelAndBody(content);

  const hintBase = buildTemplateHint(templateType);
  const hintExtra = trimSafe(customInstruction);
  const hint = [hintBase, hintExtra].filter(Boolean).join(" / ");

  let nextContent = content;

  switch (paragraph.format) {
    case "INLINE":
      nextContent = rewriteInlineParagraph(label, body);
      break;
    case "BULLET":
      nextContent = rewriteBulletParagraph(label, body);
      break;
    case "BLOCK":
    default:
      nextContent = rewriteBlockParagraph(label, body);
      break;
  }

  return {
    ...paragraph,
    content: nextContent,
    aiHint: hint,
  };
}

export function regenerateParagraphsFallback(params: {
  paragraphs: DraftPreviewParagraph[];
  templateType: DocumentTemplateType;
  targetParagraphIds: string[];
  force?: boolean;
  instructionByParagraphId?: Record<string, string | null | undefined>;
}) {
  const targetSet = new Set(params.targetParagraphIds);
  const regeneratedIds: string[] = [];
  const skippedIds: string[] = [];

  const nextParagraphs = params.paragraphs.map((paragraph) => {
    const isTarget = targetSet.has(paragraph.id);
    if (!isTarget) return paragraph;

    if (paragraph.locked && !params.force) {
      skippedIds.push(paragraph.id);
      return paragraph;
    }

    const next = regenerateSingleParagraphFallback({
      paragraph,
      templateType: params.templateType,
      customInstruction: params.instructionByParagraphId?.[paragraph.id] ?? null,
    });

    regeneratedIds.push(paragraph.id);
    return next;
  });

  return {
    paragraphs: nextParagraphs,
    regeneratedIds,
    skippedIds,
  };
}
