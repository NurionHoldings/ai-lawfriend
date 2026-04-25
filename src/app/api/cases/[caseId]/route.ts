import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { ValidationError } from "@/lib/errors";
import {
  caseIdParamSchema,
  updateCaseSchema,
} from "@/features/cases/case.validators";
import {
  getCaseDetailService,
  softDeleteCaseService,
  updateCaseService,
} from "@/features/cases/case.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const result = await getCaseDetailService(currentUser, caseId);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const body = await request.json();

    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      "status" in body
    ) {
      throw new ValidationError(
        "status 직접 수정은 허용되지 않습니다. 사건 상태 전이는 PATCH /api/cases/:caseId/status 또는 POST /api/cases/:caseId/transition 을 사용하세요.",
      );
    }

    const input = updateCaseSchema.parse(body);

    const result = await updateCaseService(currentUser, caseId, input);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const result = await softDeleteCaseService(currentUser, caseId);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
