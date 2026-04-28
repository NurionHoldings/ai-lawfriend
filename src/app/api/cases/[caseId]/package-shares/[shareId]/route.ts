import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { casePackageShareRouteParamsSchema } from "@/lib/case-package/case-package-share-schema";
import {
  assertCanReadCasePackageShare,
  assertFound,
} from "@/lib/case-package/case-package-share-policy";
import { serializeCasePackageShare } from "@/lib/case-package/case-package-share-serializer";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
    shareId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId, shareId } = casePackageShareRouteParamsSchema.parse(params);

    const share = await prisma.casePackageShare.findFirst({
      where: { id: shareId, caseId },
      include: {
        case: {
          include: {
            attachments: {
              where: { status: "ACTIVE" },
              orderBy: { createdAt: "desc" },
            },
            legalDocuments: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        lawyer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    const foundShare = assertFound(share, "사건 패키지 공유를 찾을 수 없습니다.");

    assertCanReadCasePackageShare(currentUser, foundShare);

    return ok(serializeCasePackageShare(foundShare));
  } catch (error) {
    return toErrorResponse(error);
  }
}