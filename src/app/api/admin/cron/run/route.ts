import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  runEscalationScanWithLog,
  runSlaScanWithLog,
} from "@/lib/cron/run-scans-with-log";

export const dynamic = "force-dynamic";

const schema = z.object({
  jobCode: z.enum(["alerts.sla_scan", "alerts.escalation_scan"]),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdminApi();

    const parsed = schema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
    }

    if (parsed.data.jobCode === "alerts.sla_scan") {
      const result = await runSlaScanWithLog("MANUAL");
      return NextResponse.json({ ok: true, result });
    }

    const result = await runEscalationScanWithLog("MANUAL");
    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "수동 실행 실패" },
      { status: err.status ?? 500 }
    );
  }
}
