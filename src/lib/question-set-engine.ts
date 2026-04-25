import type { InterviewAnswerMap, QuestionDefinition, QuestionSetDefinition } from "@/lib/definitions";
import { getVisibleQuestions } from "@/lib/definitions";

export function buildVisibleQuestionPayload(
  questionSet: QuestionSetDefinition,
  answers: InterviewAnswerMap,
): QuestionDefinition[] {
  return getVisibleQuestions(questionSet, answers);
}

export function groupAnswersByQuestionKey(
  items: Array<{ questionKey: string; answerValue: unknown }>,
): InterviewAnswerMap {
  return items.reduce<InterviewAnswerMap>((acc, item) => {
    acc[item.questionKey] = item.answerValue;
    return acc;
  }, {});
}
