import type {
  DocumentTemplateDefinition,
  GeneratedParagraphSeed,
  QuestionSetDefinition,
} from "@/lib/definitions";
import { buildParagraphSeeds } from "@/lib/definitions";

type AnswerMap = Record<string, unknown>;

function stringifyAnswer(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function transformAnswer(transform: string, value: unknown): string {
  const raw = stringifyAnswer(value);

  switch (transform) {
    case "JOIN_LINES":
      return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" ");
    case "BULLET_LIST":
      return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `- ${line}`)
        .join("\n");
    case "TIMELINE_SUMMARY":
      return raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" → ");
    case "DATE_RANGE_SUMMARY":
      return raw;
    case "RAW":
    default:
      return raw;
  }
}

export type ParagraphDraftSeed = GeneratedParagraphSeed & {
  content: string;
  sourceQuestionKeys: string[];
};

export function buildParagraphDraftSeeds(params: {
  template: DocumentTemplateDefinition;
  questionSet: QuestionSetDefinition;
  answers: AnswerMap;
}): ParagraphDraftSeed[] {
  const templateSeeds = buildParagraphSeeds(params.template);

  return templateSeeds.map((seed) => {
    const relatedQuestions = params.questionSet.sections
      .flatMap((section) => section.questions)
      .filter((question) =>
        question.paragraphMappings.some(
          (mapping) =>
            mapping.documentType === params.template.type &&
            mapping.templateSectionKey === seed.sectionKey &&
            mapping.paragraphKey === seed.paragraphKey,
        ),
      );

    const contentParts = relatedQuestions
      .map((question) => {
        const mapping = question.paragraphMappings.find(
          (m) =>
            m.documentType === params.template.type &&
            m.templateSectionKey === seed.sectionKey &&
            m.paragraphKey === seed.paragraphKey,
        );
        if (!mapping) return "";
        return transformAnswer(mapping.transform, params.answers[question.key]);
      })
      .filter(Boolean);

    const content = contentParts.join("\n\n").trim() || seed.fallbackText || "";

    return {
      ...seed,
      content,
      sourceQuestionKeys: relatedQuestions.map((q) => q.key),
    };
  });
}
