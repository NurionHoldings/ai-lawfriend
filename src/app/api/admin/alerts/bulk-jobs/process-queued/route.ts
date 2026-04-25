import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { processBulkActionJob } from "@/lib/alerts/bulk-job/process-bulk-action-job";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdminApi();

    const jobs = await prisma.bulkActionJob.findMany({
      where: {
        status: "QUEUED",
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 10,
    });

    const results: Array<{
      jobId: string;
      ok: boolean;
      message?: string;
    }> = [];

    for (const job of jobs) {
      try {
        await processBulkActionJob(job.id);
        results.push({ jobId: job.id, ok: true });
      } catch (error) {
        results.push({
          jobId: job.id,
          ok: false,
          message:
            error instanceof Error ? error.message : "Job 처리 중 오류가 발생했습니다.",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      processedCount: results.length,
      results,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "일괄 처리 실패" },
      { status: err.status ?? 500 }
    );
  }
}
