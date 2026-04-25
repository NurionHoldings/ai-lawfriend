import { NextRequest } from "next/server";
import {
  documentIdParamsSchema,
  updateDocumentInputSchema,
} from "@/features/documents/document-detail.validators";
import { documentDetailService } from "@/features/documents/document-detail.service";
import { documentVersionService } from "@/features/document-versions/document-version.service";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { UnauthorizedError } from "@/lib/errors";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const params = documentIdParamsSchema.parse(await context.params);
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const document = await documentDetailService.getDocumentDetail(
      params.documentId,
      user,
    );

    return ok({ document });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const params = documentIdParamsSchema.parse(await context.params);
    const body = updateDocumentInputSchema.parse(await req.json());
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const document = await documentDetailService.updateDocument(
      params.documentId,
      body,
      user,
    );

    await documentVersionService.createSnapshotFromCurrentDocument(
      params.documentId,
      user,
      "문서 저장 시 자동 스냅샷",
    );

    return ok({
      message: "문서가 저장되었습니다.",
      document,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
