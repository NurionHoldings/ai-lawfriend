import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await requireAdminApi();

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: [{ name: "asc" }],
    take: 20,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return NextResponse.json({ users });
}
