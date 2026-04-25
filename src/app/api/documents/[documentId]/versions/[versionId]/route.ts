import { NextRequest } from "next/server";
import { documentVersionIdParamsSchema } from "@/features/document-versions/document-version.validators";
import { documentVersionService } from "@/features/document-versions/document-version.service";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

type RouteContext = {
  params: Promise<{
    documentId: string;
    versionId: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = documentVersionIdParamsSchema.parse(await context.params);
    const user = await getSessionUser();

    const version = await documentVersionService.getVersionDetail(
      params.documentId,
      params.versionId,
      user,
    );

    return ok({ version });
  } catch (error) {
    return toErrorResponse(error);
  }
}
