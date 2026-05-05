import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import {
  createCasePackageShare,
  listCasePackageShares,
} from "@/features/case-package/case-package-share.repository";

const createShareSchema = z.object({
  lawyerUserId: z.string().min(1).nullable().optional(),
  optionalPin: z.string().min(4).max(20).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  scope: z
    .object({
      allowSummary: z.boolean().optional(),
      allowInterview: z.boolean().optional(),
      allowAttachmentList: z.boolean().optional(),
      allowDocumentDraft: z.boolean().optional(),
    })
    .optional(),
  downloadPermissions: z
    .object({
      allowAttachmentDownload: z.boolean().optional(),
      allowPackagePdf: z.boolean().optional(),
      allowDocumentDownload: z.boolean().optional(),
    })
    .optional(),
});

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await requireSessionUser();
  const { caseId } = await context.params;

  const shares = await listCasePackageShares({
    caseId,
    ownerUserId: user.id,
  });

  return NextResponse.json({
    ok: true,
    shares,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await requireSessionUser();
  const { caseId } = await context.params;
  const body: unknown = await request.json();
  const parsed = createShareSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_CASE_PACKAGE_SHARE_PAYLOAD",
        message: "사건 패키지 공유 입력값이 올바르지 않습니다.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  try {
    const result = await createCasePackageShare({
      caseId,
      ownerUserId: user.id,
      lawyerUserId: parsed.data.lawyerUserId ?? null,
      optionalPin: parsed.data.optionalPin ?? null,
      expiresAt: parsed.data.expiresAt ?? null,
      scope: parsed.data.scope,
      downloadPermissions: parsed.data.downloadPermissions,
    });

    return NextResponse.json({
      ok: true,
      share: result.share,
      plainAccessToken: result.plainAccessToken,
      warning:
        "plainAccessToken은 발급 직후 한 번만 표시하십시오. DB에는 hash만 저장됩니다.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "사건 패키지 공유 생성 실패";

    return NextResponse.json(
      {
        ok: false,
        code: message,
        message: "사건 패키지 공유를 생성하지 못했습니다.",
      },
      { status: 400 },
    );
  }
}