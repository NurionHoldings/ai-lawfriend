import { NextRequest, NextResponse } from "next/server";
import {
  getBulkJobChartMetrics,
  type RangePreset,
} from "@/lib/admin/bulk-jobs/metrics";
import { getBulkJobTimeseriesMetrics } from "@/lib/admin/bulk-jobs/metrics-timeseries";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const { searchParams } = new URL(req.url);

    if (searchParams.has("hours")) {
      const hours = Number(searchParams.get("hours") ?? 48);
      const points = await getBulkJobTimeseriesMetrics(hours);
      return NextResponse.json({ ok: true, points });
    }

    const range = (searchParams.get("range") ?? "14d") as RangePreset;

    const data = await getBulkJobChartMetrics(range);

    return NextResponse.json({ ok: true, items: data });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "지표 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
