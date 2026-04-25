import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { listAlertEventsQuerySchema } from "@/lib/alerts/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const parsed = listAlertEventsQuerySchema.parse({
      status: req.nextUrl.searchParams.get("status") || undefined,
      severity: req.nextUrl.searchParams.get("severity") || undefined,
      page: req.nextUrl.searchParams.get("page") || 1,
      pageSize: req.nextUrl.searchParams.get("pageSize") || 20,
      q: req.nextUrl.searchParams.get("q") || undefined,
    });

    const where = {
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.severity ? { severity: parsed.severity } : {}),
      ...(parsed.q
        ? {
            OR: [
              { title: { contains: parsed.q, mode: "insensitive" as const } },
              { message: { contains: parsed.q, mode: "insensitive" as const } },
              { entityId: { contains: parsed.q, mode: "insensitive" as const } },
              { entityType: { contains: parsed.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.alertEvent.count({ where }),
      prisma.alertEvent.findMany({
        where,
        include: {
          rule: true,
          actorUser: {
            select: { id: true, name: true, email: true, role: true },
          },
          acknowledgedBy: {
            select: { id: true, name: true, email: true },
          },
          ignoredBy: {
            select: { id: true, name: true, email: true },
          },
          resolvedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [{ detectedAt: "desc" }],
        skip: (parsed.page - 1) * parsed.pageSize,
        take: parsed.pageSize,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      items,
      pagination: {
        total,
        page: parsed.page,
        pageSize: parsed.pageSize,
        totalPages: Math.max(1, Math.ceil(total / parsed.pageSize)),
      },
    });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "경고 이력 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
