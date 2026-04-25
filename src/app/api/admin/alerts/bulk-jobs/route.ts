import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createBulkActionJob } from "@/lib/alerts/bulk-job/create-bulk-action-job";
import { getBulkActionJobs } from "@/lib/alerts/bulk-job/get-bulk-action-jobs";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.enum(["ACKNOWLEDGE", "RESOLVE", "IGNORE", "REASSIGN"]),
  alertEventIds: z.array(z.string().min(1)).min(1),
  payload: z
    .object({
      assigneeUserId: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const action = req.nextUrl.searchParams.get("action") ?? undefined;
    const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
    const from = req.nextUrl.searchParams.get("from") ?? undefined;
    const to = req.nextUrl.searchParams.get("to") ?? undefined;
    const actorQuery = req.nextUrl.searchParams.get("actorQuery") ?? undefined;
    const query = req.nextUrl.searchParams.get("query") ?? undefined;
    const onlyRetry = req.nextUrl.searchParams.get("onlyRetry") === "true";
    const priority = req.nextUrl.searchParams.get("priority") ?? undefined;

    const data = await getBulkActionJobs({
      status,
      action,
      priority,
      page,
      pageSize: 20,
      from,
      to,
      actorQuery,
      query,
      onlyRetry,
    });

    return NextResponse.json({
      ok: true,
      ...data,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "목록 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    const parsed = bodySchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "요청값이 올바르지 않습니다.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const job = await createBulkActionJob({
      actorId: admin.id,
      action: parsed.data.action,
      alertEventIds: parsed.data.alertEventIds,
      payload: parsed.data.payload,
    });

    return NextResponse.json({
      ok: true,
      jobId: job.id,
      status: job.status,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "Job 생성 실패" },
      { status: err.status ?? 500 }
    );
  }
}
