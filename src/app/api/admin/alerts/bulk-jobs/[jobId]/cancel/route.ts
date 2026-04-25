import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { cancelBulkActionJob } from "@/lib/alerts/bulk-job/cancel-bulk-action-job";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reason: z.string().optional(),
});

type Params = { params: Promise<{ jobId: string }> };

function canActOnJob(actorId: string, admin: { id: string; role: string }) {
  return admin.id === actorId || admin.role === "SUPER_ADMIN";
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "요청값이 올바르지 않습니다." }, { status: 400 });
    }

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

    const canceled = await cancelBulkActionJob({
      jobId,
      actorId: admin.id,
      reason: parsed.data.reason,
    });

    return NextResponse.json({
      ok: true,
      job: canceled,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        ok: false,
        message: err.message ?? "Job 취소 중 오류가 발생했습니다.",
      },
      { status: 400 }
    );
  }
}
