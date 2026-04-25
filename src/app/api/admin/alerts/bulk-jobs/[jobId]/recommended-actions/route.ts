import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { bulkJobRecommendedActionSchema } from "@/lib/validators/bulk-job-recommended-action";
import { runRecommendedAction } from "@/lib/bulk-jobs/run-recommended-action";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ jobId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { jobId } = await params;
    const json = await req.json().catch(() => null);

    const parsed = bulkJobRecommendedActionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid payload",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await runRecommendedAction({
      jobId,
      taxonomy: parsed.data.taxonomy,
      bulkVariant: parsed.data.bulkVariant,
      note: parsed.data.note,
      actorId: admin.id,
      actorName: admin.name ?? admin.email ?? null,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error,
          ...(result.duplicateJobId != null
            ? { duplicateJobId: result.duplicateJobId }
            : {}),
          ...(result.duplicateScheduleId != null
            ? { duplicateScheduleId: result.duplicateScheduleId }
            : {}),
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ ...result, ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "실행 실패";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
