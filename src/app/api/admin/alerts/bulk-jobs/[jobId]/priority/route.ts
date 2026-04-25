import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

const schema = z.object({
  priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL"]).optional(),
  maxConcurrency: z.number().int().min(1).max(20).optional(),
  queueGroup: z.string().trim().min(1).max(100).nullable().optional(),
  concurrencyKey: z.string().trim().min(1).max(150).nullable().optional(),
});

type Params = { params: Promise<{ jobId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  await requireAdminApi();
  const { jobId } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  );

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.bulkActionJob.update({
    where: { id: jobId },
    data,
    select: {
      id: true,
      priority: true,
      maxConcurrency: true,
      queueGroup: true,
      concurrencyKey: true,
    },
  });

  return NextResponse.json({ ok: true, job: updated });
}
