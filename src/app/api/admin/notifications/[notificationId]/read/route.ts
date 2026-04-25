import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ notificationId: string }>;
};

export async function PATCH(_: Request, { params }: Params) {
  try {
    const admin = await requireAdminApi();
    const { notificationId } = await params;

    const item = await prisma.adminNotification.findFirst({
      where: {
        id: notificationId,
        userId: admin.id,
      },
    });

    if (!item) {
      return NextResponse.json(
        { ok: false, message: "알림을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const updated = await prisma.adminNotification.update({
      where: { id: notificationId },
      data: {
        readAt: item.readAt ?? new Date(),
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "알림 읽음 처리 실패" },
      { status: err.status ?? 400 }
    );
  }
}
