import { ok, toErrorResponse } from "@/lib/domain-api-response";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import {
  casePackageRouteParamsSchema,
  CreateCasePackageShareSchema,
} from "@/lib/case-package/case-package-share-schema";
import { generateUniquePublicCode } from "@/lib/case-package/public-code";
import {
  assertUserOwnsCase,
  ensureShareCanBeCreated,
} from "@/lib/case-package/case-package-share-policy";
import { serializeCasePackageShare } from "@/lib/case-package/case-package-share-serializer";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = casePackageRouteParamsSchema.parse(params);

    const targetCase = await prisma.case.findUnique({
      where: { id: caseId },
      select: { id: true, ownerUserId: true },
    });

    if (!targetCase) {
      throw new NotFoundError("사건을 찾을 수 없습니다.");
    }

    assertUserOwnsCase(currentUser, targetCase);

    const shares = await prisma.casePackageShare.findMany({
      where: { caseId },
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
      orderBy: { createdAt: "desc" },
    });

    return ok(shares.map(serializeCasePackageShare));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const currentUser = await requireSessionUser();
    const params = await context.params;
    const { caseId } = casePackageRouteParamsSchema.parse(params);
    const body: unknown = await request.json();
    const input = CreateCasePackageShareSchema.parse(body);

    const targetCase = await prisma.case.findUnique({
      where: { id: caseId },
      select: {
        id: true,
        ownerUserId: true,
        status: true,
      },
    });

    if (!targetCase) {
      throw new NotFoundError("사건을 찾을 수 없습니다.");
    }

    assertUserOwnsCase(currentUser, targetCase);

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    ensureShareCanBeCreated({
      consentText: input.consentText,
      expiresAt,
    });

    const publicCode = await generateUniquePublicCode();

    const share = await prisma.casePackageShare.create({
      data: {
        caseId,
        ownerUserId: targetCase.ownerUserId,
        lawyerUserId: input.lawyerUserId ?? null,
        publicCode,
        shareMode: input.shareMode,
        status: "ACTIVE",
        allowSummary: input.allowSummary,
        allowInterview: input.allowInterview,
        allowAttachmentList: input.allowAttachmentList,
        allowAttachmentDownload: input.allowAttachmentDownload,
        allowDocumentDraft: input.allowDocumentDraft,
        allowDocumentPdf: input.allowDocumentPdf,
        allowPackagePdf: input.allowPackagePdf,
        allowClientContact: input.allowClientContact,
        allowOpponentDetail: input.allowOpponentDetail,
        consentText: input.consentText,
        consentedAt: new Date(),
        expiresAt,
      },
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

    return ok(serializeCasePackageShare(share), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}