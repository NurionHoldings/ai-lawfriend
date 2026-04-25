import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdminApi();

    const unreadCount = await prisma.adminNotification.count({
      where: {
        userId: admin.id,
        readAt: null,
      },
    });

    return NextResponse.json({
      ok: true,
      unreadCount,
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "읽지 않은 알림 수 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
