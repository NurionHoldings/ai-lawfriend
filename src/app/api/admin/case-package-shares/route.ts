import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/get-session-user";
import { isCasePackageAdminUser } from "@/features/case-package/case-package-admin-auth";
import { listAdminCasePackageShares } from "@/features/case-package/case-package-share.repository";
import { buildCasePackageAdminRiskBadges } from "@/features/case-package/case-package-admin-risk";

function parseStatus(value: string | null) {
  if (value === "ACTIVE" || value === "EXPIRED" || value === "REVOKED") {
    return value;
  }

  return "ALL";
}

function parseTake(value: string | null): number {
  if (!value) {
    return 50;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : 50;
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const status = parseStatus(url.searchParams.get("status"));
  const query = url.searchParams.get("query");
  const take = parseTake(url.searchParams.get("take"));

  const shares = await listAdminCasePackageShares({
    status,
    query,
    take,
  });

  return NextResponse.json({
    ok: true,
    shares: shares.map((share) => ({
      ...share,
      riskBadges: buildCasePackageAdminRiskBadges({
        status: share.status,
        lawyerUserId: share.lawyerUserId,
        expiresAt: share.expiresAt,
        allowAttachmentDownload: share.allowAttachmentDownload,
        allowPackagePdf: share.allowPackagePdf,
        accessLogs: share.accessLogs,
      }),
    })),
  });
}
