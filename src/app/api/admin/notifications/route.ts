import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminApi();

    const unreadOnly = req.nextUrl.searchParams.get("unreadOnly") === "true";
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? "1"));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(req.nextUrl.searchParams.get("pageSize") ?? "20"))
    );

    const where = {
      userId: admin.id,
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [total, items, unreadCount] = await Promise.all([
      prisma.adminNotification.count({ where }),
      prisma.adminNotification.findMany({
        where,
        include: {
          alertEvent: {
            include: {
              rule: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.adminNotification.count({
        where: { userId: admin.id, readAt: null },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      items,
      unreadCount,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "알림함 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
