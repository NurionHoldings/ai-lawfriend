import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { isCasePackageAdminUser } from "@/features/case-package/case-package-admin-auth";
import { getAdminCasePackageShareDetail } from "@/features/case-package/case-package-share.repository";
import { buildCasePackageAdminRiskBadges } from "@/features/case-package/case-package-admin-risk";

type RouteContext = {
  params: Promise<{
    shareId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();

  if (!user || !isCasePackageAdminUser(user)) {
    return NextResponse.json(
      {
        ok: false,
        code: "ADMIN_AUTH_REQUIRED",
        message: "관리자 권한이 필요합니다.",
      },
      { status: 403 },
    );
  }

  const { shareId } = await context.params;
  const share = await getAdminCasePackageShareDetail({ shareId });

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

  return NextResponse.json({
    ok: true,
    share: {
      ...share,
      riskBadges: buildCasePackageAdminRiskBadges({
        status: share.status,
        lawyerUserId: share.lawyerUserId,
        expiresAt: share.expiresAt,
        allowAttachmentDownload: share.allowAttachmentDownload,
        allowPackagePdf: share.allowPackagePdf,
        accessLogs: share.accessLogs,
      }),
    },
  });
}
