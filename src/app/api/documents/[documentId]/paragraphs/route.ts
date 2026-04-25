import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { UnauthorizedError } from "@/lib/errors";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { putDocumentParagraphsBodySchema } from "@/features/documents/document-detail.validators";
import type { UpsertDocumentParagraphInput } from "@/features/documents/document-paragraphs.types";
import {
  assertCaseDocumentDraftAccess,
  getStoredDocumentParagraphs,
  saveStoredDocumentParagraphs,
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

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { documentId } = await context.params;
    await assertCaseDocumentDraftAccess(user, documentId);
    const body = putDocumentParagraphsBodySchema.parse(await req.json());

    const result = await saveStoredDocumentParagraphs({
      documentId,
      actorUserId: user.id,
      paragraphs: body.paragraphs as UpsertDocumentParagraphInput[],
    });

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
