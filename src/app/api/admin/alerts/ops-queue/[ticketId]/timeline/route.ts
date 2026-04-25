import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ ticketId: string }>;
};

export async function GET(_req: Request, ctx: RouteContext) {
  try {
    await requireRole("STAFF");
    const { ticketId } = await ctx.params;

    const ticket = await prisma.opsQueueTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        caseId: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    if (!ticket.caseId) {
      return NextResponse.json({
        ok: true,
        items: [],
      });
    }

    const timelineItems = await prisma.caseTimelineMemo.findMany({
      where: {
        caseId: ticket.caseId,
        deletedAt: null,
        OR: [
          { content: { contains: ticket.id, mode: "insensitive" } },
          { content: { contains: "[운영 큐]", mode: "insensitive" } },
        ],
      },
      include: {
        author: {
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
      take: 30,
    });

    return NextResponse.json({
      ok: true,
      items: timelineItems,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
