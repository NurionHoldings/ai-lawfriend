import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminApi();

    const [resolved, openCount, overdueCount, dueSoonCount] = await Promise.all([
      prisma.alertEvent.findMany({
        where: {
          status: "RESOLVED",
          resolvedAt: { not: null },
        },
        select: {
          detectedAt: true,
          resolvedAt: true,
        },
      }),
      prisma.alertEvent.count({
        where: {
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
      }),
      prisma.alertEvent.count({
        where: {
          slaState: "OVERDUE",
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
      }),
      prisma.alertEvent.count({
        where: {
          slaState: "DUE_SOON",
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
      }),
    ]);

    const total = resolved.length;

    const avgMs =
      total === 0
        ? 0
        : resolved.reduce((sum, r) => {
            const resolvedAt = r.resolvedAt;
            if (!resolvedAt) return sum;
            return (
              sum +
              (new Date(resolvedAt).getTime() - new Date(r.detectedAt).getTime())
            );
          }, 0) / total;

    return NextResponse.json({
      ok: true,
      kpi: {
        resolvedCount: total,
        avgResolveHours: Math.round(avgMs / 1000 / 60 / 60),
        openCount,
        overdueCount,
        dueSoonCount,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "KPI 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
