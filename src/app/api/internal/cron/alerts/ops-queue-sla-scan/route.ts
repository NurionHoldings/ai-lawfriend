import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { scanOverdueOpsQueueItemsAndNotify } from "@/lib/ops-queue/sla";

export const dynamic = "force-dynamic";

function authorizeCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const q = req.nextUrl.searchParams.get("secret");
  if (q === secret) return true;

  if (req.headers.get("x-cron-secret") === secret) return true;

  return false;
}

export async function POST(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const result = await scanOverdueOpsQueueItemsAndNotify();
    return NextResponse.json({
      ok: true,
      ...result,
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ops-queue-sla-scan error", error);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
