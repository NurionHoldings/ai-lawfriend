import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { runEscalationScanWithLog } from "@/lib/cron/run-scans-with-log";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdminApi();

    const result = await runEscalationScanWithLog("MANUAL");

    return NextResponse.json({
      ok: true,
      result: {
        scannedCount: result.scannedCount,
        updatedCount: result.updatedCount,
        notificationCount: result.notificationCount,
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "에스컬레이션 스캔 실패" },
      { status: err.status ?? 500 }
    );
  }
}
