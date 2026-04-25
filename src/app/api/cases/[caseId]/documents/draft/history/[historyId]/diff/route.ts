import { NextRequest } from "next/server";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { getParagraphRewriteDiff } from "@/features/document-drafts/document-draft.service";
import { filterParagraphDiffLines } from "@/features/document-drafts/document-paragraph-diff.utils";

type RouteContext = {
  params: Promise<{ caseId: string; historyId: string }>;
};

function normalizeFilter(value: string | null) {
  if (
    value === "ALL" ||
    value === "CHANGED_ONLY" ||
    value === "ADDED_ONLY" ||
    value === "REMOVED_ONLY"
  ) {
    return value;
  }
  return "ALL";
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { caseId, historyId } = await context.params;
    const filter = normalizeFilter(req.nextUrl.searchParams.get("filter"));

    const result = await getParagraphRewriteDiff(user, { caseId, historyId });

    return ok({
      history: result.history,
      diffLines: filterParagraphDiffLines(result.diffLines, filter),
      filter,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
