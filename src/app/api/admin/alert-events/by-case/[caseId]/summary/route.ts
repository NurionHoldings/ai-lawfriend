import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

type Params = {
  params: Promise<{ caseId: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: Params) {
  try {
    await requireAdminApi();

    const { caseId } = await params;

    const where = {
      OR: [
        {
          entityType: "CASE",
          entityId: caseId,
        },
        {
          payloadJson: {
            path: ["caseId"],
            equals: caseId,
          },
        },
      ],
    };

    const [
      total,
      openCount,
      acknowledgedCount,
      ignoredCount,
      resolvedCount,
      criticalOpenCount,
    ] = await Promise.all([
      prisma.alertEvent.count({ where }),
      prisma.alertEvent.count({
        where: {
          ...where,
          status: "OPEN",
        },
      }),
      prisma.alertEvent.count({
        where: {
          ...where,
          status: "ACKNOWLEDGED",
        },
      }),
      prisma.alertEvent.count({
        where: {
          ...where,
          status: "IGNORED",
        },
      }),
      prisma.alertEvent.count({
        where: {
          ...where,
          status: "RESOLVED",
        },
      }),
      prisma.alertEvent.count({
        where: {
          ...where,
          status: "OPEN",
          severity: "CRITICAL",
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      summary: {
        total,
        openCount,
        acknowledgedCount,
        ignoredCount,
        resolvedCount,
        criticalOpenCount,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "사건 경고 요약 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
