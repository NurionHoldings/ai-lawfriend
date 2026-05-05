import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getIllegalLendingAdminActor } from "@/features/illegal-lending/illegal-lending-admin-actor";

export const runtime = "nodejs";

const UpdateIllegalLendingReportStatusSchema = z.object({
  status: z.enum(["DRAFT_SUBMITTED", "REVIEW_READY", "REFERRED_TO_LAWYER", "CLOSED"]),
  reason: z.string().max(500).optional().or(z.literal("")),
});

type RouteParams = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminApi();

    const { reportId } = await params;
    const body: unknown = await req.json();
    const parsed = UpdateIllegalLendingReportStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "상태값이 올바르지 않습니다.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const exists = await prisma.illegalLendingReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!exists) {
      return NextResponse.json(
        {
          ok: false,
          message: "신고서를 찾을 수 없습니다.",
        },
        { status: 404 },
      );
    }

    const actor = await getIllegalLendingAdminActor();

    const updated = await prisma.$transaction(async (tx) => {
      const report = await tx.illegalLendingReport.update({
        where: { id: reportId },
        data: {
          status: parsed.data.status,
        },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });

      await tx.illegalLendingReportStatusHistory.create({
        data: {
          reportId,
          fromStatus: exists.status,
          toStatus: parsed.data.status,
          reason: parsed.data.reason || null,
          actorId: actor.actorId,
          actorName: actor.actorName,
          actorRole: actor.actorRole,
        },
      });

      await tx.illegalLendingReportAccessLog.create({
        data: {
          reportId,
          action: "STATUS_UPDATE",
          actorId: actor.actorId,
          actorName: actor.actorName,
          actorRole: actor.actorRole,
          ipAddress:
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            null,
          userAgent: req.headers.get("user-agent") || null,
        },
      });

      return report;
    });

    return NextResponse.json({
      ok: true,
      report: updated,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    console.error("[illegal-lending-report:update-status]", error);

    return NextResponse.json(
      {
        ok: false,
        message: err.message ?? "신고서 상태 변경 중 오류가 발생했습니다.",
      },
      { status: err.status ?? 500 },
    );
  }
}