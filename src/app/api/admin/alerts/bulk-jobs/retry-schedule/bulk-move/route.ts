import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { resolveRetryPresetDate } from "@/lib/ops-queue/retry-presets";
import type { RetryMovePreset } from "@/lib/ops-queue/types";

const BodySchema = z.object({
  jobIds: z.array(z.string().min(1)).min(1),
  preset: z.enum(["30_MIN", "1_HOUR", "TOMORROW_9AM"]),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdminApi();

    const body = BodySchema.parse(await req.json());
    const nextDate = resolveRetryPresetDate(body.preset as RetryMovePreset);

    const result = await prisma.bulkActionJob.updateMany({
      where: {
        id: {
          in: body.jobIds,
        },
      },
      data: {
        retryScheduledAt: nextDate,
      },
    });

    await prisma.opsQueueTicket.updateMany({
      where: {
        retrySourceJobId: { in: body.jobIds },
        NOT: {
          status: { in: ["RESOLVED", "CANCELED", "DONE"] },
        },
      },
      data: {
        retryScheduledAt: nextDate,
      },
    });

    return NextResponse.json({
      ok: true,
      updatedCount: result.count,
      retryScheduledAt: nextDate.toISOString(),
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY", issues: error.flatten() },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR";
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
