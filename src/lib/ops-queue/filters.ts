import { z } from "zod";

export const OpsQueueBoardFilterSchema = z.object({
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  taxonomy: z.string().optional(),
  q: z.string().optional(),
  overdueOnly: z.union([z.literal("true"), z.literal("false")]).optional(),
  includeDone: z.union([z.literal("true"), z.literal("false")]).optional(),
  onlyOpen: z.union([z.literal("true"), z.literal("false")]).optional(),
});

export type OpsQueueBoardFilters = z.infer<typeof OpsQueueBoardFilterSchema>;

export type NormalizedOpsQueueBoardFilters = {
  assigneeId: string | undefined;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT" | undefined;
  taxonomy: string | undefined;
  q: string | undefined;
  overdueOnly: boolean;
  /** 기본 true: 쿼리 없을 때 기존 보드(완료 컬럼 포함)와 동일 */
  includeDone: boolean;
};

export function normalizeBoardFilters(
  input: Record<string, string | null | undefined>,
): NormalizedOpsQueueBoardFilters {
  const parsed = OpsQueueBoardFilterSchema.safeParse({
    assigneeId: input.assigneeId || undefined,
    priority: input.priority || undefined,
    taxonomy: input.taxonomy || undefined,
    q: input.q || undefined,
    overdueOnly: input.overdueOnly || undefined,
    includeDone: input.includeDone || undefined,
    onlyOpen: input.onlyOpen || undefined,
  });

  if (!parsed.success) {
    return {
      assigneeId: undefined,
      priority: undefined,
      taxonomy: undefined,
      q: undefined,
      overdueOnly: false,
      includeDone: true,
    };
  }

  const { data } = parsed;

  const includeDone =
    data.includeDone === "true"
      ? true
      : data.includeDone === "false"
        ? false
        : data.onlyOpen === "true"
          ? false
          : true;

  return {
    assigneeId: data.assigneeId,
    priority: data.priority,
    taxonomy: data.taxonomy,
    q: data.q,
    overdueOnly: data.overdueOnly === "true",
    includeDone,
  };
}
