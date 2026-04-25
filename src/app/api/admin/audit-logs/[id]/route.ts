import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, ctx: RouteContext) {
  try {
    await requireAdminApi();

    const { id } = await ctx.params;

    const item = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
