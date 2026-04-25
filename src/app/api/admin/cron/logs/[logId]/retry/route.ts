import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  runEscalationScanWithLog,
  runSlaScanWithLog,
} from "@/lib/cron/run-scans-with-log";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ logId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminApi();
    const { logId } = await params;

    const target = await prisma.cronJobExecutionLog.findUnique({
      where: { id: logId },
    });

    if (!target) {
      return NextResponse.json(
        { ok: false, message: "실행 로그를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (target.status !== "FAILED") {
      return NextResponse.json(
        { ok: false, message: "실패한 실행만 재시도할 수 있습니다." },
        { status: 400 }
      );
    }

    if (target.jobCode === "alerts.sla_scan") {
      const result = await runSlaScanWithLog("MANUAL_RETRY", logId);
      return NextResponse.json({ ok: true, result });
    }

    if (target.jobCode === "alerts.escalation_scan") {
      const result = await runEscalationScanWithLog("MANUAL_RETRY", logId);
      return NextResponse.json({ ok: true, result });
    }

    return NextResponse.json(
      { ok: false, message: "이 작업은 재시도를 지원하지 않습니다." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { ok: false, message: err.message ?? "재시도 실패" },
      { status: 500 }
    );
  }
}
