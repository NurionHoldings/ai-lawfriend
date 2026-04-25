import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/domain-api-response";
import {
  canManageQuestionSets,
  createQuestionSet,
  listQuestionSets,
} from "@/features/question-set/question-set.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("인증이 필요합니다.", 401);
    }
    if (!canManageQuestionSets(user.role)) {
      return fail("권한이 없습니다.", 403);
    }

    const data = await listQuestionSets();
    return ok(data);
  } catch (error: unknown) {
    return fail(error instanceof Error ? error.message : "목록 조회 오류", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return fail("인증이 필요합니다.", 401);
    }
    if (!canManageQuestionSets(user.role)) {
      return fail("권한이 없습니다.", 403);
    }

    const body = (await req.json()) as { name?: string };
    const name = body.name?.trim() || `새 질문셋 ${new Date().toLocaleString("ko-KR")}`;

    const data = await createQuestionSet({ name, questions: [] });
    return ok(data, { status: 201 });
  } catch (error: unknown) {
    return fail(error instanceof Error ? error.message : "생성 오류", 400);
  }
}
