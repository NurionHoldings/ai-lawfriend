import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function PATCH() {
  try {
    const admin = await requireAdminApi();

    const result = await prisma.adminNotification.updateMany({
      where: {
        userId: admin.id,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, updatedCount: result.count });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "전체 읽음 처리 실패" },
      { status: err.status ?? 400 }
    );
  }
}
