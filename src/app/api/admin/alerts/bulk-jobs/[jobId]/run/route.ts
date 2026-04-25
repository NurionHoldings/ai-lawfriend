import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { processBulkActionJob } from "@/lib/alerts/bulk-job/process-bulk-action-job";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { jobId } = await params;

    const job = await prisma.bulkActionJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ ok: false, message: "Job을 찾을 수 없습니다." }, { status: 404 });
    }

    if (job.actorId !== admin.id && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
    }

    const result = await processBulkActionJob(jobId);
    return NextResponse.json({
      ok: true,
      job: result,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        ok: false,
        message: err.message ?? "Job 실행 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
