import { NextRequest, NextResponse } from "next/server";
import { claimNextBulkJob } from "@/lib/server/bulk-job-worker-pool";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const internalKey = req.headers.get("x-internal-worker-key");
  if (internalKey !== process.env.INTERNAL_WORKER_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { workerId?: string };
  const workerId = body.workerId;

  if (!workerId) {
    return NextResponse.json({ error: "workerId is required" }, { status: 400 });
  }

  const job = await claimNextBulkJob({ workerId });

  return NextResponse.json({
    ok: true,
    job,
  });
}
