import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireRole("STAFF");

  const tickets = await prisma.opsQueueTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      sourceJobId: true,
      taxonomy: true,
      bulkVariant: true,
      status: true,
      title: true,
      description: true,
      severity: true,
      assigneeUserId: true,
      createdAt: true,
      updatedAt: true,
      metadata: true,
    },
  });

  return NextResponse.json({ tickets });
}
