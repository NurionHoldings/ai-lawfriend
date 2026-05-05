import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createJeonseDamageAccessLog,
  getJeonseDamageAdminActor,
} from "@/features/jeonse-damage/jeonse-damage-access-log";
import { autoAssignIllegalLendingLawyer } from "@/features/illegal-lending/illegal-lending-lawyer-assignment";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const CreateJeonseLawyerReviewRequestSchema = z.object({
  memo: z.string().max(1000).optional().or(z.literal("")),
  assignedLawyerId: z.string().optional().or(z.literal("")),
  assignedLawyerName: z.string().max(100).optional().or(z.literal("")),
});

type RouteParams = {
  params: Promise<{
    reportId: string;
  }>;
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminApi();

    const { reportId } = await params;
    const body = await req.json();
    const parsed = CreateJeonseLawyerReviewRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "요청값이 올바르지 않습니다.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const report = await prisma.jeonseDamageReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { ok: false, message: "서류를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const actor = await getJeonseDamageAdminActor();
    const autoAssignedLawyer = parsed.data.assignedLawyerName
      ? null
      : await autoAssignIllegalLendingLawyer();

    const reviewRequest = await prisma.$transaction(async (tx) => {
      const created = await tx.jeonseDamageLawyerReviewRequest.create({
        data: {
          reportId,
          memo: parsed.data.memo || null,
          requestedById: actor.actorId,
          requestedByName: actor.actorName,
          requestedByRole: actor.actorRole,
          assignedLawyerId:
            parsed.data.assignedLawyerId || autoAssignedLawyer?.lawyerId || null,
          assignedLawyerName:
            parsed.data.assignedLawyerName ||
            autoAssignedLawyer?.lawyerName ||
            null,
          autoAssigned: Boolean(autoAssignedLawyer),
          assignmentReason: autoAssignedLawyer?.reason || null,
        },
      });

      await tx.jeonseDamageReport.update({
        where: { id: reportId },
        data: {
          status: "REFERRED_TO_LAWYER",
        },
      });

      await tx.jeonseDamageReportStatusHistory.create({
        data: {
          reportId,
          fromStatus: report.status,
          toStatus: "REFERRED_TO_LAWYER",
          reason: "변호사 검토 요청 생성",
          actorId: actor.actorId,
          actorName: actor.actorName,
          actorRole: actor.actorRole,
        },
      });

      return created;
    });

    await createJeonseDamageAccessLog({
      reportId,
      action: "LAWYER_REVIEW_REQUEST",
      req,
    });

    return NextResponse.json({
      ok: true,
      reviewRequest,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    console.error("[jeonse-damage-report:lawyer-review]", error);

    return NextResponse.json(
      { ok: false, message: err.message || "변호사 검토 요청 중 오류가 발생했습니다." },
      { status: err.status ?? 500 },
    );
  }
}
