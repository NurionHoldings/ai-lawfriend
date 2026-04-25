import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRetryJobFromFailedItems } from "@/lib/admin/bulk-jobs/retry-failed-job";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

function canActOnJob(actorId: string, admin: { id: string; role: string }) {
  return admin.id === actorId || admin.role === "SUPER_ADMIN";
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { jobId } = await params;
    const body = (await req.json().catch(() => ({}))) as { reason?: string };
    const reason = typeof body?.reason === "string" ? body.reason : undefined;

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

    const created = await createRetryJobFromFailedItems({
      sourceJobId: jobId,
      reason,
    });

    return NextResponse.json({
      ok: true,
      jobId: created.id,
      linkUrl: `/admin/alerts/bulk-jobs/${created.id}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
