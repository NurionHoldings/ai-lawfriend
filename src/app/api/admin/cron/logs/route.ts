import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import type { CronJobStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const sp = req.nextUrl.searchParams;
    const jobCode = sp.get("jobCode") || "ALL";
    const status = sp.get("status") || "ALL";

    const where: Prisma.CronJobExecutionLogWhereInput = {
      ...(jobCode !== "ALL" ? { jobCode } : {}),
      ...(status !== "ALL" ? { status: status as CronJobStatus } : {}),
    };

    const logs = await prisma.cronJobExecutionLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ ok: true, logs });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "로그 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
