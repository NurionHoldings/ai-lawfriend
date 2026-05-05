import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  findShareForLawyer,
  logCasePackageAccess,
  resolveShareStatusForResponse,
} from "@/features/case-package/case-package-share.repository";

type RouteContext = {
  params: Promise<{
    shareId: string;
  }>;
};

function getRequestContext(request: Request, actorUserId: string) {
  return {
    actorUserId,
    ip: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  };
}

export async function GET(request: Request, context: RouteContext) {
  const user = await requireSessionUser();
  const { shareId } = await context.params;

  if (
    user.role !== "LAWYER" &&
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
    return NextResponse.json(
      {
        ok: false,
        code: "LAWYER_AUTH_REQUIRED",
        message: "변호사 권한이 필요합니다.",
      },
      { status: 403 },
    );
  }

  const share = await findShareForLawyer({
    shareId,
    lawyerUserId: user.id,
  });

  if (!share) {
    return NextResponse.json(
      {
        ok: false,
        code: "SHARE_NOT_FOUND",
        message: "사건 패키지 공유 정보를 찾을 수 없습니다.",
      },
      { status: 404 },
    );
  }

  const resolvedStatus = resolveShareStatusForResponse({
    status: share.status,
    expiresAt: share.expiresAt,
    revokedAt: share.revokedAt,
  });

  if (resolvedStatus !== "ACTIVE") {
    await logCasePackageAccess({
      shareId: share.id,
      caseId: share.caseId,
      action: resolvedStatus === "EXPIRED" ? "EXPIRED" : "REVOKED",
      targetType: "PACKAGE",
      resultMessage: `공유 상태: ${resolvedStatus}`,
      context: getRequestContext(request, user.id),
    });

    return NextResponse.json(
      {
        ok: false,
        code: resolvedStatus === "EXPIRED" ? "SHARE_EXPIRED" : "SHARE_REVOKED",
        message:
          resolvedStatus === "EXPIRED"
            ? "사건 패키지 공유 기간이 만료되었습니다."
            : "사건 패키지 공유가 취소되었습니다.",
      },
      { status: 403 },
    );
  }

  await logCasePackageAccess({
    shareId: share.id,
    caseId: share.caseId,
    action: "VIEW",
    targetType: "PACKAGE",
    resultMessage: "사건 패키지 상세 열람",
    context: getRequestContext(request, user.id),
  });

  return NextResponse.json({
    ok: true,
    package: {
      share: {
        id: share.id,
        publicCode: share.publicCode,
        expiresAt: share.expiresAt,
        allowSummary: share.allowSummary,
        allowInterview: share.allowInterview,
        allowAttachmentList: share.allowAttachmentList,
        allowAttachmentDownload: share.allowAttachmentDownload,
        allowDocumentDraft: share.allowDocumentDraft,
        allowPackagePdf: share.allowPackagePdf,
      },
      case: {
        id: share.case.id,
        title: share.case.title,
        status: share.case.status,
        caseType: share.case.category,
        summary: share.allowSummary ? share.case.description : null,
        createdAt: share.case.createdAt,
        updatedAt: share.case.updatedAt,
      },
      owner: {
        id: share.owner.id,
        name: share.owner.name,
      },
      attachments: share.allowAttachmentList
        ? share.case.attachments.map((attachment) => ({
            id: attachment.id,
            filename: attachment.originalName,
            mimeType: attachment.mimeType,
            sizeBytes: attachment.sizeBytes,
            createdAt: attachment.createdAt,
          }))
        : [],
      documents: share.allowDocumentDraft ? share.case.legalDocuments : [],
    },
  });
}
