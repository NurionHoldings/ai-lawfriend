import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import { LawyerCasePackageLookupSchema } from "@/lib/case-package/case-package-share-schema";
import { normalizePublicCode } from "@/lib/case-package/public-code";
import {
  assertLawyerCanLookupShare,
  normalizeShareStatusByTime,
} from "@/lib/case-package/case-package-share-policy";
import { createCasePackageAccessLog } from "@/lib/case-package/case-package-access-log";
import { serializeCasePackageShare } from "@/lib/case-package/case-package-share-serializer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const currentUser = await requireSessionUser();
    const body: unknown = await request.json();
    const input = LawyerCasePackageLookupSchema.parse(body);
    const publicCode = normalizePublicCode(input.publicCode);

    const share = await prisma.casePackageShare.findUnique({
      where: { publicCode },
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

    if (!share) {
      throw new NotFoundError("사건 고유번호를 확인할 수 없습니다.");
    }

    try {
      assertLawyerCanLookupShare(currentUser, share);
    } catch (error) {
      const effectiveStatus = normalizeShareStatusByTime(
        share.status,
        share.expiresAt,
      );

      await createCasePackageAccessLog({
        shareId: share.id,
        caseId: share.caseId,
        actorUserId: currentUser.id,
        action:
          effectiveStatus === "EXPIRED"
            ? "EXPIRED"
            : effectiveStatus === "REVOKED"
              ? "REVOKED"
              : "DENIED",
        targetType: "CASE_PACKAGE_SHARE",
        targetId: share.id,
        resultMessage:
          error instanceof Error ? error.message : "접근이 거부되었습니다.",
        request,
      });

      throw error;
    }

    await createCasePackageAccessLog({
      shareId: share.id,
      caseId: share.caseId,
      actorUserId: currentUser.id,
      action: "VIEW",
      targetType: "CASE_PACKAGE_SHARE",
      targetId: share.id,
      resultMessage: "변호사 고유번호 조회 성공",
      request,
    });

    return ok(serializeCasePackageShare(share));
  } catch (error) {
    return toErrorResponse(error);
  }
}