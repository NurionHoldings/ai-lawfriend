import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { UnauthorizedError } from "@/lib/errors";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { markApprovalReviewBodySchema } from "@/features/documents/document-detail.validators";
import {
  assertCaseDocumentDraftAccess,
  getStoredDocumentParagraphs,
  markDocumentApprovalReview,
} from "@/features/documents/document-paragraphs.service";

type RouteContext = {
  params: Promise<{ documentId: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { documentId } = await context.params;
    await assertCaseDocumentDraftAccess(user, documentId);
    const result = await getStoredDocumentParagraphs(documentId);

    return ok({
      review: result.review,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { documentId } = await context.params;
    await assertCaseDocumentDraftAccess(user, documentId);
    const body = markApprovalReviewBodySchema.parse(await req.json());

    const review = await markDocumentApprovalReview({
      documentId,
      actorUserId: user.id,
      reviewChecked: body.reviewChecked,
      diffReviewed: body.diffReviewed,
      checklistConfirmed: body.checklistConfirmed,
    });

    return ok(review);
  } catch (error) {
    return toErrorResponse(error);
  }
}
