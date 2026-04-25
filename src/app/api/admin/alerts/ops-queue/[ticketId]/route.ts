import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { opsQueueTicketUpdateSchema } from "@/lib/validators/ops-queue-ticket-update";

type RouteContext = {
  params: Promise<{ ticketId: string }>;
};

export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    await requireRole("STAFF");
    const { ticketId } = await ctx.params;

    const item = await prisma.opsQueueTicket.findUnique({
      where: { id: ticketId },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sourceJob: {
          select: {
            id: true,
            status: true,
            action: true,
            priority: true,
            retryScheduledAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    const recentAuditLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "OpsQueueTicket",
        entityId: item.id,
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
      take: 10,
    });

    return NextResponse.json({
      ok: true,
      item,
      recentAuditLogs,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const admin = await requireRole("ADMIN");
  const { ticketId } = await ctx.params;
  const json = await req.json().catch(() => null);

  const parsed = opsQueueTicketUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const before = await prisma.opsQueueTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      status: true,
      assigneeUserId: true,
    },
  });

  if (!before) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const ticket = await tx.opsQueueTicket.update({
      where: { id: ticketId },
      data: {
        status: parsed.data.status,
        assigneeUserId: parsed.data.assigneeUserId ?? null,
      },
      select: {
        id: true,
        status: true,
        assigneeUserId: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "ops_queue.ticket.update",
        entityType: "OpsQueueTicket",
        entityId: ticketId,
        message: "운영 큐 티켓 상태 변경",
        metadata: {
          before,
          after: ticket,
        },
      },
    });

    return ticket;
  });

  return NextResponse.json({
    ok: true,
    ticket: updated,
  });
}
