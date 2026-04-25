import { z } from "zod";

/**
 * 인터뷰 답변 POST (`/api/cases/:caseId/interview`) body.
 * [FILE-014] — 알 수 없는 키 거부(`.strict()`), [§5·Batch A] `transition` / `status` body 정렬과 동일 축.
 */
const interviewAnswerValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
]);

export const saveInterviewAnswerBodySchema = z
  .object({
    questionKey: z.string().min(1, "questionKey가 필요합니다."),
    value: interviewAnswerValueSchema.optional(),
  })
  .strict();

export type SaveInterviewAnswerBody = z.infer<typeof saveInterviewAnswerBodySchema>;
