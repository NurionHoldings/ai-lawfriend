import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  getBulkJobActivityTimeline,
  parseTimelineKindQuery,
} from "@/lib/bulk-jobs/activity-timeline";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(req: NextRequest, ctx: RouteContext) {
  await requireAdminApi();
  const { jobId } = await ctx.params;
  const timelineKind = parseTimelineKindQuery(
    req.nextUrl.searchParams.get("timelineKind") ?? undefined,
  );
  const { events, timelineKind: resolved } = await getBulkJobActivityTimeline(
    jobId,
    timelineKind,
  );
  return NextResponse.json({ events, timelineKind: resolved });
}
