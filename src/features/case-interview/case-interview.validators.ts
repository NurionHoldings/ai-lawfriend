import { z } from "zod";

export const saveCaseInterviewAnswerSchema = z.object({
  questionId: z.string().min(1),
  questionKey: z.string().min(1),
  questionText: z.string().min(1).max(500),
  answerText: z
    .string()
    .trim()
    .min(1, "답변을 입력해 주세요.")
    .max(5000, "답변은 5000자 이하여야 합니다."),
});

export type SaveCaseInterviewAnswerInput = z.infer<
  typeof saveCaseInterviewAnswerSchema
>;
