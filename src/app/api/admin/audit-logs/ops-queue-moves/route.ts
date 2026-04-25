import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const { searchParams } = new URL(req.url);
    const opsQueueTicketId = searchParams.get("opsQueueTicketId");

    const items = await prisma.auditLog.findMany({
      where: {
        action: "ops_queue.board.move",
        ...(opsQueueTicketId
          ? {
              entityId: opsQueueTicketId,
            }
          : {}),
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
