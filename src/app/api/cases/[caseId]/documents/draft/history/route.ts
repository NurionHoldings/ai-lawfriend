import { NextRequest } from "next/server";
import { fail, ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { getCaseAccessContext } from "@/features/cases/case.permissions";
import { listParagraphRewriteHistoryRepository } from "@/features/document-drafts/document-paragraph-history.repository";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const { caseId } = await context.params;
    const paragraphId = req.nextUrl.searchParams.get("paragraphId") ?? undefined;
    const documentId = req.nextUrl.searchParams.get("documentId") ?? undefined;

    const access = await getCaseAccessContext(currentUser, caseId);
    if (!(access.isOwner || access.isAdmin || access.isAssignedLawyer)) {
      return fail("조회 권한이 없습니다.", 403);
    }

    const items = await listParagraphRewriteHistoryRepository({
      caseId,
      paragraphId,
      documentId: documentId ?? undefined,
      limit: 100,
    });

    return ok({ items });
  } catch (error) {
    return toErrorResponse(error);
  }
}
