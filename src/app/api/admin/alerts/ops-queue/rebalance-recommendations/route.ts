import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { getOpsQueueRebalanceRecommendations } from "@/lib/ops-queue/rebalance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole("STAFF");

    const result = await getOpsQueueRebalanceRecommendations();

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
