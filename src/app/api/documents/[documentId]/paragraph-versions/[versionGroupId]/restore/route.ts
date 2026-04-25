import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { UnauthorizedError } from "@/lib/errors";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { assertCaseDocumentDraftAccess } from "@/features/documents/document-paragraphs.service";
import { restoreDocumentParagraphVersionGroup } from "@/features/documents/document-paragraph-versions.service";

type RouteContext = {
  params: Promise<{ documentId: string; versionGroupId: string }>;
};

export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const { documentId, versionGroupId } = await context.params;
    await assertCaseDocumentDraftAccess(user, documentId);

    const result = await restoreDocumentParagraphVersionGroup({
      documentId,
      versionGroupId,
      actorUserId: user.id,
    });

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
