import { NextRequest } from "next/server";
import {
  createDocumentSnapshotBodySchema,
  documentVersionParamsSchema,
} from "@/features/document-versions/document-version.validators";
import { documentVersionService } from "@/features/document-versions/document-version.service";
import { getSessionUser } from "@/lib/get-session-user";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const params = documentVersionParamsSchema.parse(await context.params);
    const body = createDocumentSnapshotBodySchema.parse(
      await req.json().catch(() => ({})),
    );
    const user = await getSessionUser();

    const snapshot = await documentVersionService.createSnapshotFromCurrentDocument(
      params.documentId,
      user,
      body.changeSummary,
    );

    return ok({
      message: "문서 버전 스냅샷이 생성되었습니다.",
      version: snapshot,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
