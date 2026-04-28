import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import {
  casePackageShareRouteParamsSchema,
  RevokeCasePackageShareSchema,
} from "@/lib/case-package/case-package-share-schema";
import {
  assertCanReadCasePackageShare,
  assertFound,
} from "@/lib/case-package/case-package-share-policy";
import { createCasePackageAccessLog } from "@/lib/case-package/case-package-access-log";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
    shareId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, shareId } = casePackageShareRouteParamsSchema.parse(params);
    const body: unknown = await request.json().catch(() => ({}));
    const input = RevokeCasePackageShareSchema.parse(body);

    const share = await prisma.casePackageShare.findFirst({
      where: { id: shareId, caseId },
    });

    const foundShare = assertFound(share, "사건 패키지 공유를 찾을 수 없습니다.");

    assertCanReadCasePackageShare(currentUser, foundShare);

    const updated = await prisma.casePackageShare.update({
      where: { id: shareId },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
        revokeReason: input.revokeReason || "의뢰인 공유 취소",
      },
    });

    await createCasePackageAccessLog({
      shareId: updated.id,
      caseId: updated.caseId,
      actorUserId: currentUser.id,
      action: "REVOKED",
      targetType: "CASE_PACKAGE_SHARE",
      targetId: updated.id,
      resultMessage: "사건 패키지 공유가 취소되었습니다.",
      request,
    });

    return ok({
      id: updated.id,
      status: updated.status,
      revokedAt: updated.revokedAt,
      revokeReason: updated.revokeReason,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}