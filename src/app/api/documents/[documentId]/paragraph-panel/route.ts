import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { getDocumentParagraphPanelForUser } from "@/features/documents/document-paragraph-panel.service";
import { UnauthorizedError } from "@/lib/errors";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

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
    const payload = await getDocumentParagraphPanelForUser(user, documentId);
    return ok(payload);
  } catch (error) {
    return toErrorResponse(error);
  }
}
