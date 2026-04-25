import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { caseIdParamSchema } from "@/features/cases/case.validators";
import { createTimelineMemoSchema } from "@/features/case-timeline/case-timeline.validators";
import {
  createTimelineMemoService,
  listTimelineMemosService,
} from "@/features/case-timeline/case-timeline.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ caseId: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = caseIdParamSchema.parse(params);

    const result = await listTimelineMemosService(currentUser, caseId);
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
    const input = createTimelineMemoSchema.parse(body);

    const result = await createTimelineMemoService(currentUser, caseId, {
      content: input.content,
      memoType: input.memoType,
      alertEventId: input.alertEventId,
      noteType: input.noteType,
    });
    return ok(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
