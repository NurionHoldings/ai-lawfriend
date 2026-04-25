import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { deleteCaseAssignmentParamsSchema } from "@/features/case-assignments/case-assignment.validators";
import { deleteCaseAssignmentService } from "@/features/case-assignments/case-assignment.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string; assignmentId: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, assignmentId } =
      deleteCaseAssignmentParamsSchema.parse(params);

    const result = await deleteCaseAssignmentService(
      currentUser,
      caseId,
      assignmentId
    );
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
