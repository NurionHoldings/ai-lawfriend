import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole("STAFF");

    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: {
          in: ["ADMIN", "SUPER_ADMIN", "LAWYER", "STAFF"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      take: 200,
    });

    return NextResponse.json({
      ok: true,
      items: users,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const status = err.status ?? 500;
    const message = err.message || "INTERNAL_SERVER_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
