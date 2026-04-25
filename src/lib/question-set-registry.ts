import type { QuestionSetDefinition } from "@/lib/definitions";
import { STATEMENT_DEFAULT_QUESTION_SET_V1 } from "@/lib/definitions/question-set.sample";

const REGISTRY: Record<string, QuestionSetDefinition> = {
  [`${STATEMENT_DEFAULT_QUESTION_SET_V1.code}@${STATEMENT_DEFAULT_QUESTION_SET_V1.version}`]:
    STATEMENT_DEFAULT_QUESTION_SET_V1,
};

export function getQuestionSetDefinitionByCodeVersion(code: string, version: string) {
  return REGISTRY[`${code}@${version}`] ?? null;
}
