import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { executeAlertBulkAction } from "@/lib/alerts/execute-alert-bulk-action";

const schema = z.object({
  alertIds: z.array(z.string()).min(1),
  action: z.enum(["ACKNOWLEDGE", "RESOLVE", "IGNORE", "REASSIGN"]),
  assigneeUserId: z.string().optional(),
  note: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminApi();
    const parsed = schema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "잘못된 요청입니다.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { alertIds, action, assigneeUserId, note } = parsed.data;

    const result = await executeAlertBulkAction({
      actorId: admin.id,
      actorName: admin.name,
      action,
      alertIds,
      assigneeUserId,
      note,
    });

    return NextResponse.json({
      ok: true,
      result,
      count: result.successCount,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, error: err.message ?? "대량 처리 실패" },
      { status: err.status ?? 500 }
    );
  }
}
