import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getAlertKpi } from "@/lib/alerts/get-alert-kpi";
import type { KpiGranularity, KpiPresetKey } from "@/lib/alerts/kpi-date-range";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  preset: z.enum(["7d", "14d", "30d", "quarter"]).optional(),
  granularity: z.enum(["day", "week", "month"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const parsed = querySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams.entries())
    );

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "잘못된 조회 조건입니다." },
        { status: 400 }
      );
    }

    const preset = (parsed.data.preset ?? "30d") as KpiPresetKey;
    const granularity = parsed.data.granularity as KpiGranularity | undefined;

    const data = await getAlertKpi({ preset, granularity });

    return NextResponse.json({ ok: true, ...data });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "KPI 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
