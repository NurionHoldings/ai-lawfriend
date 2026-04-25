import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { createCaseAssignmentSchema } from "@/features/case-assignments/case-assignment.validators";
import {
  createCaseAssignmentService,
  listCaseAssignmentsService,
} from "@/features/case-assignments/case-assignment.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const result = await listCaseAssignmentsService(currentUser, caseId);
    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const body = await request.json();
    const input = createCaseAssignmentSchema.parse(body);

    const result = await createCaseAssignmentService(currentUser, caseId, input);
    return ok(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
