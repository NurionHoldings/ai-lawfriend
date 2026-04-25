import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getFailedTaxonomySummaryForJob } from "@/lib/bulk-jobs/failed-taxonomy-summary";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

export async function GET(_req: Request, { params }: Params) {
  await requireAdminApi();
  const { jobId } = await params;

  const data = await getFailedTaxonomySummaryForJob(jobId);

  return NextResponse.json(data);
}
