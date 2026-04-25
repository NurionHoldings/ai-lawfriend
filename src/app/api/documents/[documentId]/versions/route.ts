import { NextRequest } from "next/server";
import { documentVersionParamsSchema } from "@/features/document-versions/document-version.validators";
import { documentVersionService } from "@/features/document-versions/document-version.service";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = documentVersionParamsSchema.parse(await context.params);
    const user = await getSessionUser();

    const versions = await documentVersionService.listVersions(
      params.documentId,
      user,
    );

    return ok({ versions });
  } catch (error) {
    return toErrorResponse(error);
  }
}
