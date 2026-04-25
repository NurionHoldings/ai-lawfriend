import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { UnauthorizedError } from "@/lib/errors";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { postParagraphVersionSnapshotBodySchema } from "@/features/document-versions/document-version.validators";
import { assertCaseDocumentDraftAccess } from "@/features/documents/document-paragraphs.service";
import {
  createDocumentParagraphSnapshot,
  listDocumentParagraphVersionGroups,
} from "@/features/documents/document-paragraph-versions.service";

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
    const groups = await listDocumentParagraphVersionGroups(documentId);

    return ok({ groups });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const body = postParagraphVersionSnapshotBodySchema.parse(
      await req.json().catch(() => ({})),
    );
    const { documentId } = await context.params;
    await assertCaseDocumentDraftAccess(user, documentId);

    const snapshot = await createDocumentParagraphSnapshot({
      documentId,
      actorUserId: user.id,
      reason: body.reason ?? "MANUAL_SNAPSHOT",
    });

    return ok(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}
