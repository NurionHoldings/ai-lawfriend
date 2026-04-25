import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { UnauthorizedError } from "@/lib/errors";
import {
  LegalDocumentDeliveryBodySchema,
  deliverLegalDocumentPost,
} from "@/lib/legal-documents/deliver-legal-document-post";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { documentId } = await context.params;
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new UnauthorizedError();
    }

    const body = LegalDocumentDeliveryBodySchema.parse(await req.json());
    const result = await deliverLegalDocumentPost(documentId, body, sessionUser);

    return ok(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
