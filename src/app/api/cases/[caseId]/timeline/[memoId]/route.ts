import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { deleteTimelineMemoParamsSchema } from "@/features/case-timeline/case-timeline.validators";
import { deleteTimelineMemoService } from "@/features/case-timeline/case-timeline.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string; memoId: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, memoId } = deleteTimelineMemoParamsSchema.parse(params);

    const result = await deleteTimelineMemoService(
      currentUser,
      caseId,
      memoId
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
