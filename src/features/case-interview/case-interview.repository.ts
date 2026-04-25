import { prisma } from "@/lib/prisma";

export const CASE_INTERVIEW_NOTE_TYPE = "CLIENT_INTERVIEW_ANSWER";
/** 질문 key → 답변 값(JSON 객체) 단일 메모 */
export const CASE_INTERVIEW_ANSWERS_MAP_NOTE_TYPE = "CLIENT_INTERVIEW_ANSWERS";
export const CASE_INTERVIEW_COMPLETED_NOTE_TYPE = "CLIENT_INTERVIEW_COMPLETED";

export type StoredInterviewAnswer = {
  id: string;
  caseId: string;
  authorUserId: string;
  questionId: string;
  questionKey: string;
  questionText: string;
  answerText: string;
  createdAt: Date;
  updatedAt: Date;
};

type InterviewAnswerPayload = {
  questionId: string;
  questionKey: string;
  questionText: string;
  answerText: string;
};

function serializeInterviewAnswer(payload: InterviewAnswerPayload) {
  return JSON.stringify(payload);
}

function parseInterviewAnswer(content: string): InterviewAnswerPayload | null {
  try {
    const parsed = JSON.parse(content) as Partial<InterviewAnswerPayload>;
    if (
      !parsed.questionId ||
      !parsed.questionKey ||
      !parsed.questionText ||
      !parsed.answerText
    ) {
      return null;
    }
    return {
      questionId: parsed.questionId,
      questionKey: parsed.questionKey,
      questionText: parsed.questionText,
      answerText: parsed.answerText,
    };
  } catch {
    return null;
  }
}

export async function findInterviewAnswersByCaseId(
  caseId: string,
): Promise<StoredInterviewAnswer[]> {
  const items = await prisma.caseTimelineMemo.findMany({
    where: {
      caseId,
      noteType: CASE_INTERVIEW_NOTE_TYPE,
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return items
    .map((item) => {
      const parsed = parseInterviewAnswer(item.content);
      if (!parsed) return null;
      return {
        id: item.id,
        caseId: item.caseId,
        authorUserId: item.authorUserId,
        questionId: parsed.questionId,
        questionKey: parsed.questionKey,
        questionText: parsed.questionText,
        answerText: parsed.answerText,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } satisfies StoredInterviewAnswer;
    })
    .filter((item): item is StoredInterviewAnswer => item !== null);
}

export async function findInterviewAnswerByQuestionId(
  caseId: string,
  questionId: string,
) {
  const item = await prisma.caseTimelineMemo.findFirst({
    where: {
      caseId,
      noteType: CASE_INTERVIEW_NOTE_TYPE,
      deletedAt: null,
      content: {
        contains: `"questionId":"${questionId}"`,
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
    },
  });

  if (!item) return null;
  const parsed = parseInterviewAnswer(item.content);
  if (!parsed) return null;
  return { id: item.id, ...parsed };
}

export async function createInterviewAnswer(data: {
  caseId: string;
  authorUserId: string;
  questionId: string;
  questionKey: string;
  questionText: string;
  answerText: string;
}) {
  return prisma.caseTimelineMemo.create({
    data: {
      caseId: data.caseId,
      authorUserId: data.authorUserId,
      memoType: "USER_NOTE",
      noteType: CASE_INTERVIEW_NOTE_TYPE,
      content: serializeInterviewAnswer(data),
    },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateInterviewAnswer(
  memoId: string,
  data: InterviewAnswerPayload,
) {
  return prisma.caseTimelineMemo.update({
    where: { id: memoId },
    data: {
      content: serializeInterviewAnswer(data),
    },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findInterviewCompletionByCaseId(caseId: string) {
  return prisma.caseTimelineMemo.findFirst({
    where: {
      caseId,
      noteType: CASE_INTERVIEW_COMPLETED_NOTE_TYPE,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      content: true,
      createdAt: true,
    },
  });
}

export async function markInterviewCompleted(data: {
  caseId: string;
  authorUserId: string;
}) {
  return prisma.caseTimelineMemo.create({
    data: {
      caseId: data.caseId,
      authorUserId: data.authorUserId,
      memoType: "USER_NOTE",
      noteType: CASE_INTERVIEW_COMPLETED_NOTE_TYPE,
      content: JSON.stringify({
        completed: true,
        completedAt: new Date().toISOString(),
      }),
    },
    select: {
      id: true,
      caseId: true,
      authorUserId: true,
      createdAt: true,
    },
  });
}
