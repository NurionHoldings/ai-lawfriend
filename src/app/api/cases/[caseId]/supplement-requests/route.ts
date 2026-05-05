import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  createSupplementRequestService,
  listSupplementRequestsService,
} from "@/features/supplement-request/supplement-request.service";
import {
  createSupplementRequestSchema,
  supplementCaseIdParamSchema,
  supplementRequestListQuerySchema,
} from "@/features/supplement-request/supplement-request.validators";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = supplementCaseIdParamSchema.parse(params);

    const url = new URL(request.url);
    const query = supplementRequestListQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
    });

    const result = await listSupplementRequestsService(currentUser, caseId, query);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = supplementCaseIdParamSchema.parse(params);
    const body = await request.json();
    const input = createSupplementRequestSchema.parse(body);

    const created = await createSupplementRequestService(currentUser, caseId, input);

    return ok(created, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}