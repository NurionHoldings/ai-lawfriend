import { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { completeCaseInterviewService } from "@/features/case-interview/case-interview.service";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();

    const { caseId } = await context.params;
    const result = await completeCaseInterviewService(currentUser, caseId);

    return ok(result);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
