import { z } from "zod";

export const createCaseAssignmentSchema = z.object({
  assigneeUserId: z.string().cuid("유효한 담당자 ID가 아닙니다."),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const deleteCaseAssignmentParamsSchema = z.object({
  caseId: z.string().cuid(),
  assignmentId: z.string().cuid(),
});
