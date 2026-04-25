import { NextRequest } from "next/server";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { regenerateDraftParagraphs } from "@/features/document-drafts/document-draft.service";
import { regenerateDraftParagraphsSchema } from "@/features/document-drafts/document-draft.validators";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const body = await req.json();
    const { caseId } = await context.params;

    const input = regenerateDraftParagraphsSchema.parse(body);

    const result = await regenerateDraftParagraphs(currentUser, {
      caseId,
      templateType: input.templateType,
      title: input.title?.trim() ?? "문서 초안",
      paragraphs: input.paragraphs,
      targetParagraphIds: input.targetParagraphIds,
      force: input.force,
      instructionByParagraphId: input.instructionByParagraphId,
      documentId: input.documentId ?? null,
      actorUserId: currentUser.id,
    });

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
