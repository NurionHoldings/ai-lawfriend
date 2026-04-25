import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { toCsv } from "@/lib/admin/bulk-jobs/csv";

export const dynamic = "force-dynamic";

function parseLocalDateStart(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseLocalDateEnd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const action = searchParams.get("action");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const jobs = await prisma.bulkActionJob.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(action ? { action } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: parseLocalDateStart(from) } : {}),
                ...(to ? { lte: parseLocalDateEnd(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        status: true,
        actorId: true,
        retryOfJobId: true,
        errorMessage: true,
        startedAt: true,
        finishedAt: true,
        createdAt: true,
        updatedAt: true,
        canceledAt: true,
        cancelReason: true,
        lastHeartbeatAt: true,
        heartbeatCount: true,
        lockExpiresAt: true,
      },
    });

    const rows = jobs.map((job) => ({
      id: job.id,
      action: job.action,
      status: job.status,
      actorId: job.actorId,
      retryOfJobId: job.retryOfJobId ?? "",
      errorMessage: job.errorMessage ?? "",
      startedAt: job.startedAt?.toISOString() ?? "",
      finishedAt: job.finishedAt?.toISOString() ?? "",
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      canceledAt: job.canceledAt?.toISOString() ?? "",
      cancelReason: job.cancelReason ?? "",
      lastHeartbeatAt: job.lastHeartbeatAt?.toISOString() ?? "",
      heartbeatCount: job.heartbeatCount,
      lockExpiresAt: job.lockExpiresAt?.toISOString() ?? "",
    }));

    const csv = "\uFEFF" + toCsv(rows);
    const filename = `bulk-action-jobs-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "내보내기 실패" },
      { status: err.status ?? 500 }
    );
  }
}
