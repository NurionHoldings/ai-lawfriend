import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { recoverStaleBulkJobLocks } from "@/lib/alerts/bulk-job/recover-stale-bulk-job-locks";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdminApi();

    const result = await recoverStaleBulkJobLocks();

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "복구 실패" },
      { status: err.status ?? 500 }
    );
  }
}
