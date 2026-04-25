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

    const hrefNeedle = `/admin/alerts/ops-queue/${ticketId}`;

    const items = await prisma.adminNotification.findMany({
      where: {
        OR: [
          {
            targetHref: {
              contains: hrefNeedle,
              mode: "insensitive",
            },
          },
          {
            body: {
              contains: ticketId,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
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
