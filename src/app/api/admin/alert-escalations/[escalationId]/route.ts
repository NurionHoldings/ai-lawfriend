import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ escalationId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdminApi();
    const { escalationId } = await params;

    const escalation = await prisma.alertEscalation.findUnique({
      where: { id: escalationId },
      include: {
        alertEvent: {
          include: {
            rule: true,
            assigneeUser: true,
            escalations: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        releasedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!escalation) {
      return NextResponse.json(
        { ok: false, message: "이력을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, escalation });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "에스컬레이션 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
