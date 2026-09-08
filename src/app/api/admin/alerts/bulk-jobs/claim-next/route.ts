import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { claimNextBulkJob } from "@/lib/server/bulk-job-worker-pool";

export const dynamic = "force-dynamic";

function matchesInternalWorkerKey(supplied: string, configured: string): boolean {
  const suppliedDigest = crypto.createHash("sha256").update(supplied).digest();
  const configuredDigest = crypto.createHash("sha256").update(configured).digest();
  return crypto.timingSafeEqual(suppliedDigest, configuredDigest);
}

export async function POST(req: NextRequest) {
  const internalKey = req.headers.get("x-internal-worker-key");
  const configuredInternalKey = process.env.INTERNAL_WORKER_KEY;

  // A missing deployment secret must never make two absent values compare equal.
  if (
    !configuredInternalKey ||
    !internalKey ||
    !matchesInternalWorkerKey(internalKey, configuredInternalKey)
  ) {
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
