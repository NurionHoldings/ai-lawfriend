import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { retryBulkActionJob } from "@/lib/alerts/bulk-job/retry-bulk-action-job";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

function canActOnJob(actorId: string, admin: { id: string; role: string }) {
  return admin.id === actorId || admin.role === "SUPER_ADMIN";
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { jobId } = await params;

    const job = await prisma.bulkActionJob.findUnique({
      where: { id: jobId },
      select: { actorId: true },
    });

    if (!job) {
      return NextResponse.json({ ok: false, message: "Job을 찾을 수 없습니다." }, { status: 404 });
    }

    if (!canActOnJob(job.actorId, admin)) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
    }

    const retried = await retryBulkActionJob({
      jobId,
    });

    return NextResponse.json({
      ok: true,
      jobId: retried.id,
      status: retried.status,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        ok: false,
        message: err.message ?? "재시도 생성 중 오류가 발생했습니다.",
      },
      { status: 400 }
    );
  }
}
