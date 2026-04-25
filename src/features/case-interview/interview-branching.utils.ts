import type {
  InterviewAnswerMap,
  InterviewAnswerValue,
  QuestionCondition,
  QuestionSetQuestion,
  ResolvedInterviewQuestion,
} from "@/features/question-set/question-set.types";
import type { CaseAccessContext } from "@/features/cases/case.permissions";
import { isQuestionAudienceVisibleForAccess } from "./interview-catalog-visibility";

function isFilled(value: InterviewAnswerValue) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function toArray(value: InterviewAnswerValue): Array<string | number | boolean> {
  if (Array.isArray(value)) return value as Array<string | number | boolean>;
  if (value === null || value === undefined) return [];
  return [value as string | number | boolean];
}

function evaluateCondition(condition: QuestionCondition, answers: InterviewAnswerMap) {
  const answer = answers[condition.sourceQuestionKey];

  switch (condition.operator) {
    case "EQUALS":
      return answer === condition.value;

    case "NOT_EQUALS":
      return answer !== condition.value;

    case "INCLUDES": {
      const answerArr = toArray(answer);
      const conditionArr = Array.isArray(condition.value)
        ? condition.value
        : [condition.value];
      return conditionArr.some((item) => answerArr.includes(item as string | number | boolean));
    }

    case "NOT_INCLUDES": {
      const answerArr = toArray(answer);
      const conditionArr = Array.isArray(condition.value)
        ? condition.value
        : [condition.value];
      return conditionArr.every((item) => !answerArr.includes(item as string | number | boolean));
    }

    case "IS_FILLED":
      return isFilled(answer);

    case "IS_EMPTY":
      return !isFilled(answer);

    default:
      return true;
  }
}

export function isQuestionVisible(
  question: QuestionSetQuestion,
  answers: InterviewAnswerMap,
  access: CaseAccessContext,
) {
  if (question.active === false) return false;
  if (!isQuestionAudienceVisibleForAccess(question.audience, access)) {
    return false;
  }

  const rule = question.visibilityRule;
  if (!rule || !rule.conditions || rule.conditions.length === 0) {
    return true;
  }

  if (rule.mode === "ANY") {
    return rule.conditions.some((condition) => evaluateCondition(condition, answers));
  }

  return rule.conditions.every((condition) => evaluateCondition(condition, answers));
}

export function resolveInterviewQuestions(
  questions: QuestionSetQuestion[],
  answers: InterviewAnswerMap,
  access: CaseAccessContext,
): ResolvedInterviewQuestion[] {
  const ordered = [...questions].sort((a, b) => a.order - b.order);

  return ordered.map((question) => {
    const isVisible = isQuestionVisible(question, answers, access);
    const value = answers[question.key];
    const isAnswered = isFilled(value);

    return {
      ...question,
      isVisible,
      isAnswered,
    };
  });
}

export function getNextQuestionKey(resolvedQuestions: ResolvedInterviewQuestion[]): string | null {
  const next = resolvedQuestions.find((q) => q.isVisible && !q.isAnswered);
  return next?.key ?? null;
}

export function buildInterviewProgress(resolvedQuestions: ResolvedInterviewQuestion[]) {
  const visible = resolvedQuestions.filter((q) => q.isVisible);
  const answered = visible.filter((q) => q.isAnswered);

  const totalVisible = visible.length;
  const answeredVisible = answered.length;
  const percent =
    totalVisible === 0 ? 0 : Math.round((answeredVisible / totalVisible) * 100);

  return {
    totalVisible,
    answeredVisible,
    percent,
  };
}
