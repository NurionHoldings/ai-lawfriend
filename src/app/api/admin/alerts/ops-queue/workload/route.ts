import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { getOpsQueueWorkloadRows } from "@/lib/ops-queue/workload";
import { getAssigneeWorkloadBuckets } from "@/lib/ops-queue/workload-buckets";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireRole("STAFF");
  const [rows, items] = await Promise.all([
    getOpsQueueWorkloadRows(),
    getAssigneeWorkloadBuckets(),
  ]);
  return NextResponse.json({ ok: true, rows, items });
}
