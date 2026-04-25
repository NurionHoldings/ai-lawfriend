import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import type { AlertEscalationLevel, AlertEscalationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function mapLevel(raw: string): AlertEscalationLevel | undefined {
  switch (raw) {
    case "0":
      return "NONE";
    case "1":
      return "LEVEL_1";
    case "2":
      return "LEVEL_2";
    case "3":
      return "LEVEL_3";
    default:
      return undefined;
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminApi();

    const sp = req.nextUrl.searchParams;
    const status = sp.get("status") || "ALL";
    const level = sp.get("level") || "ALL";
    const q = (sp.get("q") || "").trim();

    const levelFilter = level !== "ALL" ? mapLevel(level) : undefined;

    const where = {
      ...(status !== "ALL"
        ? { status: status as AlertEscalationStatus }
        : {}),
      ...(levelFilter ? { level: levelFilter } : {}),
      ...(q
        ? {
            OR: [
              { message: { contains: q, mode: "insensitive" as const } },
              {
                alertEvent: {
                  title: { contains: q, mode: "insensitive" as const },
                },
              },
              {
                alertEvent: {
                  entityId: { contains: q, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    };

    const escalations = await prisma.alertEscalation.findMany({
      where,
      include: {
        alertEvent: {
          include: {
            rule: { select: { code: true, name: true, severity: true } },
            assigneeUser: { select: { id: true, name: true, email: true } },
          },
        },
        releasedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ ok: true, escalations });
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    return NextResponse.json(
      { ok: false, message: err.message ?? "에스컬레이션 목록 조회 실패" },
      { status: err.status ?? 500 }
    );
  }
}
