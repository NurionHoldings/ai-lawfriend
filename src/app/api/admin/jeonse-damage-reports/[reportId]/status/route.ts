import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createJeonseDamageAccessLog,
  getJeonseDamageAdminActor,
} from "@/features/jeonse-damage/jeonse-damage-access-log";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const UpdateJeonseDamageReportStatusSchema = z.object({
  status: z.enum([
    "DRAFT_SUBMITTED",
    "REVIEW_READY",
    "DOCUMENTS_CHECKED",
    "REFERRED_TO_LAWYER",
    "CLOSED",
  ]),
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
    const body = await req.json();
    const parsed = UpdateJeonseDamageReportStatusSchema.safeParse(body);

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

    const exists = await prisma.jeonseDamageReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!exists) {
      return NextResponse.json(
        { ok: false, message: "서류를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const actor = await getJeonseDamageAdminActor();

    const updated = await prisma.$transaction(async (tx) => {
      const report = await tx.jeonseDamageReport.update({
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

      await tx.jeonseDamageReportStatusHistory.create({
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

      return report;
    });

    await createJeonseDamageAccessLog({
      reportId,
      action: "STATUS_UPDATE",
      req,
    });

    return NextResponse.json({
      ok: true,
      report: updated,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    console.error("[jeonse-damage-report:update-status]", error);

    return NextResponse.json(
      { ok: false, message: err.message || "상태 변경 중 오류가 발생했습니다." },
      { status: err.status ?? 500 },
    );
  }
}
