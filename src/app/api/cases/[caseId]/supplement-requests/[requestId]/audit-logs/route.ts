import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import { getSupplementRequestDetailService } from "@/features/supplement-request/supplement-request.service";
import { supplementRequestDetailParamSchema } from "@/features/supplement-request/supplement-request.validators";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
    requestId: string;
  }>;
};

function assertRequestBelongsToCase(caseId: string, requestCaseId: string) {
  if (caseId !== requestCaseId) {
    throw new NotFoundError("보완요청을 찾을 수 없습니다.");
  }
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, requestId } = supplementRequestDetailParamSchema.parse(params);

    const result = await getSupplementRequestDetailService(currentUser, requestId);
    assertRequestBelongsToCase(caseId, result.caseId);

    return ok({
      requestId,
      auditLogs: result.auditLogs,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
