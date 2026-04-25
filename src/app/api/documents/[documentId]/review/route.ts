import { NextRequest } from "next/server";
import {
  documentIdParamsSchema,
  reviewDocumentInputSchema,
} from "@/features/documents/document-detail.validators";
import { documentDetailService } from "@/features/documents/document-detail.service";
import { documentVersionService } from "@/features/document-versions/document-version.service";
import { getSessionUser } from "@/lib/get-session-user";
import { UnauthorizedError } from "@/lib/errors";
import { ok, toErrorResponse } from "@/lib/domain-api-response";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const params = documentIdParamsSchema.parse(await context.params);
    const body = reviewDocumentInputSchema.parse(await req.json());
    const user = await getSessionUser();
    if (!user) {
      throw new UnauthorizedError();
    }

    const document = await documentDetailService.reviewDocument(
      params.documentId,
      body,
      user,
    );

    const summaryMap: Record<string, string> = {
      REQUEST_REVIEW: "검토 요청 시점 스냅샷",
      APPROVE: "문서 승인 시점 스냅샷",
      REJECT: "문서 반려 시점 스냅샷",
    };

    await documentVersionService.createSnapshotFromCurrentDocument(
      params.documentId,
      user,
      summaryMap[body.action] ?? "문서 검토 처리 스냅샷",
    );

    if (body.action === "APPROVE") {
      await documentVersionService.unlockPreviousApprovedBaselines(
        params.documentId,
        user,
      );

      await documentVersionService.lockLatestVersionAsApprovedBaseline(
        params.documentId,
        user,
        "문서 승인 기준 버전 잠금",
      );
    }

    return ok({
      message: "문서 검토 상태가 반영되었습니다.",
      document,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
