import { NextRequest, NextResponse } from "next/server";
import { runEscalationScanWithLog } from "@/lib/cron/run-scans-with-log";

export const dynamic = "force-dynamic";

function authorizeCron(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const q = req.nextUrl.searchParams.get("secret");
  if (q === secret) return true;

  return false;
}

async function handle(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runEscalationScanWithLog("CRON");
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
