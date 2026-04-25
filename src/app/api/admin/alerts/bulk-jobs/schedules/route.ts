import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdminApi();

  const schedules = await prisma.bulkActionSchedule.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      sourceJobId: true,
      taxonomy: true,
      bulkVariant: true,
      status: true,
      scheduledFor: true,
      createdRetryJobId: true,
      createdAt: true,
      note: true,
    },
  });

  return NextResponse.json({ schedules });
}
