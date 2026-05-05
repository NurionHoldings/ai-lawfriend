import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/require-session-user";
import { revokeCasePackageShare } from "@/features/case-package/case-package-share.repository";

const revokeSchema = z.object({
  reason: z.string().max(500).nullable().optional(),
});

type RouteContext = {
  params: Promise<{
    caseId: string;
    shareId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await requireSessionUser();
  const { caseId, shareId } = await context.params;
  const body: unknown = await request.json();
  const parsed = revokeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_REVOKE_PAYLOAD",
        message: "공유 취소 입력값이 올바르지 않습니다.",
        issues: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  try {
    const share = await revokeCasePackageShare({
      caseId,
      shareId,
      ownerUserId: user.id,
      reason: parsed.data.reason ?? null,
    });

    return NextResponse.json({
      ok: true,
      share,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "SHARE_NOT_FOUND_OR_FORBIDDEN",
        message: "취소할 사건 패키지 공유를 찾을 수 없습니다.",
      },
      { status: 404 },
    );
  }
}