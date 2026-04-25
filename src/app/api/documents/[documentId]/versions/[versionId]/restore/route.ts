import { NextRequest } from "next/server";
import {
  documentVersionIdParamsSchema,
  restoreDocumentVersionInputSchema,
} from "@/features/document-versions/document-version.validators";
import { documentVersionService } from "@/features/document-versions/document-version.service";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

type RouteContext = {
  params: Promise<{
    documentId: string;
    versionId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const params = documentVersionIdParamsSchema.parse(await context.params);
    const body = restoreDocumentVersionInputSchema.parse(await req.json());
    const user = await getSessionUser();

    const restored = await documentVersionService.restoreVersion(
      params.documentId,
      params.versionId,
      body,
      user,
    );

    return ok({
      message: "선택한 버전으로 문서를 복원했습니다.",
      restored,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
