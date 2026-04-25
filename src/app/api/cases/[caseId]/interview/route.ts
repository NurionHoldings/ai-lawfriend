import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { saveInterviewAnswerBodySchema } from "@/features/case-interview/case-interview.api.validators";
import {
  clearHiddenInterviewAnswers,
  getInterviewFlow,
  saveInterviewAnswer,
} from "@/features/case-interview/case-interview.service";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ caseId: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { caseId } = await params;
    const flow = await getInterviewFlow(user, caseId);

    return ok(flow);
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const raw = await req.json();
    const body = saveInterviewAnswerBodySchema.parse(raw);
    const { caseId } = await params;

    const normalizedValue = body.value === undefined ? null : body.value;

    await saveInterviewAnswer(user, {
      caseId,
      questionKey: body.questionKey,
      value: normalizedValue,
    });

    const cleanedFlow = await clearHiddenInterviewAnswers(user, caseId);

    return ok({
      saved: true,
      flow: cleanedFlow,
    });
  } catch (error: unknown) {
    return toErrorResponse(error);
  }
}
