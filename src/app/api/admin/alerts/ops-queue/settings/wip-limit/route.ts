import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/require-role";
import { getOpsQueueWipLimits, upsertOpsQueueWipLimits } from "@/lib/ops-queue/wip";
import { getFeatureFlags } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  TRIAGE: z.number().int().min(1).max(9999),
  QUEUED: z.number().int().min(1).max(9999),
  WORKING: z.number().int().min(1).max(9999),
  BLOCKED: z.number().int().min(1).max(9999),
  DONE: z.number().int().min(1).max(99999),
});

export async function GET() {
  try {
    await requireRole("STAFF");

    const limits = await getOpsQueueWipLimits();

    return NextResponse.json({
      ok: true,
      limits,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const flags = getFeatureFlags();
    if (!flags.OPS_QUEUE_WIP_SETTINGS_EDIT) {
      return NextResponse.json(
        { ok: false, error: "FEATURE_DISABLED" },
        { status: 403 },
      );
    }

    await requireRole("SUPER_ADMIN");

    const json = (await req.json()) as Record<string, unknown>;
    const parsed = BodySchema.safeParse({
      TRIAGE: Number(json.TRIAGE),
      QUEUED: Number(json.QUEUED),
      WORKING: Number(json.WORKING),
      BLOCKED: Number(json.BLOCKED),
      DONE: Number(json.DONE),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "INVALID_BODY",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    await upsertOpsQueueWipLimits(parsed.data);

    return NextResponse.json({
      ok: true,
      limits: parsed.data,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
