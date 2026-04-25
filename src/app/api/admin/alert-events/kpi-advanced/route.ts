import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getAlertKpiAdvanced } from "@/lib/alerts/kpi-advanced";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const days = Number(req.nextUrl.searchParams.get("days") || "14");
    const data = await getAlertKpiAdvanced(days);

    return NextResponse.json({
      ok: true,
      ...data,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "KPI 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
