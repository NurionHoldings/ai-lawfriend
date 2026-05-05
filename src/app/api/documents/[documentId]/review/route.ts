import { NextRequest } from "next/server";
import {
  documentIdParamsSchema,
  reviewDocumentInputSchema,
} from "@/features/documents/document-detail.validators";
import { documentDetailService } from "@/features/documents/document-detail.service";
import { documentVersionService } from "@/features/document-versions/document-version.service";
import { getSessionUser } from "@/lib/get-session-user";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError, ValidationError } from "@/lib/errors";
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

    const legalDocument = await prisma.legalDocument.findUnique({
      where: { id: params.documentId },
      select: { id: true },
    });

    if (body.action === "APPROVE" && legalDocument) {
      const trace = await prisma.documentGenerationTrace.findUnique({
        where: { legalDocumentId: params.documentId },
        select: { id: true },
      });

      if (!trace) {
        throw new ValidationError(
          "문서 승인 전 출처 추적 정보가 없습니다. 문서를 다시 생성하거나 관리자에게 문의하세요.",
        );
      }
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

      if (legalDocument) {
        await prisma.documentGenerationTrace.update({
          where: { legalDocumentId: params.documentId },
          data: { approvedSnapshotAt: new Date() },
        });
      }
    }

    return ok({
      message: "문서 검토 상태가 반영되었습니다.",
      document,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
