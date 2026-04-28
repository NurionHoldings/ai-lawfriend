import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { casePackageShareRouteParamsSchema } from "@/lib/case-package/case-package-share-schema";
import {
  assertCanReadCasePackageShare,
  assertFound,
} from "@/lib/case-package/case-package-share-policy";
import { serializeCasePackageAccessLog } from "@/lib/case-package/case-package-access-log-serializer";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
    shareId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, shareId } = casePackageShareRouteParamsSchema.parse(params);

    const url = new URL(request.url);
    const takeParam = Number(url.searchParams.get("take") ?? "50");
    const take = Number.isFinite(takeParam)
      ? Math.min(Math.max(takeParam, 1), 100)
      : 50;

    const share = await prisma.casePackageShare.findFirst({
      where: {
        id: shareId,
        caseId,
      },
    });

    const foundShare = assertFound(share, "사건 패키지 공유를 찾을 수 없습니다.");

    assertCanReadCasePackageShare(currentUser, foundShare);

    const logs = await prisma.casePackageAccessLog.findMany({
      where: {
        shareId,
        caseId,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take,
    });

    return ok(logs.map(serializeCasePackageAccessLog));
  } catch (error) {
    return toErrorResponse(error);
  }
}