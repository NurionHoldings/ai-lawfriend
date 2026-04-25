import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

type Params = {
  params: Promise<{ caseId: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: Params) {
  try {
    await requireAdminApi();

    const { caseId } = await params;

    const items = await prisma.alertEvent.findMany({
      where: {
        OR: [
          {
            entityType: "CASE",
            entityId: caseId,
          },
          {
            payloadJson: {
              path: ["caseId"],
              equals: caseId,
            },
          },
        ],
      },
      include: {
        rule: true,
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        detectedAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "사건 기준 경고 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
