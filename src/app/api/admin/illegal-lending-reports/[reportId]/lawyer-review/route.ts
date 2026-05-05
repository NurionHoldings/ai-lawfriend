import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getIllegalLendingAdminActor } from "@/features/illegal-lending/illegal-lending-admin-actor";
import { createIllegalLendingAccessLog } from "@/features/illegal-lending/illegal-lending-access-log";
import { autoAssignIllegalLendingLawyer } from "@/features/illegal-lending/illegal-lending-lawyer-assignment";

export const runtime = "nodejs";

const CreateLawyerReviewRequestSchema = z.object({
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
    const body: unknown = await req.json();
    const parsed = CreateLawyerReviewRequestSchema.safeParse(body);
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

    const report = await prisma.illegalLendingReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
      },
    });
    if (!report) {
      return NextResponse.json(
        { ok: false, message: "신고서를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const actor = await getIllegalLendingAdminActor();
    const manuallyAssigned = Boolean(
      parsed.data.assignedLawyerId || parsed.data.assignedLawyerName,
    );
    const autoAssignedLawyer = manuallyAssigned ? null : await autoAssignIllegalLendingLawyer();

    const reviewRequest = await prisma.$transaction(async (tx) => {
      const created = await tx.illegalLendingLawyerReviewRequest.create({
        data: {
          reportId,
          memo: parsed.data.memo || null,
          requestedById: actor.actorId,
          requestedByName: actor.actorName,
          requestedByRole: actor.actorRole,
          assignedLawyerId:
            parsed.data.assignedLawyerId ||
            autoAssignedLawyer?.lawyerId ||
            null,
          assignedLawyerName:
            parsed.data.assignedLawyerName ||
            autoAssignedLawyer?.lawyerName ||
            null,
          autoAssigned: Boolean(autoAssignedLawyer),
          assignmentReason: autoAssignedLawyer?.reason || null,
        },
      });

      await tx.illegalLendingReport.update({
        where: { id: reportId },
        data: {
          status: "REFERRED_TO_LAWYER",
        },
      });

      await tx.illegalLendingReportStatusHistory.create({
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

      if (autoAssignedLawyer) {
        await tx.illegalLendingLawyerAssignmentHistory.create({
          data: {
            reportId,
            reviewRequestId: created.id,
            lawyerId: autoAssignedLawyer.lawyerId,
            lawyerName: autoAssignedLawyer.lawyerName,
            reason: autoAssignedLawyer.reason,
          },
        });
      }

      return created;
    });

    await createIllegalLendingAccessLog({
      reportId,
      action: "STATUS_UPDATE",
      req,
    });

    return NextResponse.json({
      ok: true,
      reviewRequest,
    });
  } catch (error) {
    console.error("[illegal-lending-report:lawyer-review]", error);

    return NextResponse.json(
      {
        ok: false,
        message: "변호사 검토 요청 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}