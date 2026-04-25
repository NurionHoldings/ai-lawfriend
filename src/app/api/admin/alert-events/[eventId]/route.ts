import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ eventId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await requireAdminApi();
    const { eventId } = await params;

    const item = await prisma.alertEvent.findUnique({
      where: { id: eventId },
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
        acknowledgedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ignoredBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assigneeUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        notifications: {
          select: {
            id: true,
            userId: true,
            title: true,
            body: true,
            readAt: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        timelineMemos: {
          where: { deletedAt: null },
          select: {
            id: true,
            caseId: true,
            content: true,
            noteType: true,
            memoType: true,
            createdAt: true,
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
          take: 10,
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { ok: false, message: "경고 이력을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "경고 상세 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
