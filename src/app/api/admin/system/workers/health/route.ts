import { NextResponse } from "next/server";
import { getWorkerHealthSummary } from "@/lib/admin/bulk-jobs/worker-health";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminApi();

    const data = await getWorkerHealthSummary();
    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
