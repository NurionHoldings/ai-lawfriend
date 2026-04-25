import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { runAlertDetection } from "@/lib/alerts/detect";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdminApi();
    const result = await runAlertDetection();
    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "경고 스캔 실패" },
      { status: err.status ?? 500 }
    );
  }
}
