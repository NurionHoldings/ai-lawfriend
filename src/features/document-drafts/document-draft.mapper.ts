import type {
  DocumentTemplateType,
  InterviewAnswerMap,
  QuestionOption,
  QuestionSetQuestion,
} from "@/features/question-set/question-set.types";
import { DOCUMENT_TEMPLATE_CONFIG } from "./document-template.config";
import { resolveDocumentMappingForTemplate } from "./document-template.utils";
import type {
  DraftDocumentBuildResult,
  DraftDocumentParagraph,
  DraftPreviewResult,
} from "./document-draft.types";
import { buildPreviewBody } from "./document-draft.compose";

function isFilled(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function resolveOptionLabel(options: QuestionOption[] | undefined, value: string) {
  const matched = (options ?? []).find((option) => option.value === value);
  return matched?.label ?? value;
}

function formatAnswerValue(question: QuestionSetQuestion, rawValue: unknown): string {
  if (!isFilled(rawValue)) return "";

  if (question.type === "BOOLEAN") {
    return rawValue === true ? "예" : "아니오";
  }

  if (question.type === "MULTI_SELECT") {
    const values = Array.isArray(rawValue) ? rawValue : [];
    return values
      .map((item) => resolveOptionLabel(question.options, String(item)))
      .join(", ");
  }

  if (question.type === "SELECT") {
    return resolveOptionLabel(question.options, String(rawValue));
  }

  if (question.type === "DATE") {
    return String(rawValue);
  }

  return String(rawValue);
}

function buildParagraphContent(params: {
  question: QuestionSetQuestion;
  answerText: string;
  paragraphLabel: string;
  format: "INLINE" | "BLOCK" | "BULLET";
  prefix?: string | null;
  suffix?: string | null;
}) {
  const { question, answerText, paragraphLabel, format, prefix, suffix } = params;

  const safeLabel = paragraphLabel?.trim() || question.label;
  const safePrefix = prefix?.trim() ? `${prefix} ` : "";
  const safeSuffix = suffix?.trim() ? ` ${suffix}` : "";

  switch (format) {
    case "INLINE":
      return `${safePrefix}${safeLabel}: ${answerText}${safeSuffix}`.trim();

    case "BULLET":
      return `- ${safePrefix}${safeLabel}: ${answerText}${safeSuffix}`.trim();

    case "BLOCK":
    default:
      return `${safePrefix}${safeLabel}\n${answerText}${safeSuffix}`.trim();
  }
}

function groupParagraphsToBody(
  paragraphs: DraftDocumentParagraph[],
  templateType: DocumentTemplateType,
) {
  const templateConfig = DOCUMENT_TEMPLATE_CONFIG[templateType];
  const grouped = new Map<string, DraftDocumentParagraph[]>();

  for (const paragraph of paragraphs) {
    const sectionKey = paragraph.sectionTitle?.trim() || "__default__";
    const current = grouped.get(sectionKey) ?? [];
    current.push(paragraph);
    grouped.set(sectionKey, current);
  }

  const blocks: string[] = [];
  const orderedSectionKeys = [
    ...templateConfig.defaultSections.filter((section) => grouped.has(section)),
    ...Array.from(grouped.keys()).filter(
      (section) =>
        section !== "__default__" && !templateConfig.defaultSections.includes(section),
    ),
  ];

  if (grouped.has("__default__")) {
    const defaultItems = [...(grouped.get("__default__") ?? [])].sort((a, b) => a.order - b.order);
    for (const item of defaultItems) {
      blocks.push(item.content);
    }
    if (defaultItems.length > 0) {
      blocks.push("");
    }
  }

  for (const sectionKey of orderedSectionKeys) {
    blocks.push(sectionKey);

    const sorted = [...(grouped.get(sectionKey) ?? [])].sort((a, b) => a.order - b.order);
    for (const item of sorted) {
      blocks.push(item.content);
    }

    blocks.push("");
  }

  return blocks.join("\n").trim();
}

export function buildDocumentDraftFromInterview(params: {
  caseTitle: string;
  questionSetName?: string | null;
  templateType: DocumentTemplateType;
  visibleQuestions: QuestionSetQuestion[];
  answers: InterviewAnswerMap;
}): DraftDocumentBuildResult {
  const { caseTitle, questionSetName, templateType, visibleQuestions, answers } = params;
  const templateConfig = DOCUMENT_TEMPLATE_CONFIG[templateType];
  const paragraphs: DraftDocumentParagraph[] = [];

  for (const question of visibleQuestions) {
    const mapping = resolveDocumentMappingForTemplate({
      mapping: question.documentMapping,
      templateType,
    });

    if (!mapping?.enabled) continue;

    const rawValue = answers[question.key];
    const filled = isFilled(rawValue);

    if (!filled && (mapping.emptyPolicy ?? "SKIP") === "SKIP") {
      continue;
    }

    const answerText = filled ? formatAnswerValue(question, rawValue) : "";
    const paragraphLabel = mapping.paragraphLabel?.trim() || question.label;
    const sectionTitle = mapping.sectionTitle?.trim() || null;
    const format = mapping.format ?? "BLOCK";
    const order = mapping.order ?? question.order;

    const content = buildParagraphContent({
      question,
      answerText,
      paragraphLabel,
      format,
      prefix: mapping.prefix,
      suffix: mapping.suffix,
    });

    paragraphs.push({
      id: `${templateType}_${question.key}_${order}`,
      sectionTitle,
      label: paragraphLabel,
      content,
      format,
      order,
      sourceQuestionKey: question.key,
    });
  }

  const sortedParagraphs = [...paragraphs].sort((a, b) => a.order - b.order);
  const body = groupParagraphsToBody(sortedParagraphs, templateType);

  const title = `${caseTitle} ${templateConfig.titleSuffix}${questionSetName ? ` - ${questionSetName}` : ""}`;

  return {
    title,
    body,
    paragraphs: sortedParagraphs,
    templateType,
  };
}

export function buildDraftPreviewFromDraft(
  buildResult: DraftDocumentBuildResult,
): DraftPreviewResult {
  const paragraphs = buildResult.paragraphs.map((paragraph) => ({
    ...paragraph,
    included: true,
    locked: false,
    aiHint: null,
  }));

  return {
    title: buildResult.title,
    templateType: buildResult.templateType,
    paragraphs,
    body: buildPreviewBody({
      templateType: buildResult.templateType,
      paragraphs,
    }),
  };
}
