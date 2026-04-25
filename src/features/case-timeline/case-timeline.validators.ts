import { z } from "zod";

export const createTimelineMemoSchema = z.object({
  content: z.string().trim().min(1, "메모 내용을 입력해 주세요.").max(10000),
  memoType: z.enum(["USER_NOTE", "STAFF_NOTE"]).optional().default("USER_NOTE"),
  alertEventId: z.string().cuid().optional().nullable(),
  noteType: z.string().max(100).optional().nullable(),
});

export const deleteTimelineMemoParamsSchema = z.object({
  caseId: z.string().cuid(),
  memoId: z.string().cuid(),
});
