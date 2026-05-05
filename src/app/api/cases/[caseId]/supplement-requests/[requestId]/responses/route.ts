import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { NotFoundError } from "@/lib/errors";
import {
  createSupplementResponseService,
  getSupplementRequestDetailService,
} from "@/features/supplement-request/supplement-request.service";
import {
  createSupplementResponseSchema,
  supplementRequestDetailParamSchema,
} from "@/features/supplement-request/supplement-request.validators";

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

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, requestId } = supplementRequestDetailParamSchema.parse(params);

    const detail = await getSupplementRequestDetailService(currentUser, requestId);
    assertRequestBelongsToCase(caseId, detail.caseId);

    const body = await request.json();
    const input = createSupplementResponseSchema.parse(body);

    const result = await createSupplementResponseService(currentUser, requestId, input);

    return ok(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
