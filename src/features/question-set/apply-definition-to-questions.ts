import { ValidationError } from "@/lib/errors";
import { assertQuestionSetIntegrity } from "@/features/question-set/question-set.service";
import type { QuestionSetQuestion } from "@/features/question-set/question-set.types";
import { projectDefinitionJsonToQuestions } from "./project-definition-json-to-questions";

type QuestionSetBackfillContext = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
};

/**
 * (β) + 정합: `definitionJson` → A안 `questions` 투영 뒤 `assertQuestionSetIntegrity`까지 수행.
 * - `publish` 라우트 트랜잭션(게시/재게시)과 동일 투영·검증
 * - 백필 스크립트 — HTTP `publish` 를 호출하지 않음(B §3, §4.2)
 */
export function buildValidatedAQuestionsForQuestionSet(
  definitionJson: unknown | null,
  context: QuestionSetBackfillContext,
): QuestionSetQuestion[] {
  const projected =
    definitionJson == null ? [] : projectDefinitionJsonToQuestions(definitionJson);
  try {
    assertQuestionSetIntegrity({
      id: context.id,
      name: context.name,
      code: context.code,
      description: context.description,
      isActive: context.isActive,
      questions: projected,
    });
  } catch (e) {
    if (e instanceof ValidationError) throw e;
    if (e instanceof Error) throw new ValidationError(e.message);
    throw e;
  }
  return projected;
}
