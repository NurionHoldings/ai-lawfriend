import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { getCaseInterviewQuestionSetService } from "@/features/case-interview/case-interview.service";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { UnauthorizedError } from "@/lib/errors";

/** [FILE-013] 권한·질문셋 응답은 서비스 `getCaseAccessContext` + 활성 `QuestionSet` — [1-B]·인터뷰 API와 동일 사건 권한 축. */

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      throw new UnauthorizedError();
    }

    const { caseId } = await context.params;
    const result = await getCaseInterviewQuestionSetService(currentUser, caseId);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
